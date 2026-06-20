/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "KNR_FASHIONS_GOLDEN_SECRET_2026_JWT";
const DB_PATH = path.join(process.cwd(), "db.json");

// Define types in-server to avoid TS compiler resolution issues for the Node script
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  gallery: string[];
  stock: number;
  featured: boolean;
  sizes?: string[];
  colors?: string[];
  material?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
  role: 'customer' | 'admin';
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: any[];
  totalAmount: number;
  deliveryAddress: string;
  orderDate: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
}

interface Inquiry {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  userName?: string;
  userPhone?: string;
  timestamp: string;
  status: 'Pending' | 'Followed Up' | 'Completed';
}

interface Database {
  users: User[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  inquiries: Inquiry[];
}

// Default luxury data-seeding
const defaultProducts: Product[] = [
  {
    id: "prod_1",
    name: "Gilded Onyx Velvet Blazer",
    description: "Luxury midnight-black velvet blazer featuring stunning peak lapels with intricate patterns hand-embroidered with metallic gold thread. Perfect for high-profile evenings and red carpet statements.",
    price: 349,
    category: "Men",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 12,
    featured: true
  },
  {
    id: "prod_2",
    name: "Midnight Gold Silk Shirt",
    description: "Crafted from 100% fine mulberry silk, this shirt features abstract liquid-gold weaves that shimmer under soft lights. Tailored fit with mother-of-pearl buttons.",
    price: 179,
    category: "Men",
    image: "https://images.unsplash.com/photo-1620012253295-c05518e99309?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1620012253295-c05518e99309?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 24,
    featured: true
  },
  {
    id: "prod_3",
    name: "Signature Golden Buckle Loafers",
    description: "High-shine premium black calfskin loafers accented with a solid, polished brass buckle in KNR signature luxury lock design.",
    price: 279,
    category: "Men",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 15,
    featured: false
  },
  {
    id: "prod_4",
    name: "Golden Hour Sequin Gown",
    description: "A breathtaking floor-length evening gown. Draped in thousands of masterfully stitched black-and-gold gradient sequins that command attention with every step.",
    price: 489,
    category: "Women",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 8,
    featured: true
  },
  {
    id: "prod_5",
    name: "Aurelia Gold-Fringe Dress",
    description: "An elegant slim cocktail dress built from premium thick stretch satin, featuring dramatic hand-sewn metallic gold tassels across the hem and sleeves.",
    price: 319,
    category: "Women",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 10,
    featured: true
  },
  {
    id: "prod_6",
    name: "KNR Empress Gold Clasp Bag",
    description: "Constructed of structural pebbled matte-black Italian leather and fortified with custom gold-plated geometric letters spelling KNR. Detachable gold chain strap included.",
    price: 259,
    category: "Women",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 20,
    featured: false
  },
  {
    id: "prod_7",
    name: "Little Prince Embroidered Suit",
    description: "A adorable three-piece suit for boys. Includes a gold brocade detailed waistcoat, comfortable black cotton trousers, and a crisp gold-collared performance white shirt.",
    price: 149,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 10,
    featured: true
  },
  {
    id: "prod_8",
    name: "Little Empress Gold Sparkle Tutu",
    description: "Stretchy comfortable black knit bodice matched with thick, layered layers of voluminous gold-flecked and glitter-pressed black tulle skirt.",
    price: 119,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 15,
    featured: false
  },
  {
    id: "prod_9",
    name: "Luxury Gold Star Kids Hoodie",
    description: "Cozy black cotton-fleece loungewear set featuring gold metallic threads embroidered in deep star constellations across chest and hood.",
    price: 89,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 25,
    featured: true
  },
  {
    id: "prod_10",
    name: "KNR Imperial Gold Emblem T-Shirt",
    description: "Crafted with 100% long-staple Egyptian cotton, boasting a high-density 3D metallic embroidery of the majestic KNR crown logo.",
    price: 35,
    category: "T-Shirts",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 7,
    featured: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Royal Black", "Imperial White", "Venetian Crimson"],
    material: "100% Egyptian Cotton"
  },
  {
    id: "prod_11",
    name: "Aura Monogram Velvet Accent Tee",
    description: "Relaxed-fit luxury t-shirt with signature velvet side-accents and hand-stitched gold silk monogram embroidery.",
    price: 45,
    category: "T-Shirts",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 30,
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Stealth Black", "Navy Royale"],
    material: "Premium Cotton & Silk-Velvet Blend"
  },
  {
    id: "prod_12",
    name: "Midnight Guild Leather Jacket",
    description: "Normally $350. Heavy, supple full-grain black cowhide detailed beautifully with robust gold zippers, gold snap buttons, and sleek custom quilted inner gold lining.",
    price: 219,
    category: "Offers",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 14,
    featured: true
  },
  {
    id: "prod_13",
    name: "Aurum Crest Intertwined Belt",
    description: "Normally $110. Custom-fitted luxury chain belt comprised of interlocking mirrors of gold luster alloy and hanging high-relief royal KNR seal.",
    price: 59,
    category: "Offers",
    image: "https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 45,
    featured: false
  }
];

const defaultCategories: Category[] = [
  { id: "cat_1", name: "Men's Collection", slug: "Men", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800" },
  { id: "cat_2", name: "Women's Collection", slug: "Women", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800" },
  { id: "cat_3", name: "Kids Collection", slug: "Kids", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800" },
  { id: "cat_4", name: "T-Shirts Collection", slug: "T-Shirts", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800" },
  { id: "cat_5", name: "Exclusive Offers", slug: "Offers", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800" }
];

// Read/Write Database Utility
function readDB(): Database {
  if (!fs.existsSync(DB_PATH)) {
    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    const initialDB: Database = {
      users: [
        {
          id: "usr_admin",
          name: "KNR Admin",
          email: "admin@knrfashions.com",
          phone: "+918333873696",
          address: "KNR High Street, Hyderabad, India",
          password: adminPasswordHash,
          role: "admin"
        },
        {
          id: "usr_cust1",
          name: "Rohan K",
          email: "rohan@gmail.com",
          phone: "+919988776655",
          address: "Flat 402, Golden Heights, Jubilee Hills, Hyderabad",
          password: bcrypt.hashSync("password123", 10),
          role: "customer"
        }
      ],
      products: defaultProducts,
      categories: defaultCategories,
      orders: [
        {
          id: "ord_1",
          userId: "usr_cust1",
          userName: "Rohan K",
          userEmail: "rohan@gmail.com",
          userPhone: "+919988776655",
          items: [
            {
              productId: "prod_2",
              name: "Midnight Gold Silk Shirt",
              price: 179,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1620012253295-c05518e99309?auto=format&fit=crop&q=80&w=800"
            }
          ],
          totalAmount: 179,
          deliveryAddress: "Flat 402, Golden Heights, Jubilee Hills, Hyderabad",
          orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: "Confirmed",
          paymentMethod: "WhatsApp Checkout"
        }
      ],
      inquiries: [
        {
          id: "inq_1",
          productId: "prod_1",
          productName: "Gilded Onyx Velvet Blazer",
          productPrice: 349,
          userName: "Rohan K",
          userPhone: "+919988776655",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: "Pending"
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), "utf8");
    return initialDB;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDB(data: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

// Ensure the db.json is initialized
readDB();

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS middleware setup in case needed, but we live on single domain
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // JWT Middleware validation helper
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  };

  // JWT Middleware optional checker for logged-in tracking on anonymous endpoints
  const optionalAuthenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (!err) {
        req.user = decoded;
      }
      next();
    });
  };

  // Admin Middleware helper
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next();
  };

  // ==================== AUTH ROUTES ====================

  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      address: address || "",
      password: bcrypt.hashSync(password, 10),
      role: "customer"
    };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Don't send password
    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ user: userSafe, token });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const db = readDB();
    const index = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    db.users[index].password = bcrypt.hashSync(newPassword, 10);
    writeDB(db);

    res.json({ success: true, message: "Password updated successfully." });
  });

  app.get("/api/auth/profile", authenticateToken, (req: any, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe });
  });

  app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
    const { name, phone, address } = req.body;
    const db = readDB();
    const index = db.users.findIndex(u => u.id === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) db.users[index].name = name;
    if (phone !== undefined) db.users[index].phone = phone;
    if (address !== undefined) db.users[index].address = address;

    writeDB(db);

    const { password: _, ...userSafe } = db.users[index];
    res.json({ user: userSafe });
  });


  // ==================== PRODUCT ROUTES ====================

  app.get("/api/products", (req, res) => {
    const db = readDB();
    const { category, search } = req.query;
    let filtered = [...db.products];

    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  app.post("/api/products", authenticateToken, requireAdmin, (req, res) => {
    const { name, description, price, category, image, gallery, stock, featured, sizes, colors, material } = req.body;
    if (!name || !price || !category || !image) {
      return res.status(400).json({ error: "Name, price, category and product primary image are required" });
    }

    const db = readDB();
    const newProduct: Product = {
      id: "prod_" + Math.random().toString(36).substr(2, 9),
      name,
      description: description || "",
      price: Number(price),
      category,
      image,
      gallery: Array.isArray(gallery) ? gallery : [image],
      stock: stock !== undefined ? Number(stock) : 10,
      featured: !!featured,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      material: material || ""
    };

    db.products.push(newProduct);
    writeDB(db);

    res.status(201).json(newProduct);
  });

  app.put("/api/products/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image, gallery, stock, featured, sizes, colors, material } = req.body;

    const db = readDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const current = db.products[index];
    db.products[index] = {
      ...current,
      name: name || current.name,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? Number(price) : current.price,
      category: category || current.category,
      image: image || current.image,
      gallery: Array.isArray(gallery) ? gallery : current.gallery,
      stock: stock !== undefined ? Number(stock) : current.stock,
      featured: featured !== undefined ? !!featured : current.featured,
      sizes: sizes !== undefined ? (Array.isArray(sizes) ? sizes : []) : current.sizes,
      colors: colors !== undefined ? (Array.isArray(colors) ? colors : []) : current.colors,
      material: material !== undefined ? material : current.material
    };

    writeDB(db);
    res.json(db.products[index]);
  });

  app.delete("/api/products/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const filtered = db.products.filter(p => p.id !== id);
    if (filtered.length === db.products.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    db.products = filtered;
    writeDB(db);
    res.json({ success: true, message: "Product deleted successfully" });
  });


  // ==================== CATEGORIES ROUTES ====================

  app.get("/api/categories", (req, res) => {
    const db = readDB();
    res.json(db.categories);
  });

  app.post("/api/categories", authenticateToken, requireAdmin, (req, res) => {
    const { name, slug, image } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Category name and slug are required" });
    }

    const db = readDB();
    const newCategory = {
      id: "cat_" + Math.random().toString(36).substr(2, 9),
      name,
      slug,
      image: image || ""
    };

    db.categories.push(newCategory);
    writeDB(db);
    res.status(201).json(newCategory);
  });

  app.delete("/api/categories/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.categories = db.categories.filter(c => c.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Category deleted" });
  });


  // ==================== WISHLIST / LOCAL USER STORAGE CAN EXIST CLIENT SIDE, ORDERS/INQUIRIES SERVER SIDE ====================

  // ==================== ORDER ROUTES ====================

  app.post("/api/orders", optionalAuthenticateToken, (req: any, res) => {
    const { items, totalAmount, deliveryAddress, contactNumber, customName, customEmail, paymentMethod } = req.body;
    if (!items || !items.length || !totalAmount || !deliveryAddress || !contactNumber) {
      return res.status(400).json({ error: "Missing required order parameters" });
    }

    const db = readDB();
    const userId = req.user ? req.user.id : "usr_anonymous";
    const userName = req.user ? (db.users.find(u => u.id === req.user.id)?.name || customName || "Guest Customer") : (customName || "Guest Customer");
    const userEmail = req.user ? req.user.email : (customEmail || "guest@knrfashions.com");

    const newOrder: Order = {
      id: "ord_" + Math.random().toString(36).substr(2, 5).toUpperCase() + Math.floor(Math.random() * 100),
      userId,
      userName,
      userEmail,
      userPhone: contactNumber,
      items,
      totalAmount: Number(totalAmount),
      deliveryAddress,
      orderDate: new Date().toISOString(),
      status: "Pending",
      paymentMethod: paymentMethod || "WhatsApp Checkout"
    };

    db.orders.push(newOrder);

    // Update product stocks
    items.forEach((item: any) => {
      const pIndex = db.products.findIndex(p => p.id === item.productId);
      if (pIndex !== -1) {
        const currentStock = db.products[pIndex].stock;
        db.products[pIndex].stock = Math.max(0, currentStock - (item.quantity || 1));
      }
    });

    writeDB(db);
    res.status(201).json(newOrder);
  });

  app.get("/api/orders", authenticateToken, (req: any, res) => {
    const db = readDB();
    if (req.user.role === "admin") {
      res.json(db.orders);
    } else {
      res.json(db.orders.filter(o => o.userId === req.user.id));
    }
  });

  app.put("/api/orders/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const db = readDB();
    const index = db.orders.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    db.orders[index].status = status;
    writeDB(db);
    res.json(db.orders[index]);
  });

  app.delete("/api/orders/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.orders = db.orders.filter(o => o.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Order records deleted" });
  });


  // ==================== WHATSAPP INQUIRY ROUTES ====================

  app.post("/api/inquiries", optionalAuthenticateToken, (req: any, res) => {
    const { productId, productName, productPrice, customName, customPhone } = req.body;
    if (!productId || !productName) {
      return res.status(400).json({ error: "Product information is required" });
    }

    const db = readDB();
    const userName = req.user ? (db.users.find(u => u.id === req.user.id)?.name || customName || "Explorer") : (customName || "Explorer");
    const userPhone = req.user ? (db.users.find(u => u.id === req.user.id)?.phone || customPhone || "") : (customPhone || "");

    const newInquiry: Inquiry = {
      id: "inq_" + Math.random().toString(36).substr(2, 9),
      productId,
      productName,
      productPrice: Number(productPrice),
      userName,
      userPhone,
      timestamp: new Date().toISOString(),
      status: "Pending"
    };

    db.inquiries.push(newInquiry);
    writeDB(db);
    res.status(201).json(newInquiry);
  });

  app.get("/api/inquiries", authenticateToken, requireAdmin, (req, res) => {
    const db = readDB();
    res.json(db.inquiries);
  });

  app.put("/api/inquiries/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const db = readDB();
    const index = db.inquiries.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Inquiry record not found" });
    }

    if (status) {
      db.inquiries[index].status = status;
    }
    writeDB(db);
    res.json(db.inquiries[index]);
  });

  app.delete("/api/inquiries/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.inquiries = db.inquiries.filter(i => i.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Inquiry record deleted" });
  });

  // ==================== ADMIN: CUSTOMERS MANAGE ====================

  app.get("/api/customers", authenticateToken, requireAdmin, (req, res) => {
    const db = readDB();
    // Exclude passwords
    const customers = db.users.map(({ password, ...userSafe }) => userSafe);
    res.json(customers);
  });

  // ==================== VITE FRONTEND MIDDLWARE ====================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KNR FASHIONS] Backend Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting fullstack backend server:", err);
});
