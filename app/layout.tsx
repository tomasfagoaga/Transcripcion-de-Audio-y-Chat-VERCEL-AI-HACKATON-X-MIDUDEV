import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transcripción de Audio y Chat - Asistente de comunicación IA VERCEL AI HACKATON X MIDUDEV - POR TOMAS FAGOAGA - 2024 ",
  description: "Transcripción de Audio y Chat - Asistente de comunicación IA VERCEL AI HACKATON X MIDUDEV - POR TOMAS FAGOAGA - 2024",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
