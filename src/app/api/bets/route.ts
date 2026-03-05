try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': chiave ? chiave.trim() : '', 
      },
      next: { revalidate: 0 }
    });

    const dati = await risposta.json();
    
    // Aggiungiamo i permessi per la grafica
    return NextResponse.json(dati, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-apisports-key',
      },
    });
    
  }
