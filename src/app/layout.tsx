import type { Metadata, Viewport } from "next";
import { Rajdhani, Montserrat } from "next/font/google";

import { Provedores } from "@/components/provedores";

import "./globals.css";

/** Display condensada da marca: títulos, overall e nomes de cartaz. */
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-rajdhani",
  display: "swap",
});

/** Corpo e interface. */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fonte-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MMA Legacy",
  description:
    "Monte o lutador perfeito com as melhores habilidades das maiores referências do MMA e descubra até onde sua carreira chegaria.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${rajdhani.variable} ${montserrat.variable} dark h-full antialiased`}
    >
      <body className="textura-arena flex min-h-full flex-col">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
