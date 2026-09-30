/**
 * Banners API service — supports both mock and real backend.
 *
 * Real backend endpoint:
 *   GET /api/banners — returns { hero, dealOfTheDay, minDiscountTiles, bankOffers }
 */
import { apiCall, api } from './client';
import { heroBanners, dealOfTheDay, bankOffers, minDiscountTiles } from '../../data/banners';
import type { Banner, DealOfTheDay, BankOffer } from '../../types';

interface BannersResponse {
  success: boolean;
  data: {
    hero: Banner[];
    dealOfTheDay: DealOfTheDay;
    minDiscountTiles: { label: string; discount: number; image: string }[];
    bankOffers: BankOffer[];
  };
}

/* Cached banner data to avoid multiple parallel calls */
let _bannersCache: BannersResponse['data'] | null = null;
async function fetchBanners(): Promise<BannersResponse['data']> {
  if (_bannersCache) return _bannersCache;
  const res = await api<BannersResponse>('/banners');
  _bannersCache = res.data;
  return _bannersCache;
}

/* ─── getHeroBanners ─── */
export async function getHeroBanners(): Promise<Banner[]> {
  return apiCall(
    () => heroBanners,
    async () => (await fetchBanners()).hero
  );
}

/* ─── getDealOfTheDay ─── */
export async function getDealOfTheDay(): Promise<DealOfTheDay> {
  return apiCall(
    () => ({ ...dealOfTheDay, endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() }),
    async () => (await fetchBanners()).dealOfTheDay
  );
}

/* ─── getBankOffers ─── */
export async function getBankOffers(): Promise<BankOffer[]> {
  return apiCall(
    () => bankOffers,
    async () => (await fetchBanners()).bankOffers
  );
}

/* ─── getMinDiscountTiles ─── */
export async function getMinDiscountTiles() {
  return apiCall(
    () => minDiscountTiles,
    async () => (await fetchBanners()).minDiscountTiles
  );
}
