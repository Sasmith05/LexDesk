import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "LexDesk",
  description: "Legal Practice Management System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}