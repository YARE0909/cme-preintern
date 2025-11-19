"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import Loader from "@/components/Loader";

import {
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// --------------------------------------
// TYPES
// --------------------------------------
type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paymentReferenceId: string;
  updatedAt: string;
}

// --------------------------------------
// STATUS STYLING
// --------------------------------------
const PAYMENT_STATUS_MAP: Record<PaymentStatus, string> = {
  SUCCESS: "text-green-300 bg-green-600/20 border-green-600/20",
  FAILED: "text-red-300 bg-red-600/20 border-red-600/20",
  PENDING: "text-yellow-300 bg-yellow-600/20 border-yellow-600/20",
};

const ICON_MAP: Record<PaymentStatus, any> = {
  SUCCESS: CheckCircle,
  FAILED: XCircle,
  PENDING: Clock,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCart();

  async function load() {
    setLoading(true);

    const res = await apiClient.get(`/payment/api/payments/user/${user?.id}`);

    if (!res.success) {
      toast.error("Failed to load payments");
      setLoading(false);
      return;
    }

    setPayments(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  if (loading) return <Loader />;

  // --------------------------------------
  // METRICS
  // --------------------------------------
  const totalPayments = payments.length;

  const totalSpent = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulPayments = payments.filter(
    (p) => p.status === "SUCCESS"
  ).length;

  const failedPayments = payments.filter((p) => p.status === "FAILED").length;

  const lastSuccess = payments
    .filter((p) => p.status === "SUCCESS")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  return (
    <div className="space-y-14 min-h-screen py-10 max-w-6xl mx-auto mb-20">
      {/* -------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Payment History
        </h1>
      </div>

      {/* -------------------------------------- */}
      {/* METRICS */}
      {/* -------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Payments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <Banknote size={36} className="text-indigo-400" />
          <p className="text-gray-400 text-sm mt-3">Total Payments</p>
          <p className="text-3xl text-white font-bold mt-1">{totalPayments}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <CheckCircle size={36} className="text-green-400" />
          <p className="text-gray-400 text-sm mt-3">Total Spent</p>
          <p className="text-3xl text-white font-bold mt-1">₹{totalSpent}</p>
        </div>

        {/* Success Count */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <CheckCircle size={36} className="text-green-400" />
          <p className="text-gray-400 text-sm mt-3">Successful</p>
          <p className="text-3xl text-white font-bold mt-1">
            {successfulPayments}
          </p>
        </div>

        {/* Failed Count */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <XCircle size={36} className="text-red-400" />
          <p className="text-gray-400 text-sm mt-3">Failed</p>
          <p className="text-3xl text-white font-bold mt-1">{failedPayments}</p>
        </div>
      </div>

      {/* -------------------------------------- */}
      {/* LAST SUCCESSFUL PAYMENT */}
      {/* -------------------------------------- */}
      {lastSuccess && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <p className="text-gray-400 text-sm mb-2">Last Successful Payment</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xl font-bold">
                ₹{lastSuccess.amount}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(lastSuccess.createdAt).toLocaleString()}
              </p>
            </div>

            <Link
              href={`/dashboard/orders/${lastSuccess.orderId}`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-md cursor-pointer font-bold"
            >
              View Order <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* -------------------------------------- */}
      {/* PAYMENT LIST */}
      {/* -------------------------------------- */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-6">All Payments</h2>

        {payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-gray-500">
          <Banknote className="w-16 h-16 mb-4 stroke-current text-gray-300" />
          <h2 className="text-2xl font-semibold mb-2">No payments yet</h2>
          <p className="text-lg mb-4">Place your first order to get started.</p>
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payments
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((p) => {
              const StatusIcon = ICON_MAP[p.status];

              return (
                <div
                  key={p.id}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:bg-zinc-900 transition backdrop-blur-xl group"
                >
                  {/* TOP: Status + Date */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 font-medium ${
                        PAYMENT_STATUS_MAP[p.status]
                      }`}
                    >
                      <StatusIcon size={14} />
                      {p.status}
                    </span>

                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* AMOUNT */}
                  <div className="mb-6">
                    <p className="text-white text-3xl font-bold">₹{p.amount}</p>
                    <p className="text-gray-500 text-sm mt-1">Payment Amount</p>
                  </div>

                  {/* DIVIDER */}
                  <div className="border-t border-zinc-800 my-4"></div>

                  {/* INFO LIST */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        Order ID
                      </span>
                      <span className="text-gray-300 truncate max-w-[60%] text-right">
                        {p.orderId}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Reference
                      </span>
                      <span className="text-gray-300 break-all max-w-[60%] text-right">
                        {p.paymentReferenceId}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        Updated
                      </span>
                      <span className="text-gray-300">
                        {new Date(p.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="border-t border-zinc-800 mt-6 mb-4"></div>

                  {/* VIEW ORDER BUTTON */}
                  <Link
                    href={`/dashboard/orders/${p.orderId}`}
                    className="w-full block px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 
               text-white text-center shadow-md transition font-semibold"
                  >
                    View Order
                  </Link>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
