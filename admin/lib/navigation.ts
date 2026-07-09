/**
 * Dekor Control Center — primary sidebar navigation.
 *
 * Source of truth: docs/architecture/04_ADMIN_INFORMATION_ARCHITECTURE.md
 * §1. Labels are Turkish, per the project's binding rule
 * (docs/engineering/02_ENGINEERING_STANDARDS.md §2 item 7) — do not add an
 * English fallback string here.
 *
 * Route slugs are ASCII-transliterated (no Turkish diacritics) purely for
 * URL hygiene — a common, expected practice even for Turkish-language
 * products. The visible label stays proper Turkish everywhere in the UI.
 *
 * `section` groups items in the sidebar under a small uppercase header.
 * Four groups, mirroring the "Website Control Center" information
 * architecture:
 * - "Website Kontrol" — one entry per real public page/template (the
 *   "digital twin" of dekortools.com — see lib/mock-data.ts's
 *   `websitePages` registry, which every entry here links to).
 * - "İçerik Yönetimi" — reusable content records (products, categories,
 *   media, files, certificates, dealers, news articles, form submissions).
 * - "Tasarım ve Genel" — global, cross-page design surfaces (header,
 *   footer, nav, shared components, theme, popups).
 * - "Sistem" — SEO, i18n, redirects, users, roles, settings.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Compass,
  MonitorPlay,
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
  Component,
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
} from 'lucide-react';

export interface NavEntry {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the empty-state placeholder page for this module. */
  description: string;
  section?: 'İçerik Yönetimi' | 'Website Kontrol' | 'Tasarım ve Genel' | 'Sistem';
}

