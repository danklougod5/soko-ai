import type { Metadata } from "next";
import "./globals.css";
import { Geist, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: "SokoAI — Le Lovable du E-commerce en Afrique",
  description:
    "Créez, personnalisez et lancez votre boutique e-commerce en Afrique en 60 secondes grâce à l'IA. Intégration native de Wave, Orange Money, WhatsApp et logistique locale.",
  keywords: [
    "ecommerce afrique",
    "boutique en ligne cote d'ivoire",
    "wave mobile money",
    "orange money checkout",
    "lovable shopify afrique",
    "ai website builder",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("h-full antialiased dark", "font-sans", geist.variable, inter.variable)}>
      <body className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-white/20 selection:text-white">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
