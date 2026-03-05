// All'interno della funzione RootLayout o dove avviene la chiamata:

async function getMatches() {
  try {
    // Puntiamo al nostro nuovo indirizzo funzionante
    const res = await fetch('https://betmasterapp-netgasbottle-6310s-projects.vercel.app/api/bets', {
      next: { revalidate: 0 } // Per avere dati sempre freschi
    });

    if (!res.ok) {
      throw new Error('Errore nel recupero dati');
    }

    return res.json();
  } catch (error) {
    console.error("Errore fetch layout:", error);
    return [];
  }
}
