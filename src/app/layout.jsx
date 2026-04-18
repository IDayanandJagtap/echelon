import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Echelon",
  description: "Productivity platform rebuilt with Next.js and Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}