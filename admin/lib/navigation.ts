/**
 * Dekor Control Center — primary sidebar navigation.
 *
 * Information architecture (2026 reorganization): a clear, enterprise-grade
 * grouping where a new user finds any major operation in at most two clicks.
 * Seven groups, each a distinct job-to-be-done:
 *
 * - "Genel Bakış"              — operational overview screens.
 * - "İçerik Yönetimi"         — daily CMS work: content RECORDS (products,
 *                               categories, news, dealers, pages, banners,
 *                               media, files, certificates, form requests).
 * - "Website Sayfaları"       — the CONTENT of specific public pages
 *                               (Hakkımızda, Üretim, İhracat, …), not templates.
 * - "Tasarım ve Yapı"         — visual structure: header/footer/nav, builders,
 *                               shared page TEMPLATES, theme, popups.
 * - "Pazarlama ve SEO"        — SEO, i18n, redirects, export map.
 * - "Kullanıcılar ve Yetkiler" — RBAC.
 * - "Sistem"                  — settings, audit.
 *
 * Labels are Turkish (binding project rule). Route slugs are ASCII
 * transliterations for URL hygiene; every route here is preserved exactly as
 * it exists today — only labels/grouping/descriptions were reorganized. The
 * distinction between a content RECORD ("Ürünler") and a page TEMPLATE
 * ("Ürün Detay Şablonu") is made explicit in labels and descriptions.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Gauge,
  Rocket,
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  BadgeCheck,
  Handshake,
  Inbox,
  TrendingUp,
  Languages,
  Users,
  ShieldCheck,
  Settings,
  Workflow,
  LayoutTemplate,
  LayoutGrid,
  PanelTop,
  PanelBottom,
  Menu,
  Blocks,
  Megaphone,
  Palette,
  Route,
  MessageSquareText,
  Newspaper,
  HeartPulse,
  Boxes,
  FileStack,
  Building2,
  Factory,
  Ship,
  Store,
  UserPlus,
  Briefcase,
  Phone,
  Radio,
  LifeBuoy,
  Compass,
  MonitorPlay,
  Map,
  ClipboardList,
  FileSignature,
} from 'lucide-react';

export const NAV_SECTIONS = [
  'Genel Bakış',
  'İçerik Yönetimi',
  'Website Sayfaları',
  'Tasarım ve Yapı',
  'Pazarlama ve SEO',
  'Kullanıcılar ve Yetkiler',
  'Sistem',
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

/** Groups expanded by default on a fresh session; the rest start collapsed. */
export const DEFAULT_EXPANDED_SECTIONS: NavSection[] = ['Genel Bakış', 'İçerik Yönetimi'];

export interface NavEntry {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Short Turkish explanation shown as page-context / empty-state text. */
  description: string;
  section: NavSection;
}

