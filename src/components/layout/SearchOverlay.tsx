import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { searchProducts } from '../../utils/search';
import { products } from '../../data/products';
import { formatPrice } from '../../utils/price';

const POPULAR_SEARCHES = ['Oversized T-Shirts', 'Cotton Kurtas', 'Slim Jeans', 'Casual Shirts', 'Dresses'];

export const SearchOverlay: React.FC = () => {
  const { searchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stylebazaar_recent_searches');
      return saved ? JSON.parse(saved) : ['T-Shirts', 'Kurtas', 'Jeans'];
    } catch {
      return ['T-Shirts', 'Kurtas', 'Jeans'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, closeSearch]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('stylebazaar_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term);
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('stylebazaar_recent_searches');
  };

  if (!searchOpen) return null;

  // Matching preview products
  const liveResults = query.trim() ? searchProducts(products, query).slice(0, 5) : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex flex-col justify-start pt-12 md:pt-20 px-4 animate-fade-in"
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search size={20} className="text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands, or categories..."
            className="flex-1 text-sm md:text-base outline-none text-primary placeholder-gray-400 bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted hover:text-primary p-1"
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={closeSearch}
            className="text-xs font-semibold text-muted hover:text-primary px-2 py-1 rounded bg-gray-100"
          >
            ESC
          </button>
        </form>

        {/* Search Content */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* Real-time search matches if user typed something */}
          {query.trim().length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Suggested Products
                </span>
                <button
                  type="button"
                  onClick={() => handleSearch(query)}
                  className="text-xs font-semibold text-accent flex items-center gap-1 hover:underline"
                >
                  View all results <ArrowRight size={13} />
                </button>
              </div>

              {liveResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {liveResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        closeSearch();
                        navigate(`/product/${p.slug}`);
                      }}
                      className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-surface rounded-lg text-left transition-colors"
                    >
                      <div className="w-10 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-primary truncate uppercase">{p.brand}</div>
                        <div className="text-xs text-muted truncate">{p.title}</div>
                      </div>
                      <div className="text-xs font-bold text-primary flex-shrink-0">
                        {formatPrice(p.price)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted">
                  No direct products found for "{query}". Press Enter to search everywhere.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Clock size={13} /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-muted hover:text-accent font-medium"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 rounded-full bg-surface text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                      >
                        <Search size={12} className="text-muted" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-accent" /> Trending Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
