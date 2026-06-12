import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "VitPay - Confidential Payroll on Arc",
  description: "Secure and encrypted salary distributions on Arc Testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers> 
          <AppLayout>
            {children}
          </AppLayout>
        </Providers> 
      </body>
    </html>
  );
}