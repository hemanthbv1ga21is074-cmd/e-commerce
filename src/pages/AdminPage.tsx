import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Tag,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  UserCheck,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  Edit2,
  Link as LinkIcon,
  ShieldAlert,
  KeyRound,
  Mail,
  Laptop,
  LogOut,
  Key,
  Copy,
  Check,
  Download,
  UserX,
  RotateCcw,
} from 'lucide-react';
import {
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminInventory,
  updateVariantStock,
  getAdminProductsList,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminAnalytics,
  getStoredCoupons,
  saveStoredCoupons,
  getAdminTeamAndInvites,
  inviteAdminStaff,
  deactivateAdminStaff,
  resetAdminStaff2Fa,
  changeAdminStaffRole,
  getAdminSessions,
  revokeAdminSession,
  revokeAllAdminSessions,
  regenerateBackupCodes,
  type AdminTeamMember,
  type AdminInviteItem,
  type AdminSessionItem,
  type OffboardingTask,
  type AdminAnalyticsData,
  type InventoryVariant,
  type AdminCoupon,
} from '../services/api/admin';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { formatCurrency, formatDate, cn } from '../utils/helpers';
import type { Order, OrderStatus, Product, OrderItem, OrderTimeline } from '../types';
import { AcceptInviteView } from '../components/admin/AcceptInviteView';

