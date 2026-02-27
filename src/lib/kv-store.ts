import { Redis } from '@upstash/redis';

// Inizializza Redis con le variabili ambiente di Vercel
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Chiavi per salvare i dati
const KEYS = {
  ESTRAZIONE: 'enalotto:estrazione',
  RITARDATARI: 'enalotto:ritardatari',
  LAST_UPDATE: 'enalotto:last_update'
};

// TTL: 24 ore
const TTL = 86400;

// ========================================
// SALVATAGGIO
// ========================================

export async function salvaEstrazione(data: any): Promise<boolean> {
  try {
    await redis.setex(KEYS.ESTRAZIONE, TTL, JSON.stringify(data));
    await redis.setex(KEYS.LAST_UPDATE, TTL, new Date().toISOString());
    console.log('[REDIS] ✓ Estrazione salvata');
    return true;
  } catch (error) {
    console.error('[REDIS] ✗ Errore salvataggio estrazione:', error);
    return false;
  }
}

export async function salvaRitardatari(data: any): Promise<boolean> {
  try {
    await redis.setex(KEYS.RITARDATARI, TTL, JSON.stringify(data));
    console.log('[REDIS] ✓ Ritardatari salvati');
    return true;
  } catch (error) {
    console.error('[REDIS] ✗ Errore salvataggio ritardatari:', error);
    return false;
  }
}

// ========================================
// LETTURA
// ========================================

export async function leggiEstrazione(): Promise<any | null> {
  try {
    const data = await redis.get(KEYS.ESTRAZIONE);
    if (data) {
      console.log('[REDIS] ✓ Estrazione letta dalla cache');
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (error) {
    console.error('[REDIS] ✗ Errore lettura estrazione:', error);
    return null;
  }
}

export async function leggiRitardatari(): Promise<any | null> {
  try {
    const data = await redis.get(KEYS.RITARDATARI);
    if (data) {
      console.log('[REDIS] ✓ Ritardatari letti dalla cache');
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (error) {
    console.error('[REDIS] ✗ Errore lettura ritardatari:', error);
    return null;
  }
}

export async function leggiUltimoAggiornamento(): Promise<string | null> {
  try {
    return await redis.get(KEYS.LAST_UPDATE);
  } catch (error) {
    return null;
  }
}

// ========================================
// VERIFICA CONNESSIONE
// ========================================

export async function redisDisponibile(): Promise<boolean> {
  try {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      console.log('[REDIS] ✗ Variabili ambiente non configurate');
      return false;
    }
    
    await redis.ping();
    console.log('[REDIS] ✓ Connessione OK');
    return true;
  } catch (error) {
    console.log('[REDIS] ✗ Connessione fallita:', error);
    return false;
  }
}
