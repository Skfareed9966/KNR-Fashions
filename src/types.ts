/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // 'Men' | 'Women' | 'Kids' | 'T-Shirts' | 'Offers'
  image: string;
  gallery: string[]; // additional images
  stock?: number;
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
  material?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string; // stored hashed on server
  role: 'customer' | 'admin';
}

export interface Category {
  id: string;
  name: string; // e.g., 'Men's Collection', 'Women's Collection', etc.
  slug: string; // e.g., 'men', 'women', 'kids', 'new-arrivals', 'offers'
  image?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  orderDate: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
}

export interface Inquiry {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  userName?: string;
  userPhone?: string;
  timestamp: string;
  status: 'Pending' | 'Followed Up' | 'Completed';
}
