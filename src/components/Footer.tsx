/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

interface FooterProps {
  setActiveSection: (sec: string) => void;
}

export default function Footer({ setActiveSection }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-gray-400 border-t border-luxury-gold/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-luxury-gold/10">
          
          {/* Brand Concept Column */}
          <div className="space-y-4">
            <div className="flex flex-col items-start leading-none cursor-pointer" onClick={() => setActiveSection("Home")}>
              <span className="font-cinzel text-2xl font-bold tracking-[0.25em] text-gold-500">
                KNR
              </span>
              <span className="font-sans text-[9px] tracking-[0.4em] text-luxury-gold uppercase mt-1">
                FASHIONS
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pt-2">
              Step into high luxury. KNR Fashions delivers magnificent couture, premium fits, and opulent patterns tailored specifically for those who command distinction.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3 pt-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="no-referrer noreferrer" 
                className="h-9 w-9 rounded-full bg-obsidian-light hover:bg-gold-500 hover:text-obsidian flex items-center justify-center border border-luxury-gold/15 hover:border-gold-500 text-luxury-gold transition-all duration-300"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="no-referrer noreferrer" 
                className="h-9 w-9 rounded-full bg-obsidian-light hover:bg-gold-500 hover:text-obsidian flex items-center justify-center border border-luxury-gold/15 hover:border-gold-500 text-luxury-gold transition-all duration-300"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://wa.me/918333873696" 
                target="_blank" 
                rel="no-referrer noreferrer" 
                className="h-9 w-9 rounded-full bg-obsidian-light hover:bg-gold-500 hover:text-obsidian flex items-center justify-center border border-luxury-gold/15 hover:border-gold-500 text-luxury-gold transition-all duration-300"
                title="WhatsApp Direct Support"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="no-referrer noreferrer" 
                className="h-9 w-9 rounded-full bg-obsidian-light hover:bg-gold-500 hover:text-obsidian flex items-center justify-center border border-luxury-gold/15 hover:border-gold-500 text-luxury-gold transition-all duration-300"
                title="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Useful Quick Links */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-sm tracking-widest text-gold-300 uppercase font-semibold">
              Collections
            </h3>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => setActiveSection("Men")} className="hover:text-gold-500 transition-colors">
                  Men's Designer Wear
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection("Women")} className="hover:text-gold-500 transition-colors">
                  Women's Elite Couture
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection("Kids")} className="hover:text-gold-500 transition-colors">
                  Little Royal Collection (Kids)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection("T-Shirts")} className="hover:text-gold-500 transition-colors">
                  Imperial T-Shirts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection("Offers")} className="hover:text-gold-500 transition-colors">
                  Limited Exclusive Offers
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Contact Info */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-sm tracking-widest text-gold-300 uppercase font-semibold">
              Contact Boutique
            </h3>
            <ul className="space-y-3.5 text-xs font-sans">
              <li className="flex items-start space-x-3.5">
                <MapPin className="h-4.5 w-4.5 text-gold-500 shrink-0 mt-0.5" />
                <span>
                  KNR Fashions Luxury High Street,<br />
                  Jubilee Hills, Road No 36,<br />
                  Hyderabad, Telangana, 500033
                </span>
              </li>
              <li className="flex items-center space-x-3.5">
                <Phone className="h-4 w-4 text-gold-500 shrink-0" />
                <a href="tel:+918333873696" className="hover:text-gold-500 transition-colors">
                  +91-8333873696
                </a>
              </li>
              <li className="flex items-center space-x-3.5">
                <Mail className="h-4 w-4 text-gold-500 shrink-0" />
                <a href="mailto:support@knrfashions.com" className="hover:text-gold-500 transition-colors">
                  support@knrfashions.com
                </a>
              </li>
            </ul>
          </div>

          {/* Google Maps Location Embedding */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-sm tracking-widest text-gold-300 uppercase font-semibold">
              Store Location
            </h3>
            <div className="rounded-sm overflow-hidden border border-luxury-gold/20 shadow-lg h-36 relative">
              {/* Responsive Iframe Embed with true Hyderabad Google Maps coordinate for high-end styling */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272901324707!2d78.4069811!3d17.4320745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91350a4b7af3%3A0xe510c4da333b2bf1!2sRoad%20No.%2036%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1718873000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) grayscale(80%) contrast(110%)" }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="KNR Fashions Google Maps Location"
              ></iframe>
            </div>
            <a 
              href="https://maps.google.com/?q=Road+No+36+Jubilee+Hills+Hyderabad+Telangana+500033" 
              target="_blank" 
              rel="no-referrer noreferrer" 
              className="text-[10px] text-gold-500 tracking-wider font-semibold uppercase block text-right hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>

        </div>

        {/* Footer Base copyright lines */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-sans space-y-4 sm:space-y-0">
          <div>
            &copy; {currentYear} <strong>KNR Fashions Boutique Ltd.</strong> All Rights Reserved. Crafted for Distinction.
          </div>
          <div className="flex space-x-6">
            <button onClick={() => setActiveSection("About Us")} className="hover:text-gold-500 transition-colors">
              About Enterprise
            </button>
            <button onClick={() => setActiveSection("Contact Us")} className="hover:text-gold-500 transition-colors">
              Support Center
            </button>
            <span className="text-luxury-gold/50">GSTIN: 36ABCDE1234F1Z8</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