export const primaryNavigation: NavEntry[] = [
  {
    label: 'Genel Bakış',
    href: '/genel-bakis',
    icon: LayoutDashboard,
    description: 'Sistem geneline dair özet bilgiler ve hızlı erişim burada yer alacak.',
  },
  {
    label: 'Operasyon Merkezi',
    href: '/operasyon-merkezi',
    icon: Gauge,
    description: 'Siteyi günlük işletmek için gereken her sinyal tek ekranda — yayın, medya, SEO, formlar, diller ve operasyon akışı.',
  },
  {
    label: 'Website Sağlığı',
    href: '/website-sagligi',
    icon: HeartPulse,
    description: 'Tüm site genelinde eksik veya tamamlanmamış içerikleri tespit eden otomatik denetim.',
  },
  {
    label: 'Yayın Merkezi',
    href: '/yayin-merkezi',
    icon: Rocket,
    description: 'Sitedeki her bölümün gerçek yayın aşaması — Taslak, Zamanlanan, Yayında, Arşivlendi.',
  },

  // Website Kontrol — the digital twin: one entry per real public page/template.
  {
    label: 'Canlı Website',
    href: '/canli-website',
    icon: MonitorPlay,
    description: 'Sitenin kendisi üzerinde çalışın — bölümlerin üzerine gelin, doğrudan düzenleyin, taslak ve yayın durumunu anında görün.',
    section: 'Website Kontrol',
  },
  {
    label: 'Website Explorer',
    href: '/website-explorer',
    icon: Compass,
    description: 'Sitenin tamamının bağlantılı haritası — sayfalar, bölümler, medya ve dosyalar tek ekranda; arama ile doğrudan düzenleyiciye atlanır.',
    section: 'Website Kontrol',
  },
  {
    label: 'Website Yapısı',
    href: '/website-yapisi',
    icon: Workflow,
    description: 'Web sitesindeki tüm sayfaların görsel haritası burada yer alacak.',
    section: 'Website Kontrol',
  },
  {
    label: 'Ana Sayfa Oluşturucu',
    href: '/ana-sayfa-olusturucu',
    icon: LayoutTemplate,
    description: 'Ana sayfa bölümleri burada sıralanıp düzenlenecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Ürünler Sayfası',
    href: '/urunler-sayfasi',
    icon: LayoutGrid,
    description: 'Genel katalog sayfasının (/urunler) hero ve ürün aileleri bölümü burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Kategori Sayfası Şablonu',
    href: '/kategori-sablonu',
    icon: Boxes,
    description: 'Kategori listeleme sayfalarının (/urunler/[kategori]) paylaşılan şablonu burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Ürün Detay Şablonu',
    href: '/urun-detay-sablonu',
    icon: FileStack,
    description: 'Ürün detay sayfalarının (/urunler/[slug]) paylaşılan şablonu burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Hakkımızda Sayfası',
    href: '/hakkimizda-sayfasi',
    icon: Building2,
    description: '/hakkimizda sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Üretim Sayfası',
    href: '/uretim-sayfasi',
    icon: Factory,
    description: '/uretim sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'İhracat Sayfası',
    href: '/ihracat-sayfasi',
    icon: Ship,
    description: '/ihracat sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Yetkili Bayiler Sayfası',
    href: '/bayi-sayfasi',
    icon: Store,
    description: '/yetkili-bayiler sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Bayi Ol Sayfası',
    href: '/bayi-ol-sayfasi',
    icon: UserPlus,
    description: '/bayi-ol sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Kariyer Sayfası',
    href: '/kariyer-sayfasi',
    icon: Briefcase,
    description: '/kariyer sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'İletişim Sayfası',
    href: '/iletisim-sayfasi',
    icon: Phone,
    description: '/iletisim sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Haberler Sayfası',
    href: '/haberler-sayfasi',
    icon: Radio,
    description: '/haberler sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },
  {
    label: 'Destek Sayfası',
    href: '/destek-sayfasi',
    icon: LifeBuoy,
    description: '/destek sayfasının bölümleri burada yönetilecek.',
    section: 'Website Kontrol',
  },

  // İçerik Yönetimi — reusable content records, not tied to one page.
  {
    label: 'Ürün Yönetimi',
    href: '/urun-yonetimi',
    icon: Package,
    description: 'Ürünlerin oluşturulması, düzenlenmesi ve yayınlanması burada yönetilecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Kategori Yönetimi',
    href: '/kategori-yonetimi',
    icon: FolderTree,
    description: 'Ürün kategorileri ve alt kategoriler burada düzenlenecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Sayfa Yönetimi',
    href: '/sayfa-yonetimi',
    icon: FileText,
    description: 'Kurumsal site sayfaları ve içerik blokları burada yönetilecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Medya Kütüphanesi',
    href: '/medya-kutuphanesi',
    icon: ImageIcon,
    description: 'Görsel ve video varlıkları burada yüklenip düzenlenecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Dosya Merkezi',
    href: '/dosya-merkezi',
    icon: FolderOpen,
    description: 'Kataloglar, fiyat listeleri ve teknik dokümanlar burada yönetilecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Sertifikalar',
    href: '/sertifikalar',
    icon: BadgeCheck,
    description: 'ISO, CE ve diğer uygunluk belgeleri burada yönetilecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Bayi Yönetimi',
    href: '/bayi-yonetimi',
    icon: Handshake,
    description: 'Bayi başvuruları, onay süreci ve bayi profilleri burada yönetilecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Haberler',
    href: '/haberler',
    icon: Newspaper,
    description: 'Newsroom makaleleri — başlık, kategori, galeri ve içerik burada yönetilecek.',
    section: 'İçerik Yönetimi',
  },
  {
    label: 'Form Talepleri',
    href: '/form-talepleri',
    icon: Inbox,
    description: 'İletişim, şikayet, fikir ve kariyer başvuruları burada toplanacak.',
    section: 'İçerik Yönetimi',
  },

  // Tasarım ve Genel — cross-page design surfaces, not one specific page.
  {
    label: 'Header Yönetimi',
    href: '/header-yonetimi',
    icon: PanelTop,
    description: 'Logo, ana menü ve header CTA burada yönetilecek.',
    section: 'Tasarım ve Genel',
  },
  {
    label: 'Footer Yönetimi',
    href: '/footer-yonetimi',
    icon: PanelBottom,
    description: 'Footer sütunları, sosyal medya ve iletişim bilgileri burada yönetilecek.',
    section: 'Tasarım ve Genel',
  },
  {
    label: 'Navigasyon Yönetimi',
    href: '/navigasyon-yonetimi',
    icon: Menu,
    description: 'Menü hiyerarşisi ve iç/dış bağlantılar burada düzenlenecek.',
    section: 'Tasarım ve Genel',
  },
  {
    label: 'Bölüm Oluşturucu',
    href: '/bolum-olusturucu',
    icon: Blocks,
    description: 'Yeniden kullanılabilir sayfa bölümleri burada tanımlanacak.',
    section: 'Tasarım ve Genel',
  },
  {
    label: 'Genel Bileşenler',
    href: '/genel-bilesenler',
    icon: Component,
    description: 'Paylaşılan CTA, banner, form ve kart bileşenleri burada yönetilecek.',
    section: 'Tasarım ve Genel',
  },
  {
    label: 'Tema Ayarları',
    href: '/tema-ayarlari',
    icon: Palette,
    description: 'Marka renkleri, tipografi, buton ve ikon stilleri burada yönetilecek.',
    section: 'Tasarım ve Genel',
  },
  {
    label: 'Popup Yönetimi',
    href: '/popup-yonetimi',
    icon: MessageSquareText,
    description: 'Duyuru pop-up\'ları ve çerez bildirimi burada yönetilecek.',
    section: 'Tasarım ve Genel',
  },

  // Sistem — SEO, i18n, redirects, users, roles, settings.
  {
    label: 'SEO Yönetimi',
    href: '/seo-yonetimi',
    icon: TrendingUp,
    description: 'Sayfa başlıkları, açıklamalar ve yapısal veriler burada yönetilecek.',
    section: 'Sistem',
  },
  {
    label: 'Dil Yönetimi',
    href: '/dil-yonetimi',
    icon: Languages,
    description: 'Aktif diller ve çeviri tamamlanma durumu burada izlenecek.',
    section: 'Sistem',
  },
  {
    label: 'Yönlendirme Yönetimi',
    href: '/yonlendirme-yonetimi',
    icon: Route,
    description: 'URL yönlendirmeleri (301) ve slug çakışmaları burada yönetilecek.',
    section: 'Sistem',
  },
  {
    label: 'Kullanıcılar',
    href: '/kullanicilar',
    icon: Users,
    description: 'Sistem kullanıcıları burada davet edilip yönetilecek.',
    section: 'Sistem',
  },
  {
    label: 'Roller ve Yetkiler',
    href: '/roller-ve-yetkiler',
    icon: ShieldCheck,
    description: 'Rol tanımları ve yetki matrisi burada düzenlenecek.',
    section: 'Sistem',
  },
  {
    label: 'Sistem Ayarları',
    href: '/sistem-ayarlari',
    icon: Settings,
    description: 'Site bilgileri, menü yönetimi ve denetim kaydı burada yer alacak.',
    section: 'Sistem',
  },
];
