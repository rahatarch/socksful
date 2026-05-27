export default function AboutUs() {
  return (
    /* সেকশন প্যাডিং মোবাইলের জন্য py-20 এবং পিসির জন্য py-32 করা হয়েছে */
    <section className="py-20 md:py-32 bg-[#fafafa] text-black px-6 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* 'About Us' ট্যাগ - ছোট স্ক্রিনে আরও স্লিক দেখাবে */}
        <h2 className="text-brand font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-sm mb-4 md:mb-6 transition-colors duration-500">
          About Us
        </h2>

        {/* মেইন ফিলোসফি টেক্সট - মোবাইলের জন্য টেক্সট সাইজ এবং লাইন-হাইট অপ্টিমাইজ করা হয়েছে */}
        <p className="text-[24px] sm:text-[32px] md:text-[42px] font-bold leading-[1.2] md:leading-tight tracking-tight text-gray-900">
          We believe comfort doesn&apos;t have to be boring.{" "}
          <br className="hidden md:block" />
          SocksFul is for those who find joy in the little details.
        </p>

        {/* ডেকোরেটিভ এলিমেন্ট - শুধুমাত্র একটি ছোট প্রিমিয়াম লাইন */}
        <div className="mt-10 md:mt-12 h-[1.5px] w-12 md:w-16 bg-brand mx-auto opacity-30 transition-colors duration-500"></div>
      </div>
    </section>
  );
}
