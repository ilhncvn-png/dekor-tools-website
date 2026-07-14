/**
 * Machine-readable snapshot of the EXISTING public Decor Tools product system
 * (Phase 1 audit output). Transcribed verbatim from the live static source:
 *
 *  - families      → `const categories` in project/"Decor Products.dc.html"
 *  - subcategories → `const order`      in project/"Decor Category.dc.html"
 *  - products      → `const products`   in project/"Decor Category.dc.html"
 *  - detailProduct → `specsData`/`features`/`applications`/`downloads`/gallery
 *                    in project/"Decor Product Detail.dc.html"
 *
 * This module is READ-ONLY reference data — importing from it seeds Neon without
 * touching any public file. Field ↔ source mapping is documented inline. Every
 * imported row is stamped importSource = "LIVE_IMPORTED".
 */

export const IMPORT_SOURCE = 'LIVE_IMPORTED' as const;

export interface CatalogFamily {
  code: string; // FAM-01 … (public product code)
  name: string; // public family card title
  productCount: number; // public "count" badge
  description: string; // public family card description
  showOnHomepage: boolean;
}

/** 11 product families — Decor Products.dc.html `const categories`. */
export const FAMILIES: CatalogFamily[] = [
  { code: 'FAM-01', name: 'Boya Aletleri', productCount: 96, showOnHomepage: true, description: 'Temiz, profesyonel kaplama için tasarlanmış rulolar, fırçalar, tepsiler ve uzatma sistemleri.' },
  { code: 'FAM-02', name: 'Sıva Aletleri', productCount: 72, showOnHomepage: true, description: 'Kusursuz duvar yüzeyleri için parlatılmış paslanmaz mala, perdah ve sıva bıçakları.' },
  { code: 'FAM-03', name: 'Fayans Aletleri', productCount: 54, showOnHomepage: true, description: 'Hassas kesim geometrisine sahip dişli yapıştırıcı malaları, aralayıcılar ve derz perdahları.' },
  { code: 'FAM-04', name: 'Alçı / Spatula Aletleri', productCount: 63, showOnHomepage: true, description: 'Doldurma, düzeltme ve yüzey sıyırma için yaylı çelik spatulalar, macun bıçakları ve kazıyıcılar.' },
  { code: 'FAM-05', name: 'Yalıtım Aletleri', productCount: 38, showOnHomepage: false, description: 'Taş yünü ve strafor levha işleri için uzun bıçaklı kesiciler, rendeler ve EPS sistemleri.' },
  { code: 'FAM-06', name: 'Ölçüm Aletleri', productCount: 41, showOnHomepage: false, description: 'Şantiyede doğruluğunu koruyan freze işlemeli su terazileri, gönyeler ve boya ipleri.' },
  { code: 'FAM-07', name: 'Güvenlik Ekipmanları', productCount: 29, showOnHomepage: false, description: 'Profesyonel güvenlik standartlarını karşılayan eldivenler, gözlükler ve şantiye koruma ekipmanları.' },
  { code: 'FAM-08', name: 'Teşhir Standları', productCount: 18, showOnHomepage: false, description: 'Dekor ürün yelpazesini etkileyici şekilde sunan perakende teşhir ve satış noktası sistemleri.' },
  { code: 'FAM-09', name: 'DKR', productCount: 24, showOnHomepage: true, description: 'Profesyonel amiral gemisi hattı — en yüksek beklentili ustalar için premium aletler.' },
  { code: 'FAM-10', name: 'Özel Tasarımlar', productCount: 12, showOnHomepage: false, description: 'Belirli pazarlar için ortaklarla geliştirilen özel ve özel markalı aletler.' },
  { code: 'FAM-11', name: 'Yeni Ürünler', productCount: 15, showOnHomepage: true, description: '2025’in en yeni ürünleri — yeni geometri, yeni malzemeler ve mühendislik geliştirmeleri.' },
];

/** Subcategories under FAM-01 (Boya Aletleri) — Decor Category.dc.html `const order`. */
export const SUBCATEGORIES: { familyCode: string; name: string }[] = [
  { familyCode: 'FAM-01', name: 'Rulolar' },
  { familyCode: 'FAM-01', name: 'Fırçalar' },
  { familyCode: 'FAM-01', name: 'Tepsiler' },
  { familyCode: 'FAM-01', name: 'Uzatma' },
  { familyCode: 'FAM-01', name: 'Aksesuarlar' },
];

