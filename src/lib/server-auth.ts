import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getSessionFromRequest, type SessionUser } from "@/lib/auth";

export interface AuthenticatedUser extends SessionUser {
  status: string;
  isVerified: boolean;
}

export const getAuthenticatedUser = async (
  request: Request,
): Promise<AuthenticatedUser | null> => {
  const session = getSessionFromRequest(request);

  if (!session || !ObjectId.isValid(session.id)) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db("socksful_db");
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.id),
    email: session.email,
  });

  if (!user || user.status === "Banned" || user.isVerified === false) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: String(user.name || session.name),
    email: String(user.email || session.email).toLowerCase().trim(),
    role: user.role === "admin" ? "admin" : "user",
    status: String(user.status || "Active"),
    isVerified: user.isVerified !== false,
  };
};

export const getAdminUser = async (request: Request) => {
  const user = await getAuthenticatedUser(request);
  return user?.role === "admin" ? user : null;
};