type AdminTab = 'overview' | 'orders' | 'products' | 'inventory' | 'coupons' | 'analytics' | 'team' | 'sessions';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, loginAsAdmin, logout } = useAuthStore();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminTeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<AdminInviteItem[]>([]);
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);

  // Team & Email Access Management states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT'>('ADMIN');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Hardened Modals
  const [inviteLinkModal, setInviteLinkModal] = useState<{
    open: boolean;
    link: string;
    expiresAt: string;
    email: string;
    role: string;
  }>({ open: false, link: '', expiresAt: '', email: '', role: '' });
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  const [offboardingModal, setOffboardingModal] = useState<{
    open: boolean;
    targetUser: AdminTeamMember | null;
    checklist: OffboardingTask[];
    reason: string;
  }>({ open: false, targetUser: null, checklist: [], reason: '' });

  const [backupCodesModal, setBackupCodesModal] = useState<{
    open: boolean;
    codes: string[];
    password: string;
    error: string;
    loading: boolean;
  }>({ open: false, codes: [], password: '', error: '', loading: false });
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Check if viewing Accept Invite flow
  const isAcceptInviteUrl =
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('/accept-invite') ||
      new URLSearchParams(window.location.search).has('token'));

  if (isAcceptInviteUrl) {
    return <AcceptInviteView />;
  }

  // Filter/Search states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryLowStockOnly, setInventoryLowStockOnly] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productDemographic, setProductDemographic] = useState<'all' | 'men' | 'women' | 'kids'>('all');

  // Modals & Selection
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingVariantId, setUpdatingVariantId] = useState<string | null>(null);

  // Product Editing & Image Management
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'link'>('upload');
  const [linkInput, setLinkInput] = useState('');

  // New Product Form state
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    gender: 'men' as 'men' | 'women' | 'kids',
    category: 'T-Shirts',
    price: 999,
    mrp: 1499,
    fabric: '100% Premium Cotton',
    fit: 'Regular Fit',
    description: '',
    imageUrl: '',
    stockSmall: 12,
    stockMedium: 15,
    stockLarge: 10,
    stockXL: 8,
  });

  // New Coupon Form state
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 15,
    minOrderValue: 999,
    maxDiscount: 500,
    expiryDate: '2026-12-31',
  });

  // Fetch all admin data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [analyticsData, ordersRes, inventoryRes, productsList, teamRes, sessionsList] = await Promise.all([
        getAdminAnalytics(),
        getAdminOrders({ status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined }),
        getAdminInventory(),
        getAdminProductsList(),
        getAdminTeamAndInvites(),
        getAdminSessions(),
      ]);

      setAnalytics(analyticsData);
      setOrders(ordersRes.orders);
      setInventory(inventoryRes.variants);
      setProducts(productsList);
      setCoupons(getStoredCoupons());
      setTeamMembers(teamRes.team);
      setPendingInvites(teamRes.invites);
      setSessions(sessionsList);
    } catch (err) {
      console.error('Failed to load admin data', err);
      showToast('Error refreshing admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [orderStatusFilter]);

  // Open modal in Add mode
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setNewProduct({
      title: '',
      brand: '',
      gender: 'men',
      category: 'T-Shirts',
      price: 999,
      mrp: 1499,
      fabric: '100% Premium Cotton',
      fit: 'Regular Fit',
      description: '',
      imageUrl: '',
      stockSmall: 12,
      stockMedium: 15,
      stockLarge: 10,
      stockXL: 8,
    });
    setProductImages([]);
    setLinkInput('');
    setImageInputMode('upload');
    setIsAddProductOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    const sizeStockMap: Record<string, number> = {};
    p.sizes?.forEach((s) => {
      sizeStockMap[s.name.toUpperCase()] = s.stock;
    });

    setNewProduct({
      title: p.title,
      brand: p.brand,
      gender: (p.gender || 'men') as 'men' | 'women' | 'kids',
      category: p.categoryPath?.[p.categoryPath.length - 1] || 'T-Shirts',
      price: p.price,
      mrp: p.mrp,
      fabric: p.fabric || '100% Premium Cotton',
      fit: p.fit || 'Regular Fit',
      description: p.description || '',
      imageUrl: p.images?.[0] || '',
      stockSmall: sizeStockMap['S'] ?? 10,
      stockMedium: sizeStockMap['M'] ?? 15,
      stockLarge: sizeStockMap['L'] ?? 10,
      stockXL: sizeStockMap['XL'] ?? 8,
    });

    setProductImages(p.images && p.images.length > 0 ? [...p.images] : []);
    setLinkInput('');
    setIsAddProductOpen(true);
  };

  // Image Upload File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload valid image files (PNG, JPG, WebP)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setProductImages((prev) => [...prev, dataUrl]);
          showToast(`Uploaded ${file.name}`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Direct Image Link Handler
  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const url = linkInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast('Please enter a valid URL starting with http:// or https://', 'error');
      return;
    }
    setProductImages((prev) => [...prev, url]);
    setLinkInput('');
    showToast('Image link added', 'success');
  };

  // Staff Invite Flow (48h single-use token with 2FA requirement)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setIsAddingMember(true);
    try {
      const res = await inviteAdminStaff(cleanEmail, newAdminRole);
      setInviteLinkModal({
        open: true,
        link: res.inviteLink,
        expiresAt: res.expiresAt,
        email: cleanEmail,
        role: newAdminRole,
      });
      showToast(`48h Staff invitation created for ${cleanEmail}!`, 'success');
      setNewAdminEmail('');
      const updated = await getAdminTeamAndInvites();
      setTeamMembers(updated.team);
      setPendingInvites(updated.invites);
    } catch (err: any) {
      showToast(err.message || 'Failed to send staff invitation', 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Staff Deactivation with Immediate Session Revocation and Offboarding Checklist
  const handleDeactivateClick = async (member: AdminTeamMember) => {
    if (member.role === 'SUPER_ADMIN' && member.email.toLowerCase() === 'admin@stylebazaar.com') {
      showToast('Cannot deactivate the primary super administrator', 'error');
      return;
    }
    const reason = prompt(`Enter deactivation reason for ${member.email}:`, 'Staff offboarding') || '';
    try {
      const res = await deactivateAdminStaff(member.id, reason);
      setOffboardingModal({
        open: true,
        targetUser: member,
        checklist: res.offboardingChecklist,
        reason,
      });
      showToast(`Deactivated ${member.email}. All sessions terminated.`, 'info');
      const updated = await getAdminTeamAndInvites();
      setTeamMembers(updated.team);
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate staff member', 'error');
    }
  };

  // Reset 2FA for staff member (SUPER_ADMIN only)
  const handleResetStaff2FaClick = async (email: string) => {
    if (!confirm(`Are you sure you want to reset 2FA credentials for ${email}? An audit alert will be recorded and user will be forced to re-enroll.`)) {
      return;
    }
    try {
      await resetAdminStaff2Fa(email);
      showToast(`2FA reset for ${email}. Email alert dispatched.`, 'success');
      const updated = await getAdminTeamAndInvites();
      setTeamMembers(updated.team);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset 2FA', 'error');
    }
  };

  // Change staff role with hierarchy enforcement
  const handleChangeRoleClick = async (member: AdminTeamMember, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT') => {
    if (member.role === newRole) return;
    if (!confirm(`Change role of ${member.email} from ${member.role} to ${newRole}? Active sessions will be terminated.`)) {
      return;
    }
    try {
      await changeAdminStaffRole(member.id, newRole);
      showToast(`Role updated to ${newRole} for ${member.email}`, 'success');
      const updated = await getAdminTeamAndInvites();
      setTeamMembers(updated.team);
    } catch (err: any) {
      showToast(err.message || 'Failed to change role', 'error');
    }
  };

  // Session Revocation handlers
  const handleRevokeSingleSession = async (sessionId: string) => {
    try {
      await revokeAdminSession(sessionId);
      showToast('Session terminated', 'info');
      const updated = await getAdminSessions();
      setSessions(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllSessionsClick = async () => {
    if (!confirm('Are you sure you want to revoke all other administrative sessions?')) return;
    try {
      await revokeAllAdminSessions(true);
      showToast('All other sessions revoked successfully', 'success');
      const updated = await getAdminSessions();
      setSessions(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke sessions', 'error');
    }
  };

  const handleRegenerateBackupCodesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCodesModal.password) {
      setBackupCodesModal((prev) => ({ ...prev, error: 'Password is required' }));
      return;
    }
    setBackupCodesModal((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const codes = await regenerateBackupCodes(backupCodesModal.password);
      setBackupCodesModal((prev) => ({ ...prev, codes, loading: false, password: '' }));
      showToast('Generated 10 new 2FA backup codes', 'success');
    } catch (err: any) {
      setBackupCodesModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Password confirmation failed',
      }));
    }
  };


  // Handle Order Status Update
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateAdminOrderStatus(
        orderId,
        newStatus,
        `Status updated to ${newStatus} via Admin Console`
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order #${orderId} marked as ${newStatus}`, 'success');
      getAdminAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle Stock Update
  const handleStockChange = async (productId: string, size: string, newStock: number) => {
    const variantId = `${productId}-${size}`;
    setUpdatingVariantId(variantId);
    try {
      await updateVariantStock(productId, size, Math.max(0, newStock));
      setInventory((prev) =>
        prev.map((v) =>
          v.productId === productId && v.size === size
            ? {
                ...v,
                stock: Math.max(0, newStock),
                isLowStock: newStock > 0 && newStock <= 5,
                isOutOfStock: newStock === 0,
              }
            : v
        )
      );
      showToast(`Stock updated for ${productId} (${size}) to ${newStock}`, 'success');
    } catch {
      showToast('Failed to update stock level', 'error');
    } finally {
      setUpdatingVariantId(null);
    }
  };

  // Handle Add / Edit Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.brand) {
      showToast('Please provide product title and brand', 'error');
      return;
    }

    try {
      const categoryPath = [
        newProduct.gender === 'men' ? 'Men' : newProduct.gender === 'women' ? 'Women' : 'Kids',
        'Topwear',
        newProduct.category,
      ];

      const fallbackImg =
        productImages[0] ||
        newProduct.imageUrl.trim() ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

      const finalImages = productImages.length > 0 ? productImages : [fallbackImg];

      const productPayload = {
        title: newProduct.title.trim(),
        brand: newProduct.brand.trim(),
        gender: newProduct.gender,
        categoryPath,
        price: Number(newProduct.price),
        mrp: Number(newProduct.mrp),
        fabric: newProduct.fabric,
        fit: newProduct.fit,
        pattern: 'Solid',
        occasion: ['Casual', 'Lifestyle'],
        description: newProduct.description || `Premium quality ${newProduct.title} by ${newProduct.brand}.`,
        highlights: ['Designed for daily comfort', '100% Breathable fabric', 'Color-lock guarantee'],
        careInstructions: ['Machine wash warm', 'Do not bleach', 'Tumble dry low'],
        deliveryEstimateDays: 3,
        returnWindowDays: 30,
        images: finalImages,
        colors: [{ name: 'Standard', hex: '#1a1a2e', images: finalImages }],
        sizes: [
          { name: 'S', stock: Number(newProduct.stockSmall) },
          { name: 'M', stock: Number(newProduct.stockMedium) },
          { name: 'L', stock: Number(newProduct.stockLarge) },
          { name: 'XL', stock: Number(newProduct.stockXL) },
        ],
      };

      if (editingProductId) {
        const updated = await updateAdminProduct(editingProductId, productPayload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? { ...p, ...updated, images: finalImages } : p))
        );
        setIsAddProductOpen(false);
        showToast(`Updated "${newProduct.title}" successfully!`, 'success');
      } else {
        const created = await createAdminProduct(productPayload);
        setProducts((prev) => [created, ...prev]);
        setIsAddProductOpen(false);
        showToast(`Created product: ${created.title}! Live on storefront.`, 'success');
      }
      refreshData();
    } catch {
      showToast('Failed to save product', 'error');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the catalog?`)) return;
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${title}" removed`, 'info');
      refreshData();
    } catch {
      showToast('Could not remove product', 'error');
    }
  };

  // Handle Add Coupon
  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    const formattedCode = newCoupon.code.toUpperCase().replace(/\s+/g, '');
    const updated: AdminCoupon[] = [
      {
        code: formattedCode,
        description:
          newCoupon.description ||
          `${newCoupon.discountValue}${newCoupon.discountType === 'percentage' ? '%' : '₹'} off on orders above ₹${newCoupon.minOrderValue}`,
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        minOrderValue: Number(newCoupon.minOrderValue),
        maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : undefined,
        isActive: true,
        usageCount: 0,
        expiryDate: newCoupon.expiryDate,
      },
      ...coupons,
    ];

    saveStoredCoupons(updated);
    setCoupons(updated);
    setIsAddCouponOpen(false);
    showToast(`Coupon ${formattedCode} created successfully`, 'success');
  };

  const handleToggleCoupon = (code: string) => {
    const updated = coupons.map((c: AdminCoupon) => (c.code === code ? { ...c, isActive: !c.isActive } : c));
    saveStoredCoupons(updated);
    setCoupons(updated);
    showToast(`Updated coupon status`, 'info');
  };

  // Filtered lists
  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return orders;
    const q = orderSearch.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.shippingAddress.toLowerCase().includes(q) ||
        o.paymentMethod.toLowerCase().includes(q) ||
        o.items.some((i: OrderItem) => i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
    );
  }, [orders, orderSearch]);

  const filteredInventory = useMemo(() => {
    let list = inventory;
    if (inventoryLowStockOnly) {
      list = list.filter((v) => v.stock <= 5);
    }
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.productTitle.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.size.toLowerCase().includes(q) ||
          v.variantId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inventory, inventoryLowStockOnly, inventorySearch]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (productDemographic !== 'all') {
      list = list.filter((p) => p.gender === productDemographic);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryPath.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, productDemographic, productSearch]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck size={12} /> Shipped
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock size={12} /> Confirmed
          </span>
        );
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Clock size={12} /> Placed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Helmet>
        <title>StyleBazaar — Admin Management Console</title>
      </Helmet>

      {/* Top Executive Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
              Style<span className="text-rose-500">Bazaar</span>
            </span>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-rose-500/30">
              Admin Portal
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Store Engine: Online</span>
            <span className="text-slate-600">|</span>
            <span>{analytics?.totalProductsCount || 104} Catalog Garments</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user?.role === 'admin' ? (
            <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="font-semibold text-slate-200">{user.name}</span>
              <button
                type="button"
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 font-medium ml-1"
                title="Logout from Admin"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                loginAsAdmin();
                showToast('Signed in with full Administrator access', 'success');
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <UserCheck size={14} />
              <span>Enable Admin Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={refreshData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={cn(loading && 'animate-spin')} />
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
          >
            <span>View Store</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-slate-800">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            {
              id: 'orders',
              label: 'Orders',
              icon: ShoppingBag,
              badge: orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length,
            },
            { id: 'products', label: 'Products', icon: Package, badge: products.length },
            {
              id: 'inventory',
              label: 'Inventory',
              icon: Boxes,
              badge: analytics?.lowStockCount,
              badgeColor: 'bg-rose-500',
            },
            { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
            { id: 'analytics', label: 'Sales & Analytics', icon: TrendingUp },
            {
              id: 'team',
              label: 'Admin Access',
              icon: KeyRound,
              badge: teamMembers.length,
              badgeColor: 'bg-indigo-600',
            },
            {
              id: 'sessions',
              label: 'My Sessions',
              icon: ShieldAlert,
              badge: sessions.length,
              badgeColor: 'bg-emerald-600',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-black text-white ml-0.5',
                      tab.badgeColor || 'bg-slate-900/80'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Gross Sales</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ₹
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-white">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span>+18.4%</span>
                  <span className="text-slate-400">vs last period</span>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-white">
                  {analytics?.totalOrders || orders.length}
                </div>
                <div className="mt-1 text-xs text-blue-400 font-medium">
                  {analytics?.pendingOrdersCount || 0} awaiting fulfillment
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Avg Order Value</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-white">
                  {formatCurrency(analytics?.averageOrderValue || 0)}
                </div>
                <div className="mt-1 text-xs text-slate-400 font-medium">
                  Consistent customer cart spend
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Low Stock Alerts</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-white">
                  {analytics?.lowStockCount || 0}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setInventoryLowStockOnly(true);
                  }}
                  className="mt-1 text-xs text-rose-400 hover:underline font-medium text-left"
                >
                  View variants needing restock →
                </button>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Quick Tasks: </span>
                Add new products to showcase, dispatch pending orders, or create promotional coupon codes.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Plus size={15} />
                  <span>Add New Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
                >
                  <Tag size={14} />
                  <span>New Coupon</span>
                </button>
              </div>
            </div>

            {/* Split Section: Recent Orders & Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders (2 Columns) */}
              <div className="lg:col-span-2 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Recent Customer Orders</h3>
                    <p className="text-xs text-slate-400">Live order queue with fulfillment status</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rose-400 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer / City</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 font-mono font-bold text-rose-400">
                            #{order.id}
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-white truncate max-w-[200px]" title={order.shippingAddress}>
                              {order.shippingAddress.split(',')[0]}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {order.shippingAddress}
                            </div>
                          </td>
                          <td className="py-3 text-slate-300">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </td>
                          <td className="py-3 font-bold text-white">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-3">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Selling Products (1 Column) */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Top Performing Styles</h3>
                  <p className="text-xs text-slate-400">Best-selling garments by volume</p>
                </div>

                <div className="space-y-3">
                  {analytics?.topSellingProducts.map((p: any, idx: number) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800"
                    >
                      <div className="w-6 text-center font-black text-slate-500 text-xs">
                        #{idx + 1}
                      </div>
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-10 h-12 object-cover rounded-md bg-slate-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.brand} • {p.unitsSold} sold
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-emerald-400">
                          {formatCurrency(p.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                {['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors',
                      orderStatusFilter === st
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700/60 text-slate-400 hover:text-white'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order ID, address, items..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Shipping Destination</th>
                      <th className="py-3.5 px-4">Garment Items</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Fulfillment Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No orders found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                            #{order.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="font-bold text-white truncate" title={order.shippingAddress}>
                              {order.shippingAddress}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-300">
                              {order.items.map((i: OrderItem) => `${i.title} (${i.size}) × ${i.quantity}`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-white whitespace-nowrap">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="capitalize font-semibold text-slate-300">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Status Transition Select */}
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-rose-500"
                              >
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                                title="Inspect Full Order"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PRODUCTS CATALOG MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header with Search, Filter & Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2">
                {(['all', 'men', 'women', 'kids'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setProductDemographic(gender)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors',
                      productDemographic === gender
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700/60 text-slate-400 hover:text-white'
                    )}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, brand, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg whitespace-nowrap shadow-sm transition-colors"
                >
                  <Plus size={15} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-800/80 border border-slate-700/70 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-500 transition-all"
                >
                  <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
                    <img
                      src={p.images?.[0]}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        {p.gender}
                      </span>
                      {p.id.startsWith('custom-') && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded shadow">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded">
                        {p.discountPercent}% OFF
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        {p.brand}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1" title={p.title}>
                        {p.title}
                      </h4>
                      <div className="text-[11px] text-slate-400 truncate">
                        {p.categoryPath.join(' > ')}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm font-black text-white">{formatCurrency(p.price)}</span>
                      <span className="text-xs text-slate-500 line-through">{formatCurrency(p.mrp)}</span>
                    </div>

                    {/* Stock by size pill */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.sizes.map((s: { name: string; stock: number }) => (
                        <span
                          key={s.name}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold',
                            s.stock > 0 ? 'bg-slate-700 text-slate-200' : 'bg-rose-950/60 text-rose-400 line-through'
                          )}
                        >
                          {s.name}:{s.stock}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-white inline-flex items-center gap-1 font-medium"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </Link>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(p)}
                          className="text-slate-300 hover:text-white font-semibold inline-flex items-center gap-1 bg-slate-700/60 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
                        >
                          <Edit2 size={11} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="text-rose-400 hover:text-rose-300 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: INVENTORY & STOCK MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total SKU Variants</span>
                <div className="text-xl font-black text-white mt-1">{inventory.length}</div>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Healthy In-Stock</span>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {inventory.filter((v) => v.stock > 5).length}
                </div>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Low Stock (&le; 5)</span>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {inventory.filter((v) => v.stock > 0 && v.stock <= 5).length}
                </div>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Out of Stock (0)</span>
                <div className="text-xl font-black text-rose-400 mt-1">
                  {inventory.filter((v) => v.stock === 0).length}
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={inventoryLowStockOnly}
                    onChange={(e) => setInventoryLowStockOnly(e.target.checked)}
                    className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 accent-rose-500 w-4 h-4"
                  />
                  <span>Show Low Stock (&le; 5) Only</span>
                </label>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter variant by name, brand, size..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Inventory Variants Table */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Garment Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Size</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Current Units</th>
                      <th className="py-3.5 px-4">Stock Status</th>
                      <th className="py-3.5 px-4 text-right">Adjust Stock Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredInventory.slice(0, 100).map((v) => (
                      <tr key={v.variantId} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.image}
                              alt={v.productTitle}
                              className="w-8 h-10 object-cover rounded bg-slate-900 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white">{v.productTitle}</div>
                              <div className="text-[11px] text-slate-400">
                                {v.brand} • SKU: {v.variantId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{v.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-400">{v.size}</td>
                        <td className="py-3 px-4 font-black text-white">{formatCurrency(v.price)}</td>
                        <td className="py-3 px-4 font-mono text-base font-black text-white">
                          {v.stock}
                        </td>
                        <td className="py-3 px-4">
                          {v.isOutOfStock ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Out of Stock
                            </span>
                          ) : v.isLowStock ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Low Stock ({v.stock})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleStockChange(v.productId, v.size, v.stock - 1)}
                              disabled={v.stock <= 0 || updatingVariantId === v.variantId}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center disabled:opacity-30"
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-white text-xs">
                              {v.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStockChange(v.productId, v.size, v.stock + 1)}
                              disabled={updatingVariantId === v.variantId}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                              title="Increase stock"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockChange(v.productId, v.size, v.stock + 10)}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] ml-1"
                              title="Restock +10 units"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: COUPONS & PROMOS */}
        {/* ======================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <div>
                <h3 className="text-base font-extrabold text-white">Promotions & Discount Vouchers</h3>
                <p className="text-xs text-slate-400">Manage promo codes redeemable during checkout</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCouponOpen(true)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              >
                <Plus size={15} />
                <span>Create Promo Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-lg font-black text-rose-400 tracking-wider">
                        {c.code}
                      </span>
                      <p className="text-xs text-slate-300 mt-1">{c.description}</p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded',
                        c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      )}
                    >
                      {c.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Benefit</span>
                      <span className="font-bold text-white">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Min Order</span>
                      <span className="font-bold text-white">₹{c.minOrderValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Redemptions</span>
                      <span className="font-bold text-white">{c.usageCount} times</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Valid Until</span>
                      <span className="font-bold text-white">{c.expiryDate}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(c.code)}
                      className="w-full text-xs font-bold py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    >
                      {c.isActive ? 'Disable Coupon' : 'Activate Coupon'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ANALYTICS & REPORTS */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8 animate-fade-in">
            {/* Revenue Trend Visual Strip */}
            <div className="bg-slate-800/70 border border-slate-700/60 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">7-Day Gross Sales Trend</h3>
                  <p className="text-xs text-slate-400">Daily store revenue performance</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Recent: </span>
                  <span className="text-sm font-black text-emerald-400">
                    {formatCurrency(analytics.recentDailyRevenue.reduce((acc: number, d: any) => acc + d.revenue, 0))}
                  </span>
                </div>
              </div>

              {/* Bar Chart Representation */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end h-48">
                {analytics.recentDailyRevenue.map((d: any) => {
                  const heightPercent = Math.round((d.revenue / 35000) * 100);
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(d.revenue / 1000).toFixed(1)}k
                      </span>
                      <div
                        style={{ height: `${Math.max(15, heightPercent)}%` }}
                        className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg group-hover:from-rose-500 group-hover:to-rose-300 transition-all shadow-md shadow-rose-950"
                      />
                      <span className="text-[11px] font-semibold text-slate-400 text-center whitespace-nowrap">
                        {d.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demographic and Fulfillment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales by Demographic */}
              <div className="bg-slate-800/70 border border-slate-700/60 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-extrabold text-white">Revenue by Demographic</h3>
                <div className="space-y-3 pt-2">
                  {analytics.revenueByDemographic.map((item: any) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="text-white font-mono">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Fulfillment Status */}
              <div className="bg-slate-800/70 border border-slate-700/60 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-extrabold text-white">Fulfillment Pipeline Distribution</h3>
                <div className="space-y-2.5 pt-2">
                  {analytics.salesByStatus.map((st: any) => (
                    <div
                      key={st.status}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                        <span className="font-semibold text-slate-200">{st.status}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{st.count} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: ADMIN ACCESS & EMAIL AUTHENTICATION */}
        {/* ======================================================== */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Intro Strip */}
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Admin Email Authentication & Access Control</h3>
                    <p className="text-xs text-slate-400">
                      Manage which email accounts are authorized with Administrator and Support privileges in Supabase.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Supabase RLS Guard: Active</span>
                </span>
              </div>
            </div>

            {/* Quick Hardened Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Authorized Staff Accounts</span>
                <div className="text-2xl font-black text-white mt-1">{teamMembers.length}</div>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  {teamMembers.filter((m) => m.isActive !== false).length} Active • {teamMembers.filter((m) => m.isActive === false).length} Deactivated
                </span>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">2FA Security Posture</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {teamMembers.filter((m) => m.twoFactorEnabled).length} / {teamMembers.length} Enrolled
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">Mandatory for all new invites</span>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Live Admin Sessions</span>
                <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{sessions.length}</div>
                <span className="text-[11px] text-slate-400 block mt-0.5">30m Idle Timeout • 12h Absolute</span>
              </div>
            </div>

            {/* Invite New Staff Form (48-Hour Single-Use Token + 2FA Enforced) */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-rose-400" />
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Invite Staff by Email (Single-Use 48h Link)
                </h4>
              </div>

              <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter staff email address (e.g. staff@stylebazaar.com)"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="w-full sm:w-56">
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="ADMIN">ADMIN (Store & Catalog)</option>
                    <option value="SUPPORT">SUPPORT (Orders Only)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Governance)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  <ShieldCheck size={15} />
                  <span>{isAddingMember ? 'Creating Invite...' : 'Generate 48h Invite'}</span>
                </button>
              </form>
              <p className="text-[11px] text-slate-400">
                Staff invites generate a cryptographically secure, single-use 48-hour link stored as a SHA-256 hash. The invitee is required to set a password and enroll 2FA with 10 backup codes before first access.
              </p>
            </div>

            {/* Pending Invitations Section */}
            {pendingInvites.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Clock size={14} />
                    <span>Pending Invitations ({pendingInvites.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Single-use links expiring in 48 hours</span>
                </div>
                <div className="divide-y divide-slate-700/60">
                  {pendingInvites.map((inv) => (
                    <div key={inv.id} className="px-5 py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-white">{inv.email}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Role: <strong className="text-emerald-400">{inv.role}</strong> • Invited by {inv.invitedBy}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Expires {formatDate(inv.expiresAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Authorized Admins */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Staff Accounts & Governance ({teamMembers.length})
                </h4>
                <span className="text-[11px] text-slate-400">Strict hierarchy & session termination controls</span>
              </div>

              <div className="divide-y divide-slate-700/60">
                {teamMembers.map((member) => {
                  const isRootAdmin = member.email.toLowerCase() === 'admin@stylebazaar.com';
                  const isDeactivated = member.isActive === false;

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        'px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-700/30 transition-colors',
                        isDeactivated && 'opacity-60 bg-slate-950/40'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full font-black text-sm flex items-center justify-center uppercase shadow',
                            member.role === 'SUPER_ADMIN'
                              ? 'bg-gradient-to-tr from-purple-600 to-rose-600 text-white'
                              : member.role === 'ADMIN'
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                          )}
                        >
                          {member.email[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs font-mono">{member.email}</span>
                            {isRootAdmin && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Primary SuperAdmin
                              </span>
                            )}
                            {isDeactivated && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700">
                                Deactivated
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{member.name || member.email.split('@')[0]}</span>
                            <span>•</span>
                            <span>Created {formatDate(member.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                        {/* 2FA Status Badge */}
                        {member.twoFactorEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck size={12} /> 2FA Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock size={12} /> 2FA Pending
                          </span>
                        )}

                        {/* Role Selector */}
                        {!isRootAdmin && !isDeactivated ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRoleClick(member, e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 focus:outline-none focus:border-rose-500"
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPPORT">SUPPORT</option>
                          </select>
                        ) : (
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full',
                              member.role === 'SUPER_ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : member.role === 'ADMIN'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            )}
                          >
                            {member.role}
                          </span>
                        )}

                        {/* Reset 2FA (SUPER_ADMIN only) */}
                        {!isRootAdmin && !isDeactivated && member.twoFactorEnabled && (
                          <button
                            type="button"
                            onClick={() => handleResetStaff2FaClick(member.email)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded border border-amber-500/20 transition-colors"
                            title="Reset 2FA for this user (audited, sends email notice)"
                          >
                            <RotateCcw size={12} />
                            <span>Reset 2FA</span>
                          </button>
                        )}

                        {/* Deactivate Button */}
                        {!isRootAdmin && !isDeactivated ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivateClick(member)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded border border-rose-500/20 transition-colors"
                          >
                            <UserX size={12} />
                            <span>Deactivate</span>
                          </button>
                        ) : isRootAdmin ? (
                          <span className="text-[10px] text-slate-500 italic px-2">Root Protected</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic px-2">Access Revoked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: SESSIONS AND REQUEST SECURITY (G1 ADDENDUM) */}
        {/* ======================================================== */}
        {activeTab === 'sessions' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldAlert className="text-emerald-400" size={20} />
                  <span>My Sessions & Request Security</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dedicated admin session cookie (<code className="text-rose-400">sb_admin_session</code>) with 30-min idle timeout and 12-hour absolute lifetime.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBackupCodesModal({ open: true, codes: [], password: '', error: '', loading: false })}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors border border-slate-700"
                >
                  <Key size={14} className="text-amber-400" />
                  <span>Regenerate 10 Backup Codes</span>
                </button>

                <button
                  type="button"
                  onClick={handleRevokeAllSessionsClick}
                  className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                >
                  <LogOut size={14} />
                  <span>Revoke All Other Sessions</span>
                </button>
              </div>
            </div>

            {/* Session Security Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Session Timeout Policy</span>
                <div className="text-sm font-bold text-white">30 Min Idle / 12 Hours Max</div>
                <p className="text-[11px] text-slate-400">Inactivity automatically terminates your admin session</p>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">CSRF Protection</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Double-Submit Header Enforced
                </div>
                <p className="text-[11px] text-slate-400">All POST/PUT/PATCH/DELETE calls validated</p>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Network Hardening</span>
                <div className="text-sm font-bold text-white">No-Store & Deny Framing</div>
                <p className="text-[11px] text-slate-400">Strict CSP, noindex, and anti-clickjacking headers</p>
              </div>
            </div>

            {/* Active Sessions Table */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Administrative Sessions ({sessions.length})
                </h4>
                <span className="text-[11px] text-slate-400">Login from new IP or device triggers security email alerts</span>
              </div>

              <div className="divide-y divide-slate-700/60">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center">
                        <Laptop size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs font-mono">
                            {sess.ipAddress || '127.0.0.1 (Local)'}
                          </span>
                          {sess.isCurrent && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                          {sess.userAgent || 'Modern Web Browser'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Last active: {formatDate(sess.lastActiveAt)} • Signed in: {formatDate(sess.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div>
                      {!sess.isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeSingleSession(sess.id)}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 transition-colors"
                        >
                          Revoke Session
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold px-2">Active Session</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ORDER DETAILS & TIMELINE */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-xs text-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Order Details</span>
                <h3 className="text-lg font-black text-rose-400 font-mono">#{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
              <span className="font-bold text-slate-300">Current Status:</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrder.status)}
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Items Ordered */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Garments in Order</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-14 object-cover rounded bg-slate-900 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-rose-400 uppercase">{item.brand}</div>
                      <div className="font-bold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white">{formatCurrency(item.price * item.quantity)}</div>
                      <div className="text-[10px] text-slate-500 line-through">
                        {formatCurrency(item.mrp * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <h5 className="font-bold text-white mb-1">Shipping Destination</h5>
                <p className="text-slate-300">{selectedOrder.shippingAddress}</p>
                <p className="text-slate-400 font-mono mt-2 text-[11px]">User ID: {selectedOrder.userId}</p>
              </div>

              <div>
                <h5 className="font-bold text-white mb-1">Payment & Charges</h5>
                <p className="text-slate-400">
                  Payment Method:{' '}
                  <span className="text-white font-semibold capitalize">{selectedOrder.paymentMethod}</span>
                </p>
                <p className="text-slate-400">
                  Estimated Delivery:{' '}
                  <span className="text-slate-300 font-semibold">{formatDate(selectedOrder.estimatedDelivery)}</span>
                </p>
                <div className="mt-3 pt-2 border-t border-slate-700/60 font-black text-sm text-emerald-400">
                  Total Order Amount: {formatCurrency(selectedOrder.total)}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">Tracking History</h5>
              <div className="space-y-2 border-l-2 border-slate-700 pl-3">
                {selectedOrder.timeline?.map((step: OrderTimeline, idx: number) => (
                  <div key={idx} className="relative">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                      {step.status}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">{formatDate(step.timestamp)}</span>
                    {step.description && <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW PRODUCT */}
      {/* ======================================================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {editingProductId ? 'Edit Fashion Product' : 'Add New Fashion Product'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {editingProductId ? 'Update garment details, images, and pricing' : 'Create and publish a new apparel item to the catalog'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Slim Fit Linen Shirt"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zephyr, UrbanThread"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Demographic
                  </label>
                  <select
                    value={newProduct.gender}
                    onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="T-Shirts, Jeans, Dresses..."
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Fit</label>
                  <input
                    type="text"
                    value={newProduct.fit}
                    onChange={(e) => setNewProduct({ ...newProduct, fit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Special Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={99}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={99}
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* DUAL-MODE IMAGE MANAGEMENT: UPLOAD + DIRECT LINK */}
              <div className="space-y-2 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-rose-400" />
                    <label className="text-[11px] font-bold text-white uppercase tracking-wider">
                      Product Images ({productImages.length})
                    </label>
                  </div>

                  {/* Toggle between Upload and Link */}
                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={cn(
                        'px-2.5 py-1 rounded transition-colors flex items-center gap-1',
                        imageInputMode === 'upload'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <UploadCloud size={11} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('link')}
                      className={cn(
                        'px-2.5 py-1 rounded transition-colors flex items-center gap-1',
                        imageInputMode === 'link'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <LinkIcon size={11} />
                      <span>Image Link</span>
                    </button>
                  </div>
                </div>

                {/* Mode 1: Drag & drop / browse file picker */}
                {imageInputMode === 'upload' ? (
                  <label className="border-2 border-dashed border-slate-700 hover:border-rose-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group">
                    <UploadCloud size={24} className="text-rose-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-bold text-slate-200">
                      Click to choose image or drag & drop here
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Supports PNG, JPG, JPEG, WebP (select multiple files)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  /* Mode 2: Direct URL link entry */
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-xs whitespace-nowrap"
                    >
                      Add Link
                    </button>
                  </div>
                )}

                {/* Gallery of Uploaded / Linked Images */}
                {productImages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Image Gallery ({productImages.length}) — First photo is the Cover Image</span>
                      <button
                        type="button"
                        onClick={() => setProductImages([])}
                        className="text-rose-400 hover:underline text-[10px]"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                      {productImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group"
                        >
                          <img
                            src={img}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...productImages];
                                  const [removed] = copy.splice(idx, 1);
                                  copy.unshift(removed);
                                  setProductImages(copy);
                                }}
                                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 shadow"
                                title="Set as primary cover photo"
                              >
                                <Star size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                              className="p-1.5 rounded-md bg-rose-900 hover:bg-rose-700 text-white shadow"
                              title="Delete photo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Initial stock per size */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Stock Units by Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Size S</span>
                    <input
                      type="number"
                      min={0}
                      value={newProduct.stockSmall}
                      onChange={(e) => setNewProduct({ ...newProduct, stockSmall: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Size M</span>
                    <input
                      type="number"
                      min={0}
                      value={newProduct.stockMedium}
                      onChange={(e) => setNewProduct({ ...newProduct, stockMedium: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Size L</span>
                    <input
                      type="number"
                      min={0}
                      value={newProduct.stockLarge}
                      onChange={(e) => setNewProduct({ ...newProduct, stockLarge: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Size XL</span>
                    <input
                      type="number"
                      min={0}
                      value={newProduct.stockXL}
                      onChange={(e) => setNewProduct({ ...newProduct, stockXL: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-sm"
                >
                  {editingProductId ? 'Save Product Changes' : 'Publish to Storefront'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW COUPON */}
      {/* ======================================================== */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Create New Promotional Voucher</h3>
              <button
                type="button"
                onClick={() => setIsAddCouponOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: STAFF INVITATION GENERATED (SINGLE-USE 48H) */}
      {/* ======================================================== */}
      {inviteLinkModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-xs text-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Staff Invitation Generated</h3>
                  <p className="text-[11px] text-slate-400">Single-use link valid for 48 hours</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteLinkModal((prev) => ({ ...prev, open: false }))}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] text-slate-400">
                  Invited Email: <strong className="text-white font-mono">{inviteLinkModal.email}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Assigned Role: <span className="font-bold text-emerald-400">{inviteLinkModal.role}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Expires On: <span className="text-amber-400 font-semibold">{formatDate(inviteLinkModal.expiresAt)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Single-Use Invitation Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLinkModal.link}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLinkModal.link);
                      setCopiedInviteLink(true);
                      showToast('Invitation link copied to clipboard', 'success');
                      setTimeout(() => setCopiedInviteLink(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
                  >
                    {copiedInviteLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedInviteLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                The invitee must set a password and enroll in 2FA with 10 backup codes to complete activation.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInviteLinkModal((prev) => ({ ...prev, open: false }))}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: OFFBOARDING CHECKLIST & DEACTIVATION CONFIRMATION */}
      {/* ======================================================== */}
      {offboardingModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-xs text-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <UserX size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Staff Offboarding Checklist</h3>
                  <p className="text-[11px] text-slate-400">Account deactivation & immediate session revocation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOffboardingModal((prev) => ({ ...prev, open: false }))}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Target: <strong className="text-white font-mono">{offboardingModal.targetUser?.email}</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Reason: <span className="text-slate-300 italic">{offboardingModal.reason || 'Staff offboarding'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Automated Security Actions Executed
                </span>
                <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  {offboardingModal.checklist.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-[11px] text-slate-300 py-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check size={11} />
                      </div>
                      <span className="flex-1">{task.task}</span>
                      <span className="text-[9px] font-black uppercase text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                The account has been marked inactive. Audit trails and activity logs remain preserved for compliance.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOffboardingModal((prev) => ({ ...prev, open: false }))}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REGENERATE 10 2FA BACKUP CODES */}
      {/* ======================================================== */}
      {backupCodesModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-xs text-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Emergency 2FA Backup Codes</h3>
                  <p className="text-[11px] text-slate-400">Generate 10 single-use recovery credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBackupCodesModal({ open: false, codes: [], password: '', error: '', loading: false })}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {backupCodesModal.codes.length === 0 ? (
              <form onSubmit={handleRegenerateBackupCodesSubmit} className="space-y-4">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Regenerating backup codes will immediately invalidate all existing backup codes. Please re-authenticate with your account password to confirm:
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Current Account Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={backupCodesModal.password}
                    onChange={(e) => setBackupCodesModal((prev) => ({ ...prev, password: e.target.value, error: '' }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                  {backupCodesModal.error && (
                    <p className="text-rose-400 text-[11px] mt-1.5">{backupCodesModal.error}</p>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBackupCodesModal({ open: false, codes: [], password: '', error: '', loading: false })}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={backupCodesModal.loading}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold transition-colors shadow-sm"
                  >
                    {backupCodesModal.loading ? 'Verifying...' : 'Generate New Codes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>Save these codes now. Old codes are invalidated and each of these 10 codes can only be used once.</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="grid grid-cols-2 gap-2 text-center font-mono font-bold text-xs text-slate-200">
                    {backupCodesModal.codes.map((code, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 py-1.5 rounded-lg">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodesModal.codes.join('\n'));
                      setCopiedBackupCodes(true);
                      showToast('Copied 10 backup codes', 'success');
                      setTimeout(() => setCopiedBackupCodes(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    {copiedBackupCodes ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedBackupCodes ? 'Copied' : 'Copy All'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const content = `StyleBazaar Admin - 2FA Emergency Backup Codes\nGenerated: ${new Date().toISOString()}\n\n` +
                        backupCodesModal.codes.map((c, i) => `${i + 1}. ${c}`).join('\n');
                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'stylebazaar-admin-backup-codes.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast('Downloaded backup codes (.txt)', 'success');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    <Download size={14} />
                    <span>Download (.txt)</span>
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setBackupCodesModal({ open: false, codes: [], password: '', error: '', loading: false })}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    Done & Saved
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
