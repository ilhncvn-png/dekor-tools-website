/**
 * Realistic sample data for every module screen — Sprint 7. Not wired to
 * any API; this is fixture data so each module reads as a finished CMS
 * screen ahead of the real backend (docs/architecture/03_DATABASE_SCHEMA.md
 * defines the eventual shape these mirror).
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  /** Display name of the assigned Product Family / sub-family — kept for backward-compatible display and CSV export. */
  category: string;
  /** Real foreign key into `categories` (Product Families) — the authoritative relation; `category` is derived from it, not the other way around. */
  categoryId?: string;
  status: 'yayinda' | 'taslak' | 'arsiv';
  countries: number;
  updatedAt: string;
  seoScore: number;
  stock: 'stokta' | 'az-stok' | 'tukendi';
  price: string;
  description: string;
  weightKg: number;
  swatch: string;
  featured: boolean;
  relatedProductIds: string[];
  /** Media Library item ids attached to this product's gallery — the real cross-module link, not a static count. */
  gallery: string[];
  /** Media Library item id (video type), or null — replaces the old hasVideo boolean. */
  video: string | null;
  /** Dosya Merkezi (FileDoc) item id — covers technical drawings and downloadable PDFs as one real relation, replacing hasTechnicalDrawing + downloadPdf. */
  document: string | null;
  /** Media Library item id used for Open Graph/share preview, or null — replaces the old filename-string field. */
  ogImage: string | null;
  specifications: { label: string; value: string }[];
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Every product's `category` name + `categoryId` below has been reconciled against
// the real public Product Families (see `categories` below) — replacing the old
// generic Turkish taxonomy strings, and fixing a real pre-existing mismatch where
// p4 was tagged "Boya" (a name that matched no category record at all).
export const products: Product[] = [
  { id: 'p1', name: 'Dekor Pro Sıva Mastarı 120cm', sku: 'DKR-SM-120', category: 'Plaster Tools', categoryId: 'fam-02', status: 'yayinda', countries: 42, updatedAt: '2026-06-24', seoScore: 92, stock: 'stokta', price: '$18.50', description: 'Paslanmaz çelik bıçaklı, hafif alüminyum gövdeli profesyonel sıva mastarı.', weightKg: 1.4, swatch: '#8A9097', featured: true, relatedProductIds: ['p8', 'p6'], gallery: ['m1'], video: null, document: 'f4', ogImage: 'm1', specifications: [{ label: 'Uzunluk', value: '120 cm' }, { label: 'Bıçak Malzemesi', value: 'Paslanmaz Çelik' }, { label: 'Gövde Malzemesi', value: 'Alüminyum' }, { label: 'Ağırlık', value: '1.4 kg' }] },
  { id: 'p2', name: 'Dekor İnox Spatula Seti (5 Parça)', sku: 'DKR-SP-500', category: 'Plastering / Scraper Tools', categoryId: 'fam-04', status: 'yayinda', countries: 38, updatedAt: '2026-06-22', seoScore: 85, stock: 'stokta', price: '$24.90', description: 'Farklı ağız genişliklerinde 5 parçalık paslanmaz çelik spatula seti.', weightKg: 0.9, swatch: '#5A6066', featured: true, relatedProductIds: ['p6'], gallery: ['m3'], video: 'm6', document: null, ogImage: 'm3', specifications: [{ label: 'Parça Sayısı', value: '5' }, { label: 'Ağız Genişlikleri', value: '40 / 60 / 80 / 100 / 120 mm' }, { label: 'Malzeme', value: 'Paslanmaz Çelik (INOX 430)' }] },
  { id: 'p3', name: 'Dekor Lazerli Su Terazisi 60cm', sku: 'DKR-OL-060', category: 'Measuring Tools', categoryId: 'fam-06', status: 'taslak', countries: 0, updatedAt: '2026-06-29', seoScore: 41, stock: 'az-stok', price: '$42.00', description: 'Çift yönlü lazer ışınlı, yüksek hassasiyetli alüminyum su terazisi.', weightKg: 1.1, swatch: '#0095DA', featured: false, relatedProductIds: ['p7'], gallery: [], video: null, document: null, ogImage: null, specifications: [{ label: 'Uzunluk', value: '60 cm' }, { label: 'Lazer Hassasiyeti', value: '±0.3 mm/m' }, { label: 'Su Geçirmezlik', value: 'IP54' }, { label: 'Pil', value: '2x AAA' }] },
  { id: 'p4', name: 'Dekor Boya Rulosu Profesyonel 25cm', sku: 'DKR-BR-025', category: 'Rollers', categoryId: 'fam-01-rollers', status: 'yayinda', countries: 51, updatedAt: '2026-06-18', seoScore: 88, stock: 'stokta', price: '$6.75', description: 'Yüksek emici mikrofiber kumaşlı, çizgisiz uygulama sağlayan profesyonel rulo.', weightKg: 0.3, swatch: '#D32027', featured: true, relatedProductIds: [], gallery: [], video: null, document: null, ogImage: null, specifications: [{ label: 'Genişlik', value: '25 cm' }, { label: 'Tüy Malzemesi', value: 'Mikrofiber' }, { label: 'Tüy Boyu', value: '12 mm' }, { label: 'Sap Tipi', value: 'Standart 6mm Diş' }] },
  { id: 'p5', name: 'Dekor Mantolama Dübeli Zımba', sku: 'DKR-YL-210', category: 'Insulation Tools', categoryId: 'fam-05', status: 'yayinda', countries: 27, updatedAt: '2026-06-15', seoScore: 73, stock: 'az-stok', price: '$31.20', description: 'Mantolama sistemleri için UV dayanımlı plastik dübel ve zımba başlığı.', weightKg: 2.0, swatch: '#E0692A', featured: false, relatedProductIds: [], gallery: [], video: null, document: null, ogImage: null, specifications: [{ label: 'Dübel Çapı', value: '8 mm' }, { label: 'Dübel Uzunluğu', value: '140-210 mm' }, { label: 'UV Dayanımı', value: 'Evet' }, { label: 'Kutu İçeriği', value: '200 adet' }] },
  { id: 'p6', name: 'Dekor Alçıpan Bıçağı 250mm', sku: 'DKR-SP-250', category: 'Plastering / Scraper Tools', categoryId: 'fam-04', status: 'arsiv', countries: 12, updatedAt: '2026-05-30', seoScore: 54, stock: 'tukendi', price: '$9.40', description: 'İnce esnek uçlu, alçıpan derz dolgusu için özel tasarım bıçak.', weightKg: 0.2, swatch: '#5A6066', featured: false, relatedProductIds: ['p1', 'p2'], gallery: [], video: null, document: null, ogImage: null, specifications: [{ label: 'Genişlik', value: '250 mm' }, { label: 'Uç Kalınlığı', value: '0.5 mm' }, { label: 'Esneklik', value: 'Yarı Esnek' }, { label: 'Malzeme', value: 'Paslanmaz Çelik' }] },
  { id: 'p7', name: 'Dekor Dijital Nem Ölçer', sku: 'DKR-OL-140', category: 'Measuring Tools', categoryId: 'fam-06', status: 'taslak', countries: 0, updatedAt: '2026-06-30', seoScore: 22, stock: 'stokta', price: '$56.00', description: 'Duvar ve ahşap yüzeylerde nem oranını dijital ekranda gösteren ölçüm cihazı.', weightKg: 0.4, swatch: '#0095DA', featured: false, relatedProductIds: ['p3'], gallery: [], video: null, document: null, ogImage: null, specifications: [{ label: 'Ölçüm Aralığı', value: '0-99.9%' }, { label: 'Ekran', value: 'Dijital LCD' }, { label: 'Ölçüm Derinliği', value: '20 mm' }, { label: 'Pil', value: '1x 9V' }] },
  { id: 'p8', name: 'Dekor Sıva Bıçağı Paslanmaz 400mm', sku: 'DKR-SM-400', category: 'Plaster Tools', categoryId: 'fam-02', status: 'yayinda', countries: 45, updatedAt: '2026-06-10', seoScore: 90, stock: 'stokta', price: '$21.30', description: 'Geniş yüzey uygulamaları için 400mm paslanmaz çelik sıva bıçağı.', weightKg: 0.8, swatch: '#8A9097', featured: true, relatedProductIds: ['p1'], gallery: [], video: null, document: 'f7', ogImage: null, specifications: [{ label: 'Genişlik', value: '400 mm' }, { label: 'Bıçak Malzemesi', value: 'Paslanmaz Çelik' }, { label: 'Sap Malzemesi', value: 'Çift Bileşenli Plastik' }, { label: 'Ağırlık', value: '0.8 kg' }] },
];

export interface Category {
  id: string;
  name: string;
  /** Public family code shown on the catalog card + family hero (e.g. "FAM-01") — top-level families only, empty for sub-families. */
  code?: string;
  slug: string;
  description: string;
  /** Longer copy for the family page hero — falls back to name/description when unset. */
  heroTitle?: string;
  heroDescription?: string;
  /** Shorter copy for the catalog landing page's family card — falls back to name/description when unset. */
  cardTitle?: string;
  cardDescription?: string;
  /** Icon key looked up via getFamilyIcon() in lib/category-health.ts — a placeholder reference, not the bespoke line-art SVGs used on the live site. */
  icon?: string;
  /** null = top-level. Any other category's id = parent. Supports unlimited nesting depth — replaces the old fixed two-level children[] structure. */
  parentId: string | null;
  /** Sibling order under the same parent (used for the real up/down reorder controls, and the public catalog card order). */
  order: number;
  visible: boolean;
  showOnHomepage: boolean;
  showInNavigation: boolean;
  seoScore: number;
  languageStatus: { code: string; complete: boolean }[];
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Product counts are never stored here — Kategori Yönetimi computes them live
// from the real `products` array (see lib/category-health.ts), so the numbers
// can never drift out of sync with the actual catalog.
//
// These 11 top-level records are the real public "Product Families" from
// project/Decor Products.dc.html's "Eleven engineered families" grid — they
// replace the earlier generic Turkish taxonomy, which matched nothing on the
// live site. Painting Tools' 5 sub-families mirror project/Decor Category.dc.html
// exactly (its filter chips: Rollers/Brushes/Trays/Extension/Accessories); the
// other 10 families have no sub-family breakdown shown on the live prototype,
// so none is invented here.
export const categories: Category[] = [
  {
    id: 'fam-01', name: 'Painting Tools', code: 'FAM-01', slug: 'painting-tools',
    description: 'Rollers, sash brushes, trays and extension systems engineered for clean, professional coverage.',
    heroDescription: 'Rollers, sash brushes, trays and extension systems — engineered for clean coverage, sharp cut-in lines and a faultless professional finish.',
    icon: 'painting', parentId: null, order: 1, visible: true, showOnHomepage: true, showInNavigation: true, seoScore: 88,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-20',
  },
  {
    id: 'fam-01-rollers', name: 'Rollers', slug: 'rollers', description: 'Chromed steel and microfibre roller frames and sleeves for clean, professional coverage.',
    icon: 'painting', parentId: 'fam-01', order: 1, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 81,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-18',
  },
  {
    id: 'fam-01-brushes', name: 'Brushes', slug: 'brushes', description: 'Angled sash and flat wall brushes in synthetic and natural bristle.',
    icon: 'painting', parentId: 'fam-01', order: 2, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 76,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-12',
  },
  {
    id: 'fam-01-trays', name: 'Trays', slug: 'trays', description: 'Paint tray and grid sets, bucket grids for roller loading.',
    icon: 'painting', parentId: 'fam-01', order: 3, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 74,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-08',
  },
  {
    id: 'fam-01-extension', name: 'Extension', slug: 'extension', description: 'Telescopic poles and thread adapters for reach and ceiling work.',
    icon: 'painting', parentId: 'fam-01', order: 4, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 72,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-05',
  },
  {
    id: 'fam-01-accessories', name: 'Accessories', slug: 'accessories', description: 'Masking tape dispensers, paint strainers and finishing accessories.',
    icon: 'painting', parentId: 'fam-01', order: 5, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 70,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-02',
  },
  {
    id: 'fam-02', name: 'Plaster Tools', code: 'FAM-02', slug: 'plaster-tools',
    description: 'Polished stainless trowels, floats and rendering blades for flawless wall finishes.',
    icon: 'plaster', parentId: null, order: 2, visible: true, showOnHomepage: true, showInNavigation: true, seoScore: 91,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: true }],
    updatedAt: '2026-06-24',
  },
  {
    id: 'fam-03', name: 'Tile Tools', code: 'FAM-03', slug: 'tile-tools',
    description: 'Notched adhesive trowels, spacers and grout floats with precision-cut geometry.',
    icon: 'tile', parentId: null, order: 3, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 74,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-16',
  },
  {
    id: 'fam-04', name: 'Plastering / Scraper Tools', code: 'FAM-04', slug: 'plastering-scraper-tools',
    description: 'Spring-tempered spatulas, fillers and scrapers for filling, smoothing and surface stripping.',
    icon: 'scraper', parentId: null, order: 4, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 68,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-05-30',
  },
  {
    id: 'fam-05', name: 'Insulation Tools', code: 'FAM-05', slug: 'insulation-tools',
    description: 'Long-blade knives, rasps and EPS systems for mineral wool and foam board work.',
    icon: 'insulation', parentId: null, order: 5, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 58,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-15',
  },
  {
    id: 'fam-06', name: 'Measuring Tools', code: 'FAM-06', slug: 'measuring-tools',
    description: 'Milled spirit levels, try squares and chalk lines built to hold true on site.',
    icon: 'measuring', parentId: null, order: 6, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 45,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-30',
  },
  {
    id: 'fam-07', name: 'Safety Equipment', code: 'FAM-07', slug: 'safety-equipment',
    description: 'Gloves, goggles and jobsite protection that meet professional safety standards.',
    icon: 'safety', parentId: null, order: 7, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 62,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-04',
  },
  {
    id: 'fam-08', name: 'Display Stands', code: 'FAM-08', slug: 'display-stands',
    description: 'Retail merchandising and POS systems that present the Dekor range with authority.',
    icon: 'stand', parentId: null, order: 8, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 51,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-05-22',
  },
  {
    id: 'fam-09', name: 'DKR', code: 'FAM-09', slug: 'dkr',
    description: 'The professional flagship line — premium tools for the most demanding applicators.',
    icon: 'dkr', parentId: null, order: 9, visible: true, showOnHomepage: true, showInNavigation: true, seoScore: 83,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-27',
  },
  {
    id: 'fam-10', name: 'Special Designs', code: 'FAM-10', slug: 'special-designs',
    description: 'Custom and private-label tooling developed with partners for specific markets.',
    icon: 'special', parentId: null, order: 10, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 40,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-04-18',
  },
  {
    id: 'fam-11', name: 'New Products', code: 'FAM-11', slug: 'new-products',
    description: 'The latest 2025 releases — fresh geometry, new materials and engineering upgrades.',
    icon: 'new', parentId: null, order: 11, visible: true, showOnHomepage: false, showInNavigation: true, seoScore: 66,
    languageStatus: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    updatedAt: '2026-06-30',
  },
];

export interface CmsPage {
  id: string;
  title: string;
  path: string;
  slug: string;
  status: 'yayinda' | 'taslak' | 'inceleme';
  author: string;
  updatedAt: string;
  language: string;
  template: string;
  sectionCount: number;
  seoScore: number;
  showInNavigation: boolean;
  metaComplete: boolean;
  revisionCount: number;
  ogImage: string | null;
  scheduledAt: string | null;
}

export const pages: CmsPage[] = [
  { id: 'pg1', title: 'Ana Sayfa', path: '/', slug: '/', status: 'yayinda', author: 'Elif Kaya', updatedAt: '2026-06-28', language: 'TR', template: 'Ana Sayfa Şablonu', sectionCount: 11, seoScore: 94, showInNavigation: true, metaComplete: true, revisionCount: 22, ogImage: 'og-anasayfa.avif', scheduledAt: null },
  { id: 'pg2', title: 'Üretim', path: '/uretim', slug: 'uretim', status: 'yayinda', author: 'Elif Kaya', updatedAt: '2026-06-20', language: 'TR', template: 'İçerik Sayfası', sectionCount: 5, seoScore: 88, showInNavigation: true, metaComplete: true, revisionCount: 14, ogImage: 'og-uretim.avif', scheduledAt: null },
  { id: 'pg3', title: 'İhracat', path: '/ihracat', slug: 'ihracat', status: 'inceleme', author: 'Mert Doğan', updatedAt: '2026-06-29', language: 'TR', template: 'İçerik Sayfası', sectionCount: 6, seoScore: 61, showInNavigation: true, metaComplete: false, revisionCount: 9, ogImage: null, scheduledAt: '2026-07-05 09:00' },
  { id: 'pg4', title: 'Bayi Ol', path: '/bayi-ol', slug: 'bayi-ol', status: 'yayinda', author: 'Elif Kaya', updatedAt: '2026-06-12', language: 'TR', template: 'Form Sayfası', sectionCount: 4, seoScore: 79, showInNavigation: true, metaComplete: true, revisionCount: 11, ogImage: 'og-bayi-ol.avif', scheduledAt: null },
  { id: 'pg5', title: 'Kariyer', path: '/kariyer', slug: 'kariyer', status: 'taslak', author: 'Selin Arslan', updatedAt: '2026-06-30', language: 'TR', template: 'İçerik Sayfası', sectionCount: 3, seoScore: 34, showInNavigation: false, metaComplete: false, revisionCount: 2, ogImage: null, scheduledAt: null },
  { id: 'pg6', title: 'İletişim', path: '/iletisim', slug: 'iletisim', status: 'yayinda', author: 'Mert Doğan', updatedAt: '2026-06-05', language: 'TR', template: 'Form Sayfası', sectionCount: 3, seoScore: 55, showInNavigation: true, metaComplete: false, revisionCount: 8, ogImage: 'og-iletisim.avif', scheduledAt: null },
  { id: 'pg7', title: 'About Us', path: '/en/about', slug: 'about', status: 'yayinda', author: 'Elif Kaya', updatedAt: '2026-06-08', language: 'EN', template: 'İçerik Sayfası', sectionCount: 5, seoScore: 82, showInNavigation: true, metaComplete: true, revisionCount: 6, ogImage: 'og-about.avif', scheduledAt: null },
];

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: string;
  folder: string;
  updatedAt: string;
  dimensions: string;
  altText: string | null;
  title: string;
  caption: string | null;
  usageCount: number;
  optimizationStatus: 'optimized' | 'gerekli' | 'desteklenmiyor';
  uploadedBy: string;
  swatch: string;
  /** Explicit "used in" list — real pages/sections that reference this asset, not just a count. */
  usedIn: string[];
}

export const mediaItems: MediaItem[] = [
  { id: 'm1', name: 'siva-mastari-hero.avif', type: 'image', size: '412 KB', folder: 'Ürün Görselleri', updatedAt: '2026-06-27', dimensions: '1600×1200', altText: 'Dekor Pro Sıva Mastarı ürün fotoğrafı', title: 'Sıva Mastarı Hero Görseli', caption: 'Dekor Pro Sıva Mastarı 120cm — stüdyo çekimi', usageCount: 3, optimizationStatus: 'optimized', uploadedBy: 'Selin Arslan', swatch: '#8A9097', usedIn: ['Ana Sayfa — Ürün Vitrini', 'Dekor Pro Sıva Mastarı 120cm (ürün sayfası)', 'Kategori — Sıva & Alçı'] },
  { id: 'm2', name: 'uretim-tesisi-drone.mp4', type: 'video', size: '18.2 MB', folder: 'Kurumsal', updatedAt: '2026-06-21', dimensions: '1920×1080', altText: null, title: 'Üretim Tesisi Drone Çekimi', caption: null, usageCount: 1, optimizationStatus: 'desteklenmiyor', uploadedBy: 'Mert Doğan', swatch: '#0E0F11', usedIn: ['Üretim Sayfası — Hero'] },
  { id: 'm3', name: 'inox-spatula-set-01.avif', type: 'image', size: '388 KB', folder: 'Ürün Görselleri', updatedAt: '2026-06-27', dimensions: '1600×1200', altText: 'İnox spatula seti 5 parça', title: 'İnox Spatula Seti Ürün Görseli', caption: '5 parçalık paslanmaz çelik spatula seti', usageCount: 2, optimizationStatus: 'optimized', uploadedBy: 'Selin Arslan', swatch: '#5A6066', usedIn: ['Ana Sayfa — Ürün Vitrini', 'Dekor İnox Spatula Seti (ürün sayfası)'] },
  { id: 'm4', name: 'fabrika-hatti-02.avif', type: 'image', size: '512 KB', folder: 'Üretim', updatedAt: '2026-06-19', dimensions: '2000×1333', altText: null, title: 'Fabrika Hattı 02', caption: null, usageCount: 0, optimizationStatus: 'gerekli', uploadedBy: 'Mert Doğan', swatch: '#0095DA', usedIn: [] },
  { id: 'm5', name: 'bayi-toplantisi-2026.avif', type: 'image', size: '447 KB', folder: 'Etkinlikler', updatedAt: '2026-06-14', dimensions: '1800×1200', altText: 'Yıllık bayi toplantısı 2026', title: 'Yıllık Bayi Toplantısı 2026', caption: 'Antalya — bayi ağı yıllık buluşması', usageCount: 1, optimizationStatus: 'optimized', uploadedBy: 'Selin Arslan', swatch: '#E0692A', usedIn: ['Ana Sayfa — Bayi Bölgesi'] },
  { id: 'm6', name: 'yeni-urun-tanitim.mp4', type: 'video', size: '24.6 MB', folder: 'Ürün Görselleri', updatedAt: '2026-06-30', dimensions: '1920×1080', altText: null, title: 'Yeni Ürün Tanıtım Videosu', caption: null, usageCount: 1, optimizationStatus: 'desteklenmiyor', uploadedBy: 'Selin Arslan', swatch: '#0E0F11', usedIn: ['Ürün Yönetimi — tanıtım galerisi'] },
  { id: 'm7', name: 'iso-9001-sertifika-tarama.avif', type: 'image', size: '203 KB', folder: 'Belgeler', updatedAt: '2026-05-22', dimensions: '1240×1754', altText: 'ISO 9001 sertifikası taraması', title: 'ISO 9001 Sertifika Taraması', caption: 'TÜV SÜD onaylı ISO 9001:2015 belgesi', usageCount: 1, optimizationStatus: 'optimized', uploadedBy: 'Mert Doğan', swatch: '#D32027', usedIn: ['Sertifikalar — ISO 9001:2015'] },
  { id: 'm8', name: 'kalite-lab-yakin-cekim.avif', type: 'image', size: '356 KB', folder: 'Üretim', updatedAt: '2026-06-11', dimensions: '1600×1067', altText: null, title: 'Kalite Laboratuvarı Yakın Çekim', caption: null, usageCount: 0, optimizationStatus: 'gerekli', uploadedBy: 'Mert Doğan', swatch: '#7C5CFF', usedIn: ['Hakkımızda Sayfası — Ar-Ge Merkezi', 'Üretim Sayfası — Belgesel Fotoğrafçılık'] },
  { id: 'm9', name: 'protools-iberia-logo.svg', type: 'image', size: '48 KB', folder: 'Bayi Logoları', updatedAt: '2026-06-10', dimensions: '400×160', altText: 'ProTools Iberia S.L. logosu', title: 'ProTools Iberia Logo', caption: null, usageCount: 1, optimizationStatus: 'optimized', uploadedBy: 'Mert Doğan', swatch: '#0095DA', usedIn: ['İhracat Sayfası — Bayi Ağı', 'Ana Sayfa — Bayi Bölgesi'] },
  { id: 'm10', name: 'nordic-construction-logo.svg', type: 'image', size: '41 KB', folder: 'Bayi Logoları', updatedAt: '2026-05-22', dimensions: '400×160', altText: 'Nordic Construction Supply logosu', title: 'Nordic Construction Logo', caption: null, usageCount: 1, optimizationStatus: 'optimized', uploadedBy: 'Mert Doğan', swatch: '#5A6066', usedIn: ['İhracat Sayfası — Bayi Ağı'] },
  { id: 'm11', name: 'gulf-craftsman-logo.svg', type: 'image', size: '39 KB', folder: 'Bayi Logoları', updatedAt: '2026-04-18', dimensions: '400×160', altText: 'Gulf Craftsman Trading logosu', title: 'Gulf Craftsman Logo', caption: null, usageCount: 1, optimizationStatus: 'optimized', uploadedBy: 'Mert Doğan', swatch: '#D32027', usedIn: ['İhracat Sayfası — Bayi Ağı'] },
];

