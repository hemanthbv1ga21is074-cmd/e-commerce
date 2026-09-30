import React, { useEffect, useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { DealOfTheDay } from '../components/home/DealOfTheDay';
import { ShopByCategory } from '../components/home/ShopByCategory';
import { ShopByBrand } from '../components/home/ShopByBrand';
import { BankOffersStrip } from '../components/home/BankOffersStrip';
import { MinDiscountTiles } from '../components/home/MinDiscountTiles';
import { TrendingSection } from '../components/home/TrendingSection';
import { RecommendedForYou } from '../components/home/RecommendedForYou';
import { RecentlyViewed } from '../components/home/RecentlyViewed';
import { Newsletter } from '../components/home/Newsletter';
import { Skeleton } from '../components/ui/Skeleton';

import { getHeroBanners, getDealOfTheDay, getBankOffers } from '../services/api/banners';
import { getTrendingProducts, getProductsByIds, getAllProducts } from '../services/api/products';
import { brands } from '../data/brands';
import type { Banner, DealOfTheDay as DealType, BankOffer, Product } from '../types';

export const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [deal, setDeal] = useState<DealType | null>(null);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [bannersData, dealData, offersData, trendingData, allProds] = await Promise.all([
          getHeroBanners(),
          getDealOfTheDay(),
          getBankOffers(),
          getTrendingProducts(10),
          getAllProducts(),
        ]);

        if (!isMounted) return;

        setBanners(bannersData);
        setDeal(dealData);
        setBankOffers(offersData);
        setTrending(trendingData);

        // Fetch products for deal of the day
        if (dealData?.productIds?.length) {
          const dealProds = await getProductsByIds(dealData.productIds);
          if (isMounted) setDealProducts(dealProds);
        }

        // Recommended items (random subset or high rated)
        const recs = allProds.filter((p) => p.rating >= 4.3).slice(0, 8);
        setRecommended(recs);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SEO title="Online Shopping for Men, Women & Kids Fashion" />

      <div className="container-app py-4 space-y-8">
        {loading ? (
          <div className="space-y-8 py-4">
            <Skeleton variant="rect" className="w-full h-80 rounded-xl" />
            <Skeleton variant="rect" className="w-full h-56 rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton variant="rect" className="w-full h-32 rounded-lg" />
              <Skeleton variant="rect" className="w-full h-32 rounded-lg" />
              <Skeleton variant="rect" className="w-full h-32 rounded-lg" />
              <Skeleton variant="rect" className="w-full h-32 rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            {/* Hero Carousel */}
            <HeroCarousel banners={banners} />

            {/* Deal Of The Day */}
            {deal && <DealOfTheDay deal={deal} products={dealProducts} />}

            {/* Shop By Category */}
            <ShopByCategory />

            {/* Bank Offers Strip */}
            <BankOffersStrip offers={bankOffers} />

            {/* Grand Steal Deals (Min 30/40/50/60% off) */}
            <MinDiscountTiles />

            {/* Grand Brands Spotlight */}
            <ShopByBrand brands={brands} />

            {/* Trending Now */}
            <TrendingSection products={trending} />

            {/* Recommended For You */}
            <RecommendedForYou products={recommended} />

            {/* Recently Viewed (client store dependent) */}
            <RecentlyViewed />

            {/* Newsletter VIP Strip */}
            <Newsletter />
          </>
        )}
      </div>
    </>
  );
};
