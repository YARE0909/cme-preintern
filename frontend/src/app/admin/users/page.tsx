"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import Loader from "@/components/Loader";

import {
  Search,
  User,
  Mail,
  Phone,
  Shield,
  X,
  User2,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Lock,
} from "lucide-react";

// --------------------------------------------------------
// TYPES
// --------------------------------------------------------
interface UserInfo {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName?: string;
  role: string;
  createdAt: string;
}

// --------------------------------------------------------
// ROLE COLORS
// --------------------------------------------------------
const ROLE_MAP: Record<string, string> = {
  ADMIN: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  USER: "text-green-300 bg-green-500/10 border-green-500/20",
};

// --------------------------------------------------------
// PAGE
// --------------------------------------------------------
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | "view">("view");
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  // Form
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    role: "USER",
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null as number | null,
  });

  // --------------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await apiClient.get("/user/api/users");

      if (!res.success) {
        console.error(res.error);
        setLoading(false);
        return;
      }

      setUsers(res.data || []);
      setLoading(false);
    }

    load();
  }, []);

  // --------------------------------------------------------
  // FILTER USERS
  // --------------------------------------------------------
  const filtered = useMemo(() => {
    return users
      .filter((u) =>
        search
          ? u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            String(u.id).includes(search)
          : true
      )
      .filter((u) =>
        roleFilter === "ALL" ? true : u.role === roleFilter
      );
  }, [users, search, roleFilter]);

  if (loading) return <Loader />;

  // --------------------------------------------------------
  // OPEN DRAWERS
  // --------------------------------------------------------
  const openView = (u: UserInfo) => {
    setDrawerMode("view");
    setSelectedUser(u);
    setDrawerOpen(true);
  };

  const openAdd = () => {
    setDrawerMode("add");
    setForm({
      username: "",
      email: "",
      phone: "",
      fullName: "",
      password: "",
      role: "USER",
    });
    setDrawerOpen(true);
  };

  const openEdit = (u: UserInfo) => {
    setDrawerMode("edit");
    setSelectedUser(u);
    setForm({
      username: u.username,
      email: u.email,
      phone: u.phone || "",
      fullName: u.fullName || "",
      password: "",
      role: u.role,
    });
    setDrawerOpen(true);
  };

  // --------------------------------------------------------
  // SAVE USER (CREATE / EDIT)
  // --------------------------------------------------------
  async function saveUser() {
    const payload = {
      username: form.username,
      email: form.email,
      fullName: form.fullName,
      phone: form.phone,
      role: form.role,
      ...(form.password ? { passwordHash: form.password } : {}),
    };

    if (!form.username || !form.email)
      return alert("Username and email required");

    if (drawerMode === "add") {
      const res = await apiClient.post("/user/api/users/register", payload);
      if (res.success) {
        setUsers((prev) => [...prev, res.data]);
        setDrawerOpen(false);
      }
    }

    if (drawerMode === "edit" && selectedUser) {
      const res = await apiClient.put(
        `/user/api/users/${selectedUser.id}`,
        payload
      );

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? res.data : u))
        );
        setDrawerOpen(false);
      }
    }
  }

  // --------------------------------------------------------
  // DELETE USER
  // --------------------------------------------------------
  async function deleteUser() {
    if (!deleteModal.id) return;

    const res = await apiClient.del(`/user/api/users/${deleteModal.id}`);

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
    }
  }

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Users Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, edit & remove user accounts
          </p>
        </div>

        <button
          onClick={openAdd}
          className="w-fit h-fit flex items-center gap-2 px-4 font-bold cursor-pointer py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow">
          <Search size={18} className="text-gray-500" />
          <input
            placeholder="Search by username, email, ID"
            className="w-full bg-transparent text-gray-200 outline-none placeholder-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-200 outline-none"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <table className="w-full">
          <thead className="bg-zinc-800 text-gray-400 text-sm">
            <tr>
              <th className="text-left p-4">User ID</th>
              <th className="text-left p-4">Username</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/50 transition"
              >
                <td className="p-4 text-white font-medium">{u.id}</td>
                <td className="p-4 text-gray-200">{u.username}</td>
                <td className="p-4 text-gray-300">{u.email}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-lg border w-fit text-xs flex items-center gap-2 ${
                      ROLE_MAP[u.role]
                    }`}
                  >
                    <Shield size={14} />
                    {u.role}
                  </span>
                </td>

                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-gray-200 cursor-pointer"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({ open: true, id: u.id })
                    }
                    className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => openView(u)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-gray-200 cursor-pointer"
                  >
                    <User size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No users match your search.
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* ADD / EDIT / VIEW DRAWER */}
      {/* -------------------------------------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-96 h-full bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto animate-slideIn shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-bold">
                {drawerMode === "add" && "Add User"}
                {drawerMode === "edit" && "Edit User"}
                {drawerMode === "view" && "User Details"}
              </h2>

              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* VIEW MODE */}
            {drawerMode === "view" && selectedUser && (
              <div className="space-y-6 text-gray-300">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-white flex items-center gap-2">
                    <User2 size={18} /> {selectedUser.username}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-white flex items-center gap-2">
                    <Mail size={18} /> {selectedUser.email}
                  </p>
                </div>

                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-white flex items-center gap-2">
                      <Phone size={18} /> {selectedUser.phone}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span
                    className={`px-3 py-1 rounded-lg border w-fit text-xs inline-flex items-center gap-2 ${
                      ROLE_MAP[selectedUser.role]
                    }`}
                  >
                    <Shield size={14} />
                    {selectedUser.role}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar size={18} />{" "}
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* ADD / EDIT FORM */}
            {(drawerMode === "add" || drawerMode === "edit") && (
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="text-gray-400 text-sm">Username</label>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 mt-1 flex items-center gap-3">
                    <User2 size={18} className="text-gray-500" />
                    <input
                      className="w-full bg-transparent outline-none text-gray-200"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 mt-1 flex items-center gap-3">
                    <Mail size={18} className="text-gray-500" />
                    <input
                      className="w-full bg-transparent outline-none text-gray-200"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-gray-400 text-sm">Full Name</label>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 mt-1 flex items-center gap-3">
                    <User size={18} className="text-gray-500" />
                    <input
                      className="w-full bg-transparent outline-none text-gray-200"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 mt-1 flex items-center gap-3">
                    <Phone size={18} className="text-gray-500" />
                    <input
                      className="w-full bg-transparent outline-none text-gray-200"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-gray-400 text-sm">Password</label>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 mt-1 flex items-center gap-3">
                    <Lock size={18} className="text-gray-500" />
                    <input
                      type="password"
                      className="w-full bg-transparent outline-none text-gray-200"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder={
                        drawerMode === "edit"
                          ? "Leave empty to keep old password"
                          : "Set password"
                      }
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="text-gray-400 text-sm">Role</label>
                  <select
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-gray-200"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveUser}
                  className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {drawerMode === "add" ? "Create User" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* DELETE USER CONFIRMATION */}
      {/* -------------------------------------------------------- */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-96 text-center shadow-xl">
            <h3 className="text-xl text-white font-bold">
              Delete this user?
            </h3>
            <p className="text-gray-400 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-gray-300 hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={deleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
