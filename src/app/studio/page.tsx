"use client";

import React, { useState } from "react";
import { StoreThemeConfig, PlacedOrder, OrderLineItem } from "@/types/store";
import { DEFAULT_STORE_CONFIG } from "@/lib/presets";
import { LovableWorkspace } from "@/components/studio/LovableWorkspace";
import { createStoreFromPromptAndAnswers } from "@/lib/design-directions";
import { useRouter } from "next/navigation";

export default function StudioPage() {
  const router = useRouter();
  const defaultPrompt = "Boutique en ligne en Côte d'Ivoire";
  const { store: initialStore, directions: initialDirs } = createStoreFromPromptAndAnswers(defaultPrompt);

  const [store, setStore] = useState<StoreThemeConfig>(initialStore);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNewOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    zone: { id: string; name: string; fee: number };
    landmark: string;
    paymentMethod: string;
    total: number;
    items: OrderLineItem[];
  }) => {
    const newOrder: PlacedOrder = {
      id: `ord-${Date.now()}`,
      createdAt: Date.now(),
      customer: {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryZoneId: orderData.zone.name,
        deliveryLandmark: orderData.landmark,
        paymentMethod: orderData.paymentMethod as "wave" | "orange_money" | "cod",
      },
      items: [],
      subtotal: orderData.total - orderData.zone.fee,
      deliveryFee: orderData.zone.fee,
      total: orderData.total,
      paymentStatus: "pending",
      orderStatus: "new",
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <LovableWorkspace
      store={store}
      setStore={setStore}
      orders={orders}
      isGenerating={isGenerating}
      initialPrompt={defaultPrompt}
      initialDirections={initialDirs}
      onBackToHome={() => router.push("/")}
      onNewOrder={handleNewOrder}
    />
  );
}
