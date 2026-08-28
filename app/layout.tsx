import type { Metadata } from "next";
import { Josefin_Sans, Inter } from "next/font/google";
import "./globals.css";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Library Archives",
  description: "Your notes, above the passages that prompted them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${josefin.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="app-frame flex flex-col">{children}</div>
      </body>
    </html>
  );
}