export interface FileVersionEntry {
  version: string;
  date: string;
  uploadedBy: string;
}

export interface FileDoc {
  id: string;
  name: string;
  category: string;
  format: 'PDF' | 'XLSX' | 'DOCX';
  size: string;
  downloads: number;
  updatedAt: string;
  accessLevel: 'herkese-acik' | 'sadece-bayi' | 'sadece-yonetici';
  version: string;
  language: string;
  linkedTo: string | null;
  uploadedBy: string;
  versionHistory?: FileVersionEntry[];
}

export const fileDocs: FileDoc[] = [
  { id: 'f1', name: '2026 Ürün Kataloğu (TR)', category: 'Katalog', format: 'PDF', size: '14.2 MB', downloads: 1284, updatedAt: '2026-06-15', accessLevel: 'herkese-acik', version: 'v3', language: 'TR', linkedTo: 'Ürünler (tümü)', uploadedBy: 'Elif Kaya' },
  { id: 'f2', name: '2026 Product Catalog (EN)', category: 'Katalog', format: 'PDF', size: '14.6 MB', downloads: 2091, updatedAt: '2026-06-15', accessLevel: 'herkese-acik', version: 'v3', language: 'EN', linkedTo: 'Ürünler (tümü)', uploadedBy: 'Elif Kaya' },
  { id: 'f3', name: 'Fiyat Listesi — Q3 2026', category: 'Fiyat Listesi', format: 'XLSX', size: '340 KB', downloads: 412, updatedAt: '2026-06-29', accessLevel: 'sadece-bayi', version: 'v5', language: 'TR', linkedTo: 'Bayi Portalı', uploadedBy: 'Mert Doğan' },
  { id: 'f4', name: 'Sıva Mastarı Teknik Çizim Seti', category: 'Teknik Doküman', format: 'PDF', size: '3.1 MB', downloads: 87, updatedAt: '2026-05-18', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Dekor Pro Sıva Mastarı 120cm', uploadedBy: 'Elif Kaya' },
  { id: 'f5', name: 'Bayi Sözleşmesi Şablonu', category: 'Bayi Dokümanları', format: 'DOCX', size: '128 KB', downloads: 56, updatedAt: '2026-04-30', accessLevel: 'sadece-yonetici', version: 'v1', language: 'TR', linkedTo: 'Bayi Yönetimi', uploadedBy: 'Selin Arslan' },
  { id: 'f6', name: 'İhracat Uygunluk Beyanı', category: 'Teknik Doküman', format: 'PDF', size: '640 KB', downloads: 143, updatedAt: '2026-06-02', accessLevel: 'herkese-acik', version: 'v2', language: 'TR', linkedTo: 'İhracat Sayfası', uploadedBy: 'Mert Doğan' },
  { id: 'f7', name: 'Sıva Bıçağı Ürün Kataloğu', category: 'Teknik Doküman', format: 'PDF', size: '2.4 MB', downloads: 34, updatedAt: '2026-06-08', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Dekor Sıva Bıçağı Paslanmaz 400mm', uploadedBy: 'Elif Kaya' },
  { id: 'f8', name: 'ISO 9001:2015 Sertifikası', category: 'Sertifika', format: 'PDF', size: '1.1 MB', downloads: 210, updatedAt: '2024-03-14', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Sertifikalar — ISO 9001:2015', uploadedBy: 'Mert Doğan' },
  { id: 'f9', name: 'ISO 14001:2015 Sertifikası', category: 'Sertifika', format: 'PDF', size: '1.0 MB', downloads: 156, updatedAt: '2024-03-14', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Sertifikalar — ISO 14001:2015', uploadedBy: 'Mert Doğan' },
  { id: 'f10', name: 'CE Uygunluk Beyanı Belgesi', category: 'Sertifika', format: 'PDF', size: '640 KB', downloads: 98, updatedAt: '2023-08-01', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Sertifikalar — CE Uygunluk Beyanı', uploadedBy: 'Mert Doğan' },
  { id: 'f11', name: 'ISO 45001:2018 Sertifikası', category: 'Sertifika', format: 'PDF', size: '980 KB', downloads: 41, updatedAt: '2023-11-20', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Sertifikalar — ISO 45001:2018', uploadedBy: 'Mert Doğan' },
  { id: 'f12', name: 'REACH Uygunluk Belgesi', category: 'Sertifika', format: 'PDF', size: '720 KB', downloads: 63, updatedAt: '2024-01-09', accessLevel: 'herkese-acik', version: 'v1', language: 'TR', linkedTo: 'Sertifikalar — REACH Uygunluk', uploadedBy: 'Mert Doğan' },
];

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  status: 'gecerli' | 'yenileniyor' | 'suresi-doldu';
  issuedAt: string;
  validUntil: string;
  scope: string;
  reminder: 'yok' | 'planlandi' | 'gecikti';
  showOnHomepage: boolean;
  showOnProductPages: boolean;
  /** Dosya Merkezi (FileDoc) item id — the real certificate document, replacing the old fileAttached boolean. */
  file: string | null;
  order: number;
  downloadEnabled: boolean;
  category: string;
}

export const certificates: Certificate[] = [
  { id: 'cert1', name: 'ISO 9001:2015', issuer: 'TÜV SÜD', status: 'gecerli', issuedAt: '2024-03-14', validUntil: '2027-03-14', scope: 'Kalite Yönetim Sistemi', reminder: 'yok', showOnHomepage: true, showOnProductPages: true, file: 'f8', order: 1, downloadEnabled: true, category: 'Kalite' },
  { id: 'cert2', name: 'ISO 14001:2015', issuer: 'TÜV SÜD', status: 'gecerli', issuedAt: '2024-03-14', validUntil: '2027-03-14', scope: 'Çevre Yönetim Sistemi', reminder: 'yok', showOnHomepage: true, showOnProductPages: false, file: 'f9', order: 2, downloadEnabled: true, category: 'Çevre' },
  { id: 'cert3', name: 'CE Uygunluk Beyanı', issuer: 'Bureau Veritas', status: 'yenileniyor', issuedAt: '2023-08-01', validUntil: '2026-08-01', scope: 'El Aletleri Direktifi', reminder: 'planlandi', showOnHomepage: false, showOnProductPages: true, file: 'f10', order: 3, downloadEnabled: true, category: 'Uygunluk' },
  { id: 'cert4', name: 'ISO 45001:2018', issuer: 'SGS', status: 'gecerli', issuedAt: '2023-11-20', validUntil: '2026-11-20', scope: 'İş Sağlığı ve Güvenliği', reminder: 'yok', showOnHomepage: false, showOnProductPages: false, file: 'f11', order: 4, downloadEnabled: true, category: 'İSG' },
  { id: 'cert5', name: 'REACH Uygunluk', issuer: 'SGS', status: 'gecerli', issuedAt: '2024-01-09', validUntil: '2027-01-09', scope: 'Kimyasal Madde Uygunluğu', reminder: 'yok', showOnHomepage: false, showOnProductPages: true, file: 'f12', order: 5, downloadEnabled: true, category: 'Uygunluk' },
  { id: 'cert6', name: 'Eski İhracat Lisansı — Rusya', issuer: 'Ticaret Bakanlığı', status: 'suresi-doldu', issuedAt: '2022-12-31', validUntil: '2025-12-31', scope: 'Bölgesel İhracat İzni', reminder: 'gecikti', showOnHomepage: false, showOnProductPages: false, file: null, order: 6, downloadEnabled: false, category: 'İhracat' },
];

export interface Dealer {
  id: string;
  company: string;
  country: string;
  region: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: 'onaylandi' | 'inceleniyor' | 'reddedildi';
  submittedAt: string;
  volume: string;
  assignedTo: string;
  listedOnWebsite: boolean;
  contractSigned: boolean;
  notes: string;
  /** Media Library item id for this dealer's logo, or null if not yet uploaded. */
  logo: string | null;
  /** How this record entered the CMS — an incoming public application vs. added directly by staff. */
  source: 'basvuru' | 'manuel';
  /** City shown on the public /yetkili-bayiler directory — only meaningful when listedOnWebsite is true (domestic Türkiye dealers use this for the real dealer-locator grid; `region` already carries the province). */
  city?: string;
  /** Product families this dealer stocks, shown as chips on the public directory card. */
  categories?: string[];
  /** Real "Partner since 2016" label shown on the public directory card. */
  partnerSince?: string;
  /** Public directory status badge — distinct from the internal application `status` field. */
  directoryStatus?: 'Premium Partner' | 'Authorized';
}

export const dealers: Dealer[] = [
  { id: 'd1', company: 'BuildMax Hardware LLC', country: 'BAE', region: 'Orta Doğu', contact: 'Yousef Al-Amin', email: 'yousef@buildmax.ae', phone: '+971 4 555 0142', address: 'Sheikh Zayed Road, Dubai, BAE', website: 'https://buildmaxhardware.ae', status: 'inceleniyor', submittedAt: '2026-06-28', volume: '$120,000 / yıl', assignedTo: 'Selin Arslan', listedOnWebsite: false, contractSigned: false, notes: '48 saattir yanıt bekliyor, öncelikli değerlendirilmeli.', logo: null, source: 'basvuru' },
  { id: 'd2', company: 'ProTools Iberia S.L.', country: 'İspanya', region: 'Avrupa', contact: 'Marta Fernández', email: 'marta@protools.es', phone: '+34 91 555 0198', address: 'Calle de Alcalá 120, Madrid, İspanya', website: 'https://protoolsiberia.es', status: 'onaylandi', submittedAt: '2026-06-10', volume: '$340,000 / yıl', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: 'En yüksek hacimli bayi, öncelikli destek sağlanıyor.', logo: 'm9', source: 'basvuru' },
  { id: 'd3', company: 'Nordic Construction Supply', country: 'İsveç', region: 'Avrupa', contact: 'Erik Lindqvist', email: 'erik@nordicsupply.se', phone: '+46 8 555 0176', address: 'Kungsgatan 30, Stockholm, İsveç', website: 'https://nordicconstructionsupply.se', status: 'onaylandi', submittedAt: '2026-05-22', volume: '$210,000 / yıl', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: 'm10', source: 'basvuru' },
  { id: 'd4', company: 'Balkan Trade Group', country: 'Sırbistan', region: 'Avrupa', contact: 'Nikola Petrović', email: 'nikola@balkantrade.rs', phone: '+381 11 555 0123', address: 'Bulevar Kralja Aleksandra 73, Belgrad, Sırbistan', website: 'https://balkantradegroup.rs', status: 'inceleniyor', submittedAt: '2026-06-30', volume: '$65,000 / yıl', assignedTo: 'Selin Arslan', listedOnWebsite: false, contractSigned: false, notes: '', logo: null, source: 'basvuru' },
  { id: 'd5', company: 'West Africa Tools Ltd.', country: 'Nijerya', region: 'Afrika', contact: 'Chidi Okafor', email: 'chidi@watools.ng', phone: '+234 1 555 0187', address: 'Adeola Odeku St, Victoria Island, Lagos, Nijerya', website: 'https://westafricatools.ng', status: 'reddedildi', submittedAt: '2026-05-02', volume: '$40,000 / yıl', assignedTo: 'Selin Arslan', listedOnWebsite: false, contractSigned: false, notes: 'Minimum sipariş hacmi karşılanmadı.', logo: null, source: 'basvuru' },
  { id: 'd6', company: 'Gulf Craftsman Trading', country: 'Katar', region: 'Orta Doğu', contact: 'Ahmed Al-Sayed', email: 'ahmed@gulfcraftsman.qa', phone: '+974 4 555 0165', address: 'Al Corniche St, Doha, Katar', website: 'https://gulfcraftsmantrading.qa', status: 'onaylandi', submittedAt: '2026-04-18', volume: '$95,000 / yıl', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: 'm11', source: 'basvuru' },
  // Domestic Türkiye dealers — power the real /yetkili-bayiler public directory grid (mirrors project/Decor Authorized Dealers.dc.html's `ALL` dataset exactly). listedOnWebsite:true is what surfaces a record there.
  { id: 'd7', company: 'Başkent Yapı Market', country: 'Türkiye', region: 'Ankara', city: 'Ankara', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Selin Arslan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Painting', 'Measurement'], partnerSince: 'Partner since 2009', directoryStatus: 'Premium Partner' },
  { id: 'd8', company: 'Teknik Yapı Center', country: 'Türkiye', region: 'İzmir', city: 'İzmir', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Selin Arslan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Measurement', 'Spatulas'], partnerSince: 'Partner since 2012', directoryStatus: 'Premium Partner' },
  { id: 'd9', company: 'Mega Hırdavat', country: 'Türkiye', region: 'İstanbul', city: 'İstanbul', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Painting', 'Plaster & Render', 'Insulation'], partnerSince: 'Partner since 2015', directoryStatus: 'Authorized' },
  { id: 'd10', company: 'Anadolu Boya', country: 'Türkiye', region: 'Bursa', city: 'Bursa', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Painting', 'Surface Prep'], partnerSince: 'Partner since 2017', directoryStatus: 'Authorized' },
  { id: 'd11', company: 'Akdeniz Yapı', country: 'Türkiye', region: 'Antalya', city: 'Antalya', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Selin Arslan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Plaster & Render', 'Insulation'], partnerSince: 'Partner since 2011', directoryStatus: 'Premium Partner' },
  { id: 'd12', company: 'Karadeniz Tools', country: 'Türkiye', region: 'Trabzon', city: 'Trabzon', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Measurement', 'Painting'], partnerSince: 'Partner since 2019', directoryStatus: 'Authorized' },
  { id: 'd13', company: 'Güneydoğu Hırdavat', country: 'Türkiye', region: 'Gaziantep', city: 'Gaziantep', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Selin Arslan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Spatulas', 'Plaster & Render'], partnerSince: 'Partner since 2016', directoryStatus: 'Authorized' },
  { id: 'd14', company: 'Marmara Boya Market', country: 'Türkiye', region: 'Kocaeli', city: 'Kocaeli', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Painting', 'Plaster & Render', 'Measurement'], partnerSince: 'Partner since 2008', directoryStatus: 'Premium Partner' },
  { id: 'd15', company: 'Ege Yapı Merkezi', country: 'Türkiye', region: 'İzmir', city: 'İzmir', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Selin Arslan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Insulation', 'Surface Prep'], partnerSince: 'Partner since 2018', directoryStatus: 'Authorized' },
  { id: 'd16', company: 'Çukurova Yapı', country: 'Türkiye', region: 'Adana', city: 'Adana', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Plaster & Render', 'Spatulas'], partnerSince: 'Partner since 2020', directoryStatus: 'Authorized' },
  { id: 'd17', company: 'Doğu Hırdavat', country: 'Türkiye', region: 'Erzurum', city: 'Erzurum', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Selin Arslan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Painting', 'Insulation'], partnerSince: 'Partner since 2021', directoryStatus: 'Authorized' },
  { id: 'd18', company: 'Yıldız Yapı Market', country: 'Türkiye', region: 'Ankara', city: 'Ankara', contact: '', email: '', phone: '', address: '', website: '', status: 'onaylandi', submittedAt: '2026-01-01', volume: '', assignedTo: 'Mert Doğan', listedOnWebsite: true, contractSigned: true, notes: '', logo: null, source: 'manuel', categories: ['Spatulas', 'Surface Prep'], partnerSince: 'Partner since 2014', directoryStatus: 'Authorized' },
];

export interface FormSubmission {
  id: string;
  type: 'iletisim' | 'sikayet' | 'fikir' | 'kariyer' | 'bayi';
  name: string;
  email: string;
  subject: string;
  message: string;
  sourceForm: string;
  sourcePage: string;
  status: 'yeni' | 'yanitlandi' | 'kapatildi';
  submittedAt: string;
  priority: 'yuksek' | 'orta' | 'dusuk';
  assignedTo: string | null;
}

export const formSubmissions: FormSubmission[] = [
  { id: 's1', type: 'iletisim', name: 'Hakan Yılmaz', email: 'hakan.yilmaz@example.com', subject: 'Toptan sipariş için fiyat talebi', message: 'Merhaba, 500 adet sıva mastarı için toptan fiyat teklifi almak istiyorum. Dönüşünüzü bekliyorum.', sourceForm: 'İletişim Formu', sourcePage: '/iletisim', status: 'yeni', submittedAt: '2026-06-30', priority: 'orta', assignedTo: null },
  { id: 's2', type: 'sikayet', name: 'Ayşe Demir', email: 'ayse.demir@example.com', subject: 'Sıva mastarında üretim hatası', message: 'Satın aldığım sıva mastarının bıçağında eğrilik var, ürünü değiştirmek istiyorum.', sourceForm: 'Şikayet Formu', sourcePage: '/sikayet', status: 'yeni', submittedAt: '2026-06-30', priority: 'yuksek', assignedTo: 'Mert Doğan' },
  { id: 's3', type: 'kariyer', name: 'Burak Şahin', email: 'burak.sahin@example.com', subject: 'Üretim Mühendisi başvurusu', message: 'Kariyer sayfanızda yayınlanan Üretim Mühendisi pozisyonu için özgeçmişimi iletiyorum.', sourceForm: 'Kariyer Başvuru Formu', sourcePage: '/kariyer', status: 'yanitlandi', submittedAt: '2026-06-27', priority: 'dusuk', assignedTo: 'Elif Kaya' },
  { id: 's4', type: 'fikir', name: 'Zeynep Aydın', email: 'zeynep.aydin@example.com', subject: 'Manyetik su terazisi önerisi', message: 'Metal yüzeylere kolayca sabitlenebilen manyetik tabanlı bir su terazisi üretmenizi öneririm.', sourceForm: 'Fikir Formu', sourcePage: '/fikir', status: 'yeni', submittedAt: '2026-06-29', priority: 'dusuk', assignedTo: null },
  { id: 's5', type: 'bayi', name: 'Deniz Korkmaz', email: 'deniz.korkmaz@example.com', subject: 'Bölgesel bayilik başvurusu — Karadeniz', message: 'Karadeniz bölgesinde 10 yıldır inşaat malzemeleri toptancılığı yapıyorum, bayiliğinizi almak istiyorum.', sourceForm: 'Bayi Başvuru Formu', sourcePage: '/bayi-ol', status: 'kapatildi', submittedAt: '2026-06-18', priority: 'orta', assignedTo: 'Selin Arslan' },
  { id: 's6', type: 'iletisim', name: 'Emre Yıldız', email: 'emre.yildiz@example.com', subject: 'Katalog talebi', message: '2026 ürün kataloğunuzun basılı bir kopyasını adresime gönderebilir misiniz?', sourceForm: 'İletişim Formu', sourcePage: '/iletisim', status: 'yanitlandi', submittedAt: '2026-06-24', priority: 'dusuk', assignedTo: 'Elif Kaya' },
];

export interface SeoRow {
  id: string;
  page: string;
  title: string;
  metaDescription: string;
  score: number;
  status: 'iyi' | 'uyari' | 'eksik';
  lastAudit: string;
  h1Present: boolean;
  altMissingCount: number;
  schemaPresent: boolean;
  recommendations: string[];
  canonicalUrl: string;
  ogImage: string | null;
  twitterCardEnabled: boolean;
  robotsIndex: boolean;
  keywords: string[];
}

export const seoRows: SeoRow[] = [
  { id: 'seo1', page: '/', title: 'Dekor Tools | Profesyonel El Aletleri Üreticisi', metaDescription: "1964'ten beri profesyonel inşaat el aletleri üreten Dekor Tools, 60'tan fazla ülkeye ihracat yapıyor.", score: 94, status: 'iyi', lastAudit: '2026-06-29', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/', ogImage: 'siva-mastari-hero.avif', twitterCardEnabled: true, robotsIndex: true, keywords: ['profesyonel el aletleri', 'sıva mastarı', 'inşaat aletleri üreticisi'] },
  { id: 'seo2', page: '/uretim', title: 'Üretim Tesisi | Dekor Tools', metaDescription: 'Gebze üretim tesisimizde sekiz kontrollü aşamada profesyonel el aletleri üretiyoruz.', score: 88, status: 'iyi', lastAudit: '2026-06-29', h1Present: true, altMissingCount: 1, schemaPresent: true, recommendations: ['1 görselde ALT metni eksik'], canonicalUrl: 'https://dekortools.com/uretim', ogImage: 'uretim-tesisi-drone.mp4', twitterCardEnabled: true, robotsIndex: true, keywords: ['üretim tesisi', 'Gebze fabrika', 'el aletleri imalatı'] },
  { id: 'seo3', page: '/ihracat', title: 'İhracat Ağı — 60+ Ülke | Dekor Tools', metaDescription: '', score: 61, status: 'uyari', lastAudit: '2026-06-27', h1Present: true, altMissingCount: 3, schemaPresent: false, recommendations: ['Meta açıklama eksik', '3 görselde ALT metni eksik', 'Yapısal veri (schema) eklenmemiş'], canonicalUrl: 'https://dekortools.com/ihracat', ogImage: null, twitterCardEnabled: false, robotsIndex: true, keywords: ['ihracat', 'distribütör ağı', 'export tools'] },
  { id: 'seo4', page: '/bayi-ol', title: '(meta açıklama eksik)', metaDescription: '', score: 34, status: 'eksik', lastAudit: '2026-06-25', h1Present: false, altMissingCount: 5, schemaPresent: false, recommendations: ['Meta başlık eksik', 'Meta açıklama eksik', 'H1 başlığı eksik', '5 görselde ALT metni eksik'], canonicalUrl: 'https://dekortools.com/bayi-ol', ogImage: null, twitterCardEnabled: false, robotsIndex: true, keywords: [] },
  { id: 'seo5', page: '/kariyer', title: 'Kariyer Fırsatları | Dekor Tools', metaDescription: "Dekor Tools ailesine katılın — Türkiye'nin lider el aletleri üreticisinde kariyer fırsatları.", score: 79, status: 'iyi', lastAudit: '2026-06-20', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/kariyer', ogImage: null, twitterCardEnabled: true, robotsIndex: true, keywords: ['kariyer', 'iş fırsatları', 'Dekor Tools iş ilanları'] },
  { id: 'seo6', page: '/iletisim', title: 'İletişim | Dekor Tools', metaDescription: 'Dekor Tools ile iletişime geçin.', score: 55, status: 'uyari', lastAudit: '2026-06-18', h1Present: true, altMissingCount: 0, schemaPresent: false, recommendations: ['Meta açıklama çok kısa (30 karakterin altında)', 'Yapısal veri (schema) eklenmemiş'], canonicalUrl: 'https://dekortools.com/iletisim', ogImage: null, twitterCardEnabled: false, robotsIndex: true, keywords: ['iletişim', 'Dekor Tools adres'] },
  { id: 'seo7', page: '/urunler', title: 'The Tool Catalog | Dekor Tools', metaDescription: '400\'den fazla profesyonel el aleti, on bir mühendislik ailesinde — 60 ihracat pazarında güvenilir.', score: 82, status: 'iyi', lastAudit: '2026-06-30', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/urunler', ogImage: 'siva-mastari-hero.avif', twitterCardEnabled: true, robotsIndex: true, keywords: ['ürün kataloğu', 'el aletleri', 'ürün aileleri'] },
  { id: 'seo8', page: '/urunler/[kategori]', title: 'Painting Tools | Dekor Tools', metaDescription: 'Rulolar, fırçalar, tepsiler ve uzatma sistemleri — temiz kaplama ve profesyonel bitiş için mühendislik ürünleri.', score: 76, status: 'iyi', lastAudit: '2026-06-30', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/urunler/siva-alci', ogImage: 'siva-mastari-hero.avif', twitterCardEnabled: true, robotsIndex: true, keywords: ['boya aletleri', 'rulo', 'fırça', 'kategori sayfası'] },
  { id: 'seo9', page: '/urunler/[slug]', title: 'Professional Spatula | Dekor Tools', metaDescription: 'Ergonomik profesyonel spatula — tam teknik özellikler, ölçülü çizim, indirilebilir katalog ve video.', score: 71, status: 'iyi', lastAudit: '2026-06-30', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/urunler/siva-alci/profesyonel-spatula', ogImage: 'siva-mastari-hero.avif', twitterCardEnabled: true, robotsIndex: true, keywords: ['spatula', 'sıva mastarı', 'ürün detay sayfası'] },
  { id: 'seo10', page: '/hakkimizda', title: 'Hakkımızda | Dekor Tools', metaDescription: "1964'ten bugüne altmış yıllık zanaat disiplini — Türkiye'nin en büyük profesyonel el aletleri üreticisinin hikayesi.", score: 85, status: 'iyi', lastAudit: '2026-07-07', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/hakkimizda', ogImage: 'siva-mastari-hero.avif', twitterCardEnabled: true, robotsIndex: true, keywords: ['hakkımızda', 'şirket tarihi', 'Dekor Tools kurumsal'] },
  { id: 'seo11', page: '/yetkili-bayiler', title: 'Yetkili Bayiler | Dekor Tools', metaDescription: "Türkiye genelinde resmi Dekor bayilerini bulun — il, şehir ve ürün kategorisine göre filtreleyin.", score: 80, status: 'iyi', lastAudit: '2026-07-07', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/yetkili-bayiler', ogImage: null, twitterCardEnabled: true, robotsIndex: true, keywords: ['yetkili bayi', 'bayi bul', 'distribütör'] },
  { id: 'seo12', page: '/haberler', title: 'Newsroom | Dekor Tools', metaDescription: 'Dekor Tools basın odası — son haberler, fuar katılımları, ürün lansmanları ve şirket gelişmeleri.', score: 77, status: 'iyi', lastAudit: '2026-07-07', h1Present: true, altMissingCount: 0, schemaPresent: true, recommendations: [], canonicalUrl: 'https://dekortools.com/haberler', ogImage: null, twitterCardEnabled: true, robotsIndex: true, keywords: ['dekor haberler', 'basın odası', 'şirket haberleri'] },
  { id: 'seo13', page: '/haberler/[slug]', title: '{{ Makale Başlığı }} | Dekor Tools', metaDescription: 'Dekor Tools haber makalesi — kategori, yayın tarihi ve ilgili haberlerle birlikte.', score: 68, status: 'uyari', lastAudit: '2026-07-07', h1Present: true, altMissingCount: 2, schemaPresent: false, recommendations: ['Article yapısal verisi eklenmemiş', '2 galeri görselinde ALT metni eksik'], canonicalUrl: 'https://dekortools.com/haberler/[slug]', ogImage: null, twitterCardEnabled: true, robotsIndex: true, keywords: ['haber detayı', 'basın açıklaması'] },
];

export interface LanguageRow {
  id: string;
  name: string;
  code: string;
  completion: number;
  isDefault: boolean;
  active: boolean;
  pagesTranslated: number;
  pagesTotal: number;
  contentBreakdown: { type: string; translated: number; total: number }[];
  untranslatedPages: string[];
}

export const languageRows: LanguageRow[] = [
  {
    id: 'l1', name: 'Türkçe', code: 'TR', completion: 100, isDefault: true, active: true, pagesTranslated: 31, pagesTotal: 31,
    contentBreakdown: [
      { type: 'Sayfalar', translated: 31, total: 31 },
      { type: 'Ürünler', translated: 248, total: 248 },
      { type: 'Kategoriler', translated: 6, total: 6 },
    ],
    untranslatedPages: [],
  },
  {
    id: 'l2', name: 'İngilizce', code: 'EN', completion: 87, isDefault: false, active: true, pagesTranslated: 27, pagesTotal: 31,
    contentBreakdown: [
      { type: 'Sayfalar', translated: 27, total: 31 },
      { type: 'Ürünler', translated: 210, total: 248 },
      { type: 'Kategoriler', translated: 6, total: 6 },
    ],
    untranslatedPages: ['Kariyer', 'Şikayet Formu', 'Fikir Formu', 'Gizlilik Politikası'],
  },
  {
    id: 'l3', name: 'Almanca', code: 'DE', completion: 42, isDefault: false, active: true, pagesTranslated: 13, pagesTotal: 31,
    contentBreakdown: [
      { type: 'Sayfalar', translated: 13, total: 31 },
      { type: 'Ürünler', translated: 84, total: 248 },
      { type: 'Kategoriler', translated: 3, total: 6 },
    ],
    untranslatedPages: ['İhracat', 'Bayi Ol', 'Kariyer', 'Sertifikalar', 'Haberler', 'İletişim'],
  },
  {
    id: 'l4', name: 'Arapça', code: 'AR', completion: 19, isDefault: false, active: false, pagesTranslated: 6, pagesTotal: 31,
    contentBreakdown: [
      { type: 'Sayfalar', translated: 6, total: 31 },
      { type: 'Ürünler', translated: 22, total: 248 },
      { type: 'Kategoriler', translated: 1, total: 6 },
    ],
    untranslatedPages: ['Üretim', 'İhracat', 'Bayi Ol', 'Kariyer', 'Sertifikalar', 'Haberler'],
  },
  {
    id: 'l5', name: 'İspanyolca', code: 'ES', completion: 0, isDefault: false, active: false, pagesTranslated: 0, pagesTotal: 31,
    contentBreakdown: [
      { type: 'Sayfalar', translated: 0, total: 31 },
      { type: 'Ürünler', translated: 0, total: 248 },
      { type: 'Kategoriler', translated: 0, total: 6 },
    ],
    untranslatedPages: ['Tüm sayfalar'],
  },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'aktif' | 'davet-edildi' | 'pasif';
  lastActive: string;
  lastLogin: string;
  joinedAt: string;
  invitedBy: string;
}

export const adminUsers: AdminUser[] = [
  { id: 'u1', name: 'Elif Kaya', email: 'elif.kaya@dekortools.com', role: 'İçerik Editörü', status: 'aktif', lastActive: '5 dk önce', lastLogin: 'Bugün, 09:12', joinedAt: '2025-03-11', invitedBy: 'Mert Doğan' },
  { id: 'u2', name: 'Mert Doğan', email: 'mert.dogan@dekortools.com', role: 'Yönetici', status: 'aktif', lastActive: '1 saat önce', lastLogin: 'Bugün, 08:40', joinedAt: '2024-11-02', invitedBy: '—' },
  { id: 'u3', name: 'Selin Arslan', email: 'selin.arslan@dekortools.com', role: 'Bayi Sorumlusu', status: 'aktif', lastActive: 'Dün', lastLogin: 'Dün, 18:42', joinedAt: '2025-06-20', invitedBy: 'Mert Doğan' },
  { id: 'u4', name: 'Caner Bulut', email: 'caner.bulut@dekortools.com', role: 'SEO Uzmanı', status: 'davet-edildi', lastActive: '—', lastLogin: 'Henüz giriş yapmadı', joinedAt: '2026-06-28', invitedBy: 'Mert Doğan' },
  { id: 'u5', name: 'Gizem Öztürk', email: 'gizem.ozturk@dekortools.com', role: 'İçerik Editörü', status: 'pasif', lastActive: '2 ay önce', lastLogin: '2026-05-02, 11:20', joinedAt: '2025-01-15', invitedBy: 'Elif Kaya' },
];

export interface Role {
  id: string;
  name: string;
  userCount: number;
  description: string;
}

export const roles: Role[] = [
  { id: 'r1', name: 'Yönetici', userCount: 2, description: 'Tüm modüllere ve sistem ayarlarına tam erişim.' },
  { id: 'r2', name: 'İçerik Editörü', userCount: 4, description: 'Ürün, sayfa ve medya içeriklerini düzenleyebilir.' },
  { id: 'r3', name: 'Bayi Sorumlusu', userCount: 2, description: 'Bayi başvurularını görüntüler ve onaylar.' },
  { id: 'r4', name: 'SEO Uzmanı', userCount: 1, description: 'SEO ayarlarını ve meta verileri düzenleyebilir.' },
  { id: 'r5', name: 'Görüntüleyici', userCount: 3, description: 'Salt okunur erişim, düzenleme yetkisi yok.' },
];

export interface PermissionRow {
  module: string;
  view: boolean;
  edit: boolean;
  publish: boolean;
  delete: boolean;
}

const allModules = [
  'Genel Bakış', 'Ürün Yönetimi', 'Kategori Yönetimi', 'Sayfa Yönetimi', 'Medya Kütüphanesi',
  'Dosya Merkezi', 'Sertifikalar', 'Bayi Yönetimi', 'Form Talepleri', 'SEO Yönetimi',
  'Dil Yönetimi', 'Kullanıcılar', 'Roller ve Yetkiler', 'Sistem Ayarları',
];

function buildMatrix(overrides: Record<string, Partial<Omit<PermissionRow, 'module'>>>): PermissionRow[] {
  return allModules.map((module) => ({
    module,
    view: false,
    edit: false,
    publish: false,
    delete: false,
    ...overrides[module],
  }));
}

/** Per-role permission matrices, all 14 modules — Yönetici has full access, others are scoped to their job. */
export const permissionMatrixByRole: Record<string, PermissionRow[]> = {
  Yönetici: buildMatrix(Object.fromEntries(allModules.map((m) => [m, { view: true, edit: true, publish: true, delete: true }]))),
  'İçerik Editörü': buildMatrix({
    'Genel Bakış': { view: true },
    'Ürün Yönetimi': { view: true, edit: true, publish: true },
    'Kategori Yönetimi': { view: true, edit: true },
    'Sayfa Yönetimi': { view: true, edit: true, publish: false },
    'Medya Kütüphanesi': { view: true, edit: true, publish: true, delete: true },
    'SEO Yönetimi': { view: true, edit: true },
    'Dil Yönetimi': { view: true },
  }),
  'Bayi Sorumlusu': buildMatrix({
    'Genel Bakış': { view: true },
    'Bayi Yönetimi': { view: true, edit: true },
    'Form Talepleri': { view: true, edit: true },
    'Dosya Merkezi': { view: true },
  }),
  'SEO Uzmanı': buildMatrix({
    'Genel Bakış': { view: true },
    'SEO Yönetimi': { view: true, edit: true },
    'Sayfa Yönetimi': { view: true },
    'Ürün Yönetimi': { view: true },
    'Dil Yönetimi': { view: true },
  }),
  Görüntüleyici: buildMatrix(Object.fromEntries(allModules.map((m) => [m, { view: true }]))),
};

export const permissionMatrix = permissionMatrixByRole['İçerik Editörü'];

export type ActivityStatus = 'success' | 'info' | 'warning' | 'neutral';

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  module: string;
  status: ActivityStatus;
  href: string;
}

export const activityFeed: ActivityItem[] = [
  { id: 'a1', actor: 'Elif Kaya', action: 'yayınladı', target: '"Ana Sayfa" sayfası', time: '12 dk önce', module: 'Sayfa Yönetimi', status: 'success', href: '/sayfa-yonetimi' },
  { id: 'a2', actor: 'Mert Doğan', action: 'onayladı', target: 'Nordic Construction Supply bayilik başvurusu', time: '48 dk önce', module: 'Bayi Yönetimi', status: 'success', href: '/bayi-yonetimi' },
  { id: 'a3', actor: 'Sistem', action: 'oluşturdu', target: 'Q3 2026 fiyat listesi yedeği', time: '2 saat önce', module: 'Sistem', status: 'neutral', href: '/sistem-ayarlari' },
  { id: 'a4', actor: 'Selin Arslan', action: 'yükledi', target: '6 yeni ürün görseli', time: '3 saat önce', module: 'Medya Kütüphanesi', status: 'info', href: '/medya-kutuphanesi' },
  { id: 'a5', actor: 'Caner Bulut', action: 'güncelledi', target: '"/ihracat" SEO meta açıklaması', time: 'Dün', module: 'SEO Yönetimi', status: 'info', href: '/seo-yonetimi' },
  { id: 'a6', actor: 'Ayşe Demir', action: 'gönderdi', target: 'sıva mastarı üretim hatası şikayeti', time: 'Dün', module: 'Form Talepleri', status: 'warning', href: '/form-talepleri' },
];

export interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
  shortcut?: string;
  favorite?: boolean;
}

export const quickActions: QuickAction[] = [
  { label: 'Yeni Ürün', description: 'Yeni bir ürün ekleyin ve düzenleyiciyi açın.', href: '/urun-yonetimi', icon: 'Package', shortcut: '⌘N', favorite: true },
  { label: 'Yeni Haber', description: "Newsroom'a yeni bir makale ekleyin.", href: '/haberler', icon: 'Newspaper', favorite: true },
  { label: 'Medya Yükle', description: 'Medya kütüphanesine görsel veya video yükleyin.', href: '/medya-kutuphanesi', icon: 'Upload' },
  { label: 'Yeni Sayfa', description: 'Kurumsal site için yeni bir sayfa başlatın.', href: '/sayfa-yonetimi', icon: 'FileText', shortcut: '⌘P' },
  { label: 'Yeni Bayi', description: 'Manuel bir bayi profili ekleyin.', href: '/bayi-yonetimi', icon: 'Handshake' },
  { label: 'Yeni Banner', description: 'Global CTA veya banner oluşturun.', href: '/genel-bilesenler', icon: 'Megaphone' },
];

// Superseded by `systemHealthGrid` (12-system grid) and `cmsHealthMetrics`
// (progress-bar version) below — kept the richer replacements only.

/** 14-day sparkline series per dashboard metric card, plus today/week/month deltas. */
export interface StatTrend {
  data: number[];
  todayChange: string;
  weekChange: string;
  monthChange: string;
}

export const statTrends: Record<string, StatTrend> = {
  products: { data: [231, 233, 235, 236, 238, 239, 240, 241, 242, 244, 245, 246, 247, 248], todayChange: '+1', weekChange: '+6', monthChange: '+17' },
  dealers: { data: [78, 79, 79, 80, 81, 81, 82, 83, 83, 84, 85, 85, 86, 86], todayChange: '0', weekChange: '+3', monthChange: '+8' },
  requests: { data: [9, 11, 14, 13, 10, 12, 15, 14, 13, 11, 10, 13, 14, 12], todayChange: '-2', weekChange: '-1', monthChange: '+3' },
  seoScore: { data: [68, 69, 70, 70, 71, 72, 73, 73, 74, 75, 75, 76, 76, 76], todayChange: '0', weekChange: '+2', monthChange: '+8' },
  visitors: { data: [12800, 13100, 13400, 13900, 14200, 14600, 15100, 15600, 16000, 16500, 17100, 17600, 18000, 18400], todayChange: '+412', weekChange: '+2,300', monthChange: '+5,600' },
  downloads: { data: [2900, 3020, 3080, 3150, 3220, 3300, 3380, 3450, 3520, 3600, 3700, 3780, 3840, 3890], todayChange: '+50', weekChange: '+340', monthChange: '+990' },
  media: { data: [4.8, 5.0, 5.1, 5.3, 5.4, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4], todayChange: '+0.1 GB', weekChange: '+0.6 GB', monthChange: '+1.6 GB' },
  pendingContent: { data: [7, 6, 6, 5, 6, 5, 4, 5, 4, 4, 3, 4, 4, 4], todayChange: '0', weekChange: '-2', monthChange: '-3' },
};

export interface AnalyticsSeries {
  id: string;
  title: string;
  description: string;
  variant: 'area' | 'bar';
  tone: string;
  unit?: string;
  labels: string[];
  data: number[];
}

/** One series per Analytics Overview tab — Traffic / SEO / Dealers / Products / Downloads / Languages / Content. */
export const analyticsSeries: AnalyticsSeries[] = [
  {
    id: 'traffic',
    title: 'Trafik',
    description: 'Toplam site ziyaretçisi — son 12 hafta',
    variant: 'area',
    tone: 'text-red',
    unit: 'ziyaretçi',
    labels: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12'],
    data: [11200, 11800, 12100, 12600, 13100, 13400, 14200, 14900, 15600, 16400, 17200, 18400],
  },
  {
    id: 'seo',
    title: 'SEO',
    description: 'Ortalama SEO skoru gelişimi — son 12 hafta',
    variant: 'area',
    tone: 'text-success',
    unit: 'puan',
    labels: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12'],
    data: [54, 56, 58, 60, 61, 63, 65, 68, 70, 72, 74, 76],
  },
  {
    id: 'dealers',
    title: 'Bayiler',
    description: 'Haftalık yeni bayilik başvurusu',
    variant: 'bar',
    tone: 'text-info',
    unit: 'başvuru',
    labels: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'],
    data: [3, 4, 6, 5, 8, 7, 9, 8],
  },
  {
    id: 'products',
    title: 'Ürünler',
    description: 'Kümülatif yayındaki ürün sayısı',
    variant: 'area',
    tone: 'text-ai',
    unit: 'ürün',
    labels: ['O', 'Ş', 'M', 'N', 'M', 'H'],
    data: [198, 206, 214, 225, 236, 248],
  },
  {
    id: 'downloads',
    title: 'İndirmeler',
    description: 'Katalog ve doküman indirmeleri',
    variant: 'bar',
    tone: 'text-orange',
    unit: 'indirme',
    labels: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'],
    data: [340, 410, 460, 505, 470, 540, 610, 590],
  },
  {
    id: 'languages',
    title: 'Diller',
    description: 'Ortalama çeviri tamamlanma oranı',
    variant: 'area',
    tone: 'text-info',
    unit: '%',
    labels: ['O', 'Ş', 'M', 'N', 'M', 'H'],
    data: [32, 38, 42, 47, 52, 62],
  },
  {
    id: 'content',
    title: 'İçerik',
    description: 'Haftalık yayınlanan sayfa/ürün',
    variant: 'bar',
    tone: 'text-red',
    unit: 'yayın',
    labels: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'],
    data: [2, 3, 5, 4, 6, 5, 7, 6],
  },
];

export type Urgency = 'kritik' | 'yuksek' | 'orta' | 'dusuk';

export interface PriorityItem {
  id: string;
  label: string;
  urgency: Urgency;
  priorityScore: number;
  icon: string;
  estimatedImpact: string;
  suggestedAction: string;
  expectedSeoImprovement?: string;
  expectedBusinessImpact?: string;
  aiRecommendation?: string;
  actionLabel: string;
  href: string;
  /** Rough time-to-complete, shown on the dashboard's compact priority cards. */
  estimatedTime?: string;
  businessImpact?: 'yuksek' | 'orta' | 'dusuk';
}

/** Priority Center — replaces the flat "Bugünkü Öncelikler" list with scored, actionable items. */
export const priorityItems: PriorityItem[] = [
  {
    id: 'pr1',
    label: '4 bayi başvurusunu onaylayın',
    urgency: 'kritik',
    priorityScore: 94,
    icon: 'Handshake',
    estimatedImpact: 'Yüksek — $625.000/yıl potansiyel hacim beklemede',
    suggestedAction: 'BuildMax ve Balkan Trade başvurularını bugün inceleyin',
    expectedBusinessImpact: '+2 aktif bayi, +%4 ihracat hacmi',
    aiRecommendation: 'Yousef Al-Amin (BuildMax) 48 saattir yanıt bekliyor — önce bu başvuruyu değerlendirin.',
    actionLabel: 'İncele',
    href: '/bayi-yonetimi',
    estimatedTime: '4 dakika',
    businessImpact: 'yuksek',
  },
  {
    id: 'pr2',
    label: '2 sayfada kritik SEO uyarısı var',
    urgency: 'kritik',
    priorityScore: 89,
    icon: 'AlertTriangle',
    estimatedImpact: 'Yüksek — organik trafiği doğrudan etkiliyor',
    suggestedAction: '"/bayi-ol" sayfasına meta açıklama ekleyin',
    expectedSeoImprovement: '+8-12 puan tahmini SEO skoru artışı',
    actionLabel: 'Düzelt',
    href: '/seo-yonetimi',
    estimatedTime: '10 dakika',
    businessImpact: 'yuksek',
  },
  {
    id: 'pr3',
    label: '7 sayfa henüz çevrilmedi (Almanca)',
    urgency: 'yuksek',
    priorityScore: 71,
    icon: 'Languages',
    estimatedImpact: 'Orta — DE pazarına giriş gecikiyor',
    suggestedAction: 'Kalan 7 sayfayı çeviri kuyruğuna alın',
    expectedBusinessImpact: 'DE pazarında %100 dil kapsamı',
    actionLabel: 'Çevir',
    href: '/dil-yonetimi',
    estimatedTime: '25 dakika',
    businessImpact: 'orta',
  },
  {
    id: 'pr4',
    label: '3 sertifikanın süresi yakında doluyor',
    urgency: 'yuksek',
    priorityScore: 66,
    icon: 'BadgeCheck',
    estimatedImpact: 'Orta — ihracat uygunluğu riske girebilir',
    suggestedAction: 'CE Uygunluk Beyanı yenileme sürecini başlatın',
    actionLabel: 'Görüntüle',
    href: '/sertifikalar',
  },
  {
    id: 'pr5',
    label: '5 ürün henüz yayınlanmadı',
    urgency: 'orta',
    priorityScore: 48,
    icon: 'Package',
    estimatedImpact: 'Orta — kataloğu tamamlıyor',
    suggestedAction: 'Taslak ürünleri gözden geçirip yayınlayın',
    expectedBusinessImpact: '+5 ürün, tam katalog kapsamı',
    actionLabel: 'Yayınla',
    href: '/urun-yonetimi',
  },
  {
    id: 'pr6',
    label: '2 medya optimizasyon görevi bekliyor',
    urgency: 'dusuk',
    priorityScore: 24,
    icon: 'ImageIcon',
    estimatedImpact: 'Düşük — sayfa yükleme hızını az etkiler',
    suggestedAction: 'Sıkıştırılmamış 2 görseli AVIF formatına dönüştürün',
    actionLabel: 'Optimize Et',
    href: '/medya-kutuphanesi',
  },
];

export interface SystemHealthItem {
  id: string;
  label: string;
  status: 'saglikli' | 'uyari' | 'kritik';
  detail: string;
  description: string;
  lastChecked: string;
  severity: 'yok' | 'dusuk' | 'orta' | 'yuksek';
}

export const systemHealthGrid: SystemHealthItem[] = [
  { id: 'sh1', label: 'Sunucu', status: 'saglikli', detail: '99.98% çalışma süresi', description: 'Uygulama sunucusu yanıt süresi ve uptime izlemesi', lastChecked: '1 dk önce', severity: 'yok' },
  { id: 'sh2', label: 'Veritabanı', status: 'saglikli', detail: '12ms ortalama sorgu süresi', description: 'Bağlantı havuzu ve sorgu performansı', lastChecked: '1 dk önce', severity: 'yok' },
  { id: 'sh3', label: 'Depolama', status: 'uyari', detail: '6.4 / 20 GB kullanıldı', description: 'Medya ve dosya deposu kapasitesi', lastChecked: '5 dk önce', severity: 'dusuk' },
  { id: 'sh4', label: 'SSL Sertifikası', status: 'saglikli', detail: '284 gün geçerli', description: 'dekortools.com ve www için geçerlilik', lastChecked: 'Bugün, 03:00', severity: 'yok' },
  { id: 'sh5', label: 'Yedekleme', status: 'saglikli', detail: 'Son yedek: 3 saat önce', description: 'Otomatik günlük veritabanı + medya yedeği', lastChecked: '3 saat önce', severity: 'yok' },
  { id: 'sh6', label: 'CDN', status: 'saglikli', detail: 'Tüm bölgelerde aktif', description: 'Statik varlık dağıtım ağı durumu', lastChecked: '2 dk önce', severity: 'yok' },
  { id: 'sh7', label: 'API', status: 'saglikli', detail: '99.95% başarı oranı', description: 'İç ve dış API istekleri başarı oranı', lastChecked: '1 dk önce', severity: 'yok' },
  { id: 'sh8', label: 'E-posta', status: 'saglikli', detail: 'SMTP bağlantısı aktif', description: 'Bildirim ve form yanıt e-postaları', lastChecked: '10 dk önce', severity: 'yok' },
  { id: 'sh9', label: 'Zamanlanmış Görevler', status: 'uyari', detail: '1 görev gecikmeli çalıştı', description: 'Cron tabanlı bakım ve rapor görevleri', lastChecked: '15 dk önce', severity: 'orta' },
  { id: 'sh10', label: 'Kuyruk (Queue)', status: 'saglikli', detail: '0 bekleyen iş', description: 'Arka plan iş kuyruğu (e-posta, dışa aktarma)', lastChecked: '1 dk önce', severity: 'yok' },
  { id: 'sh11', label: 'Görsel Optimizasyonu', status: 'kritik', detail: '3 görsel optimize edilemedi', description: 'Otomatik AVIF/WebP dönüştürme hattı', lastChecked: '20 dk önce', severity: 'yuksek' },
  { id: 'sh12', label: 'Dil Kapsamı', status: 'uyari', detail: '%62 ortalama tamamlanma', description: 'Aktif diller genelinde çeviri kapsamı', lastChecked: 'Bugün, 06:00', severity: 'orta' },
];

export interface CmsHealthDetail {
  id: string;
  label: string;
  completion: number;
  detail: string;
}

export interface CmsHealthGroup {
  id: string;
  label: string;
  summary: string;
  criticalCount: number;
  items: CmsHealthDetail[];
}

/** CMS Health, grouped by domain instead of a flat list of near-identical bars. */
export const cmsHealthGroups: CmsHealthGroup[] = [
  {
    id: 'g-products',
    label: 'Ürünler',
    summary: '238/248 tam, 32 SEO alanı eksik',
    criticalCount: 0,
    items: [
      { id: 'cm1', label: 'Tamamlanan Ürünler', completion: 96, detail: '238 / 248 ürün eksiksiz' },
      { id: 'cm2', label: 'Görseli Eksik Ürünler', completion: 92, detail: '20 ürün görsel bekliyor' },
      { id: 'cm3', label: 'SEO Alanı Eksik Ürünler', completion: 87, detail: '32 ürün SEO alanı bekliyor' },
    ],
  },
  {
    id: 'g-pages',
    label: 'Sayfalar',
    summary: '2 sayfa H1 eksik, 1 kırık bağlantı',
    criticalCount: 1,
    items: [
      { id: 'cm4', label: 'H1 Eksik Sayfalar', completion: 94, detail: '2 sayfa H1 başlığı bekliyor' },
      { id: 'cm5', label: 'Kırık İç Bağlantılar', completion: 99, detail: '1 kırık bağlantı tespit edildi' },
      { id: 'cm7', label: 'OpenGraph Eksik Sayfalar', completion: 90, detail: '3 sayfa OG etiketi bekliyor' },
    ],
  },
  {
    id: 'g-media',
    label: 'Medya',
    summary: '14 görsel ALT metni bekliyor',
    criticalCount: 0,
    items: [{ id: 'cm6', label: 'ALT Metni Eksik Görseller', completion: 81, detail: '14 görsel ALT metni bekliyor' }],
  },
  {
    id: 'g-language',
    label: 'Çoklu Dil',
    summary: '7 sayfa çeviri bekliyor — kritik',
    criticalCount: 1,
    items: [{ id: 'cm8', label: 'Çeviri Eksik İçerik', completion: 62, detail: '7 sayfa çeviri bekliyor' }],
  },
  {
    id: 'g-governance',
    label: 'İnceleme & Uygunluk',
    summary: '4 içerik incelemede, 1 sertifika süresi doldu',
    criticalCount: 1,
    items: [
      { id: 'cm9', label: 'Bekleyen İncelemeler', completion: 78, detail: '4 içerik incelemede' },
      { id: 'cm10', label: 'Süresi Dolan Sertifikalar', completion: 83, detail: '1 sertifikanın süresi doldu' },
    ],
  },
];

export type RecentFileType = 'PDF' | 'AI' | 'SVG' | 'FIG' | 'DOCX' | 'XLSX' | 'MP4' | 'JPG' | 'PNG' | 'ZIP';

export interface RecentFile {
  id: string;
  name: string;
  type: RecentFileType;
  category: string;
  downloads: number;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  previewable: boolean;
}

export const recentFiles: RecentFile[] = [
  { id: 'rf1', name: '2026 Ürün Kataloğu (TR)', type: 'PDF', category: 'Katalog', downloads: 1284, uploadedBy: 'Elif Kaya', uploadedAt: 'Bugün', version: 'v3', previewable: true },
  { id: 'rf2', name: 'siva-mastari-hero', type: 'JPG', category: 'Ürün Görseli', downloads: 0, uploadedBy: 'Selin Arslan', uploadedAt: 'Bugün', version: 'v1', previewable: true },
  { id: 'rf3', name: 'ISO 9001 Sertifika Taraması', type: 'PDF', category: 'Sertifika', downloads: 42, uploadedBy: 'Mert Doğan', uploadedAt: 'Dün', version: 'v1', previewable: true },
  { id: 'rf4', name: 'yeni-urun-tanitim', type: 'MP4', category: 'Tanıtım Videosu', downloads: 156, uploadedBy: 'Selin Arslan', uploadedAt: '2 gün önce', version: 'v2', previewable: false },
  { id: 'rf5', name: 'Fiyat Listesi — Q3 2026', type: 'XLSX', category: 'Fiyat Listesi', downloads: 412, uploadedBy: 'Mert Doğan', uploadedAt: '3 gün önce', version: 'v5', previewable: false },
  { id: 'rf6', name: 'dekor-logo-vector', type: 'AI', category: 'Marka Varlığı', downloads: 8, uploadedBy: 'Caner Bulut', uploadedAt: '4 gün önce', version: 'v2', previewable: false },
  { id: 'rf7', name: 'dekor-logo-outline', type: 'SVG', category: 'Marka Varlığı', downloads: 21, uploadedBy: 'Caner Bulut', uploadedAt: '4 gün önce', version: 'v2', previewable: true },
  { id: 'rf8', name: 'admin-panel-mockup', type: 'FIG', category: 'Tasarım', downloads: 3, uploadedBy: 'Mert Doğan', uploadedAt: '1 hafta önce', version: 'v9', previewable: false },
  { id: 'rf9', name: 'bayi-sozlesmesi-sablonu', type: 'DOCX', category: 'Bayi Dokümanları', downloads: 56, uploadedBy: 'Selin Arslan', uploadedAt: '1 hafta önce', version: 'v1', previewable: false },
  { id: 'rf10', name: 'urun-gorselleri-arsivi', type: 'ZIP', category: 'Ürün Görseli', downloads: 14, uploadedBy: 'Elif Kaya', uploadedAt: '2 hafta önce', version: 'v1', previewable: false },
];

export interface RecentUserActivity {
  id: string;
  name: string;
  role: string;
  online: boolean;
  lastLogin: string;
  isNewInvite: boolean;
}

export const recentUsersActivity: RecentUserActivity[] = [
  { id: 'ru1', name: 'Elif Kaya', role: 'İçerik Editörü', online: true, lastLogin: 'Şimdi aktif', isNewInvite: false },
  { id: 'ru2', name: 'Mert Doğan', role: 'Yönetici', online: true, lastLogin: 'Şimdi aktif', isNewInvite: false },
  { id: 'ru3', name: 'Selin Arslan', role: 'Bayi Sorumlusu', online: false, lastLogin: 'Dün, 18:42', isNewInvite: false },
  { id: 'ru4', name: 'Caner Bulut', role: 'SEO Uzmanı', online: false, lastLogin: 'Henüz giriş yapmadı', isNewInvite: true },
  { id: 'ru5', name: 'Gizem Öztürk', role: 'İçerik Editörü', online: false, lastLogin: '2 ay önce', isNewInvite: false },
];

export const dealerOverview = {
  newThisMonth: 8,
  approved: 3,
  waiting: 2,
  rejected: 1,
  pipeline: [
    { stage: 'Başvuru Alındı', count: 8 },
    { stage: 'İncelemede', count: 2 },
    { stage: 'Sözleşme Aşaması', count: 1 },
    { stage: 'Onaylandı', count: 3 },
  ],
  regions: [
    { region: 'Avrupa', count: 34, tone: 'info' as const },
    { region: 'Orta Doğu', count: 21, tone: 'ai' as const },
    { region: 'Kuzey Afrika', count: 12, tone: 'orange' as const },
    { region: 'Asya', count: 9, tone: 'success' as const },
  ],
  topCountries: [
    { country: 'İspanya', count: 14 },
    { country: 'BAE', count: 11 },
    { country: 'İsveç', count: 9 },
    { country: 'Katar', count: 7 },
    { country: 'Sırbistan', count: 5 },
  ],
  topDealers: [
    { company: 'ProTools Iberia S.L.', volume: '$340,000 / yıl', health: 96, country: 'İspanya' },
    { company: 'Nordic Construction Supply', volume: '$210,000 / yıl', health: 91, country: 'İsveç' },
    { company: 'BuildMax Hardware LLC', volume: '$120,000 / yıl', health: 74, country: 'BAE' },
    { company: 'Gulf Craftsman Trading', volume: '$95,000 / yıl', health: 88, country: 'Katar' },
  ],
};

export const seoOverview = {
  overallScore: 76,
  scoreChange: '+5 puan (30 gün)',
  excellentPages: 9,
  warningPages: 4,
  criticalPages: 2,
  missingMeta: 2,
  missingSchema: 5,
  missingAlt: 14,
  missingInternalLinks: 3,
  indexedPages: 28,
  totalPages: 31,
  keywordHealth: [
    { keyword: 'profesyonel sıva mastarı', position: 3, trend: 'up' as const },
    { keyword: 'inşaat el aletleri üreticisi', position: 5, trend: 'up' as const },
    { keyword: 'toptan boya ekipmanları', position: 11, trend: 'down' as const },
    { keyword: 'bayilik başvurusu inşaat', position: 7, trend: 'flat' as const },
  ],
  structuredDataStatus: [
    { type: 'Organization', status: 'aktif' as const },
    { type: 'Product', status: 'aktif' as const },
    { type: 'BreadcrumbList', status: 'kismi' as const },
    { type: 'Article', status: 'eksik' as const },
  ],
};

export interface ContentOverviewCard {
  id: string;
  label: string;
  value: number;
  trend: string;
  lastUpdate: string;
  href: string;
  sparkline: number[];
}

export const contentOverviewCards: ContentOverviewCard[] = [
  { id: 'co-pages', label: 'Sayfalar', value: 31, trend: '+1 bu ay', lastUpdate: '12 dk önce', href: '/sayfa-yonetimi', sparkline: [24, 25, 26, 27, 28, 29, 30, 31] },
  { id: 'co-products', label: 'Ürünler', value: 248, trend: '+17 bu ay', lastUpdate: '2 saat önce', href: '/urun-yonetimi', sparkline: [206, 214, 222, 230, 236, 240, 244, 248] },
  { id: 'co-downloads', label: 'Dosyalar', value: fileDocs.length, trend: '+2 bu ay', lastUpdate: '3 gün önce', href: '/dosya-merkezi', sparkline: [3, 3, 4, 4, 5, 5, 6, 6] },
  { id: 'co-media', label: 'Medya', value: mediaItems.length, trend: '+6 bu hafta', lastUpdate: 'Bugün', href: '/medya-kutuphanesi', sparkline: [4, 4, 5, 6, 6, 7, 8, 8] },
  { id: 'co-certificates', label: 'Sertifikalar', value: certificates.length, trend: '0 değişim', lastUpdate: '1 hafta önce', href: '/sertifikalar', sparkline: [6, 6, 6, 6, 6, 6, 6, 6] },
  { id: 'co-forms', label: 'Form Talepleri', value: formSubmissions.length, trend: '+6 bu hafta', lastUpdate: '12 dk önce', href: '/form-talepleri', sparkline: [2, 3, 3, 4, 5, 5, 6, 6] },
  { id: 'co-languages', label: 'Diller', value: languageRows.length, trend: '+1 bu yıl', lastUpdate: '3 hafta önce', href: '/dil-yonetimi', sparkline: [3, 3, 4, 4, 5, 5, 5, 5] },
  { id: 'co-published-today', label: 'Bugün Yayınlanan', value: 3, trend: '+3 bugün', lastUpdate: 'Bugün', href: '/genel-bakis', sparkline: [0, 1, 0, 2, 1, 0, 2, 3] },
];

/* ------------------------------------------------------------------ */
/* WEBSITE CONTROL — Website Structure, Homepage Builder, Header/Footer, */
/* Navigation Manager, Section Builder, Global Components.               */
/* ------------------------------------------------------------------ */

export interface WebsitePage {
  id: string;
  name: string;
  path: string;
  status: 'yayinda' | 'taslak';
  linkedModule: string;
  linkedHref: string;
  lastPublished: string;
  /** Key into the section-array map below — lets Website Yapısı expand a real section tree per page. */
  sectionsKey?:
    | 'homepageSections'
    | 'aboutSections'
    | 'manufacturingSections'
    | 'exportSections'
    | 'dealerPageSections'
    | 'supportSections'
    | 'newsroomSections'
    | 'careerSections'
    | 'productDetailSections'
    | 'categoryTemplateSections'
    | 'newsDetailSections'
    | 'contactPageSections'
    | 'productsLandingSections'
    | 'becomeDealerSections';
}

/** Mirrors the real page inventory in project/*.dc.html — every public page maps to the CMS module that actually controls it. */
export const websitePages: WebsitePage[] = [
  { id: 'wp1', name: 'Ana Sayfa', path: '/', status: 'yayinda', linkedModule: 'Ana Sayfa Oluşturucu', linkedHref: '/ana-sayfa-olusturucu', lastPublished: '2026-06-28', sectionsKey: 'homepageSections' },
  { id: 'wp2', name: 'Hakkımızda', path: '/hakkimizda', status: 'yayinda', linkedModule: 'Hakkımızda Sayfası', linkedHref: '/hakkimizda-sayfasi', lastPublished: '2026-06-20', sectionsKey: 'aboutSections' },
  { id: 'wp3', name: 'Üretim', path: '/uretim', status: 'yayinda', linkedModule: 'Üretim Sayfası', linkedHref: '/uretim-sayfasi', lastPublished: '2026-06-27', sectionsKey: 'manufacturingSections' },
  { id: 'wp4', name: 'Ürünler', path: '/urunler', status: 'yayinda', linkedModule: 'Ürünler Sayfası Oluşturucu', linkedHref: '/urunler-sayfasi', lastPublished: '2026-06-30', sectionsKey: 'productsLandingSections' },
  { id: 'wp5', name: 'Ürün Kategorisi', path: '/urunler/[kategori]', status: 'yayinda', linkedModule: 'Kategori Sayfası Şablonu', linkedHref: '/kategori-sablonu', lastPublished: '2026-06-24', sectionsKey: 'categoryTemplateSections' },
  { id: 'wp6', name: 'Ürün Detayı', path: '/urunler/[slug]', status: 'yayinda', linkedModule: 'Ürün Detay Şablonu', linkedHref: '/urun-detay-sablonu', lastPublished: '2026-06-30', sectionsKey: 'productDetailSections' },
  { id: 'wp7', name: 'İhracat', path: '/ihracat', status: 'yayinda', linkedModule: 'İhracat Sayfası', linkedHref: '/ihracat-sayfasi', lastPublished: '2026-06-29', sectionsKey: 'exportSections' },
  { id: 'wp8', name: 'Yetkili Bayiler', path: '/yetkili-bayiler', status: 'yayinda', linkedModule: 'Yetkili Bayiler Sayfası', linkedHref: '/bayi-sayfasi', lastPublished: '2026-06-14', sectionsKey: 'dealerPageSections' },
  { id: 'wp9', name: 'Bayi Ol', path: '/bayi-ol', status: 'yayinda', linkedModule: 'Bayi Ol Sayfası', linkedHref: '/bayi-ol-sayfasi', lastPublished: '2026-06-12', sectionsKey: 'becomeDealerSections' },
  { id: 'wp10', name: 'Sertifikalar', path: '/sertifikalar', status: 'yayinda', linkedModule: 'Sertifikalar', linkedHref: '/sertifikalar', lastPublished: '2026-06-15' },
  { id: 'wp11', name: 'Haberler (Newsroom)', path: '/haberler', status: 'yayinda', linkedModule: 'Haberler Sayfası', linkedHref: '/haberler-sayfasi', lastPublished: '2026-06-22', sectionsKey: 'newsroomSections' },
  { id: 'wp11b', name: 'Haber Detayı', path: '/haberler/[slug]', status: 'yayinda', linkedModule: 'Haber Detay Şablonu', linkedHref: '/haber-detay-sablonu', lastPublished: '2026-06-22', sectionsKey: 'newsDetailSections' },
  { id: 'wp12', name: 'Destek Merkezi', path: '/destek', status: 'yayinda', linkedModule: 'Destek Sayfası', linkedHref: '/destek-sayfasi', lastPublished: '2026-06-08', sectionsKey: 'supportSections' },
  { id: 'wp13', name: 'Kariyer', path: '/kariyer', status: 'taslak', linkedModule: 'Kariyer Sayfası', linkedHref: '/kariyer-sayfasi', lastPublished: '—', sectionsKey: 'careerSections' },
  { id: 'wp13b', name: 'Kariyer — Başvuru Formu', path: '/kariyer#basvur', status: 'yayinda', linkedModule: 'Kariyer Başvuru Formu', linkedHref: '/kariyer-basvuru-formu', lastPublished: '2026-06-30' },
  { id: 'wp14', name: 'İletişim', path: '/iletisim', status: 'yayinda', linkedModule: 'İletişim Sayfası', linkedHref: '/iletisim-sayfasi', lastPublished: '2026-06-05', sectionsKey: 'contactPageSections' },
  { id: 'wp15', name: 'Şikayet Formu', path: '/sikayet', status: 'yayinda', linkedModule: 'Form Talepleri', linkedHref: '/form-talepleri', lastPublished: '2026-05-20' },
  { id: 'wp16', name: 'Fikir Formu', path: '/fikir', status: 'yayinda', linkedModule: 'Form Talepleri', linkedHref: '/form-talepleri', lastPublished: '2026-05-20' },
  { id: 'wp17', name: 'İndirilenler', path: '/dosya-merkezi', status: 'yayinda', linkedModule: 'Dosya Merkezi', linkedHref: '/dosya-merkezi', lastPublished: '2026-06-15' },
];

export interface SectionButton {
  label: string;
  href: string;
  style: 'birincil' | 'ikincil' | 'metin';
  /** Opens in a new tab when true — real field, editable in SectionEditorDrawer, defaults to false (same tab) when absent on older fixture rows. */
  newTab?: boolean;
  /** Per-button visibility, independent of the whole section's visibility — defaults to true when absent. */
  visible?: boolean;
}

export interface SectionCardSpec {
  label: string;
  value: string;
}

/**
 * A single card in a multi-card section (e.g. Home's "Engineering
 * Commitments" grid, a Requirements grid, a Why Partner grid). Real,
 * editable content — added because several sections render 3-5 distinct
 * cards from real HTML but previously only had one shared title/description
 * for the whole section, meaning the individual cards weren't editable at
 * all. `specs` covers the small label/value rows a card may show (e.g.
 * "MATERIAL — 1.2379 TOOL STEEL"); decorative elements (icons, precision
 * bars, coordinate readouts) are fixed design, not modeled here.
 */
export interface SectionCard {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  specs?: SectionCardSpec[];
}

export type AnimationStyle = 'yok' | 'solma' | 'kaydirma' | 'buyutme';

/** Full publishing lifecycle — superset of the legacy `publicationStatus` field below, kept for the API contract in lib/publishing-api.ts. */
export type PublishStatus = 'taslak' | 'zamanlandi' | 'yayinda' | 'arsivlendi';

export interface RevisionSnapshot {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface RevisionEntry {
  id: string;
  versionLabel: string;
  author: string;
  date: string;
  changeSummary: string;
  /** Content fields as they were at this revision — powers version compare. Older seed revisions may not have one. */
  snapshot?: RevisionSnapshot;
}

export interface HomepageSection {
  id: string;
  name: string;
  type: string;
  order: number;
  visible: boolean;
  lastEdited: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  buttons: SectionButton[];
  mediaType: 'gorsel' | 'video' | 'belge' | 'yok';
  mediaName: string;
  backgroundColor: string;
  overlay: boolean;
  overlayOpacity: number;
  animation: AnimationStyle;
  seoNote: string;
  /**
   * `complete` is derived from real content, not stored intent — for
   * non-source languages (anything but TR) it's computed from whether the
   * `title`/`description` overrides below are actually filled in. Those
   * overrides are real per-language content, editable via the İçerik tab's
   * language switcher in SectionEditorDrawer, not just a status badge.
   */
  languages: { code: string; complete: boolean; eyebrow?: string; title?: string; subtitle?: string; description?: string }[];
  responsiveHidden: ('mobil' | 'tablet')[];
  /** Real, editable alt text for the section's image/video — independent of the underlying Media Library asset, since a section may use the same asset differently than another placement. */
  mediaAlt?: string;
  /** Real, editable caption shown under the media, independent of the Media Library asset's own caption. */
  mediaCaption?: string;
  /** Where the image/video's subject sits when the container crops it — the honest, real alternative to true pixel cropping (no image-processing pipeline exists in this fixture project). */
  mediaFocalPoint?: 'ust' | 'orta' | 'alt';
  /** Text alignment within the section — real field, reflected in SectionThumbnail. */
  alignment?: 'sol' | 'orta' | 'sag';
  /** Vertical padding preset — real field, reflected in SectionThumbnail. */
  spacing?: 'dar' | 'normal' | 'genis';
  /** Real, editable multi-card content for sections that render several distinct cards (not just one shared title/description). Absent/empty for sections that genuinely only have one text block. */
  cards?: SectionCard[];
  /** Real, editable individual statistics for sections that render a stat strip (e.g. Home's "Why the Trade Trusts Dekor" — the real HTML binds these to a `trust` list, so a single free-text description can't represent them). Absent for sections with no stat strip. */
  stats?: SectionCardSpec[];
  /** @deprecated superseded by publishStatus; kept so every existing literal below still type-checks without a mass rewrite. */
  publicationStatus: 'yayinda' | 'taslak';
  publishStatus?: PublishStatus;
  scheduledAt?: string | null;
  lastPublishedAt?: string | null;
  modifiedBy?: string;
  revisions?: RevisionEntry[];
}

/** Mirrors project/Decor Home.dc.html's real section order (see #top, #products, #why, #manufacturing, #export, #dealers, contact CTA). */
export const homepageSections: HomepageSection[] = [
  {
    id: 'hs1', name: 'Hero — Ana Görsel ve Başlık', type: 'Hero', order: 1, visible: true, lastEdited: '2026-06-28',
    eyebrow: 'SINCE 1964', title: 'Forged for the Pro.', subtitle: "Türkiye'nin en büyük profesyonel el aletleri üreticisi",
    description: 'Altı dekat metalurji, test ve titizlik — dört kıtada güvenilen kalite.',
    buttons: [{ label: 'Ürünleri Keşfet', href: '/urunler', style: 'birincil' }, { label: 'Fabrikayı Gez', href: '/uretim', style: 'ikincil' }],
    mediaType: 'video', mediaName: 'hero-carousel-01.mp4', backgroundColor: '#0B0C0E', overlay: true, overlayOpacity: 40,
    animation: 'kaydirma', seoNote: 'H1 burada tanımlanır — sayfanın tek H1 etiketi.', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Selin Arslan', revisions: [{ id: 'hs1-rev1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.', snapshot: { eyebrow: 'EST. 1964', title: 'Built for Professionals.', subtitle: "Türkiye'nin lider el aletleri üreticisi", description: 'Altmış yılı aşkın metalurji ve test tecrübesi.' } }, { id: 'hs1-rev2', versionLabel: 'v2', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'SINCE 1964', title: 'Forged for the Pro.', subtitle: "Türkiye'nin en büyük profesyonel el aletleri üreticisi", description: 'Altı dekat metalurji, test ve titizlik — dört kıtada güvenilen kalite.' } }],
  },
  {
    id: 'hs2', name: 'İstatistikler Şeridi', type: 'Statistics', order: 2, visible: true, lastEdited: '2026-06-20',
    eyebrow: 'WHY THE TRADE TRUSTS DEKOR', title: 'Rakamlarla Dekor', subtitle: '', description: 'Aşağıdaki rakamlar sitede tek tek görüntülenir — her biri ayrı ayrı düzenlenebilir.',
    buttons: [], mediaType: 'yok', mediaName: '', backgroundColor: '#0E0F11', overlay: false, overlayOpacity: 0,
    animation: 'solma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: true }],
    stats: [
      { label: 'Kuruluş', value: '1964' },
      { label: 'İhracat Yapılan Ülke', value: '60+' },
      { label: 'Ürün Çeşidi', value: '400+' },
      { label: 'Türkiye Pazar Payı', value: '#1' },
    ],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Mert Doğan', revisions: [{ id: 'hs2-rev1', versionLabel: 'v1', author: 'Mert Doğan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs2-rev2', versionLabel: 'v2', author: 'Mert Doğan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: '', title: 'Rakamlarla Dekor', subtitle: '', description: '1964 kuruluş, 60+ ülke, 400+ ürün, #1 Türkiye pazar payı.' } }, { id: 'hs2-rev3', versionLabel: 'v3', author: 'Mert Doğan', date: '2026-06-30', changeSummary: 'Rakamlar artık tek tek düzenlenebilir — önceki tek bloklu açıklama dört ayrı rakamı yansıtmıyordu.' }],
  },
  {
    id: 'hs3', name: 'Ürün Vitrini', type: 'Product Showcase', order: 3, visible: true, lastEdited: '2026-06-30',
    eyebrow: 'FEATURED PRODUCTS', title: 'Built for the trade.', subtitle: 'Öne çıkan ürünlerimiz',
    description: 'En çok tercih edilen 8 ürün otomatik olarak burada listelenir (Ürün Yönetimi → "Ana Sayfada Göster" alanı).',
    buttons: [{ label: 'Tüm Ürünler', href: '/urunler', style: 'metin' }], mediaType: 'gorsel', mediaName: 'ürün kartları (dinamik)', backgroundColor: '#F4F5F6', overlay: false, overlayOpacity: 0,
    animation: 'kaydirma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Elif Kaya', revisions: [{ id: 'hs3-rev1', versionLabel: 'v1', author: 'Elif Kaya', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs3-rev2', versionLabel: 'v2', author: 'Elif Kaya', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'FEATURED PRODUCTS', title: 'Built for the trade.', subtitle: 'Öne çıkan ürünlerimiz', description: 'En çok tercih edilen 8 ürün otomatik olarak burada listelenir (Ürün Yönetimi → "Ana Sayfada Göster" alanı).' } }],
  },
  {
    id: 'hs-why', name: 'Değer Önermesi — "Engineered without compromise"', type: 'Value Props', order: 4, visible: true, lastEdited: '2026-06-18',
    eyebrow: 'ENGINEERING COMMITMENTS · 04', title: 'Engineered without compromise.', subtitle: '',
    description: 'Altı dekat metalurji, dört mühendislik taahhüdünde — her biri Dekor damgasını kazanmadan önce ölçülür, test edilir ve doğrulanır. Aşağıdaki dört kart ayrı ayrı düzenlenebilir.',
    buttons: [], mediaType: 'gorsel', mediaName: 'atolye-detay.avif', backgroundColor: '#FFFFFF', overlay: false, overlayOpacity: 0,
    animation: 'solma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Selin Arslan',
    cards: [
      {
        id: 'why-card-1', eyebrow: 'FORGE · 01', title: 'Forged-Steel Durability',
        description: 'Tools forged and heat-treated to survive the jobsite — not the showroom.',
        specs: [{ label: 'MATERIAL', value: '1.2379 TOOL STEEL' }, { label: 'HARDNESS', value: '58–62 HRC' }],
      },
      {
        id: 'why-card-2', eyebrow: 'MAT · 02', title: 'Engineered Materials',
        description: 'Stainless, carbon steel and aircraft-grade aluminium chosen per application.',
        specs: [{ label: 'ALLOYS', value: 'SS · CARBON · 6061-T6' }, { label: 'STANDARD', value: 'APPLICATION-MATCHED' }],
      },
      {
        id: 'why-card-3', eyebrow: 'QC · 03', title: '100% Quality Control',
        description: 'Every batch inspected and stress-tested before it leaves the line.',
        specs: [{ label: 'SYSTEM', value: 'ISO 9001:2015' }, { label: 'TESTING', value: 'LOAD · FLEX · FINISH' }],
      },
      {
        id: 'why-card-4', eyebrow: 'R&D · 04', title: 'In-House R&D',
        description: 'A dedicated R&D centre turning trade feedback into better tools, faster.',
        specs: [{ label: 'PROCESS', value: 'PROTOTYPE → PRODUCTION' }, { label: 'INPUT', value: 'FIELD-DRIVEN DESIGN' }],
      },
    ],
    revisions: [{ id: 'hs4-rev1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs4-rev2', versionLabel: 'v2', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'WHY DEKOR', title: 'Zanaatkarlar için mühendislik.', subtitle: '', description: 'Malzeme kalitesi, test süreçleri ve saha dayanıklılığı vurgulanan üç sütunlu içerik bloğu.' } }, { id: 'hs4-rev3', versionLabel: 'v3', author: 'Selin Arslan', date: '2026-06-30', changeSummary: 'Gerçek dört kart içeriği eklendi (Forge/Mat/QC/R&D) — önceki tek bloklu açıklama, sitedeki dört ayrı kartı yansıtmıyordu.' }],
  },
  {
    id: 'hs4', name: 'Üretim Bölümü', type: 'Manufacturing', order: 5, visible: true, lastEdited: '2026-06-27',
    eyebrow: 'M-03 · FACILITY', title: 'From Raw Steel to Precision.', subtitle: 'Gebze üretim tesisi', description: '21.000 m² kapalı alan, 8 kontrollü üretim aşaması.',
    buttons: [{ label: 'Üretimi İncele', href: '/uretim', style: 'birincil' }], mediaType: 'video', mediaName: 'uretim-tesisi-drone.mp4', backgroundColor: '#0E0F11', overlay: true, overlayOpacity: 55,
    animation: 'buyutme', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Mert Doğan', revisions: [{ id: 'hs5-rev1', versionLabel: 'v1', author: 'Mert Doğan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs5-rev2', versionLabel: 'v2', author: 'Mert Doğan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'M-03 · FACILITY', title: 'From Raw Steel to Precision.', subtitle: 'Gebze üretim tesisi', description: '21.000 m² kapalı alan, 8 kontrollü üretim aşaması.' } }],
  },
  {
    id: 'hs5', name: 'İhracat — İnteraktif Dünya Haritası', type: 'Export Map', order: 6, visible: true, lastEdited: '2026-06-27',
    eyebrow: 'GLOBAL DISTRIBUTION NETWORK', title: 'İstanbul to 60 countries.', subtitle: 'İnteraktif bayi ve ihracat haritası', description: 'Bölge bazlı bayi yoğunluğunu gösteren SVG dünya haritası — Bayi Yönetimi verisiyle senkronize. Harita üzerindeki bölge kartları İhracat Sayfası ile aynı bayi verisini kullanır.',
    buttons: [{ label: 'Bayi Ol', href: '/bayi-ol', style: 'birincil' }], mediaType: 'gorsel', mediaName: 'dunya-haritasi.svg', backgroundColor: '#16181B', overlay: false, overlayOpacity: 0,
    animation: 'solma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    stats: [
      { label: 'COUNTRIES', value: '60+' },
      { label: 'CONTINENTS', value: '4' },
      { label: 'PRODUCT LINES', value: '400+' },
      { label: 'ESTABLISHED', value: '1964' },
      { label: 'DEALER NETWORK', value: 'Global' },
      { label: "INT'L STANDARD", value: 'ISO 9001' },
    ],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Elif Kaya', revisions: [{ id: 'hs6-rev1', versionLabel: 'v1', author: 'Elif Kaya', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs6-rev2', versionLabel: 'v2', author: 'Elif Kaya', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'EXPORT NETWORK', title: '60+ Countries.', subtitle: 'İnteraktif bayi ve ihracat haritası', description: 'Bölge bazlı bayi yoğunluğunu gösteren SVG dünya haritası — Bayi Yönetimi verisiyle senkronize.' } }, { id: 'hs6-rev3', versionLabel: 'v3', author: 'Elif Kaya', date: '2026-06-30', changeSummary: 'Gerçek 6 küresel metrik eklendi (Countries/Continents/Product Lines/Established/Dealer Network/ISO 9001).' }],
  },
  {
    id: 'hs6', name: 'Sorumluluk — Dekor Burs Programı', type: 'Responsibility', order: 7, visible: true, lastEdited: '2026-05-30',
    eyebrow: 'SOCIAL RESPONSIBILITY', title: "We don't only make tools. We make professionals.", subtitle: 'Dekor Burs Programı',
    description: '1964\'te iki kardeş ve bir zanaatla başladık. Dekor Burs Programı ile gençleri eğitime ve nitelikli mesleklere yönlendiriyor, aletlerimizin üretildiği toplumlara yatırım yapıyoruz.',
    buttons: [{ label: 'Discover Our Scholarship Program →', href: '#contact', style: 'birincil' }], mediaType: 'gorsel', mediaName: 'burs-programi-2026.avif', backgroundColor: '#0E0F11', overlay: true, overlayOpacity: 30,
    animation: 'solma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    cards: [
      { id: 'resp-card-1', eyebrow: 'PRG-01', title: 'Education Programs', description: 'Scholarships and mentoring that open doors to learning.' },
      { id: 'resp-card-2', eyebrow: 'PRG-02', title: 'Vocational Training', description: 'Hands-on skills training for the building trades.' },
      { id: 'resp-card-3', eyebrow: 'PRG-03', title: 'Community Investment', description: 'Long-term support for the communities we build in.' },
      { id: 'resp-card-4', eyebrow: 'PRG-04', title: 'Future Craftsmen', description: 'Backing the next generation of master tradespeople.' },
    ],
    responsiveHidden: ['mobil'], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Selin Arslan', revisions: [{ id: 'hs7-rev1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs7-rev2', versionLabel: 'v2', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'RESPONSIBILITY · PROGRAM-01', title: 'Future Craftsmen.', subtitle: 'Dekor Burs Programı', description: 'Meslek lisesi öğrencilerine yönelik burs ve staj programı tanıtımı.' } }, { id: 'hs7-rev3', versionLabel: 'v3', author: 'Selin Arslan', date: '2026-06-30', changeSummary: 'Gerçek 4 program kartı eklendi; buton önceden var olmayan /sorumluluk sayfasına gidiyordu, gerçek #contact bağlantısıyla değiştirildi.' }],
  },
  {
    id: 'hs7', name: 'Bayi Bölgesi — Bayi Toplantısı', type: 'Dealers', order: 8, visible: true, lastEdited: '2026-06-14',
    eyebrow: 'DEALER PARTNERSHIP', title: 'Grow with Dekor.', subtitle: '', description: '60 ülkeyi kapsayan global bir ağa katılın — rekabetçi bayi fiyatlandırması, güvenilir teslim süreleri, private-label seçenekleri ve tam pazarlama desteği.',
    buttons: [
      { label: 'Apply for Dealership →', href: '/bayi-ol', style: 'birincil' },
      { label: 'Download Catalog', href: '/destek', style: 'ikincil' },
    ],
    mediaType: 'gorsel', mediaName: 'bayi-toplantisi-2026.avif', backgroundColor: '#16181B', overlay: false, overlayOpacity: 0,
    animation: 'kaydirma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    stats: [
      { label: 'COUNTRIES', value: '60' },
      { label: 'PRODUCTS', value: '400+' },
      { label: 'YEARS', value: '60' },
      { label: 'EXPORT TEAM', value: 'Dedicated' },
    ],
    cards: [
      { id: 'dealer-card-1', eyebrow: 'PARTNER-01', title: 'Trade Pricing', description: 'Volume-based margins built for resale growth.' },
      { id: 'dealer-card-2', eyebrow: 'PARTNER-02', title: 'Fast Lead Times', description: 'Advanced B2B logistics and dependable supply.' },
      { id: 'dealer-card-3', eyebrow: 'PARTNER-03', title: 'Private Label', description: 'OEM and white-label tools to your specification.' },
      { id: 'dealer-card-4', eyebrow: 'PARTNER-04', title: 'Marketing Support', description: 'Catalogues, assets and full brand backing.' },
    ],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Mert Doğan', revisions: [{ id: 'hs8-rev1', versionLabel: 'v1', author: 'Mert Doğan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs8-rev2', versionLabel: 'v2', author: 'Mert Doğan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'DEALER NETWORK', title: 'Bayilerimizle Büyüyoruz.', subtitle: '', description: 'Bölgesel bayi vitrini ve yıllık bayi toplantısı görseli.' } }, { id: 'hs8-rev3', versionLabel: 'v3', author: 'Mert Doğan', date: '2026-06-30', changeSummary: 'Gerçek buton, istatistik ve ortaklık kartları eklendi — önceki sürüm sitedeki ikinci butonu, 4 istatistiği ve 4 partner kartını hiç göstermiyordu.' }],
  },
  {
    id: 'hs8', name: 'Müşteri Güveni — Sertifikalar', type: 'Certificates', order: 9, visible: true, lastEdited: '2026-06-15',
    eyebrow: 'CUSTOMER CONFIDENCE', title: 'Certified. Tested. Trusted.', subtitle: 'VERIFIED', description: 'Sertifikalar modülünden otomatik çekilen ISO/CE rozetleri — "Ana Sayfada Göster" işaretli olanlar listelenir.',
    buttons: [{ label: 'Tüm Sertifikalar', href: '/sertifikalar', style: 'metin' }], mediaType: 'gorsel', mediaName: 'sertifika rozetleri (dinamik)', backgroundColor: '#0E0F11', overlay: false, overlayOpacity: 0,
    animation: 'solma', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: true }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Elif Kaya', revisions: [{ id: 'hs9-rev1', versionLabel: 'v1', author: 'Elif Kaya', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs9-rev2', versionLabel: 'v2', author: 'Elif Kaya', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'CUSTOMER CONFIDENCE', title: 'Certified. Tested. Trusted.', subtitle: 'VERIFIED', description: 'Sertifikalar modülünden otomatik çekilen ISO/CE rozetleri — "Ana Sayfada Göster" işaretli olanlar listelenir.' } }],
  },
  {
    id: 'hs9', name: 'Destek Merkezi — SSS', type: 'Support', order: 10, visible: true, lastEdited: '2026-06-08',
    eyebrow: 'SUPPORT CENTER', title: 'Need help?', subtitle: '', description: 'Teknik doküman, ürün sertifikası, bayi kaynakları ve SSS bağlantıları.',
    buttons: [{ label: 'Destek Merkezi', href: '/destek', style: 'ikincil' }], mediaType: 'yok', mediaName: '', backgroundColor: '#F4F5F6', overlay: false, overlayOpacity: 0,
    animation: 'yok', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Selin Arslan', revisions: [{ id: 'hs10-rev1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs10-rev2', versionLabel: 'v2', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: 'SUPPORT CENTER', title: 'Need help?', subtitle: '', description: 'Teknik doküman, ürün sertifikası, bayi kaynakları ve SSS bağlantıları.' } }],
  },
  {
    id: 'hs10', name: 'Kapanış CTA — İletişim', type: 'CTA', order: 11, visible: true, lastEdited: '2026-06-12',
    eyebrow: '', title: "Let's build something durable.", subtitle: '', description: 'Sayfanın son dönüşüm bandı — bayilik ve iletişim formuna yönlendirir.',
    buttons: [{ label: 'Bize Ulaşın', href: '/iletisim', style: 'birincil' }, { label: 'Bayi Ol', href: '/bayi-ol', style: 'ikincil' }],
    mediaType: 'yok', mediaName: '', backgroundColor: '#0E0F11', overlay: false, overlayOpacity: 0,
    animation: 'buyutme', seoNote: '', languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    responsiveHidden: [], publicationStatus: 'yayinda', publishStatus: 'yayinda', scheduledAt: null, lastPublishedAt: '2026-06-27', modifiedBy: 'Mert Doğan', revisions: [{ id: 'hs11-rev1', versionLabel: 'v1', author: 'Mert Doğan', date: '2026-06-01', changeSummary: 'İlk yayın sürümü.' }, { id: 'hs11-rev2', versionLabel: 'v2', author: 'Mert Doğan', date: '2026-06-20', changeSummary: 'İçerik ve görsel güncellemesi.', snapshot: { eyebrow: '', title: "Let's build something durable.", subtitle: '', description: 'Sayfanın son dönüşüm bandı — bayilik ve iletişim formuna yönlendirir.' } }],
  },
];

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

export const footerColumns: FooterColumn[] = [
  { id: 'fc1', title: 'Ürünler', links: [{ label: 'Boya Ekipmanları', href: '/urunler/boya' }, { label: 'Sıva & Alçı', href: '/urunler/siva-alci' }, { label: 'Tüm Ürünler', href: '/urunler' }] },
  { id: 'fc2', title: 'Şirket', links: [{ label: 'Hakkımızda', href: '/hakkimizda' }, { label: 'Üretim', href: '/uretim' }, { label: 'Kariyer', href: '/kariyer' }] },
  { id: 'fc3', title: 'Destek', links: [{ label: 'İletişim', href: '/iletisim' }, { label: 'Sertifikalar', href: '/sertifikalar' }, { label: 'İndirilenler', href: '/dosya-merkezi' }] },
  { id: 'fc4', title: 'Bayilik', links: [{ label: 'Bayi Ol', href: '/bayi-ol' }, { label: 'Bayi Portalı', href: '/bayi-portali' }] },
];

export const footerSocial: { platform: string; url: string }[] = [
  { platform: 'LinkedIn', url: 'https://linkedin.com/company/dekortools' },
  { platform: 'Instagram', url: 'https://instagram.com/dekortools' },
  { platform: 'YouTube', url: 'https://youtube.com/@dekortools' },
];

export const footerContact = {
  address: 'Çayırova OSB, Kocaeli, Türkiye',
  phone: '+90 (262) 658 30 10',
  email: 'export@dekortools.com',
  copyright: '© 2026 Dekor Tools — Hasdemir Kardeşler. Tüm hakları saklıdır.',
  newsletterEnabled: true,
};

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  external: boolean;
  order: number;
  visible?: boolean;
  children?: NavMenuItem[];
}

export const navigationMenu: NavMenuItem[] = [
  { id: 'nm1', label: 'Ürünler', href: '/urunler', icon: 'Package', external: false, order: 1, children: [
    { id: 'nm1-1', label: 'Boya Ekipmanları', href: '/urunler/boya', icon: null, external: false, order: 1 },
    { id: 'nm1-2', label: 'Sıva & Alçı', href: '/urunler/siva-alci', icon: null, external: false, order: 2 },
  ] },
  { id: 'nm2', label: 'Üretim', href: '/uretim', icon: 'Factory', external: false, order: 2 },
  { id: 'nm3', label: 'İhracat', href: '/ihracat', icon: 'Globe2', external: false, order: 3 },
  { id: 'nm4', label: 'Bayi Portalı', href: 'https://portal.dekortools.com', icon: 'ExternalLink', external: true, order: 4 },
  { id: 'nm5', label: 'İletişim', href: '/iletisim', icon: 'Mail', external: false, order: 5 },
];

export interface SectionTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
}

export const sectionTemplates: SectionTemplate[] = [
  { id: 'st1', name: 'Hero — Görsel + Başlık', category: 'Giriş', description: 'Tam genişlik arka plan görseli/videosu, başlık ve CTA butonları.', usageCount: 3 },
  { id: 'st2', name: 'İstatistik Şeridi', category: 'İçerik', description: 'Yatay sayaç grubu (yıl, ülke, ürün sayısı vb.).', usageCount: 2 },
  { id: 'st3', name: 'Ürün Vitrini', category: 'Ürün', description: 'Öne çıkan ürünleri kart grid olarak gösterir.', usageCount: 4 },
  { id: 'st4', name: 'İnteraktif Harita', category: 'İhracat', description: 'Ülke bazlı bayi/ihracat dağılımını gösteren harita.', usageCount: 1 },
  { id: 'st5', name: 'Sertifika Şeridi', category: 'Güven', description: 'Yatay kayan sertifika logoları.', usageCount: 3 },
  { id: 'st6', name: 'CTA Banner', category: 'Dönüşüm', description: 'Tek satır başlık + buton içeren dar bant.', usageCount: 6 },
];

export interface GlobalComponent {
  id: string;
  name: string;
  type: 'CTA Bloğu' | 'Banner' | 'Form' | 'Kart';
  usageCount: number;
  updatedAt: string;
}

export const globalComponents: GlobalComponent[] = [
  { id: 'gc1', name: 'Bayi Ol CTA', type: 'CTA Bloğu', usageCount: 5, updatedAt: '2026-06-12' },
  { id: 'gc2', name: 'Katalog İndir Banner', type: 'Banner', usageCount: 8, updatedAt: '2026-06-15' },
  { id: 'gc3', name: 'İletişim Formu', type: 'Form', usageCount: 3, updatedAt: '2026-06-05' },
  { id: 'gc4', name: 'Bayilik Başvuru Formu', type: 'Form', usageCount: 2, updatedAt: '2026-06-01' },
  { id: 'gc5', name: 'Ürün Kartı', type: 'Kart', usageCount: 248, updatedAt: '2026-06-30' },
  { id: 'gc6', name: 'Sertifika Kartı', type: 'Kart', usageCount: 6, updatedAt: '2026-05-22' },
  { id: 'gc7', name: 'Çerez Bildirimi Banner', type: 'Banner', usageCount: 1, updatedAt: '2026-04-10' },
];

/* ------------------------------------------------------------------ */
/* PER-PAGE SECTION BUILDERS — Manufacturing, About, Export, Dealer.    */
/* Same HomepageSection shape reused everywhere via SectionListEditor.  */
/* Content grounded in the real project/*.dc.html section order.       */
/* ------------------------------------------------------------------ */

function makeSection(overrides: Partial<HomepageSection> & Pick<HomepageSection, 'id' | 'name' | 'type' | 'order' | 'title'>): HomepageSection {
  return {
    visible: true,
    lastEdited: '2026-06-20',
    eyebrow: '',
    subtitle: '',
    description: '',
    buttons: [],
    mediaType: 'yok',
    mediaName: '',
    backgroundColor: '#0E0F11',
    overlay: false,
    overlayOpacity: 0,
    animation: 'solma',
    seoNote: '',
    languages: [{ code: 'TR', complete: true }, { code: 'EN', complete: true }, { code: 'DE', complete: false }],
    responsiveHidden: [],
    publicationStatus: 'yayinda',
    publishStatus: 'yayinda',
    scheduledAt: null,
    lastPublishedAt: '2026-06-20',
    modifiedBy: 'Selin Arslan',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
    ],
    ...overrides,
  };
}

/** Mirrors project/Decor Manufacturing.dc.html's real section order. */
export const manufacturingSections: HomepageSection[] = [
  makeSection({
    id: 'mfg1', name: 'Hero — From Raw Steel to Precision', type: 'Hero', order: 1, title: 'From Raw Steel to Professional Precision.',
    eyebrow: 'VERTICALLY-INTEGRATED · 21,000 M²',
    description: 'Eight controlled stages. One roof. Every Dekor tool is engineered, formed, machined and inspected in our İstanbul-region facility — this is the full documentary of how a professional tool earns the trade\'s trust.',
    mediaType: 'video', mediaName: 'fabrika-hatti-02.avif', overlay: true, overlayOpacity: 45, animation: 'kaydirma',
    stats: [
      { label: 'YEARS', value: '60' },
      { label: 'M² FACILITY', value: '21,000' },
      { label: 'PRODUCTS', value: '400+' },
      { label: 'STAGES', value: '8' },
    ],
  }),
  makeSection({
    id: 'mfg2', name: 'Süreç — Follow a tool down the line', type: 'Process', order: 2, title: 'Follow a tool down the line.',
    eyebrow: 'THE PRODUCTION JOURNEY · 8 STAGES',
    description: '8 aşamalı üretim sürecini adım adım gösteren dikey zaman çizelgesi (mfg-spine). Her kart teknik etiket (kod, ölçü) ve varsa öne çıkan bir istatistik içerir.',
    backgroundColor: '#0E0F11',
    cards: [
      { id: 'mfg2-c1', eyebrow: 'MAT-01', title: 'Raw Materials', description: 'Certified steel, alloys and hardwoods are sourced and lab-verified before a single tool is formed — quality begins long before the line.', specs: [{ label: 'TAG 1', value: 'FORGED STEEL' }, { label: 'TAG 2', value: 'MATERIAL SCIENCE' }] },
      { id: 'mfg2-c2', eyebrow: 'FRG-02', title: 'Forging', description: 'High-tonnage presses and controlled heat give every blade and body its grain structure, density and raw mechanical strength.', specs: [{ label: 'TAG 1', value: 'HEAT TREATMENT' }, { label: 'TAG 2', value: 'HARDNESS HRC' }] },
      { id: 'mfg2-c3', eyebrow: 'CNC-03', title: 'CNC Machining', description: 'Multi-axis CNC centres cut edges, profiles and threads to engineering tolerances no hand process could repeat.', specs: [{ label: 'TAG 1', value: '±0.05MM TOLERANCE' }, { label: 'TAG 2', value: '5-AXIS CNC' }] },
      { id: 'mfg2-c4', eyebrow: 'GRD-04', title: 'Grinding', description: 'Precision grinding refines every cutting edge and working face to a consistent, repeatable geometry.', specs: [{ label: 'TAG 1', value: 'PRECISION GROUND' }, { label: 'TAG 2', value: 'EDGE GEOMETRY' }] },
      { id: 'mfg2-c5', eyebrow: 'SUR-05', title: 'Surface Treatment', description: 'Plating, coating and finishing deliver corrosion resistance, grip and the premium feel professionals recognise instantly.', specs: [{ label: 'TAG 1', value: 'ANTI-CORROSION' }, { label: 'TAG 2', value: 'SURFACE FINISH' }] },
      { id: 'mfg2-c6', eyebrow: 'QC-06', title: 'Quality Control', description: 'Every batch is load-, flex- and finish-tested under an ISO 9001 system. Nothing ships until it has earned the Dekor mark.', specs: [{ label: 'TAG 1', value: 'ISO 9001' }, { label: 'TAG 2', value: '100% INSPECTED' }] },
      { id: 'mfg2-c7', eyebrow: 'PKG-07', title: 'Packaging', description: 'Tools are protected and presented in retail- and export-ready packaging built to survive global transit.', specs: [{ label: 'TAG 1', value: 'RETAIL READY' }, { label: 'TAG 2', value: 'EXPORT GRADE' }] },
      { id: 'mfg2-c8', eyebrow: 'DIST-08', title: 'Global Distribution', description: 'Advanced B2B logistics route finished tools to a dealer network spanning four continents and sixty countries.', specs: [{ label: 'TAG 1', value: 'B2B LOGISTICS' }, { label: 'TAG 2', value: '4 CONTINENTS' }] },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'mfg2-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-06', changeSummary: 'Gerçek Decor Manufacturing.dc.html sürecindeki 8 aşama (Raw Materials → Global Distribution) gerçek başlık/açıklama/etiketleriyle kart olarak eklendi — önceden hiç düzenlenemiyordu.' },
    ],
  }),
  makeSection({
    id: 'mfg3', name: 'Belgesel Görsel — The Factory Floor', type: 'Documentary Intro', order: 3, title: 'The Factory Floor.',
    eyebrow: 'FACILITY-01',
    description: 'We never set out to build a company. We set out to build a better tool — and refused to stop. Six decades later, that obsession is a measurable process.',
    backgroundColor: '#0E0F11', mediaType: 'gorsel', mediaName: '',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'mfg3-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-06', changeSummary: 'Bu bölüm gerçekte "Belgesel Fotoğrafçılık" değil, hero altındaki kısa belgesel giriş paneliydi ("THE FACTORY FLOOR" / FACILITY-01 + alıntı metin) — gerçek içerikle eşitlendi, yanlış görsel referansı kaldırıldı.' },
    ],
  }),
  makeSection({
    id: 'mfg4', name: 'Tesis Rakamları', type: 'Statistics', order: 4, title: 'The Facility in Numbers',
    eyebrow: 'THE FACILITY IN NUMBERS',
    description: '21.000 m² kapalı alan, 8 üretim aşaması, günlük kapasite.', backgroundColor: '#F4F5F6',
    stats: [
      { label: 'M² UNDER ONE ROOF', value: '21,000' },
      { label: 'CONTROLLED STAGES', value: '8' },
      { label: 'PRODUCT LINES', value: '400+' },
      { label: 'YEARS OF KNOW-HOW', value: '60' },
      { label: 'BATCH INSPECTION', value: '100%' },
      { label: 'EXPORT COUNTRIES', value: '60' },
    ],
  }),
  makeSection({
    id: 'mfg5', name: 'Sertifikalar — Certified at every stage', type: 'Certifications', order: 5, title: 'Certified at every stage.',
    eyebrow: 'QUALITY & COMPLIANCE',
    description: 'Beş uygunluk sertifikası — rozet (mark), sertifika adı ve alt etiketiyle. Sertifikalar Yönetimi ile senkron tutulmalı.',
    backgroundColor: '#FFFFFF',
    cards: [
      { id: 'mfg5-c1', eyebrow: 'ISO', title: 'ISO 9001:2015', description: 'QUALITY MGMT' },
      { id: 'mfg5-c2', eyebrow: '14K', title: 'ISO 14001', description: 'ENVIRONMENTAL' },
      { id: 'mfg5-c3', eyebrow: 'CE', title: 'CE Marking', description: 'EU CONFORMITY' },
      { id: 'mfg5-c4', eyebrow: 'TSE', title: 'TSE Certified', description: 'TÜRK STANDARDLARI' },
      { id: 'mfg5-c5', eyebrow: 'R', title: 'REACH', description: 'EU CHEMICAL SAFETY' },
    ],
  }),
  makeSection({
    id: 'mfg6', name: 'Üretim Felsefesi', type: 'Philosophy', order: 6, title: "We don't build tools to a price. We build them to a standard.",
    eyebrow: 'MANUFACTURING PHILOSOPHY',
    description: 'Vertical integration means we control every variable — from the grain of the steel to the torque of the final rivet. Nothing is outsourced to chance. That control is why a Dekor tool feels right in the hand and lasts on the jobsite.',
    backgroundColor: '#0E0F11',
  }),
  makeSection({
    id: 'mfg7', name: 'Kapanış CTA — See it for yourself', type: 'CTA', order: 7, title: 'See it for yourself.',
    description: 'Explore the products this process delivers, or partner with us to bring Dekor to your market.',
    buttons: [{ label: 'Explore Products', href: '/urunler', style: 'birincil' }, { label: 'Become a Dealer', href: '/bayi-ol', style: 'ikincil' }],
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'mfg7-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-06', changeSummary: 'Eksik açıklama metni gerçek içerikle eklendi.' },
    ],
  }),
];

