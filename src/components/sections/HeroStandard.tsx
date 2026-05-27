export default function HeroStandard() {
  return (
    <section className="h-[600px] bg-white text-black flex flex-col items-center justify-center border-t-[12px] border-[#f5f5f7]">
      <div className="text-center px-4">
        <h2 className="text-[48px] md:text-[80px] font-bold tracking-tight leading-tight">
          Everyday Classic
        </h2>
        <p className="text-[20px] md:text-[32px] font-normal mt-2">
          Step into Softness.
        </p>

        <div className="flex justify-center gap-5 mt-8">
          <button className="bg-[#0071e3] text-white px-7 py-3 rounded-full text-[17px] font-medium hover:bg-[#0077ed] transition-all cursor-pointer">
            Learn more
          </button>
          <button className="border border-[#0071e3] text-[#0071e3] px-7 py-3 rounded-full text-[17px] font-medium hover:bg-[#0071e3] hover:text-white transition-all cursor-pointer">
            Buy
          </button>
        </div>
      </div>
    </section>
  );
}
