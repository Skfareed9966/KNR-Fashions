/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Sparkles, AlertCircle, ArrowRight, Star, Mail, 
  Phone, Globe, Clock, Gift, Heart, Trash2, Eye, ShieldCheck, CheckCircle2,
  Lock, MessageSquare, Loader2, ArrowUpRight, X
} from "lucide-react";
import { Product, User, Category } from "./types";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import UserProfile from "./components/UserProfile";
import AdminPanel from "./components/AdminPanel";

// Production backend relative url binding
const API_BASE_URL = window.location.origin;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("Home");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Wishlist collections
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Authentication session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Selected details modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick feedback messages
  const [globalNotice, setGlobalNotice] = useState("");

  // Contact form submission state
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Load initial databases
  useEffect(() => {
    fetchProducts();
    loadLocalSession();
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error("Error reading boutique catalogue:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadLocalSession = async () => {
    // Read local favorites
    const savedWishlist = localStorage.getItem("knr_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {}
    }

    // Read login token if any
    const token = localStorage.getItem("knr_token");
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          // Stale token clean
          localStorage.removeItem("knr_token");
        }
      } catch (err) {
        console.error("Error loading secure sessions:", err);
      }
    }
  };

  // Auth Handling Actions
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    triggerNotice(`Welcome back to royalty, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("knr_token");
    setCurrentUser(null);
    setActiveSection("Home");
    triggerNotice("Logged out of secure boutique vaults.");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // State to manage immediate admin product modifications (Direct edit from catalogue)
  const [adminEditingProduct, setAdminEditingProduct] = useState<Product | null>(null);
  const [adminEditName, setAdminEditName] = useState("");
  const [adminEditPrice, setAdminEditPrice] = useState(0);
  const [adminEditImage, setAdminEditImage] = useState("");
  const [adminEditDesc, setAdminEditDesc] = useState("");
  const [adminEditCategory, setAdminEditCategory] = useState("Men");
  const [adminEditStock, setAdminEditStock] = useState(10);
  const [adminEditFeatured, setAdminEditFeatured] = useState(false);
  const [adminEditGallery, setAdminEditGallery] = useState("");
  const [adminEditSizes, setAdminEditSizes] = useState("");
  const [adminEditColors, setAdminEditColors] = useState("");
  const [adminEditMaterial, setAdminEditMaterial] = useState("");
  const [adminEditSaving, setAdminEditSaving] = useState(false);
  const [adminEditError, setAdminEditError] = useState("");

  const startAdminEdit = (prod: Product) => {
    setAdminEditingProduct(prod);
    setAdminEditName(prod.name);
    setAdminEditPrice(prod.price);
    setAdminEditImage(prod.image);
    setAdminEditDesc(prod.description || "");
    setAdminEditCategory(prod.category);
    setAdminEditStock(prod.stock || 10);
    setAdminEditFeatured(!!prod.featured);
    setAdminEditGallery(Array.isArray(prod.gallery) ? prod.gallery.join(", ") : prod.image);
    setAdminEditSizes(Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "S, M, L, XL");
    setAdminEditColors(Array.isArray(prod.colors) ? prod.colors.join(", ") : "Black, White");
    setAdminEditMaterial(prod.material || "Premium Cotton Blend");
    setAdminEditError("");
  };

  const handleAdminEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditingProduct) return;
    if (!adminEditName.trim() || !adminEditImage.trim() || adminEditPrice <= 0) {
      setAdminEditError("Name, Image URL and a valid Price Quotient are required.");
      return;
    }
    setAdminEditSaving(true);
    setAdminEditError("");
    try {
      const token = localStorage.getItem("knr_token");
      const res = await fetch(`${API_BASE_URL}/api/products/${adminEditingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: adminEditName,
          price: adminEditPrice,
          image: adminEditImage,
          description: adminEditDesc,
          category: adminEditCategory,
          stock: adminEditStock,
          featured: adminEditFeatured,
          gallery: adminEditGallery.split(",").map(url => url.trim()).filter(Boolean),
          sizes: adminEditSizes.split(",").map(s => s.trim()).filter(Boolean),
          colors: adminEditColors.split(",").map(c => c.trim()).filter(Boolean),
          material: adminEditMaterial
        })
      });
      if (res.ok) {
        triggerNotice(`${adminEditName} custom options & specification revisions deployed.`);
        setAdminEditingProduct(null);
        fetchProducts(); // Refresh listings
      } else {
        const data = await res.json();
        setAdminEditError(data.error || "Failed to revise couture parameters.");
      }
    } catch (err) {
      setAdminEditError("Connection lost. Unable to contact high street servers.");
    } finally {
      setAdminEditSaving(false);
    }
  };

  // Wishlist Handling Actions
  const toggleWishlist = (product: Product) => {
    let updated;
    const isAlready = wishlist.some(item => item.id === product.id);
    if (isAlready) {
      updated = wishlist.filter(item => item.id !== product.id);
      triggerNotice(`Removed ${product.name} from my favorites.`);
    } else {
      updated = [...wishlist, product];
      triggerNotice(`Added ${product.name} to my favorites.`);
    }
    setWishlist(updated);
    localStorage.setItem("knr_wishlist", JSON.stringify(updated));
  };

  // Trigger feedback banner alert
  const triggerNotice = (msg: string) => {
    setGlobalNotice(msg);
    setTimeout(() => {
      setGlobalNotice("");
    }, 4000);
  };

  // WhatsApp checkout integration launcher: Opens official WhatsApp api and submits ticket records
  const handleBuyOnWhatsApp = async (product: Product) => {
    if (!currentUser) {
      triggerNotice("Please Sign In or Sign Up to buy of WhatsApp.");
      setIsAuthModalOpen(true);
      return;
    }

    // Log Inquiry to the server so Admin Panel inquiry list is perfectly maintained
    try {
      const token = localStorage.getItem("knr_token");
      await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          customName: currentUser?.name || "Anonymous Consumer",
          customPhone: currentUser?.phone || ""
        })
      });
    } catch (err) {
      console.error("Inquiry logging failed silently, continuing checkout stream.", err);
    }

    // Direct WhatsApp API construction
    const targetPhone = "918333873696"; // boutique coordinate
    const sizesText = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes.join(", ") : "S, M, L, XL";
    const colorsText = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors.join(", ") : "Black, White";
    const fabricMaterial = product.material || "Premium Custom Finish";

    const rawMessage = `✨ *KNR FASHIONS - BOTIQUE ORDER INQUIRY* ✨

Hello KNR Fashions, I am interested in placing an order for this custom boutique selection:

🛍️ *PRODUCT DETAILS*
*Name:* ${product.name}
*Collection:* ${product.category} Collection
*Price:* ₹${Number(product.price).toLocaleString()}
*Material:* ${fabricMaterial}
*Size Options:* ${sizesText}
*Color Choice:* ${colorsText}

👤 *BUYER PROFILE*
*Name:* ${currentUser?.name || "Premium customer"}
*Email:* ${currentUser?.email || "N/A"}
*WhatsApp Contact:* ${currentUser?.phone || "N/A"}
*Delivery Address:* ${currentUser?.address || "To Be Confirmed on Chat"}

🖼️ *PRODUCT PICTURE:*
${product.image}

Please confirm availability and booking session. Thank you!`;

    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMessage}`;
    
    // Redirect
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Direct Express Checkout booking handle
  const handleBookDirectOrder = async (
    product: Product,
    quantity: number,
    address: string,
    contact: string,
    name: string
  ) => {
    if (!currentUser) {
      triggerNotice("Please Sign In or Sign Up to book designs.");
      setIsAuthModalOpen(true);
      return;
    }

    const token = localStorage.getItem("knr_token");
    const items = [
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
        category: product.category
      }
    ];

    const body = {
      items,
      totalAmount: product.price * quantity,
      deliveryAddress: address,
      contactNumber: contact,
      customName: name,
      customEmail: currentUser?.email || "anonymous_consignor@knrfashions.com",
      paymentMethod: "WhatsApp Receipts & Invoice COD"
    };

    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Booking failure");
    }

    triggerNotice(`Magnificent Booking Confirmed! KNR Order ID issued.`);
    await fetchProducts(); // decrement stock variables
  };

  // Contact form capture
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setTimeout(() => setContactSuccess(false), 9000);
    }, 1800);
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const isAtCorrectCategory = 
      ["Home", "Profile", "Admin", "About Us", "Contact Us"].includes(activeSection) || 
      p.category.toLowerCase() === activeSection.toLowerCase();

    const isMatchSearch = 
      !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return isAtCorrectCategory && isMatchSearch;
  });

  return (
    <div id="app-container" className="min-h-screen bg-black text-gray-100 flex flex-col justify-between selection:bg-gold-500 selection:text-black">
      
      {/* Sticky Global Notification Sheet */}
      {globalNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#c5a880] text-black text-xs font-sans font-bold py-3.5 px-6 rounded-sm shadow-[0_10px_30px_rgba(212,175,55,0.35)] border border-gold-300 animate-slideIn tracking-widest uppercase flex items-center space-x-2">
          <Sparkles className="h-4.5 w-4.5 animate-spin" />
          <span>{globalNotice}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentUser={currentUser}
        onLogout={handleLogout}
        wishlistCount={wishlist.length}
        openWishlist={() => setIsWishlistOpen(true)}
        openAuthModal={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Primary Section Render Router */}
      <main className="flex-1 pb-16">
        
        {/* VIEW ARCHITECTURE 1: HOME AMBIENT LANDING */}
        {activeSection === "Home" && (
          <div className="space-y-20">
            {/* Hero Banner Area */}
            <section className="relative min-h-[85vh] flex items-center justify-center bg-zinc-950 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600" 
                  alt="High fashion models elegant wardrobe background" 
                  className="w-full h-full object-cover opacity-35 scale-105 select-none"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-[#070707]/90" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
              </div>

              <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
                <div className="space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-center space-x-3 text-gold-500 font-semibold tracking-[0.3em] text-[10px] md:text-xs uppercase">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>CENTURY OF DISTINCTION & COUTURE</span>
                  </div>
                  <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.15em] text-gold-gradient block uppercase leading-none pb-2">
                    KNR Fashions
                  </h1>
                  <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#c5a880]/95 max-w-2xl mx-auto font-light leading-relaxed">
                    Opulent silhouettes in rich velvet & liquid golds, handcrafted for those who dictate elegance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setActiveSection("T-Shirts")}
                    className="w-full sm:w-auto bg-gradient-to-r from-gold-600 to-gold-400 text-black font-sans text-xs tracking-[0.25em] uppercase font-bold py-4 px-8 rounded-sm hover:from-gold-500 hover:to-gold-300 transform hover:scale-[1.03] transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    Explore T-Shirts
                  </button>
                  <button 
                    onClick={() => setActiveSection("Women")}
                    className="w-full sm:w-auto bg-transparent text-white border border-[#c5a880]/50 hover:border-gold-500 font-sans text-xs tracking-[0.25em] uppercase font-bold py-4 px-8 rounded-sm hover:text-gold-500 transition-all duration-300 cursor-pointer"
                  >
                    View Women's Couture
                  </button>
                </div>

                {/* Micro anchors list */}
                <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto pt-10 text-center text-gray-500 font-sans text-[10px] uppercase tracking-widest decoration-solid">
                  <div className="space-y-1">
                    <span className="text-[#c5a880] font-cinzel font-semibold block text-sm">HYDERABAD</span>
                    <span>High Street Flagship</span>
                  </div>
                  <div className="space-y-1 border-x border-[#c5a880]/15">
                    <span className="text-[#c5a880] font-cinzel font-semibold block text-sm">13 SELECTED</span>
                    <span>Elite Masterpieces</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#c5a880] font-cinzel font-semibold block text-sm">WHATSAPP</span>
                    <span>Instant VIP Delivery</span>
                  </div>
                </div>
              </div>

              {/* Bottom scroll hint indicator */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-gray-500 font-sans text-[9px] uppercase tracking-[0.3em] cursor-pointer" onClick={() => {
                const destNode = document.getElementById("collections-categories-hook");
                if (destNode) destNode.scrollIntoView({ behavior: "smooth" });
              }}>
                <span>Scroll of Elegance</span>
                <div className="h-10 w-[1px] bg-gradient-to-b from-luxury-gold/50 to-transparent mt-2 animate-bounce" />
              </div>
            </section>

            {/* Category selection grids */}
            <section id="collections-categories-hook" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center space-y-1.5">
                <span className="text-[10px] tracking-widest text-[#c5a880] font-bold uppercase font-sans">SELECT PORTFOLIOS</span>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">Curated Slots</h3>
                <div className="h-[1px] w-14 bg-gold-500 mx-auto mt-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(
                  [
                    { name: "Men's Collection", id: "Men", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400" },
                    { name: "Women's Collection", id: "Women", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400" },
                    { name: "Kids Collection", id: "Kids", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=400" },
                    { name: "Imperial T-Shirts", id: "T-Shirts", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400" },
                    { name: "Exclusive Promo Offers", id: "Offers", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400" }
                  ] as const
                ).map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setActiveSection(c.id)}
                    className="group relative h-48 sm:h-64 rounded-xs overflow-hidden border border-luxury-gold/10 hover:border-gold-500/50 cursor-pointer shadow-md transition-all duration-500 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  >
                    <img src={c.img} alt={c.name} className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-black/20 to-transparent group-hover:via-black/40 transition-colors" />
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-sans text-[8px] tracking-widest text-[#c5a880] uppercase font-bold mb-0.5">LINEAGE SELECT</p>
                      <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white tracking-wide uppercase group-hover:text-gold-500 transition-colors">
                        {c.id === "T-Shirts" ? "T-Shirts" : c.name.split(" ")[0]}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Elite selections (Featured designs) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#c5a880]/20 pb-4">
                <div>
                  <span className="text-[10px] tracking-widest text-gold-500 font-bold uppercase font-sans">OPULENT COUTURE</span>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">Elite Selection</h3>
                </div>
                <button 
                  onClick={() => setActiveSection("T-Shirts")}
                  className="mt-2 sm:mt-0 font-sans text-[11px] tracking-widest uppercase text-gold-300 hover:text-white flex items-center space-x-1.5 transition-colors font-semibold"
                >
                  <span>Browse Whole Catalogue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {productsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-sans space-y-3.5">
                  <Loader2 className="h-7 w-7 text-gold-500 animate-spin" />
                  <span className="text-xs uppercase tracking-widest">Opening vault gates...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.filter(p => !p.stock || p.stock > 0).slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isWishlisted={wishlist.some(item => item.id === p.id)}
                      onToggleWishlist={toggleWishlist}
                      onQuickView={(p) => setSelectedProduct(p)}
                      onBuyOnWhatsApp={handleBuyOnWhatsApp}
                      isLoggedIn={!!currentUser}
                      isAdmin={currentUser?.role === "admin"}
                      onEditClick={startAdminEdit}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Trust highlights section */}
            <section className="bg-[#050505] border-y border-[#c5a880]/15 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex space-x-4 items-start font-sans">
                  <div className="p-3 bg-obsidian border border-[#c5a880]/20 rounded-full shrink-0 text-[#c5a880]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Opulent Craftsmanship</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Each piece undergoes rigorous textile evaluation in our High Street ateliers from premium silk weave, rich velvets to pure 18K gilding lines.</p>
                  </div>
                </div>

                <div className="flex space-x-4 items-start font-sans">
                  <div className="p-3 bg-obsidian border border-[#c5a880]/20 rounded-full shrink-0 text-[#c5a880]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Dedicated WhatsApp Concierge</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Instant direct coordinates with boutique consultants 24/7. Complete order confirmation, delivery tracking, and live fit support.</p>
                  </div>
                </div>

                <div className="flex space-x-4 items-start font-sans">
                  <div className="p-3 bg-obsidian border border-[#c5a880]/20 rounded-full shrink-0 text-[#c5a880]">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Bespoke Gifting Arrangements</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Premium black and gold gold-gilded custom luxury boxes accompanied by handwritten gold-ink certificates of design authenticity.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonial / customer quotes */}
            <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <div className="flex items-center justify-center space-x-1 text-[#d4af37]">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />)}
              </div>
              <p className="font-serif italic text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
                "The Onyx Velvet Blazers embroidered gold patterns exceeded my expectations. KNR Fashions brings absolute classical luxury together with modern fit and VIP client support. Highly recommended!"
              </p>
              <div className="font-sans text-[10px] tracking-widest uppercase text-gray-500 space-y-1.5 pt-2">
                <span className="font-cinzel text-gold-500 font-bold block text-xs">VISHAL MEHTA</span>
                <span>Exclusive Society Patron</span>
              </div>
            </section>

          </div>
        )}

        {/* VIEW ARCHITECTURE 2: STANDARD PRODUCTS CLASSIFIEDS */}
        {!["Home", "Profile", "Admin", "About Us", "Contact Us"].includes(activeSection) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            
            {/* Headers metadata based on category switcher */}
            <div className="border-b border-[#c5a880]/20 pb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="font-cinzel text-2xl md:text-3xl tracking-widest text-[#d4af37] font-bold uppercase text-gold-gradient">
                  {activeSection}'s Collection
                </h1>
                <p className="font-sans text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Indulge in tailored royal fits and custom high street selections.
                </p>
              </div>

              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 border border-gold-500/20 bg-gold-900/10 text-gold-300 rounded-sm">
                {filteredProducts.length} DESIGNS AVAILABLE
              </span>
            </div>

            {/* Products grid lists */}
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3.5">
                <Loader2 className="h-7 w-7 text-gold-500 animate-spin" />
                <span className="text-xs uppercase tracking-widest font-sans">Opening Vault Gates...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 space-y-4 font-sans">
                <AlertCircle className="h-10 w-10 text-gray-600 mx-auto" />
                <div>
                  <h4 className="text-white text-sm font-bold uppercase tracking-wider">No matching designs found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-normal">
                    We could not find any current listings that match your criteria. Please expand classifications or adjust search parameters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isWishlisted={wishlist.some(item => item.id === p.id)}
                    onToggleWishlist={toggleWishlist}
                    onQuickView={(p) => setSelectedProduct(p)}
                    onBuyOnWhatsApp={handleBuyOnWhatsApp}
                    isLoggedIn={!!currentUser}
                    isAdmin={currentUser?.role === "admin"}
                    onEditClick={startAdminEdit}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW ARCHITECTURE 3: ABOUT US STORY SHEET */}
        {activeSection === "About Us" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
            <div className="text-center space-y-1.5 border-b border-[#c5a880]/20 pb-6">
              <span className="text-[10px] tracking-widest text-[#c5a880] font-bold uppercase font-sans">OUR HISTORY & COUTURE LEGACY</span>
              <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-widest text-white uppercase text-gold-gradient">
                KNR Heritage
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="aspect-3/4 rounded-xs overflow-hidden border border-[#c5a880]/25 shadow-xl bg-zinc-950 relative">
                <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600" 
                  alt="Luxurious tailor fabrics spool and measuring line" 
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-6 font-sans text-xs leading-relaxed text-gray-300">
                <h3 className="font-cinzel text-md tracking-wider text-gold-500 font-bold uppercase">Distinguished Craftsmanship</h3>
                
                <p>
                  Established with the vision of bridging classical royal aesthetics with contemporary fits, KNR Fashions represents one of the premier luxury boutiques in India. Based in Hyderabad's premium Jubilee Hills, we design garments that do not merely dress, but command complete visual presence.
                </p>

                <p>
                  Our textile vectors rely exclusively on the worlds most opulent resources: thick lustrous silk velvet fabrics imported from Italy, custom woven royal jacquards, fine mulberries silks, and pure 18-karat metallized double gilded thread embroidery patterns meticulously hand stitched by veteran traditional artisans.
                </p>

                <p>
                  At KNR Fashions, we believe that true luxury requires individual touch. This is why our entire shopping engine is integrated directly with rapid WhatsApp Personal Concierge, ensuring each patron connects immediately with specialized boutique consultants who tailor fit, deliveries, and certificates of authenticity.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-sm border-t border-luxury-gold/10 pt-4 text-center">
                  <div>
                    <span className="font-cinzel text-lg font-bold text-gold-500 block">JUBILEE HILLS</span>
                    <span className="text-[9px] uppercase text-gray-500">Flagship Atelier</span>
                  </div>
                  <div>
                    <span className="font-cinzel text-lg font-bold text-gold-500 block">COUTURE Fits</span>
                    <span className="text-[9px] uppercase text-gray-500">Hand stitched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW ARCHITECTURE 4: CONTACT US MAPS & TICKETS */}
        {activeSection === "Contact Us" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
            <div className="text-center space-y-1.5 border-b border-[#c5a880]/20 pb-6">
              <span className="text-[10px] tracking-widest text-[#c5a880] font-bold uppercase font-sans">SUPPORT CONCIERGE</span>
              <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-widest text-white uppercase text-gold-gradient">
                Connect with KNR Fashions
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 font-sans">
              
              {/* Left Column: Coordinates */}
              <div className="bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm space-y-6 self-start text-xs text-gray-300">
                <h3 className="font-cinzel text-sm tracking-wider text-[#d4af37] uppercase font-bold border-b border-luxury-gold/10 pb-3">Atelier Coordinates</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3.5">
                    <Phone className="h-4.5 w-4.5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px]">Patron Telephone Support</h4>
                      <p className="mt-1">+91-8333873696</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Avail VIP Live Chat with Regional Executives 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Mail className="h-4.5 w-4.5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px]">Inquiries Mail Correspondence</h4>
                      <p className="mt-1">support@knrfashions.com</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">General ledger support coordinates</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Globe className="h-4.5 w-4.5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px]">Flagship Boutique Address</h4>
                      <p className="mt-1">Road No 36, Jubilee Hills, Hyderabad, Telangana 500033</p>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-black/50 p-3.5 border border-[#c5a880]/10 rounded-xs space-y-1">
                  <p className="font-bold text-white text-[10px] uppercase tracking-wider">Atelier Hours of Admission</p>
                  <p className="text-[10px] text-[#c5a880] mt-1">Monday – Saturday: 10:00 AM – 9:30 PM IST</p>
                  <p className="text-[10px] text-gray-500">Sunday by elite invitation appointment only</p>
                </div>
              </div>

              {/* Middle Column: interactive Ticket submission form */}
              <div className="lg:col-span-2 bg-[#090909] p-6 border border-luxury-gold/10 rounded-sm space-y-5">
                <h3 className="font-cinzel text-sm tracking-widest text-gold-300 uppercase font-bold.5 border-b border-luxury-gold/10 pb-3">Transmit Support Signal</h3>
                
                {contactSuccess ? (
                  <div className="text-center py-12 space-y-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xs">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-cinzel text-md font-bold uppercase text-white tracking-widest">Signal Locked and Transmitted</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto leading-normal">
                        Your VIP support ticket has been received by KNR Fashions elite consultants. We will reach back using your designated vectors.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-extrabold mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Consignee Name"
                          className="w-full bg-[#050505] text-white py-2 px-3 border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-extrabold mb-1">Your Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="Your Email Connection"
                          className="w-full bg-[#050505] text-white py-2 px-3 border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-extrabold mb-1">WhatsApp Number Mobile</label>
                      <input
                        type="text"
                        required
                        placeholder="+91..."
                        className="w-full bg-[#050505] text-white py-2 px-3 border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] tracking-widest uppercase text-gray-500 font-extrabold mb-1">Couture inquiries or specifications</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Define custom sizing threads queries support signals..."
                        className="w-full bg-[#050505] text-white py-2 px-3 border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-3 px-4 rounded-sm text-xs font-sans tracking-widest font-bold uppercase transition-all duration-300 hover:from-gold-500 hover:to-gold-300 cursor-pointer shadow-lg"
                    >
                      {contactSubmitting ? "Transmitting Signal..." : "Transmit Support Ticket"}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW ARCHITECTURE 5: REGISTERED CUSTOM USER PROFILE PORTAL */}
        {activeSection === "Profile" && (
          <UserProfile
            currentUser={currentUser}
            onLogin={handleLoginSuccess}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            apiBaseUrl={API_BASE_URL}
          />
        )}

        {/* VIEW ARCHITECTURE 6: DESIGNERS EXECUTIVE DESK ADMIN CASE */}
        {activeSection === "Admin" && (
          <AdminPanel
            currentUser={currentUser}
            apiBaseUrl={API_BASE_URL}
            onRefreshProducts={fetchProducts}
          />
        )}

      </main>

      {/* Global MODAL overlays 1: Heart wishlist side panel */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsWishlistOpen(false)} />
          
          <div className="relative w-full max-w-sm sm:max-w-md bg-obsidian border-l border-luxury-gold/20 h-full p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_80px_rgba(212,175,55,0.15)] z-10 animate-slideIn">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-luxury-gold/10 pb-4">
                <div className="flex items-center space-x-2 text-[#d4af37]">
                  <Heart className="h-5 w-5" fill="currentColor" />
                  <h3 className="font-cinzel text-sm sm:text-md font-bold uppercase tracking-wider text-white">
                    Patron Favorites Vault
                  </h3>
                </div>
                <button 
                  onClick={() => setIsWishlistOpen(false)}
                  className="font-sans text-[10px] tracking-widest uppercase p-1 hover:text-gold-500 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-20 font-sans space-y-4">
                  <Heart className="h-10 w-10 text-gray-700 mx-auto animate-pulse" />
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Favorites vault is empty</h4>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-normal mt-1">
                      Navigate the Men, Women, or Kids collections and toggle the heart overlays to populate your individual line.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1.5">
                  {wishlist.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-4 bg-[#090909] p-3 border border-luxury-gold/10 rounded-sm hover:border-[#c5a880]/30 transition-colors"
                    >
                      <img src={item.image} alt={item.name} className="h-14 w-11 object-cover object-top rounded-xs border border-luxury-gold/5 shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-cinzel text-xs font-bold text-white tracking-wide truncate">{item.name}</h4>
                        <p className="font-mono text-gold-500 font-semibold text-[11px] mt-0.5">₹{item.price}</p>
                        <span className="text-[8px] uppercase tracking-widest text-[#c5a880]">{item.category} classification</span>
                      </div>

                      <div className="flex flex-col space-y-1 ml-2">
                        <button
                          onClick={() => {
                            setIsWishlistOpen(false);
                            setSelectedProduct(item);
                          }}
                          className="p-1 px-2.5 bg-zinc-900 border border-luxury-gold/10 hover:border-gold-500 text-luxury-gold hover:text-gold-500 text-[9px] uppercase tracking-widest rounded-sm font-semibold transition-colors"
                          title="Open details"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="p-1 px-2 text-red-500 hover:bg-red-500/10 text-[9px] uppercase tracking-widest rounded-sm font-bold transition-colors"
                          title="Retire from vault"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-luxury-gold/10 pt-6 space-y-3">
              <div className="flex justify-between font-sans text-xs">
                <span className="uppercase text-gray-500 tracking-wider">Patron Line Value</span>
                <span className="font-mono text-gold-500 font-bold">
                  ₹{wishlist.reduce((acc, current) => acc + current.price, 0).toLocaleString()}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 leading-normal mb-3 font-sans">
                Each favorited design can be checked out directly over WhatsApp or booked through instant atelier delivery services in single frames.
              </p>
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  setActiveSection("T-Shirts");
                }}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-black py-2.5 rounded-sm text-xs font-sans tracking-widest uppercase font-bold hover:from-gold-500 hover:to-gold-300 cursor-pointer shadow-lg text-center block"
              >
                Browse Collection Catalogues
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global MODAL overlays 2: Authentic login sign-in portal popups */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsAuthModalOpen(false)} />
          
          <div className="relative w-full max-w-sm z-10">
            {/* Inner close banner button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-black border border-luxury-gold/20 text-[#c5a880] hover:text-gold-500 hover:border-gold-500 z-10"
              title="Abort credentials"
            >
              <X className="h-4 w-4" />
            </button>
            
            <UserProfile
              currentUser={currentUser}
              onLogin={handleLoginSuccess}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
        </div>
      )}

      {/* Global MODAL overlays 3: Selected product interactive specs sheet details */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isWishlisted={wishlist.some(item => item.id === selectedProduct.id)}
          onToggleWishlist={toggleWishlist}
          onBuyOnWhatsApp={handleBuyOnWhatsApp}
          onBookDirectOrder={handleBookDirectOrder}
          currentUser={currentUser}
          isAdmin={currentUser?.role === "admin"}
          onEditClick={startAdminEdit}
        />
      )}

      {/* Global MODAL overlays 4: Admin instant product editor */}
      {adminEditingProduct && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#090909] border border-luxury-gold/30 rounded-xs shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col max-h-[90vh] my-auto animate-fadeIn overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-gold/15 bg-black">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] font-semibold">Atelier Admin Workspace</span>
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide uppercase mt-0.5">
                  Edit Clothing Specs & Photo
                </h3>
              </div>
              <button
                onClick={() => setAdminEditingProduct(null)}
                className="p-1.5 rounded-full bg-obsidian border border-luxury-gold/10 text-gray-400 hover:text-gold-500 hover:border-gold-500 transition-colors cursor-pointer"
                title="Closes spec editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {adminEditError && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-sm text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{adminEditError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Couture Name / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={adminEditName}
                    onChange={(e) => setAdminEditName(e.target.value)}
                    placeholder="e.g. Royal Silk Sherwani"
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden placeholder-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Price Quotient (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={adminEditPrice || ""}
                    onChange={(e) => setAdminEditPrice(Number(e.target.value))}
                    placeholder="e.g. 15000"
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="font-sans">
                <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                  Primary Photo Image URL
                </label>
                <input
                  type="url"
                  required
                  value={adminEditImage}
                  onChange={(e) => setAdminEditImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden placeholder-zinc-700 text-[11px]"
                />
                
                {adminEditImage && (
                  <div className="mt-2 relative h-28 w-20 rounded-xs border border-luxury-gold/10 overflow-hidden bg-zinc-950">
                    <img src={adminEditImage} alt="Preview" className="h-full w-full object-cover object-top" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-gold-300 px-1 py-0.5 uppercase tracking-widest font-mono">Live Preview</span>
                  </div>
                )}
              </div>

              <div className="font-sans">
                <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                  Descriptive Copy / Text
                </label>
                <textarea
                  required
                  rows={3}
                  value={adminEditDesc}
                  onChange={(e) => setAdminEditDesc(e.target.value)}
                  placeholder="Elaborate details on fine fabric, velvet weaving, and luxury embellishments."
                  className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden placeholder-zinc-700 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Category Classification
                  </label>
                  <select
                    value={adminEditCategory}
                    onChange={(e) => setAdminEditCategory(e.target.value)}
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                  >
                    {["Men", "Women", "Kids", "T-Shirts", "Offers"].map(opt => (
                      <option key={opt} value={opt} className="bg-[#090909] text-white">
                        {opt === "T-Shirts" ? "T-Shirts" : `${opt} Collection`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Boutique Stock Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={adminEditStock}
                    onChange={(e) => setAdminEditStock(Number(e.target.value))}
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="font-sans">
                <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                  Secondary Gallery Images (Comma-separated URLs)
                </label>
                <input
                  type="text"
                  value={adminEditGallery}
                  onChange={(e) => setAdminEditGallery(e.target.value)}
                  placeholder="url1, url2, url3"
                  className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden placeholder-zinc-700 text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Size Options (com. sep.)
                  </label>
                  <input
                    type="text"
                    value={adminEditSizes}
                    onChange={(e) => setAdminEditSizes(e.target.value)}
                    placeholder="e.g. S, M, L, XL"
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Colors (com. sep.)
                  </label>
                  <input
                    type="text"
                    value={adminEditColors}
                    onChange={(e) => setAdminEditColors(e.target.value)}
                    placeholder="e.g. Black, White"
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-widest text-[#c5a880] uppercase font-bold mb-1.5">
                    Fabric / Material
                  </label>
                  <input
                    type="text"
                    value={adminEditMaterial}
                    onChange={(e) => setAdminEditMaterial(e.target.value)}
                    placeholder="e.g. 100% Rich Velvet"
                    className="w-full bg-black py-2 px-3 text-white text-xs border border-luxury-gold/15 focus:border-gold-500 rounded-sm outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 font-sans">
                <input
                  type="checkbox"
                  id="adminEditFeatured"
                  checked={adminEditFeatured}
                  onChange={(e) => setAdminEditFeatured(e.target.checked)}
                  className="rounded-xs border-luxury-gold/30 bg-black text-gold-500 focus:ring-gold-500 cursor-pointer h-4 w-4"
                />
                <label htmlFor="adminEditFeatured" className="text-xs text-gray-300 select-none cursor-pointer">
                  Feature in Premium Slider / High Banner selection
                </label>
              </div>

              {/* Action Buttons font-sans */}
              <div className="flex space-x-3 pt-4 border-t border-luxury-gold/10 font-sans">
                <button
                  type="button"
                  onClick={() => setAdminEditingProduct(null)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminEditSaving}
                  className="flex-1 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {adminEditSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Revisions...</span>
                    </>
                  ) : (
                    <span>Commit Revisions</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Global Social Medias Footer */}
      <Footer setActiveSection={setActiveSection} />

    </div>
  );
}
