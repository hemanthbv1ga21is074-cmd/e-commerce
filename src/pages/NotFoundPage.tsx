import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowRight } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO title="404 — Page Not Found" description="The page you requested does not exist." />

      <div className="container-app min-h-[60vh] flex flex-col items-center justify-center text-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-rose-50 text-accent flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <Compass size={48} />
        </div>

        <h1 className="text-4xl md:text-5xl font-black font-display text-primary tracking-tight mb-3">
          404 - Lost in Fashion?
        </h1>

        <p className="text-sm md:text-base text-muted max-w-md mb-8 leading-relaxed">
          We couldn't find the page or outfit you were looking for. It may have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="accent" size="lg" icon={<Home size={18} />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/men">
            <Button variant="outline" size="lg">
              Explore Men's
            </Button>
          </Link>
          <Link to="/women">
            <Button variant="outline" size="lg">
              Explore Women's
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-2 text-xs text-muted">
          <span>Looking for something specific?</span>
          <Link to="/search" className="text-accent font-semibold inline-flex items-center gap-0.5 hover:underline">
            Search our collection <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </>
  );
};
