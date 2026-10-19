import type { Metadata, Viewport } from "next";
import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/product";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: PRODUCT_NAME, template: `%s | ${PRODUCT_NAME}` },
  description: "School management, attendance, fees, academic results and parent communication by Gramvista Empire Group.",
  applicationName: PRODUCT_NAME,
  authors: [{ name: COMPANY_NAME }],
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export const viewport: Viewport = { themeColor: "#071a2f", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

