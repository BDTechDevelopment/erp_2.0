import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./global.css";

export const metadata = {
  title: "ERP System",
  description: "Sistema de gestão empresarial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white">{children}</body>
    </html>
  );
}