/** Mirrors project/Decor About.dc.html + linked Our Story / Vision Mission / RD Center pages. */
/**
 * Mirrors project/Decor About.dc.html — the About LANDING / chapter-hub page only
 * (/hakkimizda). Per project/CLAUDE.md, About is a real 5-page family (this hub +
 * Our Story + Vision & Mission + R&D Center + Quality & Sustainability, each its
 * own .dc.html file/route) — those 4 sub-pages are out of this module's scope
 * (not yet registered in websitePages, same status as B2B Portal). The previous
 * version of this array incorrectly compressed all 5 pages' content into one
 * 8-section list; rewritten to match only the real landing page's 6 sections.
 */
export const aboutSections: HomepageSection[] = [
  makeSection({
    id: 'ab1', name: 'Hero — A company built by hand', type: 'Hero', order: 1, title: 'A company built by hand.',
    eyebrow: 'DOC · ABOUT / 00',
    description: "What began as two brothers forging their own tools in an İstanbul basement is now Türkiye's largest manufacturer of professional construction hand tools — engineered, tested and exported from Gebze to 60 countries.",
    overlay: true, overlayOpacity: 35,
    stats: [
      { label: 'FOUNDED', value: '1964' },
      { label: 'COUNTRIES', value: '60' },
      { label: 'PRODUCTS', value: '400+' },
      { label: 'IN TÜRKİYE', value: '#1' },
    ],
  }),
  makeSection({
    id: 'ab2', name: 'Giriş & Bölümler — The Company', type: 'Chapters', order: 2, title: 'More than a manufacturer — a sixty-year discipline.',
    eyebrow: 'THE COMPANY',
    description: 'Dekor is a second-generation Turkish manufacturer of professional construction hand tools and part of the integrated Hassan Group. Every chapter below tells one part of how a single tool, made by hand in 1964, became an engineering company serving four continents.',
    backgroundColor: '#FFFFFF',
    cards: [
      { id: 'ab2-c1', eyebrow: 'DOC-A1', title: 'Our Story', description: 'Six decades from an İstanbul basement to a 21,000 m² factory — told as an animated timeline of milestones.' },
      { id: 'ab2-c2', eyebrow: 'DOC-A2', title: 'Vision & Mission', description: 'What drives Dekor forward: the promise we make to every tradesperson who picks up our tools.' },
      { id: 'ab2-c3', eyebrow: 'DOC-A3', title: 'R&D Center', description: 'Research → Prototype → Testing → Production. How a jobsite problem becomes a finished professional tool.' },
      { id: 'ab2-c4', eyebrow: 'DOC-A4', title: 'Quality & Sustainability', description: 'Certifications, manufacturing standards and a responsibility to people, trade and planet.' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ab2-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek Decor About.dc.html içeriğiyle eşitlendi: 4 gerçek bölüm kartı (Our Story/Vision & Mission/R&D Center/Quality & Sustainability) eklendi — önceden bu 4 alt sayfanın içeriği yanlışlıkla tek sayfaya sıkıştırılmıştı.' },
    ],
  }),
  makeSection({
    id: 'ab3', name: 'Rakamlarla Dekor', type: 'Statistics', order: 3, title: 'Dekor Today · By the Numbers',
    eyebrow: 'DEKOR TODAY · BY THE NUMBERS',
    description: 'Şirketin altı temel rakamı.', backgroundColor: '#F4F5F6',
    stats: [
      { label: 'YEARS OF MASTERY', value: '60' },
      { label: 'PRODUCT LINES', value: '400+' },
      { label: 'COUNTRIES SERVED', value: '60' },
      { label: 'M² PRODUCTION FLOOR', value: '21,000' },
      { label: 'CONTINENTS', value: '4' },
      { label: 'IN TÜRKİYE', value: '#1' },
    ],
  }),
  makeSection({
    id: 'ab4', name: 'Değerlerimiz', type: 'Values', order: 4, title: 'Values forged on the jobsite.',
    eyebrow: 'WHAT WE STAND FOR',
    description: 'Dört temel değer kartı.', backgroundColor: '#FFFFFF',
    cards: [
      { id: 'ab4-c1', eyebrow: '01', title: 'Engineering First', description: 'Every tool starts with the trade problem it solves, refined in our R&D centre.' },
      { id: 'ab4-c2', eyebrow: '02', title: 'Built to Last', description: 'Forged steel, real testing and honest materials — durability is non-negotiable.' },
      { id: 'ab4-c3', eyebrow: '03', title: 'People & Community', description: 'We invest in education and skilled trades through our scholarship program.' },
      { id: 'ab4-c4', eyebrow: '04', title: 'Global, Grounded', description: 'Serving 60 countries while staying rooted in the İstanbul workshop we came from.' },
    ],
  }),
  makeSection({
    id: 'ab5', name: 'Alıntı — Founding Story', type: 'Quote', order: 5,
    title: 'We never set out to build a company. We set out to build a better tool — and refused to stop.',
    eyebrow: 'THE DEKOR FOUNDING STORY',
    description: 'Merkezi büyük alıntı — kurucu hikayesi.', backgroundColor: '#16181B',
  }),
  makeSection({
    id: 'ab6', name: 'Kapanış CTA — Build with Dekor', type: 'CTA', order: 6, title: 'Build with Dekor.',
    buttons: [{ label: 'Become a Dealer', href: '/bayi-ol', style: 'birincil' }, { label: 'Explore Products', href: '/urunler', style: 'ikincil' }],
    animation: 'buyutme',
  }),
];

/**
 * Mirrors project/Decor Export.dc.html's real 9 data-screen-label sections
 * (Export Hero, Global Presence, Export Numbers, Why Dekor, Export Process,
 * Export Documents, OEM Private Label, Logistics, Export Stories, Export CTA
 * — Hero and Global Presence were previously conflated into one section).
 * The interactive world map's per-country data is intentionally NOT
 * duplicated here — it already has a real single source of truth in
 * `exportMapCountries` above, shared with the Home export section.
 */
export const exportSections: HomepageSection[] = [
  makeSection({
    id: 'ex1', name: 'Hero — Built for Global Markets', type: 'Hero', order: 1, title: 'Built for Global Markets.',
    eyebrow: 'INTERNATIONAL · EST. 1964',
    description: 'From a 21,000 m² facility near İstanbul, Dekor manufactures professional hand tools for distributors across four continents — engineered, certified and shipped as a long-term manufacturing partner, not just a supplier.',
    buttons: [
      { label: 'Become a Distributor →', href: '/bayi-ol', style: 'birincil' },
      { label: 'Contact Export Team', href: '/iletisim', style: 'ikincil' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ex1-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek Export Hero içeriğiyle eşitlendi (önceden bu bölüm "Global Presence" bölümüyle karışmıştı) — gerçek başlık, açıklama ve 2 gerçek buton eklendi.' },
    ],
  }),
  makeSection({
    id: 'ex2', name: 'Global Presence — Dünya Haritası', type: 'World Map', order: 2, title: 'One network. Four continents.',
    eyebrow: 'GLOBAL PRESENCE',
    description: 'İnteraktif dağıtıcı haritası (hover-to-select) ve seçili ülkenin detay paneli — ülke verisi Bayi Yönetimi/exportMapCountries kaynağından canlı gelir.',
    backgroundColor: '#0B0C0E',
    stats: [
      { label: 'EXPORT MARKETS', value: '60+' },
      { label: 'PLOTTED HERE', value: '12' },
    ],
  }),
  makeSection({
    id: 'ex3', name: 'İhracat Rakamları', type: 'Export Numbers', order: 3, title: 'The scale behind the partnership.',
    eyebrow: 'EXPORT NUMBERS',
    description: '4 KPI sayaç ve 3 uygunluk rozeti (credential chip).', backgroundColor: '#F4F5F6',
    stats: [
      { label: 'COUNTRIES', value: '60+' },
      { label: 'PRODUCTS', value: '400+' },
      { label: 'PRODUCTION', value: '21,000 m²' },
      { label: 'CONTINENTS', value: '4' },
      { label: 'CREDENTIAL', value: 'ISO 9001 CERTIFIED' },
      { label: 'CREDENTIAL', value: 'OEM AVAILABLE' },
      { label: 'CREDENTIAL', value: 'PRIVATE LABEL READY' },
    ],
  }),
  makeSection({
    id: 'ex4', name: 'Neden Dekor', type: 'Why Dekor', order: 4, title: 'A manufacturing partner, not a vendor.',
    eyebrow: 'WHY DEKOR', backgroundColor: '#0E0F11',
    description: '8 değer önermesi kartı — ihracat ortakları için.',
    cards: [
      { id: 'ex4-c1', eyebrow: 'WHY · CAPACITY', title: 'Stable Manufacturing', description: 'A 21,000 m² vertically-integrated facility keeps supply consistent and lead times reliable.' },
      { id: 'ex4-c2', eyebrow: 'WHY · R&D', title: 'Engineering Quality', description: 'Every tool is designed, tested and proven in our own R&D centre before it ships.' },
      { id: 'ex4-c3', eyebrow: 'WHY · BRANDING', title: 'Private Label', description: 'Your brand on our manufacturing — fully private-label ready across the range.' },
      { id: 'ex4-c4', eyebrow: 'WHY · OEM', title: 'OEM Production', description: 'Custom tooling and specifications manufactured to partner requirements.' },
      { id: 'ex4-c5', eyebrow: 'WHY · SUPPORT', title: 'Marketing Support', description: 'Catalogues, brand assets and point-of-sale to help you grow the market.' },
      { id: 'ex4-c6', eyebrow: 'WHY · SHIPPING', title: 'Fast Logistics', description: 'Coordinated sea, road and air freight reaching four continents.' },
      { id: 'ex4-c7', eyebrow: 'WHY · EXPERIENCE', title: 'International Experience', description: 'Six decades and 60+ markets of hands-on export know-how.' },
      { id: 'ex4-c8', eyebrow: 'WHY · TEAM', title: 'Dedicated Export Team', description: 'A specialist team that understands your market and speaks its language.' },
    ],
  }),
  makeSection({
    id: 'ex5', name: 'İhracat Süreci', type: 'Export Process', order: 5, title: 'From inquiry to partnership.',
    eyebrow: 'EXPORT PROCESS', backgroundColor: '#FFFFFF',
    description: '8 adımlı sipariş → üretim → sevkiyat süreci.',
    cards: [
      { id: 'ex5-c1', eyebrow: '01', title: 'Inquiry', description: 'You reach out with your market, range and volumes.' },
      { id: 'ex5-c2', eyebrow: '02', title: 'Quotation', description: 'A clear, itemised export quotation tailored to you.' },
      { id: 'ex5-c3', eyebrow: '03', title: 'Sampling', description: 'Physical samples to validate quality and fit.' },
      { id: 'ex5-c4', eyebrow: '04', title: 'Production', description: 'Scheduled manufacturing in our İstanbul facility.' },
      { id: 'ex5-c5', eyebrow: '05', title: 'Quality Control', description: 'Every batch inspected before it leaves the line.' },
      { id: 'ex5-c6', eyebrow: '06', title: 'Shipping', description: 'Sea, road or air freight, fully documented.' },
      { id: 'ex5-c7', eyebrow: '07', title: 'Delivery', description: 'Goods arrive at your port or warehouse on schedule.' },
      { id: 'ex5-c8', eyebrow: '08', title: 'Long-Term Partnership', description: 'Ongoing supply, support and shared market growth.' },
    ],
  }),
  makeSection({
    id: 'ex6', name: 'İhracat Belgeleri', type: 'Export Documents', order: 6, title: 'Everything you need to start.',
    eyebrow: 'EXPORT DOCUMENTS', backgroundColor: '#0E0F11',
    description: 'Gümrük ve uygunluk belgeleri — Dosya Merkezi ile senkronize.',
    cards: [
      { id: 'ex6-c1', eyebrow: 'PDF', title: 'Export Catalogue', description: '24.0 MB' },
      { id: 'ex6-c2', eyebrow: 'PDF', title: 'Company Profile', description: '6.4 MB' },
      { id: 'ex6-c3', eyebrow: 'ZIP', title: 'Certificates', description: '4.1 MB' },
      { id: 'ex6-c4', eyebrow: 'PDF', title: 'Declarations', description: '1.2 MB' },
      { id: 'ex6-c5', eyebrow: 'PDF', title: 'Packaging Specifications', description: '3.8 MB' },
      { id: 'ex6-c6', eyebrow: 'ZIP', title: 'Brand Assets', description: '58 MB' },
    ],
  }),
  makeSection({
    id: 'ex7', name: 'OEM / Private Label', type: 'OEM Private Label', order: 7, title: 'Your brand, our manufacturing.',
    eyebrow: 'OEM & PRIVATE LABEL', backgroundColor: '#F4F5F6',
    description: '4 gerçek hizmet kartı.',
    cards: [
      { id: 'ex7-c1', title: 'Private-Label Ready', description: 'Your logo, colourway and branding on proven Dekor tools.' },
      { id: 'ex7-c2', title: 'Custom Packaging', description: 'Blister, header card, box and display designed to your market.' },
      { id: 'ex7-c3', title: 'OEM Tooling', description: 'Bespoke geometry and specifications built to your brief.' },
      { id: 'ex7-c4', title: 'MOQ & Scheduling', description: 'Transparent minimums and planned, repeatable production runs.' },
    ],
  }),
  makeSection({
    id: 'ex8', name: 'Lojistik', type: 'Logistics', order: 8, title: 'Engineered to arrive on time.',
    eyebrow: 'LOGISTICS', backgroundColor: '#0E0F11',
    description: '6 lojistik/sevkiyat kartı.',
    cards: [
      { id: 'ex8-c1', eyebrow: 'MODE · SEA', title: 'Sea Freight', description: 'FCL & LCL container shipping from Turkish ports to the world.' },
      { id: 'ex8-c2', eyebrow: 'MODE · ROAD', title: 'Road Freight', description: 'Direct trucking across Europe, the Caucasus and the Middle East.' },
      { id: 'ex8-c3', eyebrow: 'MODE · AIR', title: 'Air Freight', description: 'Expedited air cargo for urgent orders and sample shipments.' },
      { id: 'ex8-c4', eyebrow: 'OPS · LOADING', title: 'Container Loading', description: 'Optimised palletisation for maximum container efficiency.' },
      { id: 'ex8-c5', eyebrow: 'OPS · LEAD-TIME', title: 'Lead Times', description: 'Reliable, planned production and dispatch schedules.' },
      { id: 'ex8-c6', eyebrow: 'NET · GLOBAL', title: 'Global Distribution', description: 'A coordinated network reaching customers on four continents.' },
    ],
  }),
  makeSection({
    id: 'ex9', name: 'İhracat Hikayeleri', type: 'Export Stories', order: 9, title: 'Partnerships, market by market.',
    eyebrow: 'EXPORT STORIES', backgroundColor: '#F4F5F6',
    description: '6 bayi başarı hikayesi — Bayi Yönetimi verisiyle bağlantılı.',
    cards: [
      { id: 'ex9-c1', eyebrow: 'GERMANY · EUROPE · SINCE 2009', title: 'A decade of trust in Germany', description: 'How a 2009 partnership grew into one of Dekor’s strongest European networks.' },
      { id: 'ex9-c2', eyebrow: 'UAE · MIDDLE EAST · TRADE SHOW', title: 'Dekor at Big 5 Dubai', description: 'Meeting partners from across the Gulf and Africa at the region’s largest construction fair.' },
      { id: 'ex9-c3', eyebrow: 'KAZAKHSTAN · CENTRAL ASIA · 2016', title: 'Opening the Central Asian market', description: 'New distribution brings professional tooling to a fast-growing region.' },
      { id: 'ex9-c4', eyebrow: 'ROMANIA · EUROPE · SINCE 2008', title: 'Fifteen years of partnership', description: 'A long-term relationship built on consistent supply and engineering support.' },
      { id: 'ex9-c5', eyebrow: 'TÜRKİYE · HQ · FACTORY VISIT', title: 'Distributors tour the Gebze facility', description: 'International partners walk the 21,000 m² line and meet the engineering team.' },
      { id: 'ex9-c6', eyebrow: 'GLOBAL · 2025', title: 'On the road: 2025 trade missions', description: 'From the Gulf to Central Asia — building relationships market by market.' },
    ],
  }),
  makeSection({
    id: 'ex10', name: 'Kapanış CTA — Export', type: 'CTA', order: 10, title: "Let's build your market together.",
    eyebrow: 'EXPORT · DEKOR TOOLS',
    description: 'Join a network of distributors who treat Dekor as their long-term manufacturing partner across four continents.',
    backgroundColor: '#D32027',
    buttons: [
      { label: 'Become an International Distributor →', href: '/bayi-ol', style: 'birincil' },
      { label: 'Contact Export Team', href: '/iletisim', style: 'ikincil' },
      { label: 'Download Export Catalogue', href: '/destek#downloads', style: 'ikincil' },
    ],
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ex10-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek başlık/açıklama ve 3 gerçek buton (2 buton eksikti) eklendi.' },
    ],
  }),
];

/** Mirrors project/Decor Authorized Dealers.dc.html + Home's dealer showcase block. */
/**
 * Mirrors project/Decor Authorized Dealers.dc.html — the real Turkish domestic
 * dealer-locator page (/yetkili-bayiler). The real page has only 2 sections
 * (a search/filter hero, then the dealer grid with an inline CTA button) — no
 * regional map, no separate "Partner Resources" block, and no standalone
 * closing CTA section; the previous 5-section version fabricated all three.
 * The dealer records themselves are NOT duplicated here — they come live
 * from Bayi Yönetimi's `dealers` array (entries with listedOnWebsite: true).
 */
export const dealerPageSections: HomepageSection[] = [
  makeSection({
    id: 'dl1', name: 'Hero — Dealer Locator', type: 'Hero', order: 1, title: 'Find an authorized Dekor partner.',
    eyebrow: 'DEALER LOCATOR',
    description: 'Locate official Dekor distributors across Türkiye — every partner verified, supported and stocked with genuine professional tools. Arama/filtre paneli (il, şehir, ürün kategorisi) sabit arayüz elemanıdır.',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-14', changeSummary: 'İlk yayın sürümü.' },
      { id: 'dl1-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek Decor Authorized Dealers.dc.html içeriğiyle eşitlendi — hayali "harita" ve istatistik iddiaları kaldırıldı, gerçek başlık/açıklama eklendi.' },
    ],
  }),
  makeSection({
    id: 'dl2', name: 'Bayi Ağı — Dealer Grid', type: 'Dealer Grid', order: 2, title: 'Distributor Network',
    eyebrow: 'DISTRIBUTOR NETWORK',
    description: 'Bayi kartları listesi Bayi Yönetimi\'nden ("listedOnWebsite" işaretli kayıtlar) canlı gelir — şehir, ürün kategorileri, partnerlik yılı ve dizin durumu (Premium Partner/Authorized) oradan düzenlenir.',
    backgroundColor: '#F4F5F6',
    buttons: [{ label: 'Become a Dealer →', href: '/bayi-ol', style: 'birincil' }],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-14', changeSummary: 'İlk yayın sürümü.' },
      { id: 'dl2-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: '"Bayi Kartları" ve "Bayi Kaynakları" bölümleri kaldırıldı (gerçek sayfada karşılığı yok) — gerçek "Distributor Network" bölümüyle ve inline "Become a Dealer" butonuyla değiştirildi. 12 gerçek bayi kaydı Bayi Yönetimi\'ne eklendi (city/categories/partnerSince/directoryStatus alanlarıyla).' },
    ],
  }),
];