export const primaryNavigation: NavEntry[] = [
  // ── Genel Bakış ─────────────────────────────────────────────────────────
  {
    label: 'Genel Bakış',
    href: '/genel-bakis',
    icon: LayoutDashboard,
    description: 'CMS ve web sitesinin genel durumu, bekleyen işler ve hızlı işlemler.',
    section: 'Genel Bakış',
  },
  {
    label: 'Operasyon Merkezi',
    href: '/operasyon-merkezi',
    icon: Gauge,
    description: 'Gerçek yayın işleri, revizyonlar, zamanlanmış görevler ve denetim günlüğü.',
    section: 'Genel Bakış',
  },
  {
    label: 'Website Sağlığı',
    href: '/website-sagligi',
    icon: HeartPulse,
    description: 'Canlı yayındaki web sitesinin gerçek zamanlı SEO, görsel ve bağlantı analizi.',
    section: 'Genel Bakış',
  },
  {
    label: 'Yayın Merkezi',
    href: '/yayin-merkezi',
    icon: Rocket,
    description: 'İçeriklerin yayın aşaması — Taslak, İncelemede, Yayında, Arşiv.',
    section: 'Genel Bakış',
  },

  // ── İçerik Yönetimi (content records — daily CMS work) ──────────────────
  {
    label: 'Ürünler',
    href: '/urun-yonetimi',
    icon: Package,
    description: 'Web sitesinde yayınlanan ürün kayıtlarını buradan ekleyebilir, düzenleyebilir ve yayına alabilirsiniz.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Kategoriler',
    href: '/kategori-yonetimi',
    icon: FolderTree,
    description: 'Ürün kategorisi ve alt kategori kayıtlarını buradan yönetin.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Haberler',
    href: '/haberler',
    icon: Newspaper,
    description: 'Haber ve makale kayıtları — başlık, kategori, galeri ve içerik.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Bayiler',
    href: '/bayi-yonetimi',
    icon: Handshake,
    description: 'Bayi başvuruları, onay süreci ve bayi profilleri.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Sayfalar',
    href: '/sayfa-yonetimi',
    icon: FileText,
    description: 'Kurumsal sayfa kayıtlarını buradan oluşturup yayınlayabilirsiniz.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Bannerlar',
    href: '/genel-bilesenler',
    icon: Megaphone,
    description: 'Paylaşılan banner ve CTA bileşenleri — bir düzenleme tüm kullanıldığı yerlere yansır.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Medya Kütüphanesi',
    href: '/medya-kutuphanesi',
    icon: ImageIcon,
    description: 'Görsel ve video varlıklarını buradan yükleyip düzenleyin.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Dosya Merkezi',
    href: '/dosya-merkezi',
    icon: FolderOpen,
    description: 'Kataloglar, fiyat listeleri ve teknik dokümanlar.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Sertifikalar',
    href: '/sertifikalar',
    icon: BadgeCheck,
    description: 'ISO, CE ve diğer uygunluk belgeleri.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Form Talepleri',
    href: '/form-talepleri',
    icon: Inbox,
    description: 'İletişim, şikayet, fikir ve kariyer başvurularından gelen talepler.',
    section: 'İçerik Yönetimi',
  },

  // ── Website Sayfaları (page CONTENT of specific public pages) ───────────
  {
    label: 'Ürünler Sayfası',
    href: '/urunler-sayfasi',
    icon: LayoutGrid,
    description: 'Genel ürün liste sayfasının (/urunler) içeriğini ve düzenini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Hakkımızda Sayfası',
    href: '/hakkimizda-sayfasi',
    icon: Building2,
    description: 'Kurumsal Hakkımızda sayfasının metin, görsel ve SEO içeriğini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Üretim Sayfası',
    href: '/uretim-sayfasi',
    icon: Factory,
    description: 'Üretim sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'İhracat Sayfası',
    href: '/ihracat-sayfasi',
    icon: Ship,
    description: 'İhracat sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Yetkili Bayiler Sayfası',
    href: '/bayi-sayfasi',
    icon: Store,
    description: 'Yetkili Bayiler sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Bayi Ol Sayfası',
    href: '/bayi-ol-sayfasi',
    icon: UserPlus,
    description: 'Bayi Ol sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Kariyer Sayfası',
    href: '/kariyer-sayfasi',
    icon: Briefcase,
    description: 'Kariyer sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'İletişim Sayfası',
    href: '/iletisim-sayfasi',
    icon: Phone,
    description: 'İletişim sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Haberler Sayfası',
    href: '/haberler-sayfasi',
    icon: Radio,
    description: 'Haberler liste sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Destek Sayfası',
    href: '/destek-sayfasi',
    icon: LifeBuoy,
    description: 'Destek sayfasının içerik bölümlerini yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Bayi Başvuru Formu',
    href: '/bayi-basvuru-formu',
    icon: ClipboardList,
    description: 'Bayi Ol sayfasındaki başvuru formunun alanlarını yönetir.',
    section: 'Website Sayfaları',
  },
  {
    label: 'Kariyer Başvuru Formu',
    href: '/kariyer-basvuru-formu',
    icon: FileSignature,
    description: 'Kariyer sayfasındaki başvuru formunun alanlarını yönetir.',
    section: 'Website Sayfaları',
  },

  // ── Tasarım ve Yapı (visual structure, templates, builders) ─────────────
  {
    label: 'Header Yönetimi',
    href: '/header-yonetimi',
    icon: PanelTop,
    description: 'Logo, ana menü ve header CTA yapılandırması.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Footer Yönetimi',
    href: '/footer-yonetimi',
    icon: PanelBottom,
    description: 'Footer sütunları, sosyal medya ve iletişim bilgileri.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Navigasyon Yönetimi',
    href: '/navigasyon-yonetimi',
    icon: Menu,
    description: 'Menü hiyerarşisi ve iç/dış bağlantılar.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Ana Sayfa Oluşturucu',
    href: '/ana-sayfa-olusturucu',
    icon: LayoutTemplate,
    description: 'Ana sayfa bölümlerinin sıralanıp düzenlendiği görsel oluşturucu.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Bölüm Oluşturucu',
    href: '/bolum-olusturucu',
    icon: Blocks,
    description: 'Yeniden kullanılabilir sayfa bölümleri burada tanımlanır.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Ürün Detay Şablonu',
    href: '/urun-detay-sablonu',
    icon: FileStack,
    description: 'Bu ekran ürün kayıtlarını değil, tüm ürün detay sayfalarında kullanılan ortak görünümü yönetir.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Kategori Sayfası Şablonu',
    href: '/kategori-sablonu',
    icon: Boxes,
    description: 'Bu ekran kategori kayıtlarını değil, tüm kategori sayfalarında kullanılan ortak görünümü yönetir.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Haber Detay Şablonu',
    href: '/haber-detay-sablonu',
    icon: FileText,
    description: 'Tüm haber detay sayfalarında kullanılan ortak şablon görünümünü yönetir.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Tema Ayarları',
    href: '/tema-ayarlari',
    icon: Palette,
    description: 'Tipografi, buton ve ikon stilleri. Marka renkleri sabittir.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Popup Yönetimi',
    href: '/popup-yonetimi',
    icon: MessageSquareText,
    description: 'Duyuru pop-up\'ları ve çerez bildirimi yapılandırması.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Website Yapısı',
    href: '/website-yapisi',
    icon: Workflow,
    description: 'Web sitesindeki tüm sayfaların görsel yapı haritası.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Website Explorer',
    href: '/website-explorer',
    icon: Compass,
    description: 'Sayfa, bölüm, medya ve dosyaların bağlantılı site haritası.',
    section: 'Tasarım ve Yapı',
  },
  {
    label: 'Canlı Website',
    href: '/canli-website',
    icon: MonitorPlay,
    description: 'Sitenin canlı önizlemesi üzerinde bölümleri görüntüleyip düzenleyin.',
    section: 'Tasarım ve Yapı',
  },

  // ── Pazarlama ve SEO ────────────────────────────────────────────────────
  {
    label: 'SEO Yönetimi',
    href: '/seo-yonetimi',
    icon: TrendingUp,
    description: 'Sayfa başlıkları, meta açıklamalar ve yapısal veri yönetimi.',
    section: 'Pazarlama ve SEO',
  },
  {
    label: 'Dil Yönetimi',
    href: '/dil-yonetimi',
    icon: Languages,
    description: 'Aktif diller ve çeviri tamamlanma durumu.',
    section: 'Pazarlama ve SEO',
  },
  {
    label: 'Yönlendirme Yönetimi',
    href: '/yonlendirme-yonetimi',
    icon: Route,
    description: 'URL yönlendirmeleri (301/302) ve slug çakışmaları.',
    section: 'Pazarlama ve SEO',
  },
  {
    label: 'İhracat Haritası',
    href: '/ihracat-haritasi',
    icon: Map,
    description: 'Public sitedeki ihracat haritasında gösterilen ülkeler.',
    section: 'Pazarlama ve SEO',
  },

  // ── Kullanıcılar ve Yetkiler ────────────────────────────────────────────
  {
    label: 'Kullanıcılar',
    href: '/kullanicilar',
    icon: Users,
    description: 'Sistem kullanıcılarını davet edin ve durumlarını yönetin.',
    section: 'Kullanıcılar ve Yetkiler',
  },
  {
    label: 'Roller ve Yetkiler',
    href: '/roller-ve-yetkiler',
    icon: ShieldCheck,
    description: 'Rol tanımları ve yetki matrisi.',
    section: 'Kullanıcılar ve Yetkiler',
  },

  // ── Sistem ──────────────────────────────────────────────────────────────
  {
    label: 'Sistem Ayarları',
    href: '/sistem-ayarlari',
    icon: Settings,
    description: 'Site bilgileri, entegrasyon durumu ve denetim kaydı.',
    section: 'Sistem',
  },
];
