import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/cart/CartDrawer";

// ফন্ট কনফিগারেশন - Apple স্টাইল স্মুথ লোডিংয়ের জন্য display: "swap" যোগ করা হয়েছে
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${instrument.variable}`}>
      <body
        className="w-full min-h-screen max-w-full font-jakarta text-left antialiased bg-white px-0 sm:px-0 overflow-x-hidden"
        suppressHydrationWarning={true}
      >
        {/* মেইন কন্টেন্ট */}
        {children}

        {/* গ্লোবাল কার্ট ড্রয়ার - এটি পুরো সাইটের যেকোনো জায়গা থেকে কল করা যাবে */}
        <CartDrawer />
      </body>
    </html>
  );
}
