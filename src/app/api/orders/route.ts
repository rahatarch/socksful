import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId, type ClientSession } from "mongodb";
import { badRequest, forbidden, unauthorized } from "@/lib/auth";
import { getAdminUser, getAuthenticatedUser } from "@/lib/server-auth";

interface OrderItemInput {
  id: string;
  quantity: number;
}

interface ProductDoc {
  _id: ObjectId;
  name: string;
  price: string;
  stock: number;
}

const SHIPPING_CHARGE = 120;

const toCleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const toMoneyNumber = (value: unknown) =>
  Number.parseInt(String(value || "0").replace(/[^0-9]/g, ""), 10) || 0;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeItems = (value: unknown): OrderItemInput[] | null => {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const grouped = new Map<string, number>();

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const rawItem = item as Record<string, unknown>;
    const id = toCleanString(rawItem.id);
    const quantity = Math.floor(Number(rawItem.quantity));

    if (!ObjectId.isValid(id) || !Number.isFinite(quantity) || quantity < 1) {
      return null;
    }

    grouped.set(id, (grouped.get(id) || 0) + quantity);
  }

  return [...grouped.entries()].map(([id, quantity]) => ({ id, quantity }));
};

const normalizeCustomer = (value: unknown, email: string) => {
  const body =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    email,
    phone: toCleanString(body.phone),
    firstName: toCleanString(body.firstName),
    lastName: toCleanString(body.lastName),
    address: toCleanString(body.address),
    city: toCleanString(body.city),
    district: toCleanString(body.district),
  };
};

const normalizePayment = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = value as Record<string, unknown>;
  const method = body.method === "cod" ? "cod" : "mobile";
  const provider = toCleanString(body.provider).toLowerCase();
  const sender = toCleanString(body.sender);
  const transactionId = toCleanString(body.transactionId);

  if (!provider || !sender || !transactionId) {
    return null;
  }

  return { method, provider, sender, transactionId };
};

const getProductMap = async (
  products: import("mongodb").Collection,
  items: OrderItemInput[],
  session: ClientSession,
) => {
  const ids = items.map((item) => new ObjectId(item.id));
  const docs = (await products
    .find({ _id: { $in: ids } }, { session })
    .toArray()) as ProductDoc[];

  return new Map(docs.map((product) => [product._id.toString(), product]));
};

// ১. নতুন অর্ডার তৈরি করা (কাস্টমার সাইড)
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return unauthorized();
    }

    const body = await req.json();
    const items = normalizeItems((body as Record<string, unknown>).items);
    const payment = normalizePayment((body as Record<string, unknown>).payment);
    const customer = normalizeCustomer(
      (body as Record<string, unknown>).customer,
      user.email,
    );

    if (!items) {
      return badRequest("A valid item list is required");
    }

    if (!payment) {
      return badRequest("Valid payment information is required");
    }

    if (!customer.phone || !customer.address) {
      return badRequest("Phone and shipping address are required");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");
    const products = db.collection("products");
    const orders = db.collection("orders");
    const session = client.startSession();

    let orderId: ObjectId | null = null;

    try {
      await session.withTransaction(async () => {
        const productMap = await getProductMap(products, items, session);

        if (productMap.size !== items.length) {
          throw new Error("One or more products were not found");
        }

        const normalizedItems = items.map((item) => {
          const product = productMap.get(item.id);

          if (!product) {
            throw new Error("Product not found");
          }

          if ((product.stock || 0) < item.quantity) {
            throw new Error(`${product.name} does not have enough stock`);
          }

          const unitPrice = toMoneyNumber(product.price);

          return {
            id: item.id,
            name: product.name,
            price: `${unitPrice}BDT`,
            unitPrice,
            quantity: item.quantity,
            lineTotal: unitPrice * item.quantity,
          };
        });

        const subtotal = normalizedItems.reduce(
          (sum, item) => sum + item.lineTotal,
          0,
        );
        const totalAmount = subtotal + SHIPPING_CHARGE;
        const payableNow =
          payment.method === "cod" ? SHIPPING_CHARGE : totalAmount;

        for (const item of normalizedItems) {
          const updateResult = await products.updateOne(
            {
              _id: new ObjectId(item.id),
              stock: { $gte: item.quantity },
            },
            { $inc: { stock: -item.quantity } },
            { session },
          );

          if (updateResult.modifiedCount !== 1) {
            throw new Error(`${item.name} does not have enough stock`);
          }
        }

        const result = await orders.insertOne(
          {
            customer,
            items: normalizedItems,
            payment: {
              ...payment,
              amountPaid: payableNow,
            },
            subtotal,
            shipping: SHIPPING_CHARGE,
            totalAmount,
            status: "Pending",
            userId: user.id,
            createdAt: new Date(),
          },
          { session },
        );

        orderId = result.insertedId;
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save order";
    console.error("Order API Error:", error);
    return NextResponse.json(
      { success: false, error: message },
      {
        status:
          message.includes("stock") || message.includes("found") ? 400 : 500,
      },
    );
  }
}

// ২. অর্ডার তুলে আনা
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const isAdmin = (await getAdminUser(req)) !== null;

    if (requestedEmail && requestedEmail !== user.email && !isAdmin) {
      return forbidden("You can only view your own orders");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");
    const email = isAdmin ? requestedEmail : user.email;
    const filter = email
      ? {
          "customer.email": {
            $regex: new RegExp(`^${escapeRegex(email)}$`, "i"),
          },
        }
      : {};

    const orders = await db
      .collection("orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
