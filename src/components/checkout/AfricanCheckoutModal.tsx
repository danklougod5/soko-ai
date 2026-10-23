"use client";

import React, { useState } from "react";
import { StoreThemeConfig, CartItem, DeliveryZone, OrderLineItem } from "@/types/store";
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  User, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Sparkles,
  Smartphone
} from "lucide-react";
import confetti from "canvas-confetti";

interface AfricanCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreThemeConfig;
  cart: CartItem[];
  onOrderSuccess: (order: {
    customerName: string;
    customerPhone: string;
    zone: DeliveryZone;
    landmark: string;
    paymentMethod: string;
    total: number;
    items: OrderLineItem[];
  }) => void;
}

export function AfricanCheckoutModal({
  isOpen,
  onClose,
  store,
  cart,
  onOrderSuccess,
}: AfricanCheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    store.deliveryZones[0]?.id || ""
  );
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "orange_money" | "cod" | "whatsapp">("wave");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  if (!isOpen) return null;

  const selectedZone = store.deliveryZones.find((z) => z.id === selectedZoneId) || store.deliveryZones[0];
  const itemsTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  const grandTotal = itemsTotal + deliveryFee;

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} ${store.currencySymbol}`;
  };

  // Build formatted WhatsApp message
  const generateWhatsAppMessage = () => {
    let msg = `*🛒 NOUVELLE COMMANDE — ${store.storeName.toUpperCase()}*\n\n`;
    msg += `👤 *Client :* ${customerName || "Client"}\n`;
    msg += `📞 *Téléphone :* ${customerPhone || "Non renseigné"}\n`;
    msg += `📍 *Zone :* ${selectedZone?.name || "Non spécifiée"}\n`;
    if (deliveryLandmark) {
      msg += `📌 *Repère :* ${deliveryLandmark}\n`;
    }
    msg += `\n*📦 ARTICLES :*\n`;
    cart.forEach((item) => {
      msg += `• ${item.quantity}x ${item.product.name} — ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    msg += `\n💵 *Sous-total :* ${formatPrice(itemsTotal)}\n`;
    msg += `🛵 *Livraison :* ${formatPrice(deliveryFee)}\n`;
    msg += `✨ *TOTAL À PAYER :* ${formatPrice(grandTotal)}\n`;
    msg += `💳 *Mode choisi :* ${
      paymentMethod === "wave"
        ? "Wave Mobile Money"
        : paymentMethod === "orange_money"
        ? "Orange Money"
        : paymentMethod === "cod"
        ? "Paiement à la livraison (Espèces)"
        : "Commande WhatsApp"
    }\n\n`;
    msg += `_Commande passée via ${store.storeName}_`;
    return encodeURIComponent(msg);
  };

  const handleLaunchWhatsApp = () => {
    const phone = store.merchantWhatsapp || "2250700000000";
    const url = `https://wa.me/${phone}?text=${generateWhatsAppMessage()}`;
    window.open(url, "_blank");
    triggerSuccess();
  };

  const triggerSuccess = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setOrderDone(true);
    setTimeout(() => {
      onOrderSuccess({
        customerName: customerName || "Client anonyme",
        customerPhone: customerPhone || "+225 00 00 00 00",
        zone: selectedZone,
        landmark: deliveryLandmark || "Adresse indiquée au livreur",
        paymentMethod,
        total: grandTotal,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      });
    }, 1800);
  };

  const handleConfirmOrder = () => {
    if (paymentMethod === "whatsapp") {
      handleLaunchWhatsApp();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      triggerSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xl font-bold tracking-tight text-white">
                Finaliser votre commande
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Boutique officielle • {store.storeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {orderDone ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h4 className="text-2xl font-bold text-white">
              Commande confirmée avec succès ! 🎉
            </h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Merci <span className="font-semibold text-emerald-400">{customerName || "cher client"}</span> ! 
              Le commerçant a reçu votre commande et prépare votre colis pour la zone{" "}
              <span className="font-semibold text-white">{selectedZone?.name}</span>.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
              >
                Fermer et continuer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* 1. Coordonnées client */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-400" /> Vos informations
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Numéro WhatsApp (ex: 07 00 00 00)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Logistique & Repère Africain */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" /> Lieu de livraison & Repère local
              </label>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Commune / Zone :</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {store.deliveryZones.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                        selectedZoneId === zone.id
                          ? "border-amber-500 bg-amber-500/10 text-white font-medium"
                          : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium">{zone.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{zone.estimatedTime}</div>
                      </div>
                      <div className="text-xs font-semibold text-amber-400">
                        {formatPrice(zone.fee)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Point de repère pour le livreur (Indispensable) :
                </label>
                <input
                  type="text"
                  placeholder="Ex : Derrière la pharmacie du carrefour, portail bleu avec mangue"
                  value={deliveryLandmark}
                  onChange={(e) => setDeliveryLandmark(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 3. Mode de paiement */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-amber-400" /> Mode de règlement
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Wave */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wave")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    paymentMethod === "wave"
                      ? "border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500"
                      : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl">🌊</span>
                  <span className="text-xs font-bold text-blue-400">Wave</span>
                  <span className="text-[10px] text-slate-400">Mobile Money</span>
                </button>

                {/* Orange Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("orange_money")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    paymentMethod === "orange_money"
                      ? "border-orange-500 bg-orange-500/15 text-white ring-1 ring-orange-500"
                      : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl">🍊</span>
                  <span className="text-xs font-bold text-orange-400">Orange Money</span>
                  <span className="text-[10px] text-slate-400">Code USSD</span>
                </button>

                {/* Cash on delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    paymentMethod === "cod"
                      ? "border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500"
                      : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl">🛵</span>
                  <span className="text-xs font-bold text-emerald-400">Au Livreur</span>
                  <span className="text-[10px] text-slate-400">Cash à la remise</span>
                </button>

                {/* WhatsApp 1-click */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("whatsapp")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    paymentMethod === "whatsapp"
                      ? "border-green-500 bg-green-500/15 text-white ring-1 ring-green-500"
                      : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl">💬</span>
                  <span className="text-xs font-bold text-green-400">WhatsApp</span>
                  <span className="text-[10px] text-slate-400">1-Clic direct</span>
                </button>
              </div>
            </div>

            {/* Récapitulatif montants */}
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/70 p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total articles ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Frais de livraison ({selectedZone?.name})</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between text-base font-bold text-white">
                <span>Total net</span>
                <span className="text-amber-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Bouton de confirmation */}
            <div className="pt-2">
              {paymentMethod === "whatsapp" ? (
                <button
                  type="button"
                  onClick={handleLaunchWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/25 transition active:scale-[0.99]"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Envoyer la commande sur WhatsApp ({formatPrice(grandTotal)})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition disabled:opacity-50 active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>Validation du paiement en cours...</span>
                    </div>
                  ) : (
                    <>
                      <span>Confirmer la commande ({formatPrice(grandTotal)})</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Paiement 100% sécurisé
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-amber-400" /> Suivi livreur direct
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
