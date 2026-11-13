import type { Metadata, Viewport } from "next";
import "@fontsource-variable/instrument-sans";
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
  themeColor: "#f3f5f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>
          {children}
          <StatusBar />
          <footer>Testnet demo with sample homes and photos. Interac, rupee payouts, SMS and engineer licences are simulated.</footer>
        </main>
      </body>
    </html>
  );
}
