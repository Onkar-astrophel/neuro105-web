import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oven Remote Dashboard",
  description: "Live monitoring & configuration for the PPI Neuro 105 oven controller",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
