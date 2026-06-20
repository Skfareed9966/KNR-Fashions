/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, Search, MessageSquare, Check, ShoppingBag, Edit } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onBuyOnWhatsApp: (p: Product) => Promise<void> | void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onEditClick?: (p: Product) => void;
  key?: string | number;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onBuyOnWhatsApp,
  isLoggedIn = false,
  isAdmin = false,
  onEditClick,
}: ProductCardProps) {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="group relative bg-[#090909] border border-luxury-gold/15 hover:border-gold-500/40 transition-all duration-500 rounded-xs overflow-hidden flex flex-col h-full shadow-md hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]">
      
      {/* Product Image Stage */}
      <div className="relative aspect-3/4 overflow-hidden bg-zinc-950 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gray shading overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />

        {/* Heart Wishlist overlay button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all duration-300 transform scale-90 group-hover:scale-100 ${
            isWishlisted
              ? "bg-gold-500 text-obsidian shadow-md"
              : "bg-black/60 text-white hover:text-gold-500 border border-white/10"
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.(product);
            }}
            className="absolute top-15 right-3.5 p-2 rounded-full bg-black/80 hover:bg-gold-500 text-gold-400 hover:text-black border border-luxury-gold/30 hover:border-gold-500 backdrop-blur-md transition-all duration-300 transform scale-90 sm:scale-100 shadow-md z-10"
            title="Admin Desk: Edit Photo & Price"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
          {product.category === "Offers" && (
            <span className="text-[9px] font-sans tracking-wider uppercase bg-red-600 text-white font-bold px-2 py-0.5 rounded-xs shadow-md">
              PROMO OFFER
            </span>
          )}
          {product.featured && (
            <span className="text-[10px] font-sans tracking-widest uppercase bg-gradient-to-r from-gold-600 to-gold-400 text-black font-semibold px-2 py-0.5 rounded-xs shadow-md">
              ELITE SELECTION
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[9px] font-sans tracking-wider bg-zinc-800 text-gray-400 px-2.5 py-1 rounded-xs font-bold shadow-md">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Hover Action Sheet Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-xs">
          <button
            onClick={() => onQuickView(product)}
            className="bg-white/95 text-black hover:bg-gold-500 hover:text-black hover:scale-105 px-4 py-2.5 rounded-sm shadow-xl font-sans text-[11px] uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all duration-300"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Discover Details</span>
          </button>
        </div>
      </div>

      {/* product descriptions */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#0a0a0a] to-[#070707]">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase font-sans tracking-widest text-[#c5a880]/80 mb-1">
            <span>{product.category} Collection</span>
            {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
              <span className="text-amber-500 font-semibold text-[8px] animate-pulse">Only {product.stock} left!</span>
            )}
          </div>
          
          <h3 className="font-cinzel text-xs sm:text-sm font-semibold text-white group-hover:text-gold-500 transition-colors tracking-wide line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-gray-400 font-sans text-[11px] leading-relaxed mt-1.5 mb-3 line-clamp-2">
            {product.description || "Indulge in couture designs tailored for royal prominence."}
          </p>
        </div>

        <div>
          {/* Price & Cart Actions */}
          <div className="flex items-baseline justify-between border-t border-luxury-gold/10 pt-3 mt-1">
            <span className="text-sm font-cinzel text-gold-500 font-bold tracking-wide">
              ₹{Number(product.price).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 font-sans tracking-wider uppercase font-medium">Free Express Delivery</span>
          </div>

          {/* Core Checkout trigger */}
          <button
            onClick={() => onBuyOnWhatsApp(product)}
            disabled={isOutOfStock}
            className={`w-full tracking-widest font-sans text-[11px] py-2 px-3 uppercase mt-3 rounded-sm flex items-center justify-center space-x-1.5 transition-all duration-300 cursor-pointer ${
              isOutOfStock
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/30"
                : isLoggedIn
                  ? "bg-[#25D366] hover:bg-[#20ba5a] text-white hover:scale-[1.02] shadow-[0_4px_10px_rgba(37,211,102,0.15)] font-semibold"
                  : "bg-zinc-900 border border-luxury-gold/30 hover:border-gold-500 text-gold-300 hover:text-gold-500 hover:scale-[1.02] font-semibold"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {isOutOfStock
                ? "Out of Stock"
                : isLoggedIn
                  ? "Buy on WhatsApp"
                  : "Login to Buy"}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
}
