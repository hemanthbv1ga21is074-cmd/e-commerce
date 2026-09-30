import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/ui/SEO';
import { ListingHeader } from '../components/listing/ListingHeader';
import { FilterChips } from '../components/listing/FilterChips';
import { FilterSidebar } from '../components/listing/FilterSidebar';
import { FilterBottomSheet } from '../components/listing/FilterBottomSheet';
import { SortBottomSheet } from '../components/listing/SortBottomSheet';
import { ProductGrid } from '../components/product/ProductGrid';
import { Pagination } from '../components/listing/Pagination';

import { getAllProducts } from '../services/api/products';
import { searchProducts } from '../utils/search';
import { filterProducts, sortProducts, parseQueryString, buildQueryString, countActiveFilters } from '../utils/filters';
import { DEFAULT_FILTER_STATE, type FilterState, type Product, type SortOption } from '../types';

export const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from search params
  const filters: FilterState = useMemo(() => {
    return {
      ...DEFAULT_FILTER_STATE,
      ...parseQueryString(location.search),
    };
  }, [location.search]);

  // Mobile modals
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const prods = await getAllProducts();
        if (mounted) setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load products for search', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // 1. Search filter
  const baseSearchResults = useMemo(() => {
    if (!query.trim()) return allProducts;
    return searchProducts(allProducts, query);
  }, [allProducts, query]);

  // 2. Facet filters
  const filteredProducts = useMemo(() => {
    const afterFilter = filterProducts(baseSearchResults, filters);
    return sortProducts(afterFilter, filters.sort);
  }, [baseSearchResults, filters]);

  // Paginated display
  const pageSize = 24;
  const page = filters.page || 1;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, page * pageSize);
  }, [filteredProducts, page, pageSize]);

  const applyFilterChange = (newFilters: FilterState) => {
    const qs = buildQueryString(newFilters);
    const params = new URLSearchParams(qs.replace(/^\?/, ''));
    if (query) params.set('q', query);
    setSearchParams(params);
  };

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
    applyFilterChange({ ...DEFAULT_FILTER_STATE, sort: filters.sort });
  };

  const handleSortChange = (newSort: SortOption) => {
    applyFilterChange({ ...filters, sort: newSort, page: 1 });
  };

  const handleLoadMore = () => {
    applyFilterChange({ ...filters, page: (filters.page || 1) + 1 });
  };

  const title = query ? `Results for "${query}"` : 'All Products';

  return (
    <>
      <SEO
        title={`${title} — Search StyleBazaar`}
        description={`Find best deals and trending collections for ${query} on StyleBazaar.`}
      />

      <div className="container-app py-6 space-y-4">
        {/* Header */}
        <ListingHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Search Results' },
            ...(query ? [{ label: query }] : []),
          ]}
          title={title}
          totalCount={filteredProducts.length}
          currentSort={filters.sort}
          onSortChange={handleSortChange}
          activeFilterCount={countActiveFilters(filters)}
          onOpenMobileFilters={() => setIsFilterOpen(true)}
          onOpenMobileSort={() => setIsSortOpen(true)}
        />

        {/* Active Filters */}
        <FilterChips
          filters={filters}
          onRemoveFilter={handleRemoveSingleFilter}
          onClearAll={handleClearAll}
        />

        {/* Main Content */}
        <div className="flex gap-8 items-start pt-2">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-20 max-h-[85vh] overflow-y-auto scrollbar-hide">
            <FilterSidebar
              products={baseSearchResults}
              filters={filters}
              onFilterChange={applyFilterChange}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Grid Area */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={paginatedProducts}
              loading={loading}
              skeletonCount={8}
              emptyTitle={`We couldn't find any matches for "${query}"`}
              emptyDescription="Please check the spelling or try searching for more general terms like 't-shirts', 'jeans', or 'kurtas'."
              onResetFilters={handleClearAll}
            />

            <Pagination
              currentCount={paginatedProducts.length}
              totalCount={filteredProducts.length}
              loading={false}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        products={baseSearchResults}
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
