import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "./nav";
import StatusBar from "./status";

export const metadata: Metadata = {
  title: "Homeward",
  description: "Pay for your parents' house one checked stage at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>
          {children}
          <StatusBar />
          <footer>Testnet demo. Interac, rupee payouts, SMS, engineer licences and sample images are simulated.</footer>
        </main>
      </body>
    </html>
  );
}
