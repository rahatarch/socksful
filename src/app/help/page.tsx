"use client";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function HelpPage() {
  const supportCards = [
    {
      title: "Call Us",
      description:
        "Talk directly to our comfort experts for immediate assistance.",
      icon: <Phone size={28} />,
      actionText: "Call Now",
      href: "tel:+8801700000000",
      color: "bg-blue-50/50 text-blue-600",
    },
    {
      title: "Email Support",
      description:
        "Send us your queries and we'll get back to you within 24 hours.",
      icon: <Mail size={28} />,
      actionText: "Email Now",
      href: "mailto:support@socksful.com",
      color: "bg-purple-50/50 text-purple-600",
    },
    {
      title: "Live Chat",
      description:
        "Chat with our support team in real-time for quick solutions.",
      icon: <MessageCircle size={28} />,
      actionText: "Start Chat",
      href: "#",
      color: "bg-green-50/50 text-green-600",
      isLive: true,
    },
  ];

  return (
    <main className="bg-[#fafafa] min-h-screen font-jakarta overflow-x-hidden">
      <Navbar />

      {/* ১. হিরো সেকশন - রেসপনসিভ প্যাডিং ও ফন্ট */}
      <section className="pt-28 md:pt-40 pb-12 md:pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-brand">
            <HelpCircle size={28} className="md:w-8 md:h-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-black mb-4 md:mb-6 leading-tight">
            Help{" "}
            <span className="font-instrument italic font-normal text-brand transition-colors duration-500">
              Center
            </span>
          </h1>
          <p className="text-gray-500 text-base md:text-xl font-medium max-w-md mx-auto">
            Have a question? We&apos;re here to help you find the perfect fit.
          </p>
        </motion.div>
      </section>

      {/* ২. ইন্টারেক্টিভ সাপোর্ট কার্ডস - মোবাইলে ১ কলাম গ্রিড */}
      <section className="pb-20 md:pb-32 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {supportCards.map((card, idx) => (
            <motion.a
              key={card.title}
              href={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white p-8 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-start text-left relative overflow-hidden active:scale-[0.98] md:active:scale-100"
            >
              {/* লাইভ ইন্ডিকেটর */}
              {card.isLive && (
                <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    Live Now
                  </span>
                </div>
              )}

              <div
                className={`p-3 md:p-4 rounded-2xl md:rounded-3xl mb-6 md:mb-8 ${card.color} transition-transform group-hover:scale-110 duration-500`}
              >
                {card.icon}
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">
                {card.title}
              </h3>
              <p className="text-gray-400 text-sm md:text-base font-medium mb-8 md:mb-10 leading-relaxed">
                {card.description}
              </p>

              <div className="mt-auto flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-[10px] md:text-xs group-hover:gap-4 transition-all duration-500">
                {card.actionText}
                <ArrowRight size={16} />
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ৩. এফএকিউ হাইলাইট - মোবাইল অপ্টিমাইজড লিস্ট */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">
            Common Questions
          </h2>
          <div className="space-y-3 md:space-y-4">
            {[
              "How do I track my order?",
              "What is your return policy?",
              "Which size should I pick?",
            ].map((q) => (
              <div
                key={q}
                className="group p-5 md:p-6 bg-[#fafafa] rounded-2xl md:rounded-3xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors active:scale-[0.99]"
              >
                <span className="font-bold text-gray-800 text-sm md:text-base text-left pr-4">
                  {q}
                </span>
                <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand shadow-sm group-hover:bg-brand group-hover:text-white transition-all duration-300">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
