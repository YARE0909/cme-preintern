import { CartProvider } from "@/context/CartContext";
import BottomNav from "./BottomNav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-b from-black via-zinc-950 to-zinc-900">
      <CartProvider>
        <BottomNav />
        <div className="flex flex-col w-full h-screen overflow-y-auto">
          <div className="px-6">{children}</div>
        </div>
      </CartProvider>
    </div>
  );
}
