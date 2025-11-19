"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { toast } from "react-hot-toast";
import {
  BarChart2,
  DollarSign,
  PieChart as PieIcon,
  Users,
  ShoppingBag,
  ArrowRight,
  IndianRupee,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// ----------- TYPES -----------
type Order = {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  items: { productId: string; productName: string; quantity: number }[];
};

type Product = { id: string; name: string; imageUrl?: string; price: number };
type Payment = { id: string; status: string; amount: number; createdAt: string };
type User = { id: string; username: string };

const COLORS = ["#6366f1", "#f43f5e", "#14b8a6", "#fb923c", "#a78bfa"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // ----------- Fetch everything -----------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [o, p, pay, u] = await Promise.all([
          apiClient.get<Order[]>("/order/api/orders"),
          apiClient.get<Product[]>("/product/api/products"),
          apiClient.get<Payment[]>("/payment/api/payments"),
          apiClient.get<User[]>("/user/api/users"),
        ]);

        if (!o.success) throw o.error;
        if (!p.success) throw p.error;
        if (!pay.success) throw pay.error;
        if (!u.success) throw u.error;

        setOrders(o.data || []);
        setProducts(p.data || []);
        setPayments(pay.data || []);
        setUsers(u.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load admin dashboard");
      }

      setLoading(false);
    }

    load();
  }, []);

  // ----------- METRICS -----------
  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  // ----------- PIE: Orders by Status -----------
  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      map[o.status] = (map[o.status] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // ----------- LINE: Revenue last 14 days -----------
  const revenueData = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();

    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      map.set(k, 0);
    }

    for (const o of orders) {
      const k = o.createdAt?.slice(0, 10);
      if (map.has(k)) map.set(k, map.get(k)! + Number(o.totalAmount));
    }

    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount }));
  }, [orders]);

  // ----------- BAR: Top Selling Products -----------
  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    const names = new Map<string, string>();

    for (const o of orders) {
      for (const it of o.items) {
        counts.set(it.productId, (counts.get(it.productId) || 0) + it.quantity);
        names.set(it.productId, it.productName);
      }
    }

    return [...counts.entries()]
      .map(([id, qty]) => ({
        id,
        qty,
        name: names.get(id) || "Unknown",
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  // ----------- Recent Payments -----------
  const recentPayments = payments
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-10">

      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Analytics & insights overview</p>
      </div>

      {/* ----------- METRIC CARDS ----------- */}
      <div className="grid grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow">
          <p className="text-gray-400">Total Revenue</p>
          <p className="text-3xl font-bold text-white mt-2 flex items-center gap-2">
            <IndianRupee size={20} className="text-indigo-400" />
            {totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Orders */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow">
          <p className="text-gray-400">Total Orders</p>
          <p className="text-3xl font-bold text-white mt-2 flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-400" />
            {totalOrders}
          </p>
        </div>

        {/* Users */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow">
          <p className="text-gray-400">Users</p>
          <p className="text-3xl font-bold text-white mt-2 flex items-center gap-2">
            <Users size={20} className="text-indigo-400" />
            {totalUsers}
          </p>
        </div>

        {/* Products */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow">
          <p className="text-gray-400">Products</p>
          <p className="text-3xl font-bold text-white mt-2 flex items-center gap-2">
            <BarChart2 size={20} className="text-indigo-400" />
            {totalProducts}
          </p>
        </div>
      </div>

      {/* ----------- CHARTS ROW 1 ----------- */}
      <div className="grid grid-cols-3 gap-6">

        {/* ORDERS BY STATUS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <PieIcon size={18} /> Orders by Status
          </h2>

          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" innerRadius={50} outerRadius={90}>
                  {ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVENUE TREND */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <BarChart2 size={18} /> Revenue (Last 14 Days)
          </h2>

          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={revenueData}>
                <CartesianGrid stroke="#2b2b2b" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ReTooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ----------- CHARTS ROW 2 ----------- */}
      <div className="grid grid-cols-3 gap-6">

        {/* TOP PRODUCTS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <ShoppingBag /> Top Selling Products
          </h2>

          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={topProducts}>
                <CartesianGrid stroke="#2b2b2b" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ReTooltip />
                <Bar dataKey="qty" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT PAYMENTS */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <DollarSign /> Recent Payments
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="text-gray-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800">
                    <td className="py-3">{p.id}</td>
                    <td className="py-3">₹{p.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`
                          px-3 py-1 rounded-lg text-sm
                          ${p.status === "SUCCESS" ? "bg-green-500/10 text-green-300" : ""}
                          ${p.status === "FAILED" ? "bg-red-500/10 text-red-300" : ""}
                          ${p.status === "PENDING" ? "bg-yellow-500/10 text-yellow-300" : ""}
                        `}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
