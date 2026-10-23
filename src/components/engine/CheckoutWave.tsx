"use client";

import React, { useState } from "react";
import { Smartphone, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

interface CheckoutWaveProps {
  amount: number;
  currencySymbol?: string;
  phone: string;
  onChangePhone: (phone: string) => void;
  onPay: () => void;
  isProcessing: boolean;
}

export function CheckoutWave({
  amount,
  currencySymbol = "FCFA",
  phone,
  onChangePhone,
  onPay,
  isProcessing,
}: CheckoutWaveProps) {
  const formattedAmount = `${amount.toLocaleString("fr-FR")} ${currencySymbol}`;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#1BA4E8] bg-[#1BA4E8]/5 space-y-4">
      {/* Header with Wave Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#1BA4E8] text-white flex items-center justify-center font-black text-sm shadow-md">
            W
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#0c7ab1] dark:text-[#52c2ff]">
              Wave Mobile Money
            </h4>
            <p className="text-[11px] opacity-70">
              Paiement direct sans frais supplémentaires (1%)
            </p>
          </div>
        </div>

        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#1BA4E8] text-white">
          {formattedAmount}
        </span>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5 text-[#1BA4E8]" />
          <span>Numéro de compte Wave</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="07 00 00 00 00"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold tracking-wider focus:outline-hidden focus:ring-2 focus:ring-[#1BA4E8]"
          />
        </div>
        <p className="text-[10px] opacity-60 mt-1">
          Une notification Push Wave sera envoyée sur ce numéro pour valider le paiement.
        </p>
      </div>

      {/* Step by step reassurance */}
      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-[11px] space-y-1.5">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>1. Cliquez sur le bouton pour déclencher le paiement Wave</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>2. Ouvrez l'application Wave et confirmez le montant de {formattedAmount}</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>3. Votre commande est immédiatement transmise au commerçant</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onPay}
        disabled={isProcessing || !phone.trim()}
        className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-[#1BA4E8] text-white hover:bg-[#158fcb] active:scale-98 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>En attente de validation sur votre téléphone...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>Payer {formattedAmount} avec Wave</span>
          </>
        )}
      </button>
    </div>
  );
}
