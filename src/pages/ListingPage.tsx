import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import { SEO } from '../components/ui/SEO';
import { ListingHeader } from '../components/listing/ListingHeader';
import { FilterChips } from '../components/listing/FilterChips';
import { FilterSidebar } from '../components/listing/FilterSidebar';
import { FilterBottomSheet } from '../components/listing/FilterBottomSheet';
import { SortBottomSheet } from '../components/listing/SortBottomSheet';
import { ProductGrid } from '../components/product/ProductGrid';
import { Pagination } from '../components/listing/Pagination';

import { getProducts, getAllProducts } from '../services/api/products';
import { getBreadcrumbs } from '../services/api/categories';
import {
  parseQueryString,
  buildQueryString,
  countActiveFilters,
} from '../../src/utils/filters';
import { DEFAULT_FILTER_STATE, type FilterState, type Product, type BreadcrumbItem, type Gender, type SortOption } from '../types';

export const ListingPage: React.FC = () => {
  const { gender: paramGender, category: paramCategory } = useParams<{
    gender?: string;
    category?: string;
  }>();

  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  // Determine gender from path (e.g. /men, /women, /kids)
  const currentGender = useMemo<Gender | undefined>(() => {
    const pathGender = paramGender || location.pathname.split('/')[1];
    if (pathGender === 'men' || pathGender === 'women' || pathGender === 'kids') {
      return pathGender as Gender;
    }
    return undefined;
  }, [paramGender, location.pathname]);

  const currentCategory = paramCategory;

  // Initialize filters from URL query string
  const urlFilters = useMemo(() => {
    return {
      ...DEFAULT_FILTER_STATE,
      ...parseQueryString(location.search),
    };
  }, [location.search]);

  const [filters, setFilters] = useState<FilterState>(urlFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategoryProducts, setAllCategoryProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Mobile modals state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Sync state when URL search changes
  useEffect(() => {
    setFilters({
      ...DEFAULT_FILTER_STATE,
      ...parseQueryString(location.search),
    });
  }, [location.search]);

  // Load breadcrumbs & baseline category products
  useEffect(() => {
    let mounted = true;
    async function init() {
      const crumbs = await getBreadcrumbs(currentGender, currentCategory);
      const all = await getAllProducts();
      if (!mounted) return;
      setBreadcrumbs(crumbs);
      // Filter base products by gender & category for sidebar facet counts
      let base = all;
      if (currentGender) base = base.filter((p) => p.gender === currentGender);
      if (currentCategory) {
        base = base.filter((p) =>
          p.categoryPath.some((c) => c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === currentCategory.toLowerCase()) ||
          p.slug.includes(currentCategory.toLowerCase())
        );
      }
      setAllCategoryProducts(base);
    }
    init();
    return () => {
      mounted = false;
    };
  }, [currentGender, currentCategory]);

  // Fetch filtered & paginated products
  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      if (filters.page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await getProducts(filters, currentGender, currentCategory);
        if (!mounted) return;

        if (filters.page === 1) {
          setProducts(response.items);
        } else {
          setProducts((prev) => [...prev, ...response.items]);
        }
        setTotalCount(response.total);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [filters, currentGender, currentCategory]);

  // Update URL whenever filters change
  const applyFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    const qs = buildQueryString(newFilters);
    setSearchParams(new URLSearchParams(qs.replace(/^\?/, '')));
  }, [setSearchParams]);

  const handleRemoveSingleFilter = (key: keyof FilterState, val?: string | number | null) => {
    const updated = { ...filters, page: 1 };
    if (Array.isArray(updated[key])) {
      (updated[key] as string[]) = (updated[key] as string[]).filter((x) => x !== val);
    } else {
      (updated[key] as any) = null;
    }
    applyFilterChange(updated);
  };

  const handleClearAll = () => {
    applyFilterChange({
      ...DEFAULT_FILTER_STATE,
      sort: filters.sort,
    });
  };

  const handleSortChange = (newSort: SortOption) => {
    applyFilterChange({ ...filters, sort: newSort, page: 1 });
  };

  const handleLoadMore = () => {
    applyFilterChange({ ...filters, page: (filters.page || 1) + 1 });
  };

  const pageTitle = currentCategory
    ? `${currentCategory.replace(/-/g, ' ')} For ${currentGender || ''}`
    : `${currentGender ? currentGender.toUpperCase() + "'S" : 'ALL'} FASHION`;

  return (
    <>
      <SEO
        title={`${pageTitle} — Buy ${pageTitle} Online at Best Prices`}
        description={`Explore the latest collection of ${pageTitle} at StyleBazaar. Enjoy flat discounts, free shipping, and 30-day easy returns.`}
      />

      <div className="container-app py-6 space-y-4">
        {/* Header with Title, Count, Sort, and Mobile triggers */}
        <ListingHeader
          breadcrumbs={breadcrumbs}
          title={pageTitle}
          totalCount={totalCount}
          currentSort={filters.sort}
          onSortChange={handleSortChange}
          activeFilterCount={countActiveFilters(filters)}
          onOpenMobileFilters={() => setIsFilterOpen(true)}
          onOpenMobileSort={() => setIsSortOpen(true)}
        />

        {/* Active Filter Chips */}
        <FilterChips
          filters={filters}
          onRemoveFilter={handleRemoveSingleFilter}
          onClearAll={handleClearAll}
        />

        {/* Main Content: Sidebar + Product Grid */}
        <div className="flex gap-8 items-start pt-2">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-20 max-h-[85vh] overflow-y-auto scrollbar-hide">
            <FilterSidebar
              products={allCategoryProducts}
              filters={filters}
              onFilterChange={applyFilterChange}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Products Grid Area */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              loading={loading}
              skeletonCount={8}
              emptyTitle="No items match your selected filters"
              emptyDescription="Try clearing some filters or searching for different styles."
              onResetFilters={handleClearAll}
            />

            {/* Pagination / Load More */}
            <Pagination
              currentCount={products.length}
              totalCount={totalCount}
              loading={loadingMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        products={allCategoryProducts}
        filters={filters}
        onFilterChange={applyFilterChange}
        onClearAll={handleClearAll}
      />

      {/* Mobile Sort Sheet */}
      <SortBottomSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={filters.sort}
        onSortChange={handleSortChange}
      />
    </>
  );
};