/**
 * Mirrors project/Decor Become a Dealer.dc.html — a real, distinct public page
 * from Yetkili Bayiler (dealerPageSections above). Previously had NO admin
 * section control at all; only its application form's fields were editable
 * (via Bayi Başvuru Formu). This closes that gap without duplicating the form
 * field editor — the Application Form entry here is page placement/intro copy
 * only, same pattern as İletişim's Contact Form section.
 */
export const becomeDealerSections: HomepageSection[] = [
  makeSection({
    id: 'bd1', name: 'Hero — Become an official partner', type: 'Hero', order: 1, title: 'Become an official Dekor partner.',
    eyebrow: 'PARTNER WITH DEKOR',
    description: 'Join a professional distribution network operating in more than 60 countries — backed by over 60 years of manufacturing experience and a 21,000 m² facility.',
    overlay: true, overlayOpacity: 40,
    buttons: [
      { label: 'Start Application →', href: '#apply', style: 'birincil' },
      { label: 'Download Dealer Brochure', href: '/destek#downloads', style: 'ikincil' },
    ],
    stats: [
      { label: 'COUNTRIES', value: '60+' },
      { label: 'PRODUCTS', value: '400+' },
      { label: 'CONTINENTS', value: '4' },
      { label: 'ESTABLISHED', value: '1964' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-12', changeSummary: 'İlk yayın sürümü.' },
      { id: 'bd1-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek başlık/açıklama, 2 gerçek buton ve 4 gerçek istatistik eklendi.' },
    ],
  }),
  makeSection({
    id: 'bd2', name: 'Neden Ortak Olmalı', type: 'Why Partner', order: 2, title: 'A manufacturer-grade partnership, engineered for growth.',
    eyebrow: 'WHY PARTNER WITH DEKOR', backgroundColor: '#F4F5F6',
    description: '8 gerçek fayda kartı.',
    cards: [
      { id: 'bd2-c1', eyebrow: 'BNF·01', title: 'Global Export Network', description: 'Reach professional customers in 60+ countries through an established logistics and distribution backbone.' },
      { id: 'bd2-c2', eyebrow: 'BNF·02', title: 'OEM & Private Label', description: 'Build your own brand on Dekor manufacturing lines with full private-label and OEM support.' },
      { id: 'bd2-c3', eyebrow: 'BNF·03', title: 'Marketing Support', description: 'Catalogs, brand assets, point-of-sale materials and co-funded campaigns for your market.' },
      { id: 'bd2-c4', eyebrow: 'BNF·04', title: 'Professional Training', description: 'Technical and sales training for your team — online and on-site at our facility.' },
      { id: 'bd2-c5', eyebrow: 'BNF·05', title: 'Fast Manufacturing', description: 'Short, reliable lead times from a 21,000 m² facility engineered for volume production.' },
      { id: 'bd2-c6', eyebrow: 'BNF·06', title: 'Dedicated Export Team', description: 'A named account manager and export specialists supporting your region directly.' },
      { id: 'bd2-c7', eyebrow: 'BNF·07', title: 'High Production Capacity', description: '400+ products manufactured at scale with consistent quality and availability.' },
      { id: 'bd2-c8', eyebrow: 'BNF·08', title: 'Premium Product Quality', description: 'ISO-certified professional tools trusted on job sites for over 60 years.' },
    ],
  }),
  makeSection({
    id: 'bd3', name: 'Gereksinimler', type: 'Requirements', order: 3, title: 'The specification for a qualified distributor.',
    eyebrow: 'PARTNER REQUIREMENTS', backgroundColor: '#0E0F11',
    description: 'We partner with established companies that can represent Dekor with the same engineering standards we build into every tool.',
    cards: [
      { id: 'bd3-c1', eyebrow: 'REQ·01', title: 'Registered Company', description: 'A legally registered business entity in your country of operation.' },
      { id: 'bd3-c2', eyebrow: 'REQ·02', title: 'Industry Experience', description: 'Demonstrated experience in building materials or professional tools.' },
      { id: 'bd3-c3', eyebrow: 'REQ·03', title: 'Showroom or Warehouse', description: 'A physical showroom or warehouse facility to hold and present stock.' },
      { id: 'bd3-c4', eyebrow: 'REQ·04', title: 'Sales Team', description: 'An active sales team capable of covering your territory.' },
      { id: 'bd3-c5', eyebrow: 'REQ·05', title: 'Regional Distribution', description: 'Capability to distribute and deliver across your region.' },
      { id: 'bd3-c6', eyebrow: 'REQ·06', title: 'Financial Stability', description: 'Sound financial standing and creditworthiness for ongoing supply.' },
      { id: 'bd3-c7', eyebrow: 'REQ·07', title: 'Long-Term Mindset', description: 'A commitment to a long-term, growth-focused partnership.' },
    ],
  }),
  makeSection({
    id: 'bd4', name: 'Başvuru Süreci', type: 'Process', order: 4, title: 'From application to first order.',
    eyebrow: 'APPLICATION PROCESS', backgroundColor: '#0E0F11',
    description: '6 adımlı başvuru → onay sürecini gösteren dikey zaman çizelgesi (Bayi Başvuru Formu\'nun kendi adımlarından farklı — bu, başvuru sonrası değerlendirme sürecini anlatır).',
    cards: [
      { id: 'bd4-c1', eyebrow: '01', title: 'Submit Application', description: 'Complete the dealer application with your company and contact details.' },
      { id: 'bd4-c2', eyebrow: '02', title: 'Application Review', description: 'Our export team reviews your submission, usually within 3–5 business days.' },
      { id: 'bd4-c3', eyebrow: '03', title: 'Business Evaluation', description: 'We assess market fit, territory coverage and distribution capabilities.' },
      { id: 'bd4-c4', eyebrow: '04', title: 'Interview', description: 'A call or meeting with our export team to align on goals and expectations.' },
      { id: 'bd4-c5', eyebrow: '05', title: 'Dealer Approval', description: 'Commercial terms, territory and onboarding plan are confirmed.' },
      { id: 'bd4-c6', eyebrow: '06', title: 'Welcome to Dekor', description: 'You receive your dealer kit, portal access and full first-order support.' },
    ],
  }),
  makeSection({
    id: 'bd5', name: 'Başvuru Formu', type: 'Application Form', order: 5, title: 'Tell us about your company.',
    eyebrow: 'DEALER APPLICATION', backgroundColor: '#F4F5F6',
    description: 'Complete the application below. Fields marked * are required. Your information is reviewed confidentially by our export team. Form alanlarının kendisi Bayi Başvuru Formu modülünde yönetilir.',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-12', changeSummary: 'İlk yayın sürümü.' },
      { id: 'bd5-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek giriş metniyle eşitlendi.' },
    ],
  }),
  makeSection({
    id: 'bd6', name: 'Kapanış — Talk to our export team', type: 'Contact Cards', order: 6, title: 'Talk to our export team.',
    eyebrow: 'NEED TO TALK FIRST?', backgroundColor: '#0E0F11',
    description: 'Have questions before applying? Our dedicated export specialists are ready to help.',
    buttons: [
      { label: 'EXPORT TEAM: Global Distribution', href: '/iletisim', style: 'ikincil' },
      { label: 'PHONE: +90 262 658 30 10', href: 'tel:+902626583010', style: 'ikincil' },
      { label: 'EMAIL: export@dekortools.com', href: 'mailto:export@dekortools.com', style: 'ikincil' },
      { label: 'WHATSAPP: +90 262 658 30 10', href: 'https://wa.me/902626583010', style: 'ikincil' },
      { label: 'SCHEDULE A MEETING: Book a call', href: '/iletisim', style: 'ikincil' },
    ],
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-12', changeSummary: 'İlk yayın sürümü.' },
      { id: 'bd6-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Tek jenerik buton yerine gerçek 5 iletişim yöntemi (ekip/telefon/e-posta/WhatsApp/randevu) eklendi; başlık ve açıklama gerçek metinle değiştirildi.' },
    ],
  }),
];

