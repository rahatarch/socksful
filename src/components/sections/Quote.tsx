export default function Quote() {
  return (
    <section className="py-32 bg-white text-black flex items-center justify-center px-8">
      <div className="max-w-4xl text-center">
        <h2 className="text-[36px] md:text-[60px] font-bold tracking-tight leading-[1.1] text-gray-900">
          "Life is too short to wear boring socks."
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="w-16 h-1 bg-brand rounded-full transition-colors duration-500"></div>
        </div>
      </div>
    </section>
  );
}
