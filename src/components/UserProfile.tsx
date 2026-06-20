/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, KeyRound, MapPin, Phone, Mail, ShoppingBag, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { User as UserType, Order } from "../types";

interface UserProfileProps {
  currentUser: UserType | null;
  onLogin: (u: UserType, token: string) => void;
  onUpdateUser: (u: UserType) => void;
  onLogout: () => void;
  apiBaseUrl: string;
}

type AuthTab = "login" | "signup" | "forgot";

export default function UserProfile({
  currentUser,
  onLogin,
  onUpdateUser,
  onLogout,
  apiBaseUrl,
}: UserProfileProps) {
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");

  // Profile Management Logs
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileOrders, setProfileOrders] = useState<Order[]>([]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch orders of client if logged-in
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone || "");
      setProfileAddress(currentUser.address || "");
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileOrders(data);
      }
    } catch (err) {
      console.error("Error reading order history ledger:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login validation failed");
      }
      localStorage.setItem("knr_token", data.token);
      onLogin(data.user, data.token);
      setAuthSuccess("Aura secured. Logged in successfully.");
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminQuickAccess = async () => {
    setEmail("admin@knrfashions.com");
    setPassword("admin123");
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@knrfashions.com", password: "admin123" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login validation failed");
      }
      localStorage.setItem("knr_token", data.token);
      onLogin(data.user, data.token);
      setAuthSuccess("Administrator VIP session active.");
    } catch (err: any) {
      setAuthError(err.message || "Failed to secure administrator logs.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration validation failed");
      }
      localStorage.setItem("knr_token", data.token);
      onLogin(data.user, data.token);
      setAuthSuccess("Profile created successfully.");
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Email and new password are required.");
      return;
    }
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password update failed.");
      }
      setAuthSuccess("Password updated successfully. You can login now!");
      setAuthTab("login");
    } catch (err: any) {
      setAuthError(err.message || "No profile matches this email.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUpdatingProfile(true);
    setAuthSuccess("");
    setAuthError("");

    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${apiBaseUrl}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileName, phone: profilePhone, address: profileAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      onUpdateUser(data.user);
      setAuthSuccess("Couture profile ledger updated successfully!");
      setTimeout(() => setAuthSuccess(""), 4000);
    } catch (err: any) {
      setAuthError(err.message || "Error saving profile details.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (currentUser) {
    // ACCOUNT PORTAL
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-luxury-gold/15 pb-6">
          <div>
            <h1 className="font-cinzel text-2xl md:text-3xl tracking-widest text-white uppercase font-bold text-gold-gradient">
              My Luxury Portal
            </h1>
            <p className="font-sans text-xs text-gray-400 mt-1 uppercase tracking-wider">
              Manage details, track high street invoices, and review WhatsApp inquiries.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-gold-500/10 text-gold-300 px-3 py-1 rounded-sm border border-gold-500/20">
              {currentUser.role.toUpperCase()} LEDGER ACTIVE
            </span>
            <button
              onClick={onLogout}
              className="bg-obsidian border border-red-500/30 text-red-500 text-xs tracking-widest uppercase font-sans font-semibold py-1.5 px-4 rounded-sm hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {authSuccess && (
          <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 p-3.5 text-xs rounded-sm font-sans flex items-center space-x-2.5">
            <CheckCircle className="h-4 w-4" />
            <span>{authSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Section 1: Profile forms */}
          <div className="lg:col-span-1 bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm">
            <h2 className="font-cinzel text-md tracking-wider text-gold-300 uppercase font-bold.5 mb-6 border-b border-luxury-gold/10 pb-3">
              Couture Account Details
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-sans tracking-widest text-gray-500 uppercase font-semibold mb-1">
                  Full Customer Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-obsidian text-white py-2 pl-9 pr-3 text-xs border border-luxury-gold/10 focus:border-gold-500 rounded-sm outline-hidden font-sans"
                  />
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-luxury-gold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest text-gray-500 uppercase font-semibold mb-1">
                  Email Address (Immutable)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-[#030303] text-gray-500 py-2 pl-9 pr-3 text-xs border border-luxury-gold/5 rounded-sm cursor-not-allowed font-sans"
                  />
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-600" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest text-gray-500 uppercase font-semibold mb-1">
                  WhatsApp Contact Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Include country code (+91...)"
                    className="w-full bg-obsidian text-white py-2 pl-9 pr-3 text-xs border border-luxury-gold/10 focus:border-gold-500 rounded-sm outline-hidden font-sans"
                  />
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-luxury-gold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest text-gray-500 uppercase font-semibold mb-1">
                  Shipping Destination Address
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    placeholder="Full physical billing and delivery vectors"
                    className="w-full bg-obsidian text-white py-2 pl-9 pr-3 text-xs border border-luxury-gold/10 focus:border-gold-500 rounded-sm outline-hidden font-sans resize-none"
                  />
                  <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-luxury-gold" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 px-4 rounded-sm text-xs font-sans font-bold tracking-widest uppercase hover:from-gold-500 hover:to-gold-300 transition-all duration-300 shrink-0 cursor-pointer shadow-md"
              >
                {isUpdatingProfile ? "Authorizing Details..." : "Save Account Details"}
              </button>
            </form>
          </div>

          {/* Section 2: Order logs history list */}
          <div className="lg:col-span-2 bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm">
            <div className="flex items-center justify-between border-b border-luxury-gold/10 pb-3 mb-6">
              <h2 className="font-cinzel text-md tracking-wider text-gold-300 uppercase font-bold.5">
                My Booking History Ledger
              </h2>
              <span className="text-[10px] font-mono tracking-wider bg-gold-500/10 text-gold-500 px-2.5 py-0.5 rounded-sm">
                {profileOrders.length} Bookings Recorded
              </span>
            </div>

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 font-sans space-y-2">
                <Loader2 className="h-6 w-6 text-gold-500 animate-spin" />
                <span className="text-xs uppercase tracking-widest">Checking High Street Vaults...</span>
              </div>
            ) : profileOrders.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-12 w-12 bg-obsidian-light rounded-full flex items-center justify-center mx-auto text-gold-500/30 border border-luxury-gold/5">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-cinzel text-xs font-bold uppercase tracking-wider">No Bookings Found</h4>
                  <p className="text-[11px] text-gray-500 font-sans max-w-sm mx-auto">
                    You have not recorded any couture bookings yet! Visit the Men, Women, or Kids collections to start checking out premium fashion.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
                {profileOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#040404]/80 border border-luxury-gold/10 hover:border-gold-500/30 rounded-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gold-500 uppercase tracking-widest bg-gold-900/40 px-2 py-0.5 rounded-xs">
                          {order.id}
                        </span>
                        <span className="text-[10px] font-sans text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>

                      {/* Items previews list */}
                      <div className="space-y-1.5 pt-1.5 border-t border-luxury-gold/5 mt-1">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <img src={item.image} alt="Couture Preview" className="h-7 w-7 rounded-full object-cover object-top border border-luxury-gold/20 shrink-0" referrerPolicy="no-referrer" />
                            <span className="font-sans text-[11px] text-gray-300">
                              {item.name} <strong className="text-[#c5a880] font-mono">x{item.quantity}</strong>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] font-sans text-gray-400 pt-1.5 border-t border-luxury-gold/5 flex gap-4">
                        <span><strong>Shipping Vector:</strong> {order.deliveryAddress}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-2 w-full sm:w-auto text-right border-t sm:border-t-0 border-luxury-gold/5 pt-2 sm:pt-0">
                      <span className="font-cinzel text-base text-gold-500 font-bold">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-widest font-semibold px-2 px-3 py-0.5 rounded-sm font-sans ${
                          order.status === "Delivered"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : order.status === "Shipped"
                            ? "bg-blue-950/45 text-blue-400 border border-blue-500/20"
                            : order.status === "Cancelled"
                            ? "bg-red-950/40 text-red-400 border border-red-500/20"
                            : "bg-amber-950/40 text-amber-500 border border-amber-500/20"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[9px] font-sans text-gray-500 uppercase tracking-widest">{order.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // LOG OUT SCREEN (ACCESS / REGISTRATION PANELS)
  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-[#090909] border border-luxury-gold/25 rounded-md shadow-[0_0_35px_rgba(212,175,55,0.15)] animate-scaleUp">
      
      {/* Tab select block */}
      <div className="grid grid-cols-3 border-b border-luxury-gold/15 mb-6 text-center">
        <button
          onClick={() => { setAuthTab("login"); setAuthError(""); setAuthSuccess(""); }}
          className={`font-cinzel text-xs tracking-widest uppercase pb-3 font-semibold transition-all duration-300 ${
            authTab === "login" ? "text-gold-500 border-b-2 border-gold-500" : "text-gray-500 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setAuthTab("signup"); setAuthError(""); setAuthSuccess(""); }}
          className={`font-cinzel text-xs tracking-widest uppercase pb-3 font-semibold transition-all duration-300 ${
            authTab === "signup" ? "text-gold-500 border-b-2 border-gold-500" : "text-gray-500 hover:text-white"
          }`}
        >
          Register
        </button>
        <button
          onClick={() => { setAuthTab("forgot"); setAuthError(""); setAuthSuccess(""); }}
          className={`font-cinzel text-xs tracking-widest uppercase pb-3 font-semibold transition-all duration-300 ${
            authTab === "forgot" ? "text-gold-500 border-b-2 border-gold-500" : "text-gray-500 hover:text-white"
          }`}
        >
          Reset Password
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="font-cinzel text-lg tracking-widest font-extrabold uppercase text-gold-gradient">
          {authTab === "login" && "Boutique Member Portal"}
          {authTab === "signup" && "Register Couture Account"}
          {authTab === "forgot" && "Update Vault Password"}
        </h2>
        <p className="font-sans text-[10px] uppercase text-gray-500 mt-1 tracking-widest">
          {authTab === "login" && "Access individual orders, track purchases, and buy on WhatsApp"}
          {authTab === "signup" && "Join KNR Fashions for custom tailoring and VIP member catalogs"}
          {authTab === "forgot" && "Re-encrypt password with email validation"}
        </p>
      </div>

      {/* Errors notifications */}
      {authError && (
        <div className="bg-red-950/20 text-red-400 border border-red-500/30 p-2.5 text-[11px] rounded-sm font-sans mb-5 leading-normal">
          {authError}
        </div>
      )}

      {authSuccess && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 p-2.5 text-[11px] rounded-sm font-sans mb-5 leading-normal">
          {authSuccess}
        </div>
      )}

      {/* Forms switch conditional rendered block */}
      {authTab === "login" && (
        <form onSubmit={handleLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@knrfashions.com"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Secret Keyphrase (Password)</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] text-white py-2 pl-3 pr-9 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-[#c5a880]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm hover:from-gold-500 hover:to-gold-300 cursor-pointer shadow-md mt-6 flex items-center justify-center space-x-2"
          >
            {authLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Sign In Securely</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-luxury-gold/10"></div>
            <span className="flex-shrink mx-3 text-[9px] uppercase tracking-widest text-[#c5a880]/60 font-sans font-medium">or</span>
            <div className="flex-grow border-t border-luxury-gold/10"></div>
          </div>

          <button
            type="button"
            onClick={handleAdminQuickAccess}
            disabled={authLoading}
            className="w-full bg-[#111] hover:bg-[#1f1a14] border border-[#c5a880]/30 hover:border-gold-500 text-gold-300 hover:text-gold-500 py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm cursor-pointer shadow-md flex items-center justify-center space-x-2 transition-all duration-300"
          >
            <KeyRound className="h-4 w-4 text-gold-500" />
            <span>Atelier Administrator Desk (Quick Access)</span>
          </button>
        </form>
      )}

      {authTab === "signup" && (
        <form onSubmit={handleSignup} className="space-y-4 font-sans">
          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Complete Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Create Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">WhatsApp Number Mobile (Optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Delivery Destination (Optional)</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Default shipping location coordinates"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm hover:from-gold-500 hover:to-gold-300 cursor-pointer shadow-md mt-6 flex items-center justify-center space-x-2"
          >
            {authLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Register & Initialize</span>
          </button>
        </form>
      )}

      {authTab === "forgot" && (
        <form onSubmit={handleForgotPassword} className="space-y-4 font-sans">
          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">Registered Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-bold mb-1">New Phrase Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New secret keyphrase"
              className="w-full bg-[#050505] text-white py-2 px-3 text-xs border border-luxury-gold/15 focus:border-gold-500 outline-hidden rounded-sm"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm hover:from-gold-500 hover:to-gold-300 cursor-pointer shadow-md mt-6 flex items-center justify-center space-x-2"
          >
            {authLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Commit Password Reset</span>
          </button>
        </form>
      )}



    </div>
  );
}
