/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Menu, X, Heart, User, LogOut, ShieldAlert, ShoppingBag, Search } from "lucide-react";
import { User as UserType } from "../types";

interface NavbarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  wishlistCount: number;
  openWishlist: () => void;
  openAuthModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({
  activeSection,
  setActiveSection,
  currentUser,
  onLogout,
  wishlistCount,
  openWishlist,
  openAuthModal,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navigationItems = [
    { label: "Home", id: "Home" },
    { label: "Men", id: "Men" },
    { label: "Women", id: "Women" },
    { label: "Kids", id: "Kids" },
    { label: "T-Shirts", id: "T-Shirts" },
    { label: "Offers", id: "Offers" },
    { label: "About Us", id: "About Us" },
    { label: "Contact Us", id: "Contact Us" },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#070707]/95 border-b border-luxury-gold/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick("Home")}>
            <div className="flex flex-col items-start leading-none">
              <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.25em] text-gold-500 hover:text-gold-300 transition-colors">
                KNR
              </span>
              <span className="font-sans text-[8px] tracking-[0.4em] text-luxury-gold uppercase mt-1">
                FASHIONS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-6">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`font-sans text-xs tracking-widest uppercase transition-all duration-300 relative py-2 ${
                    isActive
                      ? "text-gold-500 font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-300 via-gold-500 to-luxury-gold shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search, Wishlist, User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                className={`w-40 xl:w-56 bg-obsidian-light/80 text-white pl-9 pr-4 py-1.5 rounded-full text-xs font-sans tracking-wide border border-luxury-gold/20 outline-hidden transition-all duration-300 focus:border-gold-500 ${
                  isSearchFocused ? "w-56 xl:w-64 border-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.2)]" : ""
                }`}
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-luxury-gold/60" />
            </div>

            {/* Wishlist Button */}
            <button
              onClick={openWishlist}
              className="relative p-2 text-gray-400 hover:text-gold-500 transition-colors rounded-full hover:bg-obsidian-light"
              title="My Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-obsidian text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Profile / Dashboard trigger */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {currentUser.role === "admin" ? (
                  <button
                    onClick={() => handleNavClick("Admin")}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs tracking-wider uppercase transition-all duration-300 ${
                      activeSection === "Admin"
                        ? "bg-gold-500 text-obsidian border-gold-500"
                        : "bg-obsidian border-luxury-gold/30 text-gold-500 hover:border-gold-500"
                    }`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                    <span className="max-w-[100px] truncate">Admin: {currentUser.name.split(" ")[0]}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick("Profile")}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs tracking-wider uppercase transition-all duration-300 ${
                      activeSection === "Profile"
                        ? "bg-gold-500 text-obsidian border-gold-500"
                        : "bg-obsidian border-luxury-gold/30 text-gold-500 hover:border-gold-500"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span className="max-w-[100px] truncate">{currentUser.name.split(" ")[0]}</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-obsidian-light rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-gold-600 to-gold-400 text-black px-4 py-1.5 rounded-sm text-xs font-sans tracking-widest uppercase font-bold hover:from-gold-500 hover:to-gold-300 transition-all duration-300 cursor-pointer shadow-md"
              >
                <User className="h-3.5 w-3.5" />
                <span>Join / Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu & actions */}
          <div className="flex lg:hidden items-center space-x-2">
            
            {/* Wishlist Mobile Action */}
            <button
              onClick={openWishlist}
              className="relative p-2 text-gray-400 hover:text-gold-500 transition-colors rounded-full"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-obsidian text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Profile trigger on mobile */}
            {currentUser && (
              <button
                onClick={() => handleNavClick("Profile")}
                className={`p-2 rounded-full ${activeSection === "Profile" ? "text-gold-500" : "text-gray-400"}`}
              >
                <User className="h-5 w-5" />
              </button>
            )}

            {/* Main menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-gold-500 p-2 rounded-full hover:bg-obsidian"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation links */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-luxury-gold/10 px-4 py-4 space-y-4 animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search complete luxury line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian-light text-white pl-9 pr-4 py-2 rounded-sm text-xs border border-luxury-gold/20 outline-hidden focus:border-gold-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-luxury-gold/40" />
          </div>

          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left font-sans text-xs tracking-widest uppercase py-2.5 px-3 block rounded-xs transition-colors ${
                    isActive
                      ? "bg-gold-500/10 text-gold-500 border-l-2 border-gold-500"
                      : "text-gray-400 hover:bg-obsidian-light hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User management on mobile */}
          <div className="pt-4 border-t border-luxury-gold/10">
            {currentUser ? (
              <div className="flex flex-col space-y-2 px-3">
                <div className="flex items-center space-x-2 pb-2">
                  <User className="h-4 w-4 text-gold-500" />
                  <span className="text-gray-300 text-xs font-semibold">{currentUser.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 bg-luxury-gold/20 text-gold-300 rounded-sm">
                    {currentUser.role}
                  </span>
                </div>
                
                {currentUser.role === "admin" ? (
                  <button
                    onClick={() => handleNavClick("Admin")}
                    className="w-full text-center py-2 text-xs border border-amber-500/30 rounded-sm text-gold-500 hover:bg-gold-500/10 tracking-widest uppercase transition-colors"
                  >
                    Go to Admin Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick("Profile")}
                    className="w-full text-center py-2 text-xs border border-luxury-gold/30 rounded-sm text-gold-500 hover:bg-luxury-gold/10 tracking-widest uppercase transition-colors"
                  >
                    My Account Profile
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="w-full text-center py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-sm tracking-widest uppercase transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 rounded-sm text-xs font-sans tracking-widest uppercase font-bold shadow-md text-center max-w-full block"
              >
                Join / Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
