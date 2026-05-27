"use client";
import { motion, Variants } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// অ্যানিমেশন ভেরিয়েন্টস
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function OurStory() {
  return (
    <main className="bg-white min-h-screen font-jakarta overflow-x-hidden">
      <Navbar />

      {/* ১. হিরো সেকশন - মোবাইলের জন্য প্যাডিং এবং ফন্ট সাইজ অ্যাডজাস্ট করা হয়েছে */}
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 px-6 text-center border-b border-gray-50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.span
            variants={fadeInUp}
            className="text-brand font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-4 md:mb-6 block transition-colors duration-500"
          >
            The Journey
          </motion.span>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight text-black leading-[1.15] md:leading-[1.1]"
          >
            Crafting Joy, <br />
            <span className="font-instrument italic font-normal text-brand transition-colors duration-500">
              One Step
            </span>{" "}
            at a Time.
          </motion.h1>
        </motion.div>
      </section>

      {/* ২. ফিলোসফি সেকশন - রেসপনসিভ টেক্সট সাইজ */}
      <section className="py-20 md:py-32 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-2xl md:text-4xl font-medium leading-relaxed text-gray-800"
          >
            It started with a simple question:{" "}
            <span className="text-black font-bold italic">
              Why do socks have to be boring?
            </span>{" "}
            We realized that the most essential part of your wardrobe was often
            the most overlooked.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 md:mt-12 text-base md:text-xl text-gray-500 leading-relaxed font-medium"
          >
            SocksFul was born in 2025 with a mission to bring color, comfort,
            and personality to your daily essentials. We believe that what you
            wear on your feet can change how you feel all day.
          </motion.p>
        </div>
      </section>

      {/* ৩. ভ্যালু গ্রিড - মোবাইলে ১ কলাম এবং পিসিতে ৩ কলাম */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {/* Feature 1 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-4 md:space-y-6"
            >
              <div className="w-12 h-1 bg-brand transition-colors duration-500"></div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Uncompromising Comfort
              </h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
                We use only the finest long-staple cotton and breathable
                materials, ensuring your feet feel like they&apos;re walking on
                clouds.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-4 md:space-y-6"
            >
              <div className="w-12 h-1 bg-brand transition-colors duration-500"></div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Vibrant Creativity
              </h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
                From bold patterns to subtle elegance, our designs are made for
                those who find joy in the little details of life.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-4 md:space-y-6"
            >
              <div className="w-12 h-1 bg-brand transition-colors duration-500"></div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Ethically Woven
              </h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
                Sustainability isn&apos;t just a buzzword for us. Our socks are
                made to last, reducing waste and supporting fair labor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ৪. ক্লোজিং সেকশন - রেসপনসিভ ওয়াটারমার্ক এবং কোট */}
      <section className="py-24 md:py-40 px-6 text-center bg-black text-white overflow-hidden relative">
        {/* বিশাল ওয়াটারমার্ক মোবাইলে ছোট করা হয়েছে */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
          <h2 className="text-[60vw] md:text-[40vw] font-bold select-none leading-none">
            SF
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-instrument italic leading-tight mb-8 md:mb-12 px-2">
            &quot;SocksFul is not just a brand, it&apos;s a celebration of your
            daily journey.&quot;
          </h2>
          <div className="h-[1px] w-16 md:w-24 bg-brand mx-auto mb-8 md:mb-10 transition-colors duration-500"></div>
          <p className="uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] text-gray-400 font-bold">
            Since 2025 • Dhaka
          </p>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
