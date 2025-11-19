"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  IndianRupee,
  Image,
  Tag,
} from "lucide-react";
import Loader from "@/components/Loader";

// --------------------------------------------------------
// TYPES
// --------------------------------------------------------
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
}

// --------------------------------------------------------
// PAGE COMPONENT
// --------------------------------------------------------
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Add/Edit Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  async function load() {
    setLoading(true);
    const res = await apiClient.get("/product/api/products");

    if (!res.success) {
      toast.error("Failed to load products");
      setLoading(false);
      return;
    }

    setProducts(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // --------------------------------------------------------
  // FILTERED PRODUCTS
  // --------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // --------------------------------------------------------
  // OPEN ADD PRODUCT
  // --------------------------------------------------------
  const openAdd = () => {
    setDrawerMode("add");
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
    });
    setDrawerOpen(true);
  };

  // --------------------------------------------------------
  // OPEN EDIT PRODUCT
  // --------------------------------------------------------
  const openEdit = (p: Product) => {
    setDrawerMode("edit");
    setCurrentProduct(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      category: p.category || "",
      imageUrl: p.imageUrl || "",
    });
    setDrawerOpen(true);
  };

  // --------------------------------------------------------
  // SAVE PRODUCT (ADD OR EDIT)
  // --------------------------------------------------------
  const saveProduct = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl,
      stockQuantity: 1,
    };

    if (!payload.name || !payload.price) {
      return toast.error("Name and price are required");
    }

    if (drawerMode === "add") {
      const res = await apiClient.post("/product/api/products", payload);
      if (res.success) {
        toast.success("Product added");
        setProducts((prev) => [...prev, res.data]);
      } else toast.error(res.error || "Failed to add product");
    } else {
      const res = await apiClient.put(
        `/product/api/products/${currentProduct?.id}`,
        payload
      );
      if (res.success) {
        toast.success("Product updated");
        setProducts((prev) =>
          prev.map((p) => (p.id === currentProduct?.id ? res.data : p))
        );
        load();
      } else toast.error(res.error || "Failed to update product");
    }

    setDrawerOpen(false);
  };

  // --------------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------------
  const deleteProduct = async () => {
    if (!deleteModal.id) return;

    const res = await apiClient.del(`/product/api/products/${deleteModal.id}`);

    if (res.success) {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
    } else toast.error(res.error || "Failed to delete");
  };

  // --------------------------------------------------------
  // UI START
  // --------------------------------------------------------
  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Manage Products
        </h1>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800">
        <Search className="text-gray-500" size={18} />
        <input
          className="w-full bg-transparent text-gray-200 placeholder-gray-500 outline-none"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* PRODUCTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <table className="w-full">
          <thead className="bg-zinc-800 text-gray-400 text-sm">
            <tr>
              <th className="text-left p-4">Image</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr
                key={p.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/50 transition"
              >
                <td className="p-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-14 h-14 object-cover rounded-xl border border-zinc-700"
                  />
                </td>

                <td className="p-4 text-white font-medium">{p.name}</td>

                <td className="p-4 text-gray-400 text-sm">
                  {p.category || "—"}
                </td>

                <td className="p-4 text-gray-200">
                  ₹{Number(p.price).toFixed(2)}
                </td>

                <td className="p-4 flex items-center justify-end gap-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-200 cursor-pointer"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => setDeleteModal({ open: true, id: p.id })}
                    className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No matching products.
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* ADD / EDIT PRODUCT DRAWER */}
      {/* -------------------------------------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-96 h-full bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto shadow-xl animate-slideIn flex flex-col justify-between">
            <div className="w-full h-fit">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">
                  {drawerMode === "add" ? "Add Product" : "Edit Product"}
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <div className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700">
                    <Tag size={18} className="text-gray-500" />
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full bg-transparent outline-none text-gray-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-400 text-sm">Description</label>
                  <div className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700">
                    <Tag size={18} className="text-gray-500" />
                    <input
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      className="w-full bg-transparent outline-none text-gray-200"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-gray-400 text-sm">Price</label>
                  <div className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700">
                    <IndianRupee size={18} className="text-gray-500" />
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full bg-transparent outline-none text-gray-200"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-gray-400 text-sm">Category</label>
                  <div className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700">
                    <Tag size={18} className="text-gray-500" />
                    <input
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full bg-transparent outline-none text-gray-200"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-gray-400 text-sm">Image URL</label>
                  {form.imageUrl.length > 0 && (
                    <div>
                      <img
                        src={form.imageUrl}
                        alt="Product Image"
                        className="w-full h-40 object-cover rounded-xl my-2 border border-zinc-700"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700">
                    <Image size={18} className="text-gray-500" />
                    <input
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                      className="w-full bg-transparent outline-none text-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Save Button */}
            <button
              onClick={saveProduct}
              className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
            >
              {drawerMode === "add" ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* -------------------------------------------------------- */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-96 text-center shadow-2xl">
            <h3 className="text-xl text-white font-bold">
              Delete this product?
            </h3>

            <p className="text-gray-400 mt-2">This action cannot be undone.</p>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-gray-300 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={deleteProduct}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition"
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
