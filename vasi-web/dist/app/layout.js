import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
const font = Plus_Jakarta_Sans({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-sans",
    display: "swap",
});
export const metadata = {
    title: "Vasi — Geleceğe Mesaj Bırak",
    description: "Vasi ile sevdiklerine zaman aşımına uğramayan mesajlar gönder. Tarihli, tetikleyici tabanlı veya miras mesajları yaz.",
};
export default function RootLayout({ children }) {
    return (React.createElement("html", { lang: "tr" },
        React.createElement("body", { className: font.variable }, children)));
}