/** Mirrors project/Decor Support.dc.html's real section order. */
export const supportSections: HomepageSection[] = [
  makeSection({ id: 'sup1', name: 'Hero — Destek Merkezi', type: 'Hero', order: 1, title: 'Need help?', eyebrow: 'SUPPORT CENTER', description: 'Destek kategorilerine hızlı erişim bandı.' }),
  makeSection({ id: 'sup2', name: 'Destek Kategorileri', type: 'Categories', order: 2, title: 'Support Categories', description: 'Teknik doküman, ürün sertifikası, bayi kaynakları kategorileri.', backgroundColor: '#F4F5F6' }),
  makeSection({ id: 'sup3', name: 'Sıkça Sorulan Sorular', type: 'FAQ', order: 3, title: 'Frequently Asked Questions', description: 'Akordiyon tipi SSS listesi.', backgroundColor: '#0D1116' }),
  makeSection({ id: 'sup4', name: 'İndirilenler', type: 'Downloads', order: 4, title: 'Downloads', description: 'Katalog, fiyat listesi ve teknik doküman kısayolları — Dosya Merkezi ile senkronize.', backgroundColor: '#F4F5F6' }),
  makeSection({ id: 'sup5', name: 'Kapanış CTA — İletişim', type: 'CTA', order: 5, title: 'Still need help?', buttons: [{ label: 'Bize Ulaşın', href: '/iletisim', style: 'birincil' }], animation: 'buyutme' }),
];

