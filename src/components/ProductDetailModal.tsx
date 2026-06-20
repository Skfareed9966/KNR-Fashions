/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Heart, MessageSquare, ShieldCheck, Truck, RefreshCcw, Tag, Edit } from "lucide-react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onBuyOnWhatsApp: (p: Product) => Promise<void> | void;
  onBookDirectOrder: (p: Product, qty: number, address: string, contact: string, name: string) => Promise<void> | void;
  currentUser: { name: string; email: string; phone?: string; address?: string } | null;
  isAdmin?: boolean;
  onEditClick?: (p: Product) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onBuyOnWhatsApp,
  onBookDirectOrder,
  currentUser,
  isAdmin = false,
  onEditClick,
}: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [checkoutMode, setCheckoutMode] = useState(false);
  
  // Checkout Fields
  const [customName, setCustomName] = useState(currentUser?.name || "");
  const [customPhone, setCustomPhone] = useState(currentUser?.phone || "");
  const [customAddress, setCustomAddress] = useState(currentUser?.address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const images = Array.isArray(product.gallery) && product.gallery.length > 0 
    ? product.gallery 
    : [product.image];

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customPhone || !customAddress) {
      alert("Please fill out all billing and shipping variables.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onBookDirectOrder(product, quantity, customAddress, customPhone, customName);
      setOrderPlaced(true);
      setTimeout(() => {
        setCheckoutMode(false);
        setOrderPlaced(false);
        onClose();
      }, 3500);
    } catch (err) {
      console.error(err);
      alert("Error confirming booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      {/* Container Card */}
      <div className="relative w-full max-w-4xl bg-obsidian border border-luxury-gold/30 rounded-xs overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.25)] z-10 animate-scaleUp my-8">
        
        {/* Close Button Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-luxury-gold/20 text-luxury-gold hover:text-gold-500 hover:border-gold-500/50 z-20 transition-all duration-300"
          title="Close details modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Gallery Media Block */}
          <div className="p-6 bg-[#030303] flex flex-col justify-between">
            <div className="aspect-3/4 rounded-xs overflow-hidden border border-luxury-gold/10 relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Gallery Thumbnails List */}
            {images.length > 1 && (
              <div className="flex space-x-2.5 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 shrink-0 rounded-xs overflow-hidden border transition-all duration-300 relative ${
                      activeImage === img
                        ? "border-gold-500 scale-95 shadow-md shadow-gold-500/10"
                        : "border-zinc-800 hover:border-luxury-gold/50"
                    }`}
                  >
                    <img src={img} alt="Thumbnail preview" className="h-full w-full object-cover object-top" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Content Block */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            
            {!checkoutMode ? (
              // Primary Details Screen
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-[10px] uppercase font-sans tracking-[0.2em] text-gold-300">
                    <Tag className="h-3 w-3" />
                    <span>{product.category} Collection</span>
                  </div>
                  <h2 className="font-cinzel text-xl md:text-2xl font-bold tracking-wide text-white mt-1">
                    {product.name}
                  </h2>
                </div>

                <div className="flex items-baseline space-x-4 border-y border-luxury-gold/10 py-4">
                  <span className="font-cinzel text-2xl md:text-3xl text-gold-500 font-bold tracking-wide">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-sans tracking-wide uppercase line-through">
                    ₹{Math.round(product.price * 1.35).toLocaleString()}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-extrabold bg-gold-500/10 text-gold-300 px-2 py-0.5 rounded-sm">
                    Express Free Delivery
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-sans text-[11px] uppercase tracking-widest text-[#c5a880] font-semibold">Couture Description</h4>
                  <p className="font-sans text-xs text-gray-300 leading-relaxed">
                    {product.description || "Indulge in couture designs tailored for royal prominence. This KNR original integrates traditional silhouettes with luxury modern design."}
                  </p>
                </div>

                {/* Shipping & Support guarantees block */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center border-b border-luxury-gold/10 pb-4">
                  <div className="flex flex-col items-center bg-obsidian-light/50 p-2.5 rounded-xs border border-luxury-gold/5">
                    <Truck className="h-4.5 w-4.5 text-gold-500" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-1.5 font-sans font-medium">Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center bg-obsidian-light/50 p-2.5 rounded-xs border border-luxury-gold/5">
                    <ShieldCheck className="h-4.5 w-4.5 text-gold-500" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-1.5 font-sans font-medium">100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center bg-obsidian-light/50 p-2.5 rounded-xs border border-luxury-gold/5">
                    <RefreshCcw className="h-4.5 w-4.5 text-gold-500" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-1.5 font-sans font-medium">Couture Fit Guarantee</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-zinc-700 bg-[#090909] px-2 rounded-xs">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="text-gray-400 hover:text-white px-2 py-1 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="text-white px-3 font-mono font-semibold text-xs">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(product.stock || 20, prev + 1))}
                      className="text-gray-400 hover:text-white px-2 py-1 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`px-4 rounded-xs flex items-center justify-center border transition-all duration-300 ${
                      isWishlisted
                        ? "bg-gold-500 text-obsidian border-gold-500"
                        : "border-zinc-700 text-gray-400 hover:text-white hover:border-luxury-gold"
                    }`}
                    title={isWishlisted ? "Favorite" : "Mark as Favorite"}
                  >
                    <Heart className="h-4.5 w-4.5" fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Primary Button Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onBuyOnWhatsApp(product)}
                    disabled={isOutOfStock}
                    className={`w-full tracking-wider font-sans text-xs py-3 px-4 uppercase font-bold rounded-sm flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                      isOutOfStock
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : currentUser
                          ? "bg-[#25D366] hover:bg-[#20ba5a] text-white hover:shadow-lg shadow-[#25D366]/10"
                          : "bg-zinc-900 border border-luxury-gold/30 hover:border-gold-500 text-gold-300 hover:text-gold-500"
                    }`}
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    <span>
                      {isOutOfStock
                        ? "Sold Out"
                        : currentUser
                          ? "Buy on WhatsApp"
                          : "Login to Buy"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onBuyOnWhatsApp(product);
                      } else {
                        setCheckoutMode(true);
                      }
                    }}
                    disabled={isOutOfStock}
                    className={`w-full tracking-wider font-sans text-xs py-3 px-4 uppercase font-bold rounded-sm flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                      isOutOfStock
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : currentUser
                          ? "bg-gradient-to-r from-gold-600 to-gold-400 text-black hover:from-gold-500 hover:to-gold-300"
                          : "bg-zinc-950 border border-gold-900/40 text-gold-400 hover:bg-[#141414]"
                    }`}
                  >
                    <span>
                      {isOutOfStock
                        ? "Restocking"
                        : currentUser
                          ? "Instant Booking"
                          : "Login to Book"}
                    </span>
                  </button>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t border-luxury-gold/15 mt-5">
                    <button
                      onClick={() => {
                        onClose();
                        onEditClick?.(product);
                      }}
                      className="w-full bg-[#111] hover:bg-[#1f1a14] border border-gold-500 text-gold-500 py-3 px-4 text-xs font-bold tracking-widest uppercase rounded-sm flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.01]"
                    >
                      <Edit className="h-4 w-4 text-gold-500" />
                      <span>Admin: Edit Photo & Price</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Dedicated Booking Form
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-luxury-gold/10">
                  <h3 className="font-cinzel text-md tracking-wider text-gold-500 font-bold uppercase">
                    Checkout & Express Booking
                  </h3>
                  <button
                    onClick={() => setCheckoutMode(false)}
                    className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-sans"
                  >
                    ← Back
                  </button>
                </div>

                {orderPlaced ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="h-16 w-16 bg-gold-500/10 border border-gold-500 text-gold-500 flex items-center justify-center rounded-full mx-auto">
                      <ShieldCheck className="h-8 w-8 animate-bounce" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-wider">Couture Booking Confirmed</h4>
                      <p className="font-sans text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                        Your luxury order has been finalized in our high street boutique. We have automatically initialized your WhatsApp delivery receipt. Redirecting...
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="bg-[#090909] p-3 border border-luxury-gold/10 rounded-sm">
                      <p className="text-[10px] font-sans tracking-wide uppercase text-gray-500">Order Totals</p>
                      <div className="flex justify-between items-center text-sm font-medium mt-1">
                        <span className="text-white font-sans text-xs">{product.name} (x{quantity})</span>
                        <span className="text-gold-500 font-cinzel font-semibold">₹{(product.price * quantity).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-[#c5a880] uppercase font-bold mb-1">
                          Consignee Name
                        </label>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Your complete legal name"
                          className="w-full bg-[#050505] text-white py-2 px-3 text-xs rounded-sm border border-luxury-gold/15 outline-hidden focus:border-gold-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-[#c5a880] uppercase font-bold mb-1">
                          WhatsApp Contact Number
                        </label>
                        <input
                          type="text"
                          required
                          value={customPhone}
                          onChange={(e) => setCustomPhone(e.target.value)}
                          placeholder="Include country code (e.g. +91XXXXXXXXXX)"
                          className="w-full bg-[#050505] text-white py-2 px-3 text-xs rounded-sm border border-luxury-gold/15 outline-hidden focus:border-gold-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-[#c5a880] uppercase font-bold mb-1">
                          Delivery Address
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          placeholder="Complete physical street, suite and pincode vectors"
                          className="w-full bg-[#050505] text-white py-2 px-3 text-xs rounded-sm border border-luxury-gold/15 outline-hidden focus:border-gold-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-3 px-4 font-sans text-xs tracking-widest uppercase font-bold rounded-sm transition-all duration-300 hover:from-gold-500 hover:to-gold-300 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? "Securing Ledger..." : `Authorize Booking • $${(product.price * quantity).toLocaleString()}`}
                    </button>
                    
                    <p className="text-[10px] text-gray-500 font-sans text-center leading-relaxed">
                      By prioritizing Booking, you also trigger immediate WhatsApp checkout routing alerts to our regional boutique agents.
                    </p>
                  </form>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-luxury-gold/10 flex justify-between items-center">
              <span className="text-[10px] font-sans tracking-wider text-gray-500">Security Encrypted Checkout G-V29</span>
              <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200" alt="Authenticity badge" className="h-6 object-contain opacity-40 grayscale" referrerPolicy="no-referrer" />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
