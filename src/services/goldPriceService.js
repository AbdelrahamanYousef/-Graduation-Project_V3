/**
 * Gold & Silver Price Service
 * Fetches live prices from goldapi.io, caches in localStorage for 8 hours (≈3×/day).
 * Falls back to hardcoded prices if API fails or is unavailable.
 *
 * API: https://goldapi.io
 * Endpoints:
 *   GET /api/XAU/EGP → Gold price per gram (24K, 21K, 18K)
 *   GET /api/XAG/EGP → Silver price per gram
 */

const API_KEY = 'goldapi-dnq1c19mkvjypse-io';
const BASE_URL = 'https://www.goldapi.io/api';
const CACHE_KEY = 'zakat_metal_prices';
const CACHE_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours → 3 updates/day

// Fallback prices (EGP per gram) — safety net if API is unreachable
const FALLBACK = {
    gold24k: 4200,
    gold21k: 3675,
    gold18k: 3150,
    silver: 56,
};

// ─── Cache Helpers ───────────────────────────────────────────────

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (Date.now() - data.timestamp > CACHE_DURATION_MS) return null;
        return data;
    } catch {
        return null;
    }
}

function writeCache(prices) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            ...prices,
            timestamp: Date.now(),
        }));
    } catch {
        // localStorage full or unavailable — silently fail
    }
}

// ─── API Fetchers ────────────────────────────────────────────────

async function fetchGoldPrices() {
    const res = await fetch(`${BASE_URL}/XAU/EGP`, {
        headers: { 'x-access-token': API_KEY, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Gold API error: ${res.status}`);
    const data = await res.json();
    return {
        gold24k: data.price_gram_24k,
        gold21k: data.price_gram_21k || data.price_gram_24k * 0.875,
        gold18k: data.price_gram_18k || data.price_gram_24k * 0.75,
    };
}

async function fetchSilverPrice() {
    const res = await fetch(`${BASE_URL}/XAG/EGP`, {
        headers: { 'x-access-token': API_KEY, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Silver API error: ${res.status}`);
    const data = await res.json();
    // goldapi.io returns price_gram_24k for silver too
    const silverPerGram = data.price_gram_24k || data.price_gram || (data.price / 31.1035);
    return silverPerGram || FALLBACK.silver;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Get metal prices — uses cache if fresh, otherwise fetches from API.
 * @returns {{ gold24k, gold21k, gold18k, silver, lastUpdated, isLive }}
 */
export async function getMetalPrices() {
    // 1. Check cache first
    const cached = readCache();
    if (cached) {
        return {
            gold24k: cached.gold24k,
            gold21k: cached.gold21k,
            gold18k: cached.gold18k,
            silver: cached.silver,
            lastUpdated: new Date(cached.timestamp),
            isLive: true,
        };
    }

    // 2. Fetch from API (2 parallel requests)
    try {
        const [goldPrices, silverPrice] = await Promise.all([
            fetchGoldPrices(),
            fetchSilverPrice(),
        ]);

        const prices = {
            gold24k: goldPrices.gold24k,
            gold21k: goldPrices.gold21k,
            gold18k: goldPrices.gold18k,
            silver: silverPrice,
        };

        writeCache(prices);

        return {
            ...prices,
            lastUpdated: new Date(),
            isLive: true,
        };
    } catch (err) {
        console.warn('Metal price API failed, using fallback prices:', err.message);

        return {
            ...FALLBACK,
            lastUpdated: null,
            isLive: false,
        };
    }
}

/**
 * Calculate the dynamic Nisab based on current gold price.
 * Nisab = 85 grams of 24K gold
 */
export function calculateNisab(gold24kPrice) {
    return 85 * gold24kPrice;
}

/**
 * Get the last time prices were updated from cache.
 * @returns {Date|null}
 */
export function getLastUpdateTime() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return new Date(data.timestamp);
    } catch {
        return null;
    }
}
