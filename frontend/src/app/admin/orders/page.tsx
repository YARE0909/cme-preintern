"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { Search, User, Calendar, X } from "lucide-react";
import toast from "react-hot-toast";

// --------------------------------------------------------
// TYPES
// --------------------------------------------------------
interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface UserInfo {
  id: number;
  username: string;
  fullName?: string;
  email: string;
}

// --------------------------------------------------------
// ORDER STATUS OPTIONS
// --------------------------------------------------------
const ORDER_STATUS = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

// --------------------------------------------------------
// PAGE
// --------------------------------------------------------
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userMap, setUserMap] = useState<Map<number, UserInfo>>(new Map());
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --------------------------------------------------------
  // LOAD PRODUCTS + ORDERS + USER DATA
  // --------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const orderRes = await apiClient.get("/order/api/orders");
      const productRes = await apiClient.get("/product/api/products");
      const allUsersRes = await apiClient.get("/user/api/users");

      if (!orderRes.success || !productRes.success || !allUsersRes.success) {
        toast.error("Failed to load admin order data");
        setLoading(false);
        return;
      }

      // Build Product Map
      const productMap = new Map(
        productRes.data.map((p: Product) => [p.id, p.imageUrl])
      );

      // Build User Map
      const uMap = new Map<number, UserInfo>();
      allUsersRes.data.forEach((u: UserInfo) => uMap.set(u.id, u));
      setUserMap(uMap);

      // Attach product image
      const enrichedOrders = orderRes.data.map((o: Order) => ({
        ...o,
        items: o.items.map((i) => ({
          ...i,
          imageUrl: productMap.get(i.productId) || "/placeholder.jpg",
        })),
      }));

      setOrders(enrichedOrders);
      setProducts(productRes.data);
      setLoading(false);
    }

    load();
  }, []);

  // --------------------------------------------------------
  // FILTERED ORDERS
  // --------------------------------------------------------
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const user = userMap.get(o.userId);
      const userName = user?.username?.toLowerCase() || "";
      const query = search.toLowerCase();

      return search
        ? o.id.toLowerCase().includes(query) ||
            String(o.userId).includes(query) ||
            userName.includes(query)
        : true;
    });
  }, [orders, search, userMap]);

  // --------------------------------------------------------
  // UPDATE STATUS
  // --------------------------------------------------------
  const updateStatus = async (orderId: string, status: string) => {
    const res = await apiClient.put(
      `/order/api/orders/${orderId}/status?status=${status}`
    );

    if (!res.success) {
      toast.error("Failed to update order status");
      return;
    }

    toast.success("Order status updated");

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
    CONFIRMED: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    DELIVERED: "text-green-300 bg-green-500/10 border-green-500/20",
    CANCELLED: "text-red-300 bg-red-500/10 border-red-500/20",
  };

  if (loading) return <Loader />;

  // --------------------------------------------------------
  // UI START
  // --------------------------------------------------------
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Manage Orders
        </h1>
        <p className="text-gray-400 mt-1">
          Track, review & update customer order statuses
        </p>
      </div>

      {/* SEARCH */}
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow">
        <Search size={18} className="text-gray-500" />
        <input
          placeholder="Search by Order ID, User ID or Username"
          className="w-full bg-transparent text-gray-200 outline-none placeholder-gray-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <table className="w-full">
          <thead className="bg-zinc-800 text-gray-400 text-sm">
            <tr>
              <th className="text-left p-4">Order ID</th>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Items</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => {
              const user = userMap.get(o.userId);

              return (
                <tr
                  key={o.id}
                  onClick={() => {
                    setSelectedOrder(o);
                    setDrawerOpen(true);
                  }}
                  className="border-t border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
                >
                  <td className="p-4 text-white font-medium">{o.id}</td>

                  <td className="p-4 text-gray-300 flex items-center gap-2">
                    <User size={16} />
                    {user?.username || "Unknown"}
                  </td>

                  <td className="p-4 text-gray-300">{o.items.length} items</td>

                  <td className="p-4 text-gray-200 font-semibold cursor-pointer">
                    ₹{o.totalAmount}
                  </td>

                  <td className="p-4">
                    <span
                      className={`
      px-3 py-1 rounded-lg text-sm cursor-pointer border ${
        STATUS_COLORS[o.status] || "text-gray-300"
      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-4 text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No matching orders found.
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* ORDER DETAILS DRAWER */}
      {/* -------------------------------------------------------- */}
      {drawerOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-96 h-full bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto shadow-xl animate-slideIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-bold">Order Details</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Order Info */}
            <div className="space-y-6 text-gray-300">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-white">{selectedOrder.id}</p>
              </div>

              {/* User */}
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="text-white flex items-center gap-2">
                  <User size={16} />
                  {userMap.get(selectedOrder.userId)?.username || "Unknown"}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-500">Order Status</p>

                <div
                  className={`
      mt-2 px-3 py-1 rounded-lg text-sm w-fit border
      ${STATUS_COLORS[selectedOrder.status] || "text-gray-300"}
    `}
                >
                  {selectedOrder.status}
                </div>

                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateStatus(selectedOrder.id, e.target.value)
                  }
                  className="mt-3 w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-gray-200 outline-none cursor-pointer font-bold"
                >
                  {ORDER_STATUS.map((s) => (
                    <option key={s} value={s} className="text-black">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>

                <div className="space-y-4">
                  {selectedOrder.items.map((i) => (
                    <div
                      key={i.productId}
                      className="flex items-center gap-4 bg-zinc-800/40 p-3 rounded-xl border border-zinc-700"
                    >
                      <img
                        src={i.imageUrl}
                        className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
                      />

                      <div className="flex-1">
                        <p className="text-white font-bold">{i.productName}</p>
                        <p className="text-gray-400 text-sm">
                          {i.quantity} × ₹{i.price}
                        </p>
                      </div>

                      <p className="text-white font-bold">₹{i.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-white text-lg font-bold">
                  ₹{selectedOrder.totalAmount}
                </p>
              </div>

              {/* Created At */}
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-white flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
