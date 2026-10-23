"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreThemeConfig, PlacedOrder, DesignDirection, ClarificationQuestion, OrderLineItem } from "@/types/store";
import { DEFAULT_STORE_CONFIG } from "@/lib/presets";
import { BoltLandingPage } from "@/components/landing/BoltLandingPage";
import { LovableWorkspace } from "@/components/studio/LovableWorkspace";
import { createStoreFromPromptAndAnswers } from "@/lib/design-directions";

export default function HomePage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"landing" | "studio">("landing");
  const [store, setStore] = useState<StoreThemeConfig>(DEFAULT_STORE_CONFIG);
  const [directions, setDirections] = useState<DesignDirection[]>([]);
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>("");

  // Le prompt principal de la landing lance le studio React (vrai projet de code)
  const handleStartFromLanding = (promptText: string) => {
    router.push(`/studioreact?prompt=${encodeURIComponent(promptText)}`);
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

  // If in landing view, show the bolt.new inspired experience
  if (currentView === "landing") {
    return (
      <BoltLandingPage
        onStartBuild={handleStartFromLanding}
        onOpenStudio={() => setCurrentView("studio")}
        onOpenCodeStudio={() => router.push("/studiohtml")}
      />
    );
  }

  // Otherwise, show the Lovable-style Studio Workspace
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