export interface CatalogProduct {
  code: string; // DKR-… (public product code / sku)
  name: string;
  material: string;
  sizes: string;
  dim: string;
  tag: string; // ÇOK SATAN | PRO | YENİ | SET | ''
  familyCode: string;
  subName?: string; // subcategory label
}

/** 12 products — Decor Category.dc.html `const products` (Boya Aletleri catalog). */
export const CATEGORY_PRODUCTS: CatalogProduct[] = [
  { code: 'DKR-4200', name: 'Pro Rulo İskeleti 240mm', material: 'Kromlu çelik', sizes: '180 · 240 · 280', dim: '240 mm', tag: 'ÇOK SATAN', familyCode: 'FAM-01', subName: 'Rulolar' },
  { code: 'DKR-4215', name: 'Mini Rulo Seti 100mm', material: 'Mikrofiber', sizes: '100 mm', dim: '100 mm', tag: '', familyCode: 'FAM-01', subName: 'Rulolar' },
  { code: 'DKR-4232', name: 'Kalorifer Rulosu 60mm', material: 'Yüksek yoğunluklu sünger', sizes: '60 mm', dim: '60 mm', tag: '', familyCode: 'FAM-01', subName: 'Rulolar' },
  { code: 'DKR-4310', name: 'Açılı Kenar Fırçası 2"', material: 'Sentetik + kayın', sizes: '1 · 2 · 2.5"', dim: '50 mm', tag: '', familyCode: 'FAM-01', subName: 'Fırçalar' },
  { code: 'DKR-4325', name: 'Düz Duvar Fırçası 4"', material: 'Doğal kıl', sizes: '3 · 4 · 5"', dim: '100 mm', tag: 'PRO', familyCode: 'FAM-01', subName: 'Fırçalar' },
  { code: 'DKR-4340', name: 'Detay Fırça Seti', material: 'Sentetik filament', sizes: '3 parça', dim: 'SET', tag: 'SET', familyCode: 'FAM-01', subName: 'Fırçalar' },
  { code: 'DKR-4055', name: 'Boya Tepsisi ve Izgara Seti', material: 'Polipropilen', sizes: '240 mm', dim: '240 mm', tag: '', familyCode: 'FAM-01', subName: 'Tepsiler' },
  { code: 'DKR-4068', name: 'Kova Izgarası Pro', material: 'Galvanizli çelik', sizes: 'Üniversal', dim: '300 mm', tag: '', familyCode: 'FAM-01', subName: 'Tepsiler' },
  { code: 'DKR-4120', name: 'Teleskopik Sap 1,5–3m', material: 'Alüminyum', sizes: '1,5 – 3 m', dim: '3 m', tag: 'YENİ', familyCode: 'FAM-01', subName: 'Uzatma' },
  { code: 'DKR-4135', name: 'Sap Adaptör Dişi', material: 'İşlenmiş pirinç', sizes: 'Üniversal', dim: 'M12', tag: '', familyCode: 'FAM-01', subName: 'Uzatma' },
  { code: 'DKR-4410', name: 'Maskeleme Bandı Aparatı', material: 'ABS + çelik', sizes: '25 – 50 mm', dim: '50 mm', tag: '', familyCode: 'FAM-01', subName: 'Aksesuarlar' },
  { code: 'DKR-4420', name: 'Boya Filtre Ağı', material: 'Naylon ağ', sizes: '190 mikron', dim: 'Ø 200', tag: '', familyCode: 'FAM-01', subName: 'Aksesuarlar' },
];

