
// app/layout.jsx
import './globals.css';
export const metadata = {
  title: "حجز قاعة الاجتماعات",
  description: "نظام حجز قاعة الاجتماعات"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
