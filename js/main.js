/**
 * main.js — Manipulación del DOM y lógica de la UI
 * 
 * Gestiona la creación de tarjetas, el panel de detalle,
 * y la interacción del usuario con la interfaz.
 */

// ============================================
// DOM References
// ============================================
const cryptoGrid = document.getElementById('crypto-grid');
const gridLoader = document.getElementById('grid-loader');
const detailPanel = document.getElementById('detail-panel');
const panelCloseBtn = document.getElementById('panel-close');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const lastUpdateEl = document.getElementById('last-update');

// Detail panel elements
const detailImg = document.getElementById('detail-img');
const detailName = document.getElementById('detail-name');
const detailSymbol = document.getElementById('detail-symbol');
const statPrice = document.getElementById('stat-price');
const statChange24h = document.getElementById('stat-change-24h');
const statHigh24h = document.getElementById('stat-high-24h');
const statLow24h = document.getElementById('stat-low-24h');
const statMarketCap = document.getElementById('stat-market-cap');
const statVolume = document.getElementById('stat-volume');
const statSupply = document.getElementById('stat-supply');
const statAth = document.getElementById('stat-ath');

// ============================================
// State
// ============================================
let cryptoData = [];
let activeCardId = null;

// ============================================
// Formatters
// ============================================

/**
 * Formatea un número como moneda USD.
 * @param {number} value 
 * @param {number} decimals 
 * @returns {string}
 */
function formatUSD(value, decimals = 2) {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Formatea números grandes de forma compacta (ej: 1.2T, 450B).
 * @param {number} value 
 * @returns {string}
 */
function formatCompact(value) {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Formatea el porcentaje de cambio con signo y emoji.
 * @param {number} value 
 * @returns {{ text: string, isPositive: boolean }}
 */
function formatChange(value) {
    if (value === null || value === undefined) return { text: '—', isPositive: true };
    const sign = value >= 0 ? '▲' : '▼';
    return {
        text: `${sign} ${Math.abs(value).toFixed(2)}%`,
        isPositive: value >= 0
    };
}

/**
 * Obtiene la hora actual formateada.
 * @returns {string}
 */
function getTimeString() {
    return new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ============================================
// UI — Render Cards
// ============================================

/**
 * Crea el HTML de una tarjeta de criptomoneda.
 * @param {Object} coin — Datos de la moneda desde CoinGecko.
 * @param {number} index — Índice para la animación escalonada.
 * @returns {HTMLElement}
 */
function createCryptoCard(coin, index) {
    const card = document.createElement('article');
    card.className = 'crypto-card';
    card.dataset.coinId = coin.id;
    card.style.animationDelay = `${index * 0.06}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver detalles de ${coin.name}`);

    const change = formatChange(coin.price_change_percentage_24h);

    card.innerHTML = `
        <span class="rank-badge">#${coin.market_cap_rank || '—'}</span>
        <div class="card-header">
            <div class="crypto-icon-wrapper">
                <img src="${coin.image}" alt="${coin.name}" loading="lazy" width="32" height="32">
            </div>
            <div class="card-info">
                <p class="crypto-name">${coin.name}</p>
                <p class="crypto-symbol">${coin.symbol}</p>
            </div>
        </div>
        <div class="card-body">
            <span class="crypto-price">${formatUSD(coin.current_price)}</span>
            <span class="crypto-change ${change.isPositive ? 'positive' : 'negative'}">${change.text}</span>
        </div>
    `;

    // Click handler
    card.addEventListener('click', () => handleCardClick(coin.id));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(coin.id);
        }
    });

    return card;
}

/**
 * Renderiza todas las tarjetas en el grid.
 * @param {Array} coins 
 */
function renderGrid(coins) {
    // Limpiar el grid (quitar loader y tarjetas anteriores)
    cryptoGrid.innerHTML = '';

    coins.forEach((coin, index) => {
        const card = createCryptoCard(coin, index);
        cryptoGrid.appendChild(card);
    });
}

// ============================================
// UI — Detail Panel
// ============================================

/**
 * Maneja el clic en una tarjeta. Carga datos detallados y muestra el panel.
 * @param {string} coinId 
 */
async function handleCardClick(coinId) {
    // Marcar tarjeta activa
    setActiveCard(coinId);

    // Mostrar panel con estado de carga
    showDetailPanel();
    setDetailLoading(true);

    try {
        const detail = await fetchCryptoDetail(coinId);
        populateDetail(detail);
    } catch (error) {
        showDetailError(error.message);
    } finally {
        setDetailLoading(false);
    }
}

/**
 * Marca visualmente la tarjeta activa y desmarca las demás.
 * @param {string} coinId 
 */
