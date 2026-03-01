import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://roompersonality.com"),
  title: "Room Personality Test | 사진 한 장으로 방 성격 테스트",
  description:
    "질문 없이 사진 한 장으로 방 분위기→습관→성향을 재미로 분석하는 Room Personality Test.",
  openGraph: {
    title: "Room Personality Test",
    description: "사진 한 장으로 방 성격 테스트 (재미용)",
    url: "https://roompersonality.com",
    siteName: "RoomPersonality",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
