import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "敲木鱼",
  description: "功德+1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
