"use client";

import React, { useState } from "react";
import { Smartphone, CheckCircle2, ShieldCheck, Loader2, KeyRound } from "lucide-react";

interface CheckoutOrangeMoneyProps {
  amount: number;
  currencySymbol?: string;
  phone: string;
  onChangePhone: (phone: string) => void;
  onPay: (otpCode?: string) => void;
  isProcessing: boolean;
}

export function CheckoutOrangeMoney({
  amount,
  currencySymbol = "FCFA",
  phone,
  onChangePhone,
  onPay,
  isProcessing,
}: CheckoutOrangeMoneyProps) {
  const [otpCode, setOtpCode] = useState("");
  const formattedAmount = `${amount.toLocaleString("fr-FR")} ${currencySymbol}`;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#FF6600] bg-[#FF6600]/5 space-y-4">
      {/* Header with Orange Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#FF6600] text-white flex items-center justify-center font-black text-sm shadow-md">
            OM
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#d45500] dark:text-[#ff8533]">
              Orange Money
            </h4>
            <p className="text-[11px] opacity-70">
              Paiement sécurisé par notification Push ou code USSD
            </p>
          </div>
        </div>

        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#FF6600] text-white">
          {formattedAmount}
        </span>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5 text-[#FF6600]" />
          <span>Numéro Orange Money</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="07 00 00 00 00"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold tracking-wider focus:outline-hidden focus:ring-2 focus:ring-[#FF6600]"
          />
        </div>
      </div>

      {/* OTP / Code Autorisation (optionnel selon le pays) */}
      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5 text-[#FF6600]" />
            <span>Code d'autorisation (ou composez #144*82#)</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-normal">Optionnel</span>
        </label>
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="Entrez le code OTP reçu par SMS"
          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#FF6600]"
        />
      </div>

      {/* USSD Guide */}
      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-[11px] space-y-1.5">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>1. Cliquez sur payer pour initier le prélèvement</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>2. Tapez votre code secret Orange Money sur l'invite qui s'affiche</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>3. Réception instantanée du SMS de confirmation</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onPay(otpCode)}
        disabled={isProcessing || !phone.trim()}
        className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-[#FF6600] text-white hover:bg-[#e05a00] active:scale-98 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>En attente de validation sur votre téléphone...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>Payer {formattedAmount} avec Orange Money</span>
          </>
        )}
      </button>
    </div>
  );
}
