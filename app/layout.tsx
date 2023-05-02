import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "@/app/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
   title: "Realtime Chat Application",
   description: "Chat with your friends",
   icons: {
      icon: { url: "@/app/favicon.ico", type: "image/ico" },
      shortcut: { url: "@/app/favicon.ico", type: "image/ico" },
   },
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}
