import type { Metadata, Viewport } from "next";
import { Anek_Malayalam, Manjari } from "next/font/google";
import "./globals.css";
import Nav from "./nav";
import Link from "next/link";
import StatusBar from "./status";
import Brand from "./brand";

// Both typefaces cover Malayalam as well as Latin, so a parent's screen and a sponsor's screen match.
const body = Anek_Malayalam({ subsets: ["latin", "malayalam"], variable: "--font-body", display: "swap" });
const brand = Manjari({ subsets: ["latin"], weight: "700", variable: "--font-brand", display: "swap" });

export const metadata: Metadata = {
  title: "Homeward",
  description: "Pay for your parents' house one checked stage at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eef1f2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${brand.variable}`}>
      <body>
        <Nav />
        <main>
          <Brand />
          {children}
          <StatusBar />
          <footer>
            Testnet demo. Interac, rupee payouts and SMS are simulated.{" "}
            <Link className="link" href="/proof">
              See transactions on Stellar testnet
            </Link>
          </footer>
        </main>
      </body>
    </html>
  );
}
