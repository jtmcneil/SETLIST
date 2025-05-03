import type { Metadata } from "next";
import "./globals.css";
import Nav from "./nav";

export const metadata: Metadata = {
    title: "Setlist",
    description: "Distribute content your way, with ease",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="">
                <div className="fixed left-0 top-0 w-12 lg:w-36 h-screen border-r-2 border-[#ff5048] z-50" />
                <Nav />
                <main className="min-h-screen paper pt-20 px-12 lg:px-36">
                    {children}
                </main>
            </body>
        </html>
    );
}
