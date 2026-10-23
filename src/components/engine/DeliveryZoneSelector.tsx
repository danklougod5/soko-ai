"use client";

import React from "react";
import { DeliveryZone } from "@/types/store";
import { MapPin, Clock, Compass } from "lucide-react";

interface DeliveryZoneSelectorProps {
  zones: DeliveryZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  landmark: string;
  onChangeLandmark: (landmark: string) => void;
  currencySymbol?: string;
  primaryColor?: string;
}

export function DeliveryZoneSelector({
  zones,
  selectedZoneId,
  onSelectZone,
  landmark,
  onChangeLandmark,
  currencySymbol = "FCFA",
  primaryColor = "#EA580C",
}: DeliveryZoneSelectorProps) {
  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  return (
    <div className="space-y-4">
      {/* Zone Dropdown / List */}
      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-orange-500" />
          <span>Commune / Quartier de livraison</span>
        </label>
        <div className="relative">
          <select
            value={selectedZoneId}
            onChange={(e) => onSelectZone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 cursor-pointer appearance-none"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} — {zone.fee.toLocaleString("fr-FR")} {currencySymbol} ({zone.estimatedTime})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Selected Zone Pill Info */}
        {selectedZone && (
          <div className="mt-2 flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              Délai estimé : <strong className="font-bold">{selectedZone.estimatedTime}</strong>
            </span>
            <span className="font-bold">
              Frais : {selectedZone.fee.toLocaleString("fr-FR")} {currencySymbol}
            </span>
          </div>
        )}
      </div>

      {/* African Landmark Input (Indispensable) */}
      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-blue-500" />
          <span>Point de repère précis (Essentiel pour le livreur)</span>
        </label>
        <input
          type="text"
          value={landmark}
          onChange={(e) => onChangeLandmark(e.target.value)}
          placeholder="Ex: Derrière la pharmacie, portail vert, villa 45..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
        />
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
          Aide le livreur à vous trouver rapidement sans avoir à vous rappeler 10 fois.
        </p>
      </div>
    </div>
  );
}
