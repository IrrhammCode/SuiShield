import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletAuthProvider } from "@/context/WalletAuthContext";
import { SuiWalletProvider } from "@/lib/sui-wallet";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "SuiShield — Check Before You Approve",
  description:
    "AI-powered trust analysis for every Sui interaction. Paste any address. Get a verdict. Share the proof. Powered by Tatum Sui RPC and Walrus decentralized storage.",
  keywords: [
    "Sui blockchain",
    "wallet analysis",
    "scam detection",
    "trust score",
    "Walrus storage",
    "Tatum",
    "DeFi safety",
    "NFT verification",
    "blockchain forensics",
  ],
  openGraph: {
    title: "SuiShield — Check Before You Approve",
    description:
      "AI-powered trust analysis for every Sui interaction. Powered by Tatum Sui RPC and Walrus storage.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuiShield",
    description: "Check Before You Approve — AI-powered trust analysis for Sui",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-[#080A14] text-white overflow-x-hidden min-h-screen">
        <SuiWalletProvider>
          <WalletProvider>
            <WalletAuthProvider>{children}</WalletAuthProvider>
          </WalletProvider>
        </SuiWalletProvider>
      </body>
    </html>
  );
}
