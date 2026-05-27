export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] pt-16 pb-8 px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-300 pb-12 text-[#1d1d1f]">
          <div>
            <h4 className="text-xs font-bold uppercase mb-4 opacity-80">
              Shop
            </h4>
            <ul className="text-[12px] space-y-2 opacity-70">
              <li className="hover:underline cursor-pointer">New Arrivals</li>
              <li className="hover:underline cursor-pointer">Best Sellers</li>
              <li className="hover:underline cursor-pointer">Gift Sets</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-4 opacity-80">
              Account
            </h4>
            <ul className="text-[12px] space-y-2 opacity-70">
              <li className="hover:underline cursor-pointer">
                Manage SocksFul ID
              </li>
              <li className="hover:underline cursor-pointer">Order Status</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-4 opacity-80">
              Store
            </h4>
            <ul className="text-[12px] space-y-2 opacity-70">
              <li className="hover:underline cursor-pointer">Find a Store</li>
              <li className="hover:underline cursor-pointer">
                Student Discount
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-4 opacity-80">
              About
            </h4>
            <ul className="text-[12px] space-y-2 opacity-70">
              <li className="hover:underline cursor-pointer">Sustainability</li>
              <li className="hover:underline cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 text-[11px] text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 SocksFul Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:underline cursor-pointer">Terms of Use</span>
            <span className="hover:underline cursor-pointer">Sales Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
