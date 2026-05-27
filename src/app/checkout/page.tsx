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
  const { items, clearCart } = useCartStore();
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
    } catch (error) {
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || (items.length === 0 && !isOrderPlaced)) return null;

  return (
    <main className="bg-[#fafafa] min-h-screen font-jakarta text-left overflow-x-hidden">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-28 md:pt-40 pb-20">
        <h1 className="text-3xl md:text-5xl font-bold text-black mb-8 md:mb-12 tracking-tight">
          Checkout
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-[1.5] w-full space-y-6">
            {/* ১. কন্টাক্ট ইনফরমেশন */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
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
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
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

            {/* ৩. পেমেন্ট মেথড */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Payment Method
              </h2>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mb-8 ml-11">
                Advance delivery charge (120BDT) is mandatory.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod("mobile")}
                  className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === "mobile" ? "border-brand bg-brand/5" : "border-gray-50 bg-gray-50"}`}
                >
                  <div className="flex items-center gap-4">
                    <Smartphone
                      size={24}
                      className={
                        paymentMethod === "mobile"
                          ? "text-brand"
                          : "text-gray-400"
                      }
                    />
                    <div className="text-left">
                      <p className="font-bold text-sm">Mobile Banking</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Full Payment
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "mobile" && (
                    <CheckCircle2 size={20} className="text-brand" />
                  )}
                </button>
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === "cod" ? "border-brand bg-brand/5" : "border-gray-50 bg-gray-50"}`}
                >
                  <div className="flex items-center gap-4">
                    <Truck
                      size={24}
                      className={
                        paymentMethod === "cod" ? "text-brand" : "text-gray-400"
                      }
                    />
                    <div className="text-left">
                      <p className="font-bold text-sm">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Pay Charge Only
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "cod" && (
                    <CheckCircle2 size={20} className="text-brand" />
                  )}
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {providers.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setSelectedProvider(p.value)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${selectedProvider === p.value ? `${p.color} text-white shadow-lg` : "bg-white text-gray-400 hover:text-black"}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Please send{" "}
                    <span className="font-bold text-black">
                      {payableNow}BDT
                    </span>{" "}
                    to <span className="font-bold text-black">017XXXXXXXX</span>{" "}
                    using{" "}
                    <span className="font-bold capitalize text-brand">
                      {selectedProvider}
                    </span>{" "}
                    Personal number.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Sender Phone Number"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Transaction ID (TrxID)"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:border-brand transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* অর্ডার সামারি */}
          <div className="lg:w-[400px] w-full sticky top-24">
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-xl">
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
