import "./globals.css";

export const metadata = {
  title: "BetMaster AI",
  description: "Pronostici con Intelligenza Artificiale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body style={{ margin: 0, backgroundColor: 'black' }}>
        {children}
      </body>
    </html>
  );
}
