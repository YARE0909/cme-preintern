"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import {
  Search,
  CreditCard,
  IndianRupee,
  X,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// --------------------------------------------------------
// TYPES
// --------------------------------------------------------
interface Payment {
  id: string;
  orderId: string;
  userId: number;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

// Status badge classes
const STATUS_MAP: Record<string, string> = {
  SUCCESS: "text-green-300 bg-green-500/10 border-green-500/20",
  FAILED: "text-red-300 bg-red-500/10 border-red-500/20",
  PENDING: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
};

const STATUS_ICON_MAP = {
  SUCCESS: CheckCircle,
  FAILED: XCircle,
  PENDING: Clock,
};

// --------------------------------------------------------
// PAGE COMPONENT
// --------------------------------------------------------
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // --------------------------------------------------------
  // LOAD PAYMENTS
  // --------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await apiClient.get("/payment/api/payments"); // Adjust service name as needed

      if (!res.success) {
        console.error(res.error);
        setLoading(false);
        return;
      }

      setPayments(res.data || []);
      setLoading(false);
    }

    load();
  }, []);

  // --------------------------------------------------------
  // FILTERED LIST
  // --------------------------------------------------------
  const filtered = useMemo(() => {
    return payments
      .filter((p) =>
        search
          ? p.id.toLowerCase().includes(search.toLowerCase()) ||
            p.orderId.toLowerCase().includes(search.toLowerCase()) ||
            String(p.userId).includes(search)
          : true
      )
      .filter((p) =>
        statusFilter === "ALL" ? true : p.status === statusFilter
      );
  }, [payments, search, statusFilter]);

  if (loading) return <Loader />;

  // --------------------------------------------------------
  // UI START
  // --------------------------------------------------------
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Payments Management
        </h1>
        <p className="text-gray-400 mt-1">
          View and manage all platform payments
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 w-full shadow">
          <Search size={18} className="text-gray-500" />
          <input
            placeholder="Search by Payment ID, User ID, Order ID"
            className="w-full bg-transparent text-gray-200 outline-none placeholder-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-200 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">

        <table className="w-full">
          <thead className="bg-zinc-800 text-gray-400 text-sm">
            <tr>
              <th className="text-left p-4">Payment ID</th>
              <th className="text-left p-4">Order ID</th>
              <th className="text-left p-4">User ID</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Created At</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((pay) => {
              const Icon = STATUS_ICON_MAP[pay.status];

              return (
                <tr
                  key={pay.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
                  onClick={() => {
                    setSelectedPayment(pay);
                    setDrawerOpen(true);
                  }}
                >
                  <td className="p-4 text-white font-medium">{pay.id}</td>
                  <td className="p-4 text-gray-300">{pay.orderId}</td>
                  <td className="p-4 text-gray-300">{pay.userId}</td>

                  <td className="p-4 text-gray-200 flex items-center gap-1">
                    <IndianRupee size={14} />
                    {Number(pay.amount).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-lg border text-xs flex items-center gap-2 w-fit ${
                        STATUS_MAP[pay.status]
                      }`}
                    >
                      <Icon size={13} />
                      {pay.status}
                    </span>
                  </td>

                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(pay.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No payments match your filters.
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* DETAILS DRAWER */}
      {/* -------------------------------------------------------- */}
      {drawerOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-96 h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 overflow-y-auto animate-slideIn">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-bold">
                Payment Details
              </h2>

              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 text-gray-300">

              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="text-white font-semibold">{selectedPayment.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-white">{selectedPayment.orderId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-white">{selectedPayment.userId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-white flex items-center gap-1 text-lg font-bold">
                  <IndianRupee size={18} />
                  {selectedPayment.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>

                <span
                  className={`mt-1 px-3 py-1 rounded-lg border text-xs flex items-center gap-2 w-fit ${
                    STATUS_MAP[selectedPayment.status]
                  }`}
                >
                  {(() => {
                    const Icon = STATUS_ICON_MAP[selectedPayment.status];
                    return <Icon size={13} />;
                  })()}{" "}
                  {selectedPayment.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Timestamp</p>
                <p className="text-white">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
