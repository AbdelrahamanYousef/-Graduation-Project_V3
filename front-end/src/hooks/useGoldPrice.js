import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMetalPrices, calculateNisab, calculateSilverNisab } from '../services/goldPriceService';
import { useAdminData } from '../contexts/AdminDataContext';

/**
 * useGoldPrice — Custom React hook for live gold & silver prices.
 *
 * Handles:
 *   1. Admin-override prices from zakatConfig (highest priority)
 *   2. Live API fetch via goldPriceService (with 8-hour cache)
 *   3. Fallback prices if API fails
 *   4. Manual refresh (clears cache)
 *   5. Nisab calculation (gold-based = 85g × 24K price)
 *
 * @returns {{ prices, loading, error, isLive, lastUpdated, refetch, nisabGold, nisabSilver, nisab, source }}
 */
export default function useGoldPrice() {
    const { state } = useAdminData();
    const zakatConfig = state?.content?.zakatConfig;

    const [prices, setPrices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchKey, setFetchKey] = useState(0); // bump to force re-fetch

    // Determine source and fetch prices
    useEffect(() => {
        let cancelled = false;

        const useLive = zakatConfig?.useLiveApi !== false;

        // 1. Admin override (only if Live API is disabled)
        if (!useLive && zakatConfig && zakatConfig.goldPrice && zakatConfig.silverPrice) {
            setPrices({
                gold24k: zakatConfig.goldPrice,
                gold21k: zakatConfig.goldPrice * (21 / 24),
                gold18k: zakatConfig.goldPrice * (18 / 24),
                silver: zakatConfig.silverPrice,
                isLive: false,
                lastUpdated: new Date(),
                source: 'admin',
            });
            setLoading(false);
            setError(null);
            return;
        }

        // 2. Fetch from API / cache
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const data = await getMetalPrices();
                if (cancelled) return;
                
                // If live api succeeded, use the values. Otherwise, use admin's backup prices if set, else service fallbacks.
                const gold24k = data.isLive ? data.gold24k : (zakatConfig?.goldPrice || data.gold24k);
                const silver = data.isLive ? data.silver : (zakatConfig?.silverPrice || data.silver);
                
                setPrices({
                    gold24k,
                    gold21k: gold24k * (21 / 24),
                    gold18k: gold24k * (18 / 24),
                    silver,
                    isLive: data.isLive,
                    lastUpdated: data.lastUpdated,
                    source: data.isLive ? 'api' : 'fallback',
                });
            } catch (err) {
                if (cancelled) return;
                setError(err.message || 'Failed to fetch prices');
                // absolute fallback
                const gold24k = zakatConfig?.goldPrice || 7700;
                const silver = zakatConfig?.silverPrice || 129;
                setPrices({
                    gold24k,
                    gold21k: gold24k * (21 / 24),
                    gold18k: gold24k * (18 / 24),
                    silver,
                    isLive: false,
                    lastUpdated: null,
                    source: 'fallback',
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [zakatConfig, fetchKey]);

    // Manual refresh — clears cache and re-fetches
    const refetch = useCallback(() => {
        try {
            localStorage.removeItem('zakat_metal_prices');
        } catch { /* noop */ }
        setFetchKey(k => k + 1);
    }, []);

    // Nisab calculations
    const nisabGold = useMemo(() => {
        if (!prices?.gold24k) return 0;
        return calculateNisab(prices.gold24k);
    }, [prices?.gold24k]);

    const nisabSilver = useMemo(() => {
        if (!prices?.silver) return 0;
        return calculateSilverNisab(prices.silver);
    }, [prices?.silver]);

    // Use gold-based nisab (standard in Islamic finance)
    const nisab = nisabGold;

    return {
        prices,
        loading,
        error,
        isLive: prices?.isLive ?? false,
        lastUpdated: prices?.lastUpdated ?? null,
        source: prices?.source ?? 'fallback',
        refetch,
        nisabGold,
        nisabSilver,
        nisab,
    };
}
