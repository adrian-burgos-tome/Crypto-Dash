/**
 * api.js — Módulo de acceso a la API de CoinGecko
 * 
 * Funciones asíncronas para obtener datos del mercado cripto.
 * Usa la API pública gratuita de CoinGecko (sin API key).
 * Docs: https://docs.coingecko.com/reference/introduction
 */

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Configuración de Caché (en milisegundos)
const CACHE_TTL = 120 * 1000; // 2 minutos
const apiCache = new Map();

/**
 * Función de utilidad para crear una pausa asíncrona.
 * @param {number} ms — Milisegundos de espera.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Lista de IDs de las criptomonedas más populares que queremos mostrar.
 * (Estos IDs coinciden con los de CoinGecko)
 */
const CRYPTO_IDS = [
    'bitcoin',
    'ethereum',
    'tether',
    'binancecoin',
    'solana',
    'ripple',
    'usd-coin',
    'dogecoin',
    'cardano',
    'tron',
    'avalanche-2',
    'polkadot'
];

/**
 * Obtiene los datos de mercado de las criptomonedas seleccionadas.
 * Incluye precio, variación 24h, capitalización, volumen, etc.
 * 
 * @returns {Promise<Array>} Array de objetos con datos de cada cripto.
 * @throws {Error} Si la petición falla o la API devuelve un error.
 */
async function fetchCryptoList() {
    const cacheKey = 'market_list';
    
    // Verificar caché
    if (apiCache.has(cacheKey)) {
        const { data, timestamp } = apiCache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_TTL) {
            console.log('[API] Usando datos de la lista desde el caché');
            return data;
        }
    }

    const ids = CRYPTO_IDS.join(',');
    const url = `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;

    try {
        // Pausa artificial para evitar saturación y dar efecto de escaneo
        await sleep(600);
        
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Límite de peticiones alcanzado (Rate Limit). Por favor, espera un momento.');
            }
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Guardar en caché
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        
        return data;
    } catch (error) {
        console.error('[API] Error al obtener lista de criptos:', error);
        throw error;
    }
}

/**
 * Obtiene datos detallados de una criptomoneda específica.
 * Incluye datos de mercado expandidos, descripción, links, etc.
 * 
 * @param {string} coinId — El ID de CoinGecko (ej: "bitcoin").
 * @returns {Promise<Object>} Objeto con todos los datos de la moneda.
 * @throws {Error} Si la petición falla.
 */
async function fetchCryptoDetail(coinId) {
    const cacheKey = `detail_${coinId}`;
    
    // Verificar caché
    if (apiCache.has(cacheKey)) {
        const { data, timestamp } = apiCache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`[API] Usando datos de detalle para ${coinId} desde el caché`);
            return data;
        }
    }

    const url = `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;

    try {
        // Pausa artificial para evitar saturación y dar efecto de escaneo
        await sleep(500);

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Demasiadas peticiones. Espera un minuto antes de consultar otra moneda.');
            }
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Guardar en caché
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        
        return data;
    } catch (error) {
        console.error(`[API] Error al obtener detalle de ${coinId}:`, error);
        throw error;
    }
}
