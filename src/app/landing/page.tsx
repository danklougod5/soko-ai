"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreThemeConfig, PlacedOrder, DesignDirection, ClarificationQuestion, OrderLineItem } from "@/types/store";
import { DEFAULT_STORE_CONFIG } from "@/lib/presets";
import { BoltLandingPage } from "@/components/landing/BoltLandingPage";
import { LovableWorkspace } from "@/components/studio/LovableWorkspace";

export default function LandingPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"landing" | "studio">("landing");
  const [store, setStore] = useState<StoreThemeConfig>(DEFAULT_STORE_CONFIG);
  const [directions, setDirections] = useState<DesignDirection[]>([]);
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>("");

  const handleStartFromLanding = (promptText: string) => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/studioreact?prompt=${encodeURIComponent(promptText)}`;
  };

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

  if (currentView === "landing") {
    return (
      <BoltLandingPage
        onStartBuild={handleStartFromLanding}
        onOpenStudio={() => router.push("/studioreact")}
        onOpenCodeStudio={() => router.push("/studiohtml")}
      />
    );
  }

  return (
    <LovableWorkspace
      store={store}
      setStore={setStore}
      orders={orders}
      isGenerating={isGenerating}
      initialPrompt={lastPrompt}
      initialDirections={directions}
      initialQuestions={questions}
      onBackToHome={() => setCurrentView("landing")}
      onNewOrder={handleNewOrder}
    />
  );
}