export interface NewsArticle {
  id: string;
  slug: string;
  category: 'News' | 'Trade Shows' | 'Training Academy' | 'Company Life';
  date: string;
  readingTime: string;
  title: string;
  excerpt: string;
  featured: boolean;
  status: 'yayinda' | 'taslak';
  /** Media Library item ids attached to this article's gallery — real cross-module link, not a static count. */
  gallery: string[];
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
}

/** Mirrors project/news-data.js ARTICLES — the real Newsroom/Article dataset, editable here. */
export const newsArticles: NewsArticle[] = [
  { id: 'na1', slug: 'export-reach-60-countries', category: 'News', date: '2025-03-18', readingTime: '4 min read', title: 'Dekor expands its export reach to 60 countries across four continents', excerpt: 'A new wave of distribution agreements brings Dekor professional tools to additional markets in the Gulf, North Africa and Central Asia.', featured: true, status: 'yayinda', gallery: [], tags: ['Export', 'Growth', 'Distribution'] },
  { id: 'na2', slug: 'professional-spatula-series-launch', category: 'News', date: '2024-11-12', readingTime: '3 min read', title: 'New professional spatula series launched for plaster and render specialists', excerpt: 'Engineered stainless blades, balanced handles and a reworked geometry — the new series targets finishing professionals who demand control.', featured: false, status: 'yayinda', gallery: [], tags: ['Product Launch', 'Plaster & Render'] },
  { id: 'na3', slug: 'iso-9001-recertification', category: 'News', date: '2024-06-04', readingTime: '2 min read', title: 'Dekor earns updated ISO 9001 quality management certification', excerpt: 'An independent audit confirms Dekor’s quality management system meets the latest international standard across manufacturing and supply.', featured: false, status: 'yayinda', gallery: [], tags: ['Quality', 'Certification'] },
  { id: 'na4', slug: 'bau-2025-munich', category: 'Trade Shows', date: '2025-01-22', readingTime: '4 min read', title: 'Dekor at BAU 2025 Munich: a stand built around precision', excerpt: 'Dekor presented its professional ranges to a global audience at BAU Munich, with live finishing demonstrations and new export partnerships.', featured: true, status: 'yayinda', gallery: [], tags: ['BAU', 'Munich', 'Export'] },
  { id: 'na5', slug: 'rew-istanbul-2024', category: 'Trade Shows', date: '2024-10-15', readingTime: '3 min read', title: 'Highlights from REW İstanbul 2024', excerpt: 'Dekor connected with regional partners at REW İstanbul, showcasing surface-preparation and measurement ranges to a professional crowd.', featured: false, status: 'yayinda', gallery: [], tags: ['REW', 'İstanbul'] },
  { id: 'na6', slug: 'dubai-big5-2024', category: 'Trade Shows', date: '2024-11-26', readingTime: '3 min read', title: 'Dubai Big 5 2024: Dekor in the Gulf', excerpt: 'A standout presence at the Gulf’s largest construction event, with a focus on export-ready professional tooling.', featured: false, status: 'yayinda', gallery: [], tags: ['Big 5', 'Dubai', 'Gulf'] },
  { id: 'na7', slug: 'applicator-training-1000', category: 'Training Academy', date: '2025-02-10', readingTime: '4 min read', title: 'Applicator training program reaches 1,000 professionals', excerpt: 'Dekor’s hands-on academy passes a milestone, training applicators in finishing technique, tool care and site efficiency.', featured: true, status: 'yayinda', gallery: [], tags: ['Training', 'Applicators', 'Academy'] },
  { id: 'na8', slug: 'dealer-technical-workshops', category: 'Training Academy', date: '2024-09-19', readingTime: '3 min read', title: 'Dealer technical workshop series kicks off', excerpt: 'A new program equips dealer sales teams with the product knowledge to advise professional customers with confidence.', featured: false, status: 'yayinda', gallery: [], tags: ['Dealers', 'Training'] },
  { id: 'na9', slug: 'annual-dealer-meeting-2025', category: 'Company Life', date: '2025-04-08', readingTime: '4 min read', title: 'Annual dealer meeting 2025 brings the network to Antalya', excerpt: 'Partners from across Türkiye and beyond gathered to review a record year, preview new ranges and set shared goals.', featured: true, status: 'yayinda', gallery: [], tags: ['Dealers', 'Event', 'Antalya'] },
  { id: 'na10', slug: 'inside-gebze-factory', category: 'Company Life', date: '2024-12-03', readingTime: '5 min read', title: 'Inside the Gebze factory: a visit to the line', excerpt: 'A walk through the 21,000 m² facility where raw steel becomes professional finishing tools.', featured: false, status: 'yayinda', gallery: [], tags: ['Factory', 'Manufacturing', 'Gebze'] },
  { id: 'na11', slug: 'industry-excellence-award', category: 'Company Life', date: '2024-08-21', readingTime: '2 min read', title: 'Dekor wins industry excellence award', excerpt: 'Recognition for sustained quality and export performance in the professional tools category.', featured: false, status: 'yayinda', gallery: [], tags: ['Award', 'Recognition'] },
  { id: 'na12', slug: 'team-day-volunteering', category: 'Company Life', date: '2024-07-14', readingTime: '3 min read', title: 'Team day: volunteering and social activities', excerpt: 'Beyond the factory floor — a look at the community and social side of life at Dekor.', featured: false, status: 'taslak', gallery: [], tags: ['Team', 'Community', 'Social'] },
];

