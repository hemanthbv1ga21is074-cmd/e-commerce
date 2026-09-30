import type { Gender } from './common';

export interface CategoryNode {
  id: string;
  label: string;
  slug: string;
  gender?: Gender;
  children?: CategoryNode[];
  productCount?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface MegaMenuColumn {
  title: string;
  links: { label: string; href: string; highlight?: boolean }[];
}

export interface MegaMenuSection {
  label: string;
  gender: Gender | 'brands' | 'sale';
  columns: MegaMenuColumn[];
}
