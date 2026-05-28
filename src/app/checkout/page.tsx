"use client";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import {
  Truck,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const providers = [
  { name: "bKash", value: "bkash", color: "bg-[#e2136e]" },
  { name: "Nagad", value: "nagad", color: "bg-[#f7941d]" },
  { name: "Rocket", value: "rocket", color: "bg-[#8c3494]" },
  { name: "Upay", value: "upay", color: "bg-[#00adef]" },
];

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore(); // items is CartItem[]
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    district: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [selectedProvider, setSelectedProvider] = useState("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  useEffect(() => {
    setMounted(true);

    // লগইন করা ইউজারের ইমেইল অটো-ফিল করা যাতে অর্ডারে সবসময় সঠিক ইমেইল যায়
    const savedUser = localStorage.getItem("socksful-user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
      }
    }

    if (mounted && items.length === 0 && !isOrderPlaced) {
      router.push("/");
    }
  }, [items.length, mounted, router, isOrderPlaced]);

  const subtotal = items.reduce((acc, item) => {
    const price = parseInt(item.price.replace("BDT", ""));
    return acc + price * item.quantity;
  }, 0);

  const shipping = 120;
  const total = subtotal + shipping;
  const payableNow = paymentMethod === "cod" ? shipping : total;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // রিয়েল অর্ডার সাবমিট লজিক
  const handlePlaceOrder = async () => {
    if (
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !senderNumber ||
      !trxId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: items,
          payment: {
            method: paymentMethod,
            provider: selectedProvider,
            sender: senderNumber,
            transactionId: trxId,
            amountPaid: payableNow,
          },
          totalAmount: total,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsOrderPlaced(true);
        clearCart();
        router.push("/order-success");
      } else {
        alert("Server Error: " + data.error);
      }
    } catch {
      // error intentionally ignored
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || (items.length === 0 && !isOrderPlaced)) return null;

  return (
    <main className="bg-[#fafafa] min-h-screen font-jakarta text-left overflow-x-hidden">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 md:px-8 pt-16 sm:pt-28 md:pt-40 pb-8 md:pb-20">
        <h1 className="text-3xl md:text-5xl font-bold text-black mb-8 md:mb-12 tracking-tight">
          Checkout
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-start">
          <div className="flex-[1.5] w-full min-w-0 space-y-4 sm:space-y-6">
            {/* ১. কন্টাক্ট ইনফরমেশন */}
            <div className="bg-white p-3 sm:p-5 md:p-8 rounded-[20px] sm:rounded-[26px] md:rounded-[32px] border border-gray-100 shadow-sm min-w-0">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
              </div>
            </div>

            {/* ২. শিপিং অ্যাড্রেস */}
            <div className="bg-white p-3 sm:p-5 md:p-8 rounded-[20px] sm:rounded-[26px] md:rounded-[32px] border border-gray-100 shadow-sm min-w-0">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="First Name"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Full Address"
                  className="w-full md:col-span-2 px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="City"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
                <input
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="District"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                />
              </div>
            </div>

            {/* 3. Payment Method - Premium Card */}
            <div className="bg-white p-3 sm:p-5 md:p-8 rounded-[20px] sm:rounded-[26px] md:rounded-[32px] border border-gray-100 shadow-sm min-w-0">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Payment Method
              </h2>

              {/* Notice */}
              <div className="mb-6 p-3 sm:p-4 bg-brand/5 rounded-2xl border border-brand/10">
                <p className="text-[10px] sm:text-xs font-bold text-brand uppercase tracking-widest">
                  Advance delivery charge (120 BDT) is required to place an
                  order.
                </p>
              </div>

              {/* Payment Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod("mobile")}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer gap-2 ${
                    paymentMethod === "mobile"
                      ? "border-brand bg-brand/5 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${paymentMethod === "mobile" ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Smartphone size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm leading-tight">
                        Mobile Banking
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Full Payment
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "mobile" && (
                    <CheckCircle2 size={16} className="text-brand" />
                  )}
                </button>
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer gap-2 ${
                    paymentMethod === "cod"
                      ? "border-brand bg-brand/5 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${paymentMethod === "cod" ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Truck size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm leading-tight">
                        Cash on Delivery
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Delivery Charge Only
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "cod" && (
                    <CheckCircle2 size={16} className="text-brand" />
                  )}
                </button>
              </div>

              {/* Payment Steps */}
              <div className="space-y-6">
                {/* Step 1: Provider */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black mb-3">
                      Select your mobile banking provider
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                      {providers.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setSelectedProvider(p.value)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase border-2 transition-all ${
                            selectedProvider === p.value
                              ? "bg-brand text-white border-brand shadow-md shadow-brand/20"
                              : "bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: Send Money */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black mb-3">
                      Send{" "}
                      <span className="text-brand font-black">
                        {payableNow} BDT
                      </span>{" "}
                      to our{" "}
                      <span className="capitalize text-brand font-black">
                        {selectedProvider}
                      </span>{" "}
                      number
                    </p>
                    <div className="inline-flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 mb-2">
                      <span className="font-black tracking-widest text-lg sm:text-xl text-black select-all">
                        01327904782
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                      Send Money option only. Always send as Personal, not
                      Merchant/Payment.
                    </p>
                  </div>
                </div>

                {/* Step 3: Enter Details */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black mb-3">
                      Enter payment details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="sender-number"
                          className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block"
                        >
                          Sender Phone Number
                        </label>
                        <input
                          id="sender-number"
                          type="text"
                          placeholder="eg. 01XXXXXXXXX"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="trx-id"
                          className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block"
                        >
                          Transaction ID (TrxID)
                        </label>
                        <input
                          id="trx-id"
                          type="text"
                          placeholder="TrxID Code"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Confirmation */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                      After successful payment and form submission you will get
                      order confirmation via SMS and Email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* অর্ডার সামারি */}
          <div className="w-full sm:max-w-xs md:max-w-sm sticky top-24 min-w-0">
            <div className="bg-white p-3 sm:p-5 md:p-8 rounded-[20px] sm:rounded-[26px] md:rounded-[32px] border border-gray-100 shadow-xl min-w-0">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-8 max-h-[250px] overflow-y-auto no-scrollbar">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-300">
                        SF
                      </div>
                      <div>
                        <p className="font-bold text-black">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-black">
                      {parseInt(item.price) * item.quantity}BDT
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-6">
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>Subtotal</span>
                  <span>{subtotal}BDT</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>Shipping</span>
                  <span>{shipping}BDT</span>
                </div>
                <div className="flex justify-between text-xl font-black text-black pt-2">
                  <span>Total Amount</span>
                  <span>{total}BDT</span>
                </div>
                <div className="mt-6 p-4 bg-brand/5 rounded-2xl border border-brand/10">
                  <div className="flex justify-between items-center text-brand font-black uppercase tracking-widest text-[10px]">
                    <span>Payable Now</span>
                    <span>{payableNow}BDT</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] mt-8 hover:bg-brand transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} /> Admin will verify manually
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
