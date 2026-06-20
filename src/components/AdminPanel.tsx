/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart3, Plus, Edit, Trash2, Users, BookOpen, MessageSquare, 
  Tag, Compass, IndianRupee, CheckCircle2, TrendingUp, HelpCircle, 
  Loader2, RefreshCw, Layers, Check, X, ShieldAlert 
} from "lucide-react";
import { Product, Category, User, Order, Inquiry } from "../types";

interface AdminPanelProps {
  currentUser: User | null;
  apiBaseUrl: string;
  onRefreshProducts: () => void;
}

type AdminTab = "dashboard" | "products" | "categories" | "customers" | "orders" | "inquiries";

export default function AdminPanel({
  currentUser,
  apiBaseUrl,
  onRefreshProducts,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Product CRUD Form state
  const [productEditing, setProductEditing] = useState<Product | null>(null);
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pCategory, setPCategory] = useState("Men");
  const [pImage, setPImage] = useState("");
  const [pStock, setPStock] = useState(10);
  const [pFeatured, setPFeatured] = useState(false);
  const [pGalleryRaw, setPGalleryRaw] = useState("");
  const [pSizes, setPSizes] = useState("");
  const [pColors, setPColors] = useState("");
  const [pMaterial, setPMaterial] = useState("");

  // Category CRUD Form state
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  // Trigger Refetches
  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("knr_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all sources concurrently
      const [pRes, cRes, cuRes, oRes, iRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/products`),
        fetch(`${apiBaseUrl}/api/categories`),
        fetch(`${apiBaseUrl}/api/customers`, { headers }),
        fetch(`${apiBaseUrl}/api/orders`, { headers }),
        fetch(`${apiBaseUrl}/api/inquiries`, { headers }),
      ]);

      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (cuRes.ok) setCustomers(await cuRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (iRes.ok) setInquiries(await iRes.json());
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error communicating with security vaults.");
    } finally {
      setLoading(false);
    }
  };

  // Check admin authorization
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#090909] border border-red-500/35 rounded-sm shadow-xl text-center space-y-6">
        <ShieldAlert className="h-14 w-14 text-red-500 mx-auto animate-pulse" />
        <div className="space-y-1.5">
          <h2 className="font-cinzel text-lg font-bold text-white uppercase tracking-widest">
            Aura Revoked • Unauthorized Access
          </h2>
          <p className="font-sans text-xs text-gray-400 leading-relaxed">
            This module represents KNR high street administrative vaults. Only users with designated Admin roles can synchronize ledger keys.
          </p>
        </div>
        <p className="font-mono text-[10px] text-zinc-600 bg-black/50 py-1.5 rounded-sm">
          ErrorCode: KNR_ADMIN_SHIELD_403
        </p>
      </div>
    );
  }

  // ==================== PRODUCT FORM MGMT ====================
  const handleEditProductClick = (prod: Product) => {
    setProductEditing(prod);
    setPName(prod.name);
    setPDesc(prod.description);
    setPPrice(prod.price);
    setPCategory(prod.category);
    setPImage(prod.image);
    setPStock(prod.stock || 10);
    setPFeatured(prod.featured);
    setPGalleryRaw(Array.isArray(prod.gallery) ? prod.gallery.join(", ") : prod.image);
    setPSizes(Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "");
    setPColors(Array.isArray(prod.colors) ? prod.colors.join(", ") : "");
    setPMaterial(prod.material || "");
    
    // Smooth scroll to form
    const fNode = document.getElementById("product-form-anchor");
    if (fNode) fNode.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearProductForm = () => {
    setProductEditing(null);
    setPName("");
    setPDesc("");
    setPPrice(0);
    setPCategory("Men");
    setPImage("");
    setPStock(10);
    setPFeatured(false);
    setPGalleryRaw("");
    setPSizes("");
    setPColors("");
    setPMaterial("");
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pName.trim()) {
      setErrorMsg("Couture Product Title cannot be empty.");
      return;
    }
    if (!pDesc || !pDesc.trim()) {
      setErrorMsg("Descriptive Copy of the cloth cannot be empty.");
      return;
    }
    if (!pPrice || pPrice <= 0) {
      setErrorMsg("Price Quotient is required and must be greater than zero.");
      return;
    }
    if (!pCategory || !pCategory.trim()) {
      setErrorMsg("Collection category classification is required.");
      return;
    }
    if (!pImage || !pImage.trim()) {
      setErrorMsg("Primary Image URL of the design cannot be empty.");
      return;
    }
    if (pStock === undefined || pStock < 0) {
      setErrorMsg("Stock quantity must be specified as 0 or higher.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const token = localStorage.getItem("knr_token");
    const galleryArr = pGalleryRaw 
      ? pGalleryRaw.split(",").map(s => s.trim()).filter(s => s.length > 0)
      : [pImage];

    const body = {
      name: pName,
      description: pDesc,
      price: Number(pPrice),
      category: pCategory,
      image: pImage,
      gallery: galleryArr,
      stock: Number(pStock),
      featured: pFeatured,
      sizes: pSizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: pColors.split(",").map(c => c.trim()).filter(Boolean),
      material: pMaterial
    };

    try {
      let res;
      if (productEditing) {
        // UPDATE PUT
        res = await fetch(`${apiBaseUrl}/api/products/${productEditing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      } else {
        // CREATE POST
        res = await fetch(`${apiBaseUrl}/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      }

      if (res.ok) {
        setSuccessMsg(productEditing ? "Couture line updated." : "New couture line added to high street.");
        handleClearProductForm();
        fetchAdminData();
        onRefreshProducts();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Save error occurred");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error finalizing product updates.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to retire this product from KNR catalogue?")) return;
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("Product catalogue record retired.");
        fetchAdminData();
        onRefreshProducts();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error decommissioning products.");
    }
  };


  // ==================== CATEGORY MGMT ====================
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: catName, slug: catSlug })
      });
      if (res.ok) {
        setSuccessMsg(`Collection tier ${catName} introduced.`);
        setCatName("");
        setCatSlug("");
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Retire this collection tier from luxury navigation channels?")) return;
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("Collection tier retired.");
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };


  // ==================== ORDER STATUS UPDATE ====================
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`Booking status transitioned to ${newStatus}.`);
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Decommission this order record entirely?")) return;
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("Order removed from ledger logs.");
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };


  // ==================== INQUIRY RESOLVE ====================
  const handleUpdateInquiryStatus = async (inqId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/inquiries/${inqId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`WhatsApp inquiry status transitioned to ${newStatus}.`);
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (inqId: string) => {
    if (!window.confirm("Retire inquiry ticket logs?")) return;
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/inquiries/${inqId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("Ticket record destroyed.");
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats Counters
  const grossSales = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((acc, obj) => acc + Number(obj.totalAmount), 0);
  
  const pendingTix = inquiries.filter(i => i.status === "Pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Admin Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#c5a880]/30 pb-6">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl tracking-widest text-[#d4af37] uppercase font-bold text-gold-gradient">
            High Street Executive Desk
          </h1>
          <p className="font-sans text-xs text-gray-400 mt-1 uppercase tracking-widest">
            KNR Central Administration Suite • Sovereign Ledgers & Logs
          </p>
        </div>

        <div className="flex items-center space-x-3.5 mt-4 md:mt-0">
          <button
            onClick={fetchAdminData}
            className="p-2 bg-obsidian-light/80 hover:bg-obsidian border border-[#c5a880]/20 hover:border-gold-500 hover:text-gold-500 rounded-sm text-gray-400 transition-colors cursor-pointer shrink-0"
            title="Refresh Ledger Sync"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          
          <span className="text-[10px] sm:text-xs font-mono px-3.5 py-1 text-gold-300 border border-gold-500/20 bg-gold-900/10 rounded-sm uppercase tracking-widest">
            Aura: Core Sync Authorized
          </span>
        </div>
      </div>

      {/* Admin Subtabs Selectors */}
      <div className="flex overflow-x-auto pb-1.5 scrollbar-thin border-b border-zinc-800">
        <div className="flex space-x-1 sm:space-x-2">
          {(
            [
              { id: "dashboard", label: "Overview Metrics", icon: BarChart3 },
              { id: "products", label: "Catalogue CRUD", icon: Compass },
              { id: "categories", label: "Tiers & Slots", icon: Layers },
              { id: "orders", label: "Booked Ledgers", icon: BookOpen },
              { id: "customers", label: "Society Ledger", icon: Users },
              { id: "inquiries", label: `WhatsApp Tickets (${pendingTix})`, icon: MessageSquare },
            ] as const
          ).map((t) => {
            const IsActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-sm shrink-0 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 relative ${
                  IsActive
                    ? "bg-[#141414] text-gold-500 border-t border-x border-[#c5a880]/30 font-bold"
                    : "text-gray-400 hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global feedback boards */}
      {errorMsg && (
        <div className="bg-red-950/20 text-red-400 border border-red-500/30 p-3.5 text-xs rounded-sm font-sans flex items-center space-x-2.5">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/35 p-3.5 text-xs rounded-sm font-sans flex items-center space-x-2.5">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
          <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          <span className="font-sans text-xs uppercase tracking-[0.2em]">Synchronizing Vault Invoices...</span>
        </div>
      ) : (
        <div className="animate-fadeIn">
          
          {/* ==================== DASHBOARD OVERVIEW ==================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Quick stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#090909] p-5 rounded-xs border border-luxury-gold/10 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-sans text-gray-500 uppercase tracking-widest font-bold">Boutique Gross Sales</span>
                    <IndianRupee className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">₹{grossSales.toLocaleString()}</h3>
                    <p className="text-[9px] text-emerald-400 font-sans tracking-wide mt-1">Excludes cancelled invoices</p>
                  </div>
                </div>

                <div className="bg-[#090909] p-5 rounded-xs border border-luxury-gold/10 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-sans text-gray-500 uppercase tracking-widest font-bold">Society Registrants</span>
                    <Users className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">{customers.length} Accounts</h3>
                    <p className="text-[9px] text-[#c5a880] font-sans tracking-wide mt-1">Couture society registrants</p>
                  </div>
                </div>

                <div className="bg-[#090909] p-5 rounded-xs border border-luxury-gold/10 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-sans text-gray-500 uppercase tracking-widest font-bold">Active Catalogue</span>
                    <Layers className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">{products.length} Designs</h3>
                    <p className="text-[9px] text-amber-500 font-sans tracking-warning mt-1">{products.filter(p => !p.stock || p.stock < 5).length} Low Stock</p>
                  </div>
                </div>

                <div className="bg-[#090909] p-5 rounded-xs border border-luxury-gold/10 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-sans text-gray-500 uppercase tracking-widest font-bold">WhatsApp Tickets</span>
                    <MessageSquare className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">{inquiries.length} Tickets</h3>
                    <p className="text-[9px] text-[#25D366] font-sans tracking-wide mt-1">{pendingTix} pending resolution</p>
                  </div>
                </div>
              </div>

              {/* Graphic metrics panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Visual statistics bars */}
                <div className="bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm space-y-5">
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                    Category Performance Index
                  </h3>
                  <div className="space-y-4">
                    {["Men", "Women", "Kids", "T-Shirts", "Offers"].map(cat => {
                      const prodsQty = products.filter(p => p.category === cat).length;
                      const orderCount = orders.filter(o => o.items.some(it => it.category === cat)).length; // Estimate
                      const perc = products.length ? (prodsQty / products.length) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1 font-sans">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-300">{cat} Line</span>
                            <span className="text-gold-500">{prodsQty} pieces ({Math.round(perc)}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-500" style={{ width: `${perc}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live inquiries bulletin logs */}
                <div className="bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm space-y-5">
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                    Recent WhatsApp Tickets
                  </h3>

                  {inquiries.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-sans text-xs">
                      No customer inquiries logged.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {inquiries.slice(0, 5).map((inq) => (
                        <div key={inq.id} className="bg-[#030303] border border-luxury-gold/5 p-3 rounded-xs flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-white font-sans">{inq.productName}</p>
                            <p className="text-[10px] text-gray-400 font-sans">By: {inq.userName || "Guest Customer"} ({inq.userPhone || "No contact"})</p>
                          </div>
                          <div className="text-right">
                            <p className="font-cinzel text-gold-500 font-bold">₹{inq.productPrice}</p>
                            <span className={`text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm ${inq.status === "Pending" ? "bg-amber-950/40 text-amber-500 border border-amber-500/10" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/10"}`}>
                              {inq.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ==================== PRODUCTS CATALOGUE CRUD ==================== */}
          {activeTab === "products" && (
            <div className="space-y-10">
              
              {/* Add/Edit Product Anchor Card */}
              <div id="product-form-anchor" className="bg-[#090909] p-6 border border-[#c5a880]/20 rounded-sm space-y-6">
                <div>
                  <h3 className="font-cinzel text-sm font-bold uppercase tracking-widest border-b border-[#c5a880]/10 pb-2 text-gold-300">
                    {productEditing ? `Update Design Parameters • ${productEditing.name}` : "Design Integration Workspace"}
                  </h3>
                  <p className="font-sans text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                    Deploy primary configurations, descriptive copy and image URLs below.
                  </p>
                </div>

                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
                  
                  {/* Left Column: text inputs */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Couture Product Title</label>
                        <input
                          type="text"
                          required
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="e.g., Aurum Royal Tunic"
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Price Quotient (₹ INR)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={pPrice || ""}
                          onChange={(e) => setPPrice(Number(e.target.value))}
                          placeholder="Retail Price in INR"
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Descriptive Copy</label>
                      <textarea
                        rows={3}
                        value={pDesc}
                        onChange={(e) => setPDesc(e.target.value)}
                        placeholder="Detail materials weave patterns design notes"
                        className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Collection category</label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value)}
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden cursor-pointer"
                        >
                          {categories.map(c => (
                            <option key={c.id} className="bg-obsidian" value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Initial Stock Quantity</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={pStock}
                          onChange={(e) => setPStock(Number(e.target.value))}
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>

                      <div className="flex items-center space-x-2 sm:pt-6">
                        <input
                          type="checkbox"
                          id="pFeatured"
                          checked={pFeatured}
                          onChange={(e) => setPFeatured(e.target.checked)}
                          className="accent-[#d4af37] h-4 w-4 border-luxury-gold/20"
                        />
                        <label htmlFor="pFeatured" className="text-[10px] tracking-wider text-gray-300 uppercase cursor-pointer">
                          Add to Elite Selection
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-luxury-gold/10 pt-4">
                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Sizes (com. sep.)</label>
                        <input
                          type="text"
                          value={pSizes}
                          onChange={(e) => setPSizes(e.target.value)}
                          placeholder="e.g. S, M, L, XL"
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Colors (com. sep.)</label>
                        <input
                          type="text"
                          value={pColors}
                          onChange={(e) => setPColors(e.target.value)}
                          placeholder="e.g. Black, Navy, Olive"
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Fabric / Material</label>
                        <input
                          type="text"
                          value={pMaterial}
                          onChange={(e) => setPMaterial(e.target.value)}
                          placeholder="e.g. Wool & Silk Blend"
                          className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: images resources */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Primary Image URL</label>
                      <input
                        type="url"
                        required
                        value={pImage}
                        onChange={(e) => setPImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Additional Gallery URLs</label>
                      <textarea
                        rows={2}
                        value={pGalleryRaw}
                        onChange={(e) => setPGalleryRaw(e.target.value)}
                        placeholder="Separate multiple URLs with commas"
                        className="w-full bg-obsidian py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden resize-none"
                      />
                    </div>

                    <div className="flex space-x-3 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 font-sans text-xs font-bold tracking-widest uppercase rounded-sm hover:from-gold-500 hover:to-gold-300 transition-all duration-300 cursor-pointer shadow-md"
                      >
                        {saving ? "Deploying..." : productEditing ? "Commit Revision" : "Deploy Design"}
                      </button>

                      {productEditing && (
                        <button
                          type="button"
                          onClick={handleClearProductForm}
                          className="py-2.5 px-4 bg-zinc-900 border border-zinc-700 text-gray-400 hover:text-white rounded-sm text-xs font-bold tracking-widest uppercase transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </form>
              </div>

              {/* Spreadsheets lists of products */}
              <div className="bg-[#090909] border border-luxury-gold/10 rounded-sm overflow-hidden space-y-4 p-5">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                  Global Catalogue Inventory ({products.length} Designs)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-luxury-gold/10 text-gray-400 font-semibold uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-2">Design Preview</th>
                        <th className="py-3 px-2">Design Details</th>
                        <th className="py-3 px-2">Collection</th>
                        <th className="py-3 px-2">Price Quotient</th>
                        <th className="py-3 px-2">Stock Inventory</th>
                        <th className="py-3 px-2 text-right">Actions Ledger</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 font-sans">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-zinc-950/40 text-gray-300">
                          <td className="py-3 px-2">
                            <img src={prod.image} alt={prod.name} className="h-10 w-8 object-cover object-top rounded-xs border border-luxury-gold/10 shrink-0" referrerPolicy="no-referrer" />
                          </td>
                          <td className="py-3 px-2 max-w-sm">
                            <p className="font-semibold text-white">{prod.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{prod.description || "No description set"}</p>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-luxury-gold/10 text-gold-300 border border-luxury-gold/5 rounded-sm">
                              {prod.category}
                            </span>
                          </td>
                           <td className="py-3 px-2 font-mono text-gold-500 font-semibold">₹{prod.price}</td>
                          <td className="py-3 px-2">
                            <span className={`text-[10px] font-mono font-bold ${(!prod.stock || prod.stock <= 3) ? "text-red-500" : "text-gray-300"}`}>
                              {prod.stock || 0} left
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditProductClick(prod)}
                                className="p-1.5 bg-zinc-900 border border-luxury-gold/10 hover:border-gold-500/40 text-[#c5a880] hover:text-gold-500 rounded-sm transition-colors"
                                title="Edit parameters"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 bg-zinc-900 border border-red-950 hover:border-red-500 text-red-500/80 hover:text-red-500 rounded-sm transition-colors"
                                title="Destructive retirement"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== MANAGE CATEGORIES ==================== */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Add Category Section */}
              <div className="bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm self-start space-y-5">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-2 text-gold-300">
                  Introduce Collection Tier
                </h3>
                <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Tier Name Description</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="e.g., Summer Resort"
                      className="w-full bg-[#050505] py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1">Ref Tag/Slug</label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="e.g., Summer"
                      className="w-full bg-[#050505] py-2 px-3 text-white border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 font-sans font-bold tracking-widest uppercase rounded-sm hover:from-gold-500 hover:to-gold-300 transition-all duration-300 cursor-pointer shadow-md"
                  >
                    Deploy Collection Tier
                  </button>
                </form>
              </div>

              {/* List Collection categories */}
              <div className="lg:col-span-2 bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm space-y-4">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                  Active Collection Slots ({categories.length} Tiers)
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-[#030303] border border-luxury-gold/5 p-4 rounded-xs flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-white font-sans text-sm">{cat.name}</p>
                        <p className="text-[10px] text-gold-500 font-mono">Reference slug: {cat.slug}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={["Men", "Women", "Kids", "T-Shirts", "Offers"].includes(cat.slug)}
                        className="p-1.5 bg-zinc-900 border border-red-950 hover:border-red-500 text-red-500 hover:text-red-500 rounded-sm transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title={["Men", "Women", "Kids", "T-Shirts", "Offers"].includes(cat.slug) ? "Core System Locked" : "Delete Tier"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== MANAGE CUSTOM BOOKINGS ==================== */}
          {activeTab === "orders" && (
            <div className="bg-[#090909] border border-luxury-gold/10 p-6 rounded-sm space-y-4">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                Active Boutique Orders & Bookings ({orders.length} Records)
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  No boutique orders registered.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-luxury-gold/10 text-gray-400 font-semibold uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-2">Order UID</th>
                        <th className="py-3 px-2">Customer Vectors</th>
                        <th className="py-3 px-2">Particular Items Booked</th>
                        <th className="py-3 px-2">Consolidated Bill</th>
                        <th className="py-3 px-2">Fulfillment</th>
                        <th className="py-3 px-2 text-right">Override Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-950/40 text-gray-300">
                          <td className="py-3 px-2">
                            <span className="font-mono font-bold text-gold-500 p-1.5 bg-black rounded-sm border border-gold-900/20 uppercase tracking-widest shrink-0">{o.id}</span>
                          </td>
                          <td className="py-3 px-2">
                            <p className="font-semibold text-white">{o.userName}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{o.userPhone}</p>
                            <p className="text-[9px] text-gray-500 truncate max-w-[140px]" title={o.deliveryAddress}>{o.deliveryAddress}</p>
                          </td>
                          <td className="py-3 px-2">
                            <div className="space-y-1">
                              {o.items.map((it: any, idx: number) => (
                                <p key={idx} className="text-[10px]">
                                  {it.name} <strong className="text-gold-500">x{it.quantity || 1}</strong>
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-mono text-gold-500 font-semibold">₹{o.totalAmount}</td>
                          <td className="py-3 px-2">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-sm border outline-hidden ${
                                o.status === "Delivered"
                                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                                  : o.status === "Shipped"
                                  ? "bg-blue-950/20 text-blue-400 border-blue-500/25"
                                  : o.status === "Cancelled"
                                  ? "bg-red-950/20 text-red-400 border-red-500/25"
                                  : "bg-amber-950/20 text-amber-500 border-amber-500/25"
                              }`}
                            >
                              {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(st => (
                                <option key={st} className="bg-obsidian" value={st}>{st}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="p-1.5 bg-zinc-900 border border-red-950 hover:border-red-500 text-red-500 hover:text-red-500 rounded-sm transition-colors"
                              title="Delete log"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== SOCIETY CUSTOMERS LIST ==================== */}
          {activeTab === "customers" && (
            <div className="bg-[#090909] border border-luxury-gold/10 p-5 rounded-sm space-y-4">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                Registered Couture Society Contacts ({customers.length} Accounts)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-luxury-gold/10 text-gray-400 font-semibold uppercase tracking-widest text-[9px]">
                      <th className="py-3 px-2">Account Registry ID</th>
                      <th className="py-3 px-2">Customer Credentials</th>
                      <th className="py-3 px-2">Direct Reach Number</th>
                      <th className="py-3 px-2">System Clearance Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-950/40 text-gray-300">
                        <td className="py-3 px-2 font-mono text-gray-500 text-[10px] uppercase">{c.id}</td>
                        <td className="py-3 px-2">
                          <p className="font-semibold text-white">{c.name}</p>
                          <p className="text-[10px] text-[#c5a880]">{c.email}</p>
                          <p className="text-[9px] text-gray-500 truncate max-w-sm mt-0.5" title={c.address}>{c.address || "No delivery address logged"}</p>
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-400">{c.phone || "No contact logged"}</td>
                        <td className="py-3 px-2">
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-sm border ${c.role === "admin" ? "bg-purple-950/20 text-purple-400 border-purple-500/20" : "bg-zinc-900 text-gray-400 border-zinc-800"}`}>
                            {c.role} Gate
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== MANAGE WHATSAPP INQUIRIES ==================== */}
          {activeTab === "inquiries" && (
            <div className="bg-[#090909] border border-luxury-gold/10 p-5 rounded-sm space-y-4">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest border-b border-[#c5a880]/15 pb-3 text-gold-300">
                Tracked WhatsApp Inquiry Tickets ({inquiries.length} Logs)
              </h3>

              {inquiries.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  No inquiries locked.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-luxury-gold/10 text-gray-400 font-semibold uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-2">Ticket ID</th>
                        <th className="py-3 px-2">Focus Product Details</th>
                        <th className="py-3 px-2">Enquiring Customer</th>
                        <th className="py-3 px-2">Contact Link</th>
                        <th className="py-3 px-2">Fulfillment</th>
                        <th className="py-3 px-2 text-right">Overrides</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-zinc-950/40 text-gray-300">
                          <td className="py-3 px-2 font-mono text-gray-500 text-[10px] uppercase">{inq.id}</td>
                          <td className="py-3 px-2">
                            <p className="font-semibold text-white">{inq.productName}</p>
                            <p className="text-[10px] text-gold-500 font-semibold font-mono">₹{inq.productPrice}</p>
                          </td>
                          <td className="py-3 px-2">
                            <p className="font-semibold text-white">{inq.userName || "Guest Customer"}</p>
                            <p className="text-[10px] text-gray-400">{inq.userPhone || "No telephone logged"}</p>
                          </td>
                          <td className="py-3 px-2">
                            {inq.userPhone ? (
                              <a
                                href={`https://wa.me/${inq.userPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="no-referrer noreferrer"
                                className="text-[#25D366] hover:underline flex items-center space-x-1 font-semibold"
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                <span>Message Client</span>
                              </a>
                            ) : (
                              <span className="text-gray-500">No contact links</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                              className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-sm border outline-hidden ${
                                inq.status === "Completed"
                                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/25"
                                  : inq.status === "Followed Up"
                                  ? "bg-blue-950/20 text-blue-400 border-blue-500/25"
                                  : "bg-amber-950/20 text-amber-500 border-amber-500/25"
                              }`}
                            >
                              {["Pending", "Followed Up", "Completed"].map(status => (
                                <option key={status} className="bg-obsidian" value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-1.5 bg-zinc-900 border border-red-950 hover:border-red-500 text-red-500 hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
