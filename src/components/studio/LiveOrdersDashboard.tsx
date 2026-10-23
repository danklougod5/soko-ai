"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  AlertCircle,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  CreditCard,
  Banknote
} from "lucide-react";
import { PlacedOrder } from "@/types/store";

interface LiveOrdersDashboardProps {
  storeId?: Id<"stores"> | null;
  localOrders: PlacedOrder[];
  currencySymbol: string;
}

export function LiveOrdersDashboard({
  storeId,
  localOrders,
  currencySymbol,
}: LiveOrdersDashboardProps) {
  const [filter, setFilter] = useState<string>("all");

  // Live Convex query for orders
  const convexOrders = useQuery(
    api.orders.listByStore,
    storeId ? { storeId } : "skip"
  );

  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  // Combine Convex orders with local test orders if no Convex orders yet
  const orders = (convexOrders && convexOrders.length > 0)
    ? convexOrders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber || `CMD-${o._id.slice(-6).toUpperCase()}`,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerWhatsapp: o.customerWhatsapp || o.customerPhone,
        deliveryCommune: o.deliveryCommune,
        deliveryLandmark: o.deliveryLandmark,
        deliveryFee: o.deliveryFee,
        itemsTotal: o.itemsTotal,
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        items: o.items || [],
        isConvex: true,
      }))
    : localOrders.map((lo) => ({
        id: lo.id,
        orderNumber: lo.id.toUpperCase(),
        customerName: lo.customer.customerName,
        customerPhone: lo.customer.customerPhone,
        customerWhatsapp: lo.customer.customerWhatsapp || lo.customer.customerPhone,
        deliveryCommune: lo.customer.deliveryZoneId,
        deliveryLandmark: lo.customer.deliveryLandmark,
        deliveryFee: lo.deliveryFee,
        itemsTotal: lo.subtotal,
        totalAmount: lo.total,
        paymentMethod: lo.customer.paymentMethod,
        paymentStatus: lo.paymentStatus,
        orderStatus: lo.orderStatus,
        createdAt: lo.createdAt,
        items: lo.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
        isConvex: false,
      }));

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === "paid").length;

  const handleStatusChange = async (orderId: string, isConvex: boolean, newStatus: any) => {
    if (isConvex) {
      try {
        await updateOrderStatus({
          orderId: orderId as Id<"orders">,
          status: newStatus,
        });
      } catch (e) {
        console.error("Erreur mise à jour statut:", e);
      }
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case "wave":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1DA1F2]" />
            Wave
          </span>
        );
      case "orange_money":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Orange Money
          </span>
        );
      case "cod":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Banknote className="h-3 w-3" />
            Paiement à la livraison
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-300">
            {method}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Nouveau</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">Confirmé</span>;
      case "preparing":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">En préparation</span>;
      case "shipping":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">En livraison</span>;
      case "delivered":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Livré</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0E] text-slate-100 p-6 space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-[#12131A] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Revenus encaissés</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {totalRevenue.toLocaleString("fr-FR")} {currencySymbol}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Commandes totales</p>
            <h3 className="text-2xl font-black text-white mt-1">{orders.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Paiements validés</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {paidOrdersCount} / {orders.length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Commandes en temps réel</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {storeId ? "Convex Sync Actif" : "Mode Démo"}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-[#151620] border border-white/8 rounded-xl p-1 text-xs">
          {[
            { id: "all", label: "Toutes" },
            { id: "new", label: "Nouvelles" },
            { id: "confirmed", label: "Confirmées" },
            { id: "delivered", label: "Livrées" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === tab.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredOrders.length === 0 ? (
          <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
            <ShoppingBag className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">Aucune commande pour le moment.</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Passez une commande de test dans l&apos;aperçu ou partagez le lien de votre boutique pour recevoir les premières commandes de vos clients !
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#12131A] border border-white/8 hover:border-white/15 rounded-2xl p-5 transition space-y-4 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {getPaymentBadge(order.paymentMethod)}
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-white">
                    {order.totalAmount.toLocaleString("fr-FR")} {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Client & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {/* Customer */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Client</span>
                  <p className="font-semibold text-white">{order.customerName}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-slate-300 font-mono">{order.customerPhone}</span>
                    <a
                      href={`https://wa.me/${order.customerWhatsapp.replace(/[^0-9]/g, "")}?text=Bonjour%20${encodeURIComponent(order.customerName)},%20concernant%20votre%20commande%20${order.orderNumber}...`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium transition text-[11px]"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Delivery Zone & Landmark */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Lieu de livraison & Repère</span>
                  <p className="font-semibold text-white flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>{order.deliveryCommune}</span>
                  </p>
                  <p className="text-slate-300 italic bg-white/5 p-1.5 rounded-lg border border-white/5">
                    &quot;{order.deliveryLandmark}&quot;
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-1 flex flex-col justify-end">
                  <span className="text-slate-400 font-medium">Changer le statut</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    {order.orderStatus === "new" && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.isConvex, "confirmed")}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
                      >
                        Confirmer
                      </button>
                    )}
                    {order.orderStatus === "confirmed" && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.isConvex, "shipping")}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
                      >
                        Expédier
                      </button>
                    )}
                    {order.orderStatus === "shipping" && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.isConvex, "delivered")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition"
                      >
                        Marquer Livré
                      </button>
                    )}
                    {order.orderStatus === "delivered" && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Livraison effectuée
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
