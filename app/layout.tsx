import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { StoreProvider } from "./components/StoreProvider";
import { ViewProvider } from "./components/layout/ViewContext";
import LayoutWrapper from "./components/layout/LayoutWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candidate Engagement Chatbot",
  description:
    "A specialized chatbot that engages job applicants with contextually relevant information while qualifying their fit",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <ViewProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ViewProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
