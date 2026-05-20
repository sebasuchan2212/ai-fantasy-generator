import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI FANTASY Generator",
  description:
    "TRPG・小説・ゲーム制作に使えるNPCとモンスターをワンクリックで大量生成できる創作支援ツールです。",
  openGraph: {
    title: "AI FANTASY Generator | NPC・モンスター量産メーカー",
    description:
      "NPC・モンスター・設定資料を画像プロンプト付きでまとめて生成できます。",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
