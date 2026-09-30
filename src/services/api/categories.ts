/**
 * Categories API service — supports both mock and real backend.
 *
 * Real backend endpoints:
 *   GET /api/categories/tree     — full category hierarchy
 *   GET /api/categories/megamenu — mega menu sections
 */
import { apiCall, api } from './client';
import { categoryTree, megaMenuSections } from '../../data/categories';
import type { CategoryNode, MegaMenuSection, BreadcrumbItem, Gender } from '../../types';

/* ─── getCategoryTree ─── */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  return apiCall(
    () => categoryTree,
    async () => {
      const res = await api<{ success: boolean; data: CategoryNode[] }>('/categories/tree');
      return res.data;
    }
  );
}

/* ─── getMegaMenuSections ─── */
export async function getMegaMenuSections(): Promise<MegaMenuSection[]> {
  return apiCall(
    () => megaMenuSections,
    async () => {
      const res = await api<{ success: boolean; data: MegaMenuSection[] }>('/categories/megamenu');
      return res.data;
    }
  );
}

/* ─── getBreadcrumbs (local-only — no backend endpoint needed) ─── */
export async function getBreadcrumbs(
  gender?: Gender,
  categorySlug?: string
): Promise<BreadcrumbItem[]> {
  return apiCall(
    () => {
      const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
      if (!gender) return crumbs;
      const genderNode = categoryTree.find((c) => c.slug === gender);
      if (genderNode) crumbs.push({ label: genderNode.label, href: `/${genderNode.slug}` });
      if (categorySlug && genderNode?.children) {
        for (const child of genderNode.children) {
          if (child.slug === categorySlug) {
            crumbs.push({ label: child.label });
            return crumbs;
          }
          if (child.children) {
            for (const subChild of child.children) {
              if (subChild.slug === categorySlug) {
                crumbs.push({ label: child.label });
                crumbs.push({ label: subChild.label });
                return crumbs;
              }
            }
          }
        }
      }
      return crumbs;
    },
    async () => {
      // Breadcrumbs are derived from the tree — use local logic even in real mode
      const tree = await getCategoryTree();
      const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
      if (!gender) return crumbs;
      const genderNode = tree.find((c) => c.slug === gender);
      if (genderNode) crumbs.push({ label: genderNode.label, href: `/${genderNode.slug}` });
      if (categorySlug && genderNode?.children) {
        for (const child of genderNode.children) {
          if (child.slug === categorySlug) {
            crumbs.push({ label: child.label });
            return crumbs;
          }
          if (child.children) {
            for (const subChild of child.children) {
              if (subChild.slug === categorySlug) {
                crumbs.push({ label: child.label });
                crumbs.push({ label: subChild.label });
                return crumbs;
              }
            }
          }
        }
      }
      return crumbs;
    }
  );
}