export const newsCategoryTone: Record<NewsArticle['category'], 'danger' | 'info' | 'success' | 'warning'> = {
  News: 'danger',
  'Trade Shows': 'info',
  'Training Academy': 'success',
  'Company Life': 'warning',
};

/** Mirrors project/Decor Newsroom.dc.html's real section order. */
export const newsroomSections: HomepageSection[] = [
  makeSection({
    id: 'news1', name: 'Hero — Newsroom', type: 'Hero', order: 1, title: 'Newsroom.',
    eyebrow: 'PRESS & MEDIA',
    description: 'Latest news, trade shows, product launches and company updates from Dekor — engineered tools, told from the inside.',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-22', changeSummary: 'İlk yayın sürümü.' },
      { id: 'news1-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek eyebrow ("PRESS & MEDIA") ve gerçek açıklama metniyle eşitlendi.' },
    ],
  }),
  makeSection({ id: 'news2', name: 'Haber Izgarası', type: 'News Grid', order: 2, title: 'News Grid', description: 'Kategori filtre çipleri, arama ve sıralama kontrolleriyle sayfalanmış haber kartları — Haberler modülü içerik havuzundan dinamik çekilir.', backgroundColor: '#F4F5F6' }),
];

/** Mirrors project/Decor Career.dc.html's real section order — HERO / WHY JOIN / OPEN POSITIONS / WIZARD / SUCCESS SCREEN comment markers. */
export const careerSections: HomepageSection[] = [
  makeSection({
    id: 'car1', name: 'Hero — Build the tools professionals trust', type: 'Hero', order: 1, title: 'Build the tools professionals trust.',
    eyebrow: 'CAREERS AT DEKOR',
    description: "Join the team behind Türkiye's largest manufacturer of professional hand tools — engineering, production, R&D and global trade.",
    buttons: [
      { label: 'Start Your Application →', href: '#apply', style: 'birincil' },
      { label: 'View Open Positions', href: '#positions', style: 'ikincil' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-08', changeSummary: 'İlk yayın sürümü.' },
      { id: 'car1-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek başlık/açıklama ve 2 gerçek buton eklendi.' },
    ],
  }),
  makeSection({
    id: 'car-why', name: "Neden Dekor'da Çalışmalı", type: 'Why Join', order: 2, title: 'A workshop mindset, at industrial scale.',
    eyebrow: 'WHY DEKOR', backgroundColor: '#FFFFFF',
    description: '3 gerçek değer kartı.',
    cards: [
      { id: 'car-why-c1', eyebrow: '01', title: 'Real craft', description: 'We still think like the tradespeople we came from — quality is personal here.' },
      { id: 'car-why-c2', eyebrow: '02', title: 'Engineering depth', description: 'In-house R&D, metallurgy and CNC — solve hard problems with serious equipment.' },
      { id: 'car-why-c3', eyebrow: '03', title: 'Global reach', description: 'Your work ships to 60 countries across four continents.' },
    ],
  }),
  makeSection({
    id: 'car2', name: 'Açık Pozisyonlar', type: 'Open Positions', order: 3, title: "Where we're hiring.",
    eyebrow: 'OPEN POSITIONS', backgroundColor: '#0E0F11',
    description: '4 gerçek açık pozisyon — Kariyer Başvuru Formu\'nda seçilebilecek pozisyon listesiyle eşleşmeli.',
    cards: [
      { id: 'car2-c1', eyebrow: 'ENG-01', title: 'Mechanical Design Engineer', description: 'R&D · Çayırova, Kocaeli · Full-time' },
      { id: 'car2-c2', eyebrow: 'PRD-02', title: 'CNC Production Technician', description: 'Manufacturing · Çayırova, Kocaeli · Full-time' },
      { id: 'car2-c3', eyebrow: 'EXP-03', title: 'Export Sales Specialist', description: 'International Trade · İstanbul · Full-time' },
      { id: 'car2-c4', eyebrow: 'QC-04', title: 'Quality Control Engineer', description: 'Quality · Çayırova, Kocaeli · Full-time' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-08', changeSummary: 'İlk yayın sürümü.' },
      { id: 'car2-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: '4 gerçek açık pozisyon kart olarak eklendi — önceden içerik tamamen boştu.' },
    ],
  }),
  makeSection({
    id: 'car3', name: 'Başvuru Sihirbazı Girişi', type: 'Application Wizard', order: 4, title: 'Apply to join Dekor.',
    eyebrow: 'APPLICATION · 6 STEPS',
    description: 'Çok adımlı başvuru formunun giriş bölümü — form alanlarının kendisi Kariyer Başvuru Formu modülünde yönetilir. Gerçek sayfada bu bölüm ayrı bir CTA değil, formun kendisidir (buton yok).',
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-08', changeSummary: 'İlk yayın sürümü.' },
      { id: 'car3-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek başlık ("Apply to join Dekor.") ile değiştirildi; gerçek sayfada bulunmayan "/kariyer/basvuru" butonu kaldırıldı (form #apply çapasına yerleşiktir, ayrı sayfa değildir).' },
    ],
  }),
];

/** Mirrors project/Decor Product Detail.dc.html's real data-screen-label section order — the shared template every product page renders through. */
export const productDetailSections: HomepageSection[] = [
  makeSection({
    id: 'pd1', name: 'Ürün Hero', type: 'Product Hero', order: 1, title: '{{ Ürün Adı }}',
    description: 'Ürün adı, kısa açıklama ve birincil CTA — Ürün Yönetimi verisinden otomatik doldurulur.',
    mediaType: 'gorsel', mediaName: 'ürün hero görseli (dinamik)',
    buttons: [
      { label: 'Technical Sheet', href: '#downloads', style: 'birincil' },
      { label: 'Watch Video', href: '#video', style: 'ikincil' },
      { label: 'Contact Sales', href: '/iletisim', style: 'ikincil' },
    ],
  }),
  makeSection({ id: 'pd2', name: 'Galeri', type: 'Gallery', order: 2, title: 'Every detail, up close.', description: 'Ürünün çoklu açıdan çekilmiş görsel galerisi.', backgroundColor: '#F4F5F6' }),
  makeSection({ id: 'pd3', name: 'Ürün Genel Bakış', type: 'Product Overview', order: 3, title: 'The complete technical story.', description: 'Uzun açıklama metni ve öne çıkan özellik rozetleri.' }),
  makeSection({ id: 'pd4', name: 'Kullanım Alanları', type: 'Applications', order: 4, title: 'Where it works.', description: 'Ürünün kullanıldığı yüzey/iş türleri.', backgroundColor: '#F4F5F6' }),
  makeSection({ id: 'pd5', name: 'Özellikler', type: 'Features', order: 5, title: 'Built around how the tool actually works.', description: 'İkonlu özellik listesi (malzeme, ağırlık, ergonomi vb.).' }),
  makeSection({ id: 'pd6', name: 'Teknik Özellikler', type: 'Specifications', order: 6, title: 'Full technical range.', description: 'Tablo biçiminde teknik özellik dökümü — Ürün Yönetimi alanlarından otomatik.', backgroundColor: '#FFFFFF' }),
  makeSection({ id: 'pd7', name: 'Teknik Çizim', type: 'Technical Drawing', order: 7, title: 'Measured to the millimetre.', description: 'Ölçülü teknik çizim görseli.' }),
  makeSection({ id: 'pd8', name: 'İndirilenler', type: 'Downloads', order: 8, title: 'Documents & resources.', description: 'Ürüne özel PDF katalog/çizim — Dosya Merkezi ile senkronize.', backgroundColor: '#F4F5F6', mediaType: 'belge', mediaName: 'Sıva Mastarı Teknik Çizim Seti' }),
  makeSection({ id: 'pd9', name: 'Tanıtım Videosu', type: 'Video', order: 9, title: 'See the tool in action.', description: 'Ürün kullanım/tanıtım videosu.', backgroundColor: '#16181B', mediaType: 'video', mediaName: 'yeni-urun-tanitim.mp4' }),
  makeSection({ id: 'pd10', name: 'İlgili Ürünler', type: 'Related Products', order: 10, title: 'Related products.', description: 'Aynı kategoriden otomatik önerilen ürünler. "VIEW ALL [FAMILY] →" bağlantısı ürünün kategorisine göre otomatik oluşturulur.', backgroundColor: '#F4F5F6' }),
  makeSection({
    id: 'pd11', name: 'Kapanış CTA', type: 'CTA', order: 11, title: 'Order the {{ Ürün Adı }}.',
    description: 'Available to dealers across 60 markets — request pricing, samples or private-label options from our export team.',
    backgroundColor: '#D32027',
    buttons: [
      { label: 'Order via B2B →', href: '/b2b-portal', style: 'birincil' },
      { label: 'Become a Dealer', href: '/bayi-ol', style: 'ikincil' },
    ],
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'pd11-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-06', changeSummary: 'Gerçek Decor Product Detail.dc.html içeriğiyle eşitlendi: başlık ve açıklama gerçek metinle değiştirildi, 2. buton (Become a Dealer → /bayi-ol) eklendi.' },
    ],
  }),
];

