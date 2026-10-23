"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { CartItem, DeliveryZone, StoreThemeConfig } from "@/types/store";

interface WhatsAppOrderButtonProps {
  store: StoreThemeConfig;
  cart?: CartItem[];
  zone?: DeliveryZone;
  landmark?: string;
  customerName?: string;
  variant?: "floating" | "button" | "inline";
  className?: string;
}

export function WhatsAppOrderButton({
  store,
  cart = [],
  zone,
  landmark,
  customerName,
  variant = "floating",
  className = "",
}: WhatsAppOrderButtonProps) {
  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} ${store.currencySymbol || "FCFA"}`;
  };

  const cleanPhone = (store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "");

  const generateWhatsAppUrl = () => {
    let msg = `Bonjour *${store.storeName}* ! 👋\n`;

    if (customerName) {
      msg += `Je suis *${customerName}*.\n`;
    }

    if (cart.length > 0) {
      const itemsTotal = cart.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      );
      const deliveryFee = zone ? zone.fee : 0;
      const total = itemsTotal + deliveryFee;

      msg += `\n🛒 *Voici ma commande :*\n`;
      cart.forEach((item) => {
        msg += `• ${item.quantity}x ${item.product.name} (${formatPrice(
          item.product.price * item.quantity
        )})\n`;
      });

      msg += `\n💵 Sous-total : ${formatPrice(itemsTotal)}\n`;
      if (zone) {
        msg += `🛵 Livraison (${zone.name}) : ${formatPrice(deliveryFee)}\n`;
      }
      if (landmark) {
        msg += `📍 Point de repère : ${landmark}\n`;
      }
      msg += `✨ *TOTAL : ${formatPrice(total)}*\n`;
    } else {
      msg += `J'ai vu votre boutique en ligne et j'aimerais avoir plus de renseignements sur vos articles disponibles.`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (variant === "floating") {
    return (
      <a
        href={generateWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        title="Commander directement sur WhatsApp"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-250 cursor-pointer ${className}`}
      >
        <div className="relative">
          <MessageCircle className="h-5 w-5 fill-white text-emerald-500" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100" />
          </span>
        </div>
        <span className="hidden sm:inline">Commander sur WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={generateWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer ${className}`}
    >
      <MessageCircle className="h-4 w-4 fill-white text-emerald-500" />
      <span>Commander sur WhatsApp 1-Clic</span>
    </a>
  );
}