function setActiveCard(coinId) {
    activeCardId = coinId;
    document.querySelectorAll('.crypto-card').forEach(card => {
        card.classList.toggle('active', card.dataset.coinId === coinId);
    });
}

/**
 * Muestra el panel de detalle.
 */
function showDetailPanel() {
    detailPanel.classList.add('visible');
    detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Oculta el panel de detalle.
 */
function hideDetailPanel() {
    detailPanel.classList.remove('visible');
    activeCardId = null;
    document.querySelectorAll('.crypto-card').forEach(card => {
        card.classList.remove('active');
    });
}

/**
 * Muestra/oculta el estado de carga del panel.
 * @param {boolean} loading 
 */
function setDetailLoading(loading) {
    const stats = document.getElementById('detail-stats');
    if (loading) {
        stats.style.opacity = '0.3';
        stats.style.pointerEvents = 'none';
    } else {
        stats.style.opacity = '1';
        stats.style.pointerEvents = 'auto';
    }
}

/**
 * Rellena el panel de detalle con los datos de la moneda.
 * @param {Object} coin — Datos detallados de CoinGecko.
 */
function populateDetail(coin) {
    const market = coin.market_data;

    // Header
    detailImg.src = coin.image?.large || coin.image?.small || '';
    detailImg.alt = coin.name;
    detailName.textContent = coin.name;
    detailSymbol.textContent = coin.symbol?.toUpperCase() || '—';

    // Stats
    statPrice.textContent = formatUSD(market.current_price?.usd);

    const change = formatChange(market.price_change_percentage_24h);
    statChange24h.textContent = change.text;
    statChange24h.style.color = change.isPositive ? 'var(--neon-green)' : 'var(--neon-red)';

    statHigh24h.textContent = formatUSD(market.high_24h?.usd);
    statLow24h.textContent = formatUSD(market.low_24h?.usd);
    statMarketCap.textContent = formatCompact(market.market_cap?.usd);
    statVolume.textContent = formatCompact(market.total_volume?.usd);
    statSupply.textContent = formatCompact(market.circulating_supply);
    statAth.textContent = formatUSD(market.ath?.usd);
}

/**
 * Muestra un error en el panel de detalle.
 * @param {string} message 
 */
function showDetailError(message) {
    detailName.textContent = 'Error';
    detailSymbol.textContent = message;
    statPrice.textContent = '—';
    statChange24h.textContent = '—';
    statHigh24h.textContent = '—';
    statLow24h.textContent = '—';
    statMarketCap.textContent = '—';
    statVolume.textContent = '—';
    statSupply.textContent = '—';
    statAth.textContent = '—';
}

// ============================================
// UI — Status & Loading
// ============================================

/**
 * Actualiza el indicador de estado de conexión.
 * @param {'online'|'offline'|'loading'} status 
 */
function setConnectionStatus(status) {
    switch (status) {
        case 'online':
            statusDot.classList.remove('offline');
            statusText.textContent = 'ONLINE';
            lastUpdateEl.textContent = `Última actualización: ${getTimeString()}`;
            break;
        case 'offline':
            statusDot.classList.add('offline');
            statusText.textContent = 'ERROR';
            break;
        case 'loading':
            statusDot.classList.remove('offline');
            statusText.textContent = 'CARGANDO...';
            break;
    }
}

/**
 * Muestra un mensaje de error en el grid.
 * @param {string} message 
 */
function showGridError(message) {
    cryptoGrid.innerHTML = `
        <div class="error-container" style="grid-column: 1 / -1;">
            <div class="error-icon">⚠</div>
            <p class="error-message">${message}</p>
            <button class="retry-btn" id="retry-btn" onclick="initApp()">REINTENTAR</button>
        </div>
    `;
}

// ============================================
// App Initialization
// ============================================

/**
 * Inicializa la aplicación: carga datos y renderiza la UI.
 */
async function initApp() {
    setConnectionStatus('loading');

    // Mostrar loader
    cryptoGrid.innerHTML = `
        <div class="loading-container" id="grid-loader" style="grid-column: 1 / -1;">
            <div class="loader"></div>
            <span class="loading-text">Conectando con CoinGecko...</span>
        </div>
    `;

    try {
        cryptoData = await fetchCryptoList();
        renderGrid(cryptoData);
        setConnectionStatus('online');
    } catch (error) {
        setConnectionStatus('offline');
        showGridError('No se pudieron cargar los datos. Verifica tu conexión a internet.');
    }
}

// ============================================
// Event Listeners
// ============================================

// Cerrar panel de detalle
panelCloseBtn.addEventListener('click', hideDetailPanel);

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideDetailPanel();
    }
});

// ============================================
// Boot
// ============================================
document.addEventListener('DOMContentLoaded', initApp);