/** Mirrors project/Decor Category.dc.html — the shared template every category listing page renders through. */
export const categoryTemplateSections: HomepageSection[] = [
  makeSection({ id: 'cat1', name: 'Kategori Hero', type: 'Category Hero', order: 1, title: '{{ Kategori Adı }}', description: 'Kategori adı ve kısa açıklama — Kategori Yönetimi verisinden otomatik doldurulur.', overlay: true, overlayOpacity: 40 }),
  makeSection({ id: 'cat2', name: 'Ürün Listeleme', type: 'Category Listing', order: 2, title: 'Category Listing', description: 'Filtrelenebilir/sıralanabilir ürün grid — Ürün Yönetimi kategoriye bağlı ürünleri gösterir.', backgroundColor: '#F4F5F6' }),
  makeSection({
    id: 'cat3', name: 'Kapanış CTA', type: 'CTA', order: 3, title: "Can't find the right tool?",
    description: 'Our technical team will help you match the right Dekor tool to your application and market.',
    backgroundColor: '#D32027',
    buttons: [
      { label: 'Contact Sales →', href: '/iletisim', style: 'birincil' },
      { label: 'All Families', href: '/urunler', style: 'ikincil' },
    ],
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-20', changeSummary: 'İlk yayın sürümü.' },
      { id: 'cat3-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-06', changeSummary: "Gerçek Decor Category.dc.html içeriğiyle eşitlendi: başlık \"Can't find the right tool?\", açıklama eklendi, 2. buton (All Families → /urunler) eklendi." },
    ],
  }),
];

/** Mirrors project/Decor Products.dc.html — the public catalog landing page (/urunler). Family cards themselves are NOT stored here: their content, order and visibility come live from Kategori Yönetimi (Product Families), exactly like the Category Listing section above pulls from Ürün Yönetimi. */
export const productsLandingSections: HomepageSection[] = [
  makeSection({
    id: 'pl1', name: 'Katalog Hero', type: 'Products Hero', order: 1, title: 'The Tool Catalog.', subtitle: '',
    description: 'Over 400 professional hand tools across eleven engineered families. Forged, machined and tested in our 21,000 m² facility — built for the trade, trusted on four continents.',
    overlay: true, overlayOpacity: 35,
    stats: [
      { label: 'PRODUCTS', value: '400+' },
      { label: 'FAMILIES', value: '11' },
      { label: 'EXPORT MARKETS', value: '60' },
    ],
  }),
  makeSection({ id: 'pl2', name: 'Ürün Aileleri', type: 'Product Families', order: 2, eyebrow: 'PRODUCT FAMILIES', title: 'Eleven engineered families.', description: 'Every Dekor tool belongs to a disciplined product family. Select a family to browse its full technical range. Aile kartlarının sırası, görünürlüğü ve içeriği Kategori Yönetimi (Ürün Aileleri) kayıtlarından otomatik gelir.', backgroundColor: '#F4F5F6' }),
  makeSection({ id: 'pl3', name: 'Kapanış CTA', type: 'CTA', order: 3, title: "Need the full technical catalog?", description: 'Download specifications, packaging data and pricing — or request physical samples for your market.', backgroundColor: '#D32027', buttons: [{ label: 'Download Catalog', href: '/destek#downloads', style: 'birincil' }, { label: 'Become a Dealer', href: '/bayi-ol', style: 'ikincil' }], animation: 'buyutme' }),
];

/** Mirrors project/Decor Article.dc.html — the shared template every news article renders through. */
/**
 * Mirrors project/Decor Article.dc.html's real 3 sections exactly. The real
 * page ends after Related Articles (with its own real "All Stories →" and
 * "← Back to Newsroom" buttons plus prev/next story navigation) — there is
 * no separate newsletter/closing-CTA section on the real page; the previous
 * 4th section was fabricated and had zero real buttons (flagged as a
 * critical "CTA Eksik" finding by Website Sağlığı before this fix).
 */
export const newsDetailSections: HomepageSection[] = [
  makeSection({ id: 'nd1', name: 'Makale Hero', type: 'Article Hero', order: 1, title: '{{ Makale Başlığı }}', description: 'Başlık, kategori etiketi ve yayın tarihi — arka plan görseli haberden otomatik.', overlay: true, overlayOpacity: 50 }),
  makeSection({ id: 'nd2', name: 'Makale İçeriği', type: 'Article Body', order: 2, title: 'Article Body', description: 'Zengin metin editörü ile yazılan haber içeriği.' }),
  makeSection({
    id: 'nd3', name: 'İlgili Haberler', type: 'Related Articles', order: 3, title: 'More from the newsroom.',
    eyebrow: 'RELATED NEWS',
    description: 'Aynı kategoriden 3 önerilen haber kartı + önceki/sonraki makale gezinmesi.',
    backgroundColor: '#0E0F11',
    buttons: [
      { label: 'All Stories →', href: '/haberler', style: 'birincil' },
      { label: '← Back to Newsroom', href: '/haberler', style: 'ikincil' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-22', changeSummary: 'İlk yayın sürümü.' },
      { id: 'nd3-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek olmayan "Kapanış CTA" (haberdar olun) bölümü kaldırıldı — gerçek sayfada karşılığı yok. Bu bölümün gerçek "All Stories →" ve "← Back to Newsroom" butonları buraya eklendi, başlık gerçek metinle ("More from the newsroom.") değiştirildi.' },
    ],
  }),
];

/** Mirrors project/Decor Contact.dc.html's real section order. */
/**
 * Mirrors project/Decor Contact.dc.html's real 6 sections exactly. The real
 * page has NO contact form anywhere on it (previously fabricated as ct1) —
 * it's offices, a factory/HQ highlight, a factory location card with real
 * map coordinates, department shortcuts, and a 2-panel complaint/dealer CTA
 * band. If a real "message us" form is wanted later, it belongs on a real
 * page section that doesn't exist yet — not invented here.
 */
export const contactPageSections: HomepageSection[] = [
  makeSection({
    id: 'ct1', name: 'Hero — Contact Decor', type: 'Hero', order: 1, title: 'Contact Decor.',
    eyebrow: 'GLOBAL CONTACT HUB',
    description: 'Reach our headquarters, factory, export offices and international trade teams.',
    stats: [
      { label: 'GLOBAL OFFICES', value: '4' },
      { label: 'COUNTRIES', value: '3' },
      { label: 'EXPORT MARKETS', value: '60' },
      { label: 'RESPONSE TIME', value: '<24h' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-05', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ct1-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Gerçek başlık/açıklama ve 4 gerçek istatistik eklendi.' },
    ],
  }),
  makeSection({
    id: 'ct2', name: 'Ofislerimiz', type: 'Office Cards', order: 2, title: 'Where to find us.',
    eyebrow: 'OUR OFFICES', backgroundColor: '#F4F5F6',
    description: '4 gerçek ofis kartı — merkez, fabrika ve iki uluslararası ofis.',
    cards: [
      { id: 'ct2-c1', eyebrow: 'OFC-01 · İSTANBUL · TR', title: 'HASSAN Merkez', description: "Kozyatağı Mah. Şehit İlknur Keleş Sok. Anaç Aksakal Plaza No:10 D:9, Kadıköy / İSTANBUL — Headquarters." },
      { id: 'ct2-c2', eyebrow: 'OFC-02 · KOCAELİ · TR', title: 'HASSAN Fabrika', description: "Cumhuriyet Mah. Turgut Özal Cd. Karayel Sok. No:24 Şekerpınar, Çayırova / Kocaeli — 0 (262) 658 30 10 · info@dekortools.com · export@dekortools.com" },
      { id: 'ct2-c3', eyebrow: 'OFC-03 · LONDON · UK', title: 'Dekortools UK', description: 'Unit A 37 New Road Langley, Berks SL3 8JJ London — 01753 547 942 · info@dekortools.co.uk' },
      { id: 'ct2-c4', eyebrow: 'OFC-04 · MOSCOW · RU', title: 'Dekor-Trade', description: '127282, Ulitsa Polyarnaya, Dom 41, Stroenie-1 Moscow — +7 495 109 88 07 · info@dekor-trade.ru' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-05', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ct2-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: '"Ofis Bilgileri" tek metin bloğu yerine 4 gerçek ofis kartı eklendi.' },
    ],
  }),
  makeSection({
    id: 'ct3', name: 'Merkez & Fabrika', type: 'HQ Highlight', order: 3, title: 'One roof. Every stage of the build.',
    eyebrow: 'HEADQUARTERS & FACTORY', backgroundColor: '#0E0F11',
    description: 'Our 21,000 m² Çayırova facility houses material science, forging, CNC machining, quality control and global logistics — the engine behind every Dekor tool. Adres: Cumhuriyet Mah. Turgut Özal Cd. Karayel Sok. No:24 Şekerpınar, Çayırova / Kocaeli — TÜRKİYE. Tel: 0 (262) 658 30 10 · info@dekortools.com',
  }),
  makeSection({
    id: 'ct4', name: 'Fabrika Konumu', type: 'Map', order: 4, title: 'HASSAN İNŞAAT MAKİNA SAN. ve TİC. LTD. ŞTİ.',
    eyebrow: 'FACTORY LOCATION', backgroundColor: '#0A0B0C',
    description: 'Cumhuriyet Mah. Turgut Özal Caddesi, Karayel Sokak No:22, Çayırova, Cumhuriyet, 41420, Çayırova / Kocaeli, Türkiye. Koordinat: 40.8261° N · 29.3787° E',
    buttons: [
      { label: 'Open in Google Maps →', href: 'https://maps.google.com/?q=HASSAN+Fabrika+Çayırova+Kocaeli', style: 'birincil', newTab: true },
      { label: 'Get Directions', href: 'https://maps.google.com/?daddr=HASSAN+Fabrika+Çayırova+Kocaeli', style: 'ikincil', newTab: true },
      { label: 'Contact Factory', href: 'tel:+902626583010', style: 'ikincil' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-05', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ct4-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Jenerik "harita" içeriği gerçek fabrika konum kartıyla (adres, koordinat, 3 gerçek buton) değiştirildi.' },
    ],
  }),
  makeSection({
    id: 'ct5', name: 'Departman Yönlendirme', type: 'Department Routing', order: 5, title: 'Department shortcuts.',
    eyebrow: 'REACH THE RIGHT TEAM',
    description: '6 gerçek departman kısayolu.',
    cards: [
      { id: 'ct5-c1', eyebrow: 'GENERAL', title: 'General Enquiries', description: 'info@dekortools.com' },
      { id: 'ct5-c2', eyebrow: 'SALES · TR', title: 'Domestic Sales', description: 'satis@dekortools.com' },
      { id: 'ct5-c3', eyebrow: 'EXPORT', title: 'Export & International', description: 'export@dekortools.com' },
      { id: 'ct5-c4', eyebrow: 'GLOBAL SALES', title: 'International Sales', description: 'sales@dekortools.com' },
      { id: 'ct5-c5', eyebrow: 'PHONE · TR', title: 'Factory Switchboard', description: '0 (262) 658 30 10' },
      { id: 'ct5-c6', eyebrow: 'SUPPORT', title: 'Complaints & Service', description: 'Submit a complaint →' },
    ],
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-05', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ct5-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: '6 gerçek departman kısayolu eklendi (önceden içerik boştu).' },
    ],
  }),
  makeSection({
    id: 'ct6', name: 'Kapanış — Şikayet & Bayilik', type: 'CTA', order: 6, title: 'Have a complaint or issue? · Become a Dekor dealer.',
    backgroundColor: '#D32027',
    description: 'İki panelli kapanış bandı: Service & Quality (şikayet) ve Partnership & Export (bayilik).',
    cards: [
      { id: 'ct6-c1', eyebrow: 'SERVICE & QUALITY', title: 'Have a complaint or issue?', description: "Our support team treats every report seriously. Submit the details and we'll respond fast." },
      { id: 'ct6-c2', eyebrow: 'PARTNERSHIP & EXPORT', title: 'Become a Dekor dealer.', description: 'Join a global network across 60 countries with trade pricing, private-label and full support.' },
    ],
    buttons: [
      { label: 'Submit Your Complaint →', href: '/sikayet', style: 'ikincil' },
      { label: 'Apply for Dealership →', href: '/bayi-ol', style: 'birincil' },
    ],
    animation: 'buyutme',
    revisions: [
      { id: 'rev-seed-1', versionLabel: 'v1', author: 'Selin Arslan', date: '2026-06-05', changeSummary: 'İlk yayın sürümü.' },
      { id: 'ct6-rev2', versionLabel: 'v2', author: 'Sprint 8 Audit', date: '2026-07-07', changeSummary: 'Tek jenerik CTA yerine gerçek 2 panelli (şikayet + bayilik) kapanış bandı eklendi.' },
    ],
  }),
];

export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type: 'metin' | 'e-posta' | 'telefon' | 'sayi' | 'secim' | 'uzun-metin' | 'dosya';
  required: boolean;
  order: number;
  step: number;
}

export interface ApplicationForm {
  id: string;
  name: string;
  targetPage: string;
  submitsTo: string;
  stepNames: string[];
  fields: FormField[];
}

/** Mirrors project/Decor Become a Dealer.dc.html's real "Application Form" section fields (id="apply"). */
export const dealerApplicationForm: ApplicationForm = {
  id: 'form-dealer',
  name: 'Bayi Başvuru Formu',
  targetPage: '/bayi-ol',
  submitsTo: 'Bayi Yönetimi',
  stepNames: ['Şirket Bilgileri', 'Yetkili Kişi', 'İş Detayları', 'Ek Notlar'],
  fields: [
    { id: 'f1', label: 'Ticari Unvan', placeholder: 'Trading name', type: 'metin', required: true, order: 1, step: 1 },
    { id: 'f2', label: 'Tescilli Tüzel Kişilik', placeholder: 'Registered legal entity', type: 'metin', required: true, order: 2, step: 1 },
    { id: 'f3', label: 'Ticaret Sicil Numarası', placeholder: 'Registration number', type: 'metin', required: true, order: 3, step: 1 },
    { id: 'f4', label: 'Vergi Numarası', placeholder: 'Tax ID', type: 'metin', required: false, order: 4, step: 1 },
    { id: 'f5', label: 'Ülke', placeholder: 'Country', type: 'secim', required: true, order: 5, step: 1 },
    { id: 'f6', label: 'Şehir', placeholder: 'City', type: 'metin', required: true, order: 6, step: 1 },
    { id: 'f7', label: 'Adres', placeholder: 'Street, district, postal code', type: 'uzun-metin', required: true, order: 7, step: 1 },
    { id: 'f8', label: 'Yetkili Ad Soyad', placeholder: 'First and last name', type: 'metin', required: true, order: 1, step: 2 },
    { id: 'f9', label: 'Ünvan', placeholder: 'e.g. Purchasing Manager', type: 'metin', required: true, order: 2, step: 2 },
    { id: 'f10', label: 'E-posta', placeholder: 'you@company.com', type: 'e-posta', required: true, order: 3, step: 2 },
    { id: 'f11', label: 'Telefon', placeholder: '+90 …', type: 'telefon', required: true, order: 4, step: 2 },
    { id: 'f12', label: 'Uzmanlık Alanı', placeholder: 'e.g. paint tools, hardware', type: 'metin', required: false, order: 1, step: 3 },
    { id: 'f13', label: 'Depo Alanı', placeholder: 'e.g. 1,200 m²', type: 'metin', required: false, order: 2, step: 3 },
    { id: 'f14', label: 'Hedef Bölgeler', placeholder: 'e.g. Türkiye, Iraq', type: 'metin', required: false, order: 3, step: 3 },
    { id: 'f15', label: 'Ek Notlar', placeholder: 'Anything else we should know…', type: 'uzun-metin', required: false, order: 1, step: 4 },
  ],
};

/** Mirrors project/Decor Career.dc.html's application form fields. */
export const careerApplicationForm: ApplicationForm = {
  id: 'form-career',
  name: 'Kariyer Başvuru Formu',
  targetPage: '/kariyer',
  submitsTo: 'Form Talepleri',
  stepNames: ['Kişisel Bilgiler', 'Pozisyon', 'Özgeçmiş'],
  fields: [
    { id: 'cf1', label: 'Ad Soyad', placeholder: 'Adınız Soyadınız', type: 'metin', required: true, order: 1, step: 1 },
    { id: 'cf2', label: 'E-posta', placeholder: 'ornek@eposta.com', type: 'e-posta', required: true, order: 2, step: 1 },
    { id: 'cf3', label: 'Telefon', placeholder: '+90 …', type: 'telefon', required: true, order: 3, step: 1 },
    { id: 'cf4', label: 'Başvurulan Pozisyon', placeholder: 'Seçiniz', type: 'secim', required: true, order: 1, step: 2 },
    { id: 'cf5', label: 'Departman', placeholder: 'Seçiniz', type: 'secim', required: true, order: 2, step: 2 },
    { id: 'cf6', label: 'Özgeçmiş (CV)', placeholder: 'PDF yükleyin', type: 'dosya', required: true, order: 1, step: 3 },
    { id: 'cf7', label: 'Ön Yazı', placeholder: 'Kendinizi tanıtın…', type: 'uzun-metin', required: false, order: 2, step: 3 },
  ],
};

export interface ExportCountry {
  id: string;
  country: string;
  region: string;
  dealerCount: number;
  exportVolume: string;
  active: boolean;
}

/** Powers the interactive world map on both the Homepage export section and /ihracat — single source of truth. */
export const exportMapCountries: ExportCountry[] = [
  { id: 'ec1', country: 'İspanya', region: 'Avrupa', dealerCount: 14, exportVolume: '$340,000', active: true },
  { id: 'ec2', country: 'BAE', region: 'Orta Doğu', dealerCount: 11, exportVolume: '$120,000', active: true },
  { id: 'ec3', country: 'İsveç', region: 'Avrupa', dealerCount: 9, exportVolume: '$210,000', active: true },
  { id: 'ec4', country: 'Katar', region: 'Orta Doğu', dealerCount: 7, exportVolume: '$95,000', active: true },
  { id: 'ec5', country: 'Sırbistan', region: 'Avrupa', dealerCount: 5, exportVolume: '$65,000', active: true },
  { id: 'ec6', country: 'Nijerya', region: 'Afrika', dealerCount: 2, exportVolume: '$40,000', active: false },
  { id: 'ec7', country: 'Almanya', region: 'Avrupa', dealerCount: 0, exportVolume: '$0', active: false },
];

export interface GlobalBanner {
  id: string;
  name: string;
  type: 'CTA' | 'Banner';
  message: string;
  buttonLabel: string;
  buttonHref: string;
  placements: string[];
  active: boolean;
}

/** Site-wide banners/CTAs that can appear on multiple pages at once — one edit updates every placement. */
export const globalBanners: GlobalBanner[] = [
  { id: 'gb1', name: 'Katalog İndir Banner', type: 'Banner', message: "2026 ürün kataloğumuz yayında.", buttonLabel: 'İndir', buttonHref: '/dosya-merkezi', placements: ['Ana Sayfa', 'Ürünler', 'Destek Merkezi'], active: true },
  { id: 'gb2', name: 'Bayi Ol CTA', type: 'CTA', message: 'Dekor ailesine katılın.', buttonLabel: 'Başvur', buttonHref: '/bayi-ol', placements: ['Ana Sayfa', 'Üretim', 'İhracat', 'Ürün Detayı'], active: true },
  { id: 'gb3', name: 'Çerez Bildirimi', type: 'Banner', message: 'Bu site deneyiminizi geliştirmek için çerezler kullanır.', buttonLabel: 'Kabul Et', buttonHref: '#', placements: ['Tüm Sayfalar'], active: true },
];

/* ------------------------------------------------------------------ */
/* GLOBAL THEME, REDIRECTS, POPUPS — the remaining "operating system"   */
/* layer: brand tokens, URL integrity, and site-wide overlays.          */
/* ------------------------------------------------------------------ */

export const themeSettings = {
  brandColors: [
    { name: 'Birincil (Decor Red)', value: '#D32027', role: 'CTA, vurgu, aktif durumlar' },
    { name: 'Teknik Mavi', value: '#0095DA', role: 'Mühendislik/teknik göstergeler' },
    { name: 'Neredeyse Siyah', value: '#0E0F11', role: 'Koyu bölüm arka planları' },
    { name: 'Sis (Mist)', value: '#F4F5F6', role: 'Açık bölüm arka planları' },
    { name: 'Çelik Gri', value: '#5A6066', role: 'İkincil metin' },
  ],
  typography: {
    displayFont: 'Archivo',
    monoFont: 'IBM Plex Mono',
    headingWeight: 800,
    bodySize: '15px',
    trackingHeadings: '-0.03em',
  },
  buttons: {
    radius: '2px',
    primaryStyle: 'Dolu (Solid)',
    secondaryStyle: 'Çerçeveli (Outline)',
  },
  iconStyle: 'Çizgi (Line) — Lucide',
};

export interface RedirectRule {
  id: string;
  from: string;
  to: string;
  type: '301' | '302';
  hits: number;
  createdAt: string;
}

/** URL integrity — every slug change from Sayfa/Ürün/Kategori Yönetimi should generate one of these automatically. */
export const redirectRules: RedirectRule[] = [
  { id: 'rd1', from: '/hakkimizda-biz-kimiz', to: '/hakkimizda', type: '301', hits: 412, createdAt: '2026-04-10' },
  { id: 'rd2', from: '/urunler/boya-ekipmanlari-eski', to: '/urunler/boya', type: '301', hits: 88, createdAt: '2026-05-02' },
  { id: 'rd3', from: '/bayilik', to: '/bayi-ol', type: '301', hits: 231, createdAt: '2026-03-18' },
  { id: 'rd4', from: '/destek-merkezi', to: '/destek', type: '302', hits: 15, createdAt: '2026-06-08' },
];

export interface SlugConflict {
  id: string;
  slug: string;
  usedBy: string[];
}

export const slugConflicts: SlugConflict[] = [
  { id: 'sc1', slug: '/destek', usedBy: ['Sayfa Yönetimi — Destek Merkezi', 'Bölüm Oluşturucu — Destek Şablonu'] },
];

export interface PopupRule {
  id: string;
  name: string;
  type: 'duyuru' | 'promosyon' | 'cerez';
  trigger: 'sayfa-yuklenince' | 'cikis-niyeti' | 'gecikme' | 'her-zaman';
  delaySeconds: number | null;
  pages: string[];
  active: boolean;
}

export const popups: PopupRule[] = [
  { id: 'pp1', name: 'Çerez Bildirimi', type: 'cerez', trigger: 'her-zaman', delaySeconds: null, pages: ['Tüm Sayfalar'], active: true },
  { id: 'pp2', name: '2026 Katalog Duyurusu', type: 'duyuru', trigger: 'gecikme', delaySeconds: 5, pages: ['Ana Sayfa', 'Ürünler'], active: true },
  { id: 'pp3', name: 'Bayi Kampanyası', type: 'promosyon', trigger: 'cikis-niyeti', delaySeconds: null, pages: ['Ana Sayfa'], active: false },
];
