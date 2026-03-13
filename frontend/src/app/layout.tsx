import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/theme-provider";
import GlobalCopyright from "@/components/GlobalCopyright";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${siteConfig.brand?.logoText?.split(" ")[0] || "🦀"}</text></svg>`,
  },
  verification: {
    google: "lX-ZWLJRzO1V3CudEyBKXFmKnlSZ4fUhbV6wj79s4Qk",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.meta.themeColorLight },
    { media: "(prefers-color-scheme: dark)",  color: siteConfig.meta.themeColorDark  },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.theme.defaultLanguage} suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={siteConfig.theme.defaultTheme}
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* flex-1 makes the main content expand, pushing the copyright to the bottom */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          
          {/* Universal Copyright Bar - Visible on every page */}
          <GlobalCopyright />
        </ThemeProvider>
      </body>
    </html>
  );
}