/** The one fully-detailed product — Decor Product Detail.dc.html. */
export const DETAIL_PRODUCT = {
  code: 'DKR-3017',
  name: 'Profesyonel Spatula',
  eyebrow: 'ALÇI / SPATULA ALETLERİ',
  familyCode: 'FAM-04',
  canonical: 'https://www.dekor-tools.com/products/scraper-tools/professional-spatula',
  shortDescription: 'Yay çeliği veya sertleştirilmiş paslanmaz çelik seçenekleriyle, ince sıva ve macun uygulamaları için mühendislik ürünü profesyonel spatula.',
  materialSummary: 'Yay çeliği / Paslanmaz',
  // specsData → technical / variant table (7 rows)
  variants: [
    { code: 'DKR-3015', material: 'Yay çeliği', width: '60', length: '110', thickness: '0.5', pack: '12' },
    { code: 'DKR-3016', material: 'Yay çeliği', width: '80', length: '115', thickness: '0.5', pack: '12' },
    { code: 'DKR-3017', material: 'Yay çeliği', width: '100', length: '120', thickness: '0.6', pack: '12' },
    { code: 'DKR-3018', material: 'Yay çeliği', width: '120', length: '125', thickness: '0.6', pack: '10' },
    { code: 'DKR-3025', material: 'Paslanmaz', width: '100', length: '120', thickness: '0.6', pack: '12' },
    { code: 'DKR-3026', material: 'Paslanmaz', width: '120', length: '125', thickness: '0.7', pack: '10' },
    { code: 'DKR-3027', material: 'Paslanmaz', width: '150', length: '130', thickness: '0.7', pack: '8' },
  ],
  // features → engineering notes (5)
  features: [
    { num: '01', title: 'İki çelik seçeneği', desc: 'Maksimum esneklik için yay çeliği veya korozyon direnci ve kenar ömrü için sertleştirilmiş paslanmaz çelik seçin.' },
    { num: '02', title: 'Esnek bıçak geometrisi', desc: 'Mühendislik konikliği, bıçağın eşit yüklenmesini ve pürüzsüz, izsiz bir çekiş için temiz salınmasını sağlar.' },
    { num: '03', title: 'Sıva ve macun için optimize', desc: 'İnce sıva, macun ve yüzey onarımı için ayarlanmıştır — çalışma yüzeyi baskı altında doğruluğunu korur.' },
    { num: '04', title: 'Profesyonel tutuş sapı', desc: 'Yumuşak dokulu, perçinli sap aleti elde dengeler ve şantiyede çözücülere karşı dayanıklıdır.' },
    { num: '05', title: 'Çoklu genişlik seçenekleri', desc: '60 mm ile 150 mm arasında sunulur, böylece uygulayıcılar bıçağı her detay ve yüzeye uydurabilir.' },
  ],
  // gallery (5 items)
  gallery: [
    { code: 'DKR-3017', label: 'ANA GÖRSEL', caption: 'Tam alet · stüdyo ürün görseli', role: 'MAIN' },
    { code: 'DKR-3017-A', label: 'BIÇAK YAKIN ÇEKİM', caption: 'Konik yay çeliği kesim kenarı', role: 'CLOSE_UP' },
    { code: 'DKR-3017-B', label: 'SAP DETAYI', caption: 'Perçinli yumuşak tutuş, elde dengeli', role: 'HANDLE_DETAIL' },
    { code: 'DKR-3017-C', label: 'KULLANIMDA', caption: 'Sıva duvarda ince sıva bitirme işlemi', role: 'APPLICATION' },
    { code: 'DKR-3017-P', label: 'AMBALAJ', caption: 'Perakende blister ve katalog sunumu', role: 'PACKAGING' },
  ],
  // application areas (6)
  applications: [
    { title: 'İç Mekan Sıva', line: 'İç duvar ve tavanlarda pürüzsüz ince sıva ve düzeltme.' },
    { title: 'Dış Cephe Sıvası', line: 'Cephe ve alt zeminlerde çimento ve kireç sıvalarının bitirilmesi.' },
    { title: 'Derz Doldurma', line: 'Dekorasyon öncesi derzlerin doldurulması ve inceltilmesi.' },
    { title: 'Alçıpan', line: 'Kesintisiz bir yüzey için alçıpan bantlama ve derzleme.' },
    { title: 'Fayans Montajı', line: 'Fayans zeminlerde yapıştırıcı yayma ve arka sıvama.' },
    { title: 'Yüzey Onarımı', line: 'Duvarcılık, sıva ve hasarlı alçıyı hızlıca yamama.' },
  ],
  // downloadable documents (6)
  documents: [
    { title: 'Teknik Föy', format: 'PDF', size: '2.4 MB', type: 'TECHNICAL_SHEET' },
    { title: 'Ürün Kataloğu', format: 'PDF', size: '18.6 MB', type: 'CATALOG' },
    { title: 'Sertifikalar', format: 'ZIP', size: '4.1 MB', type: 'CERTIFICATE' },
    { title: 'Performans Beyanı', format: 'PDF', size: '820 KB', type: 'PERFORMANCE_DECLARATION' },
    { title: 'Kullanım Kılavuzu', format: 'PDF', size: '3.2 MB', type: 'USER_MANUAL' },
    { title: 'Garanti Bilgisi', format: 'PDF', size: '640 KB', type: 'WARRANTY' },
  ],
} as const;
