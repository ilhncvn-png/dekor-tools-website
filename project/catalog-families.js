// Dekor product families — the single shared definition behind the /urunler family
// grid and the home-page product showcase (all 7 languages).
//
// Live values (Turkish name + description, published product count, category slug)
// come from the published product snapshot: /admin/api/public/products → categories.
// This module only holds presentation metadata (order, cover photo, per-language
// labels and the static fallback shown if the API is unreachable).

export const FAMILY_CODES = ['FAM-01','FAM-02','FAM-03','FAM-04','FAM-05','FAM-06','FAM-07','FAM-08','FAM-09','FAM-10','FAM-11'];

/** Families shown on the home-page showcase (the rest are one click away on /urunler). */
export const HOME_FEATURED = ['FAM-01','FAM-02','FAM-03','FAM-06'];

/** Category covers — real product photography. Özel Tasarımlar has no verified photo. */
export const COVERS = {
  'FAM-01':'boya', 'FAM-02':'siva', 'FAM-03':'fayans', 'FAM-04':'alci', 'FAM-05':'izolasyon',
  'FAM-06':'olcu', 'FAM-07':'is-guvenligi', 'FAM-08':'teshir', 'FAM-09':'dkr', 'FAM-11':'yeni',
};

/** Card top-accent bar: interface blue / charcoal, alternating as on the original grid. */
const BLUE = '#0095DA', DARK = '#1A1C1F';
export const ACCENTS = {
  'FAM-01':BLUE, 'FAM-02':DARK, 'FAM-03':DARK, 'FAM-04':BLUE, 'FAM-05':DARK, 'FAM-06':DARK,
  'FAM-07':BLUE, 'FAM-08':DARK, 'FAM-09':BLUE, 'FAM-10':DARK, 'FAM-11':BLUE,
};

export const PRODUCTS_ROUTE = { tr:'/urunler', en:'/en/products', de:'/de/produkte', fr:'/fr/produits', ru:'/ru/produkty', az:'/az/mehsullar', ar:'/ar/المنتجات' };
export const CATEGORY_ROUTE = {
  tr:'/urunler/kategori', en:'/en/products/category', de:'/de/produkte/kategorie', fr:'/fr/produits/categorie',
  ru:'/ru/produkty/kategoriya', az:'/az/mehsullar/kateqoriya', ar:'/ar/المنتجات/الفئة',
};

/** Per-language family name + description (static fallback; TR is replaced by live data). */
const TEXT = {
  "tr": {
    "FAM-01": [
      "Boya Aletleri",
      "Boya uygulamalarında temiz ve profesyonel sonuç için tasarlanan aletler."
    ],
    "FAM-02": [
      "Sıva Aletleri",
      "Sıva uygulamalarında düzgün ve dayanıklı yüzeyler için profesyonel aletler."
    ],
    "FAM-03": [
      "Fayans Aletleri",
      "Fayans ve seramik uygulamaları için hassas ve dayanıklı aletler."
    ],
    "FAM-04": [
      "Alçı Aletleri",
      "Alçı, macun ve yüzey hazırlama işleri için profesyonel aletler."
    ],
    "FAM-05": [
      "İzolasyon Aletleri",
      "Isı ve ses yalıtımı uygulamaları için tasarlanan aletler."
    ],
    "FAM-06": [
      "Ölçü Aletleri",
      "Şantiyede doğru ölçüm ve hizalama için profesyonel ölçü aletleri."
    ],
    "FAM-07": [
      "İş Güvenliği Ekipmanları",
      "Şantiyede kullanıcıyı korumaya yönelik iş güvenliği ekipmanları."
    ],
    "FAM-08": [
      "Tanıtım Teşhir Standları",
      "Dekor ürünlerini satış noktalarında sergilemek için tanıtım ve teşhir çözümleri."
    ],
    "FAM-09": [
      "dkr Marka Ürünler",
      "dkr markası altında sunulan profesyonel ürünler."
    ],
    "FAM-10": [
      "Özel Tasarımlar",
      "Standart ürün gamı dışında; ihracat ve iç piyasa talepleri doğrultusunda üretilen özel ürünler ve promosyon ürünleri."
    ],
    "FAM-11": [
      "Yeni Ürünler",
      "Ürün gruplarımıza yeni eklenen ürünlere tek noktadan hızlı erişim."
    ]
  },
  "en": {
    "FAM-01": [
      "Painting Tools",
      "Tools designed for clean, professional results in painting work."
    ],
    "FAM-02": [
      "Plastering Tools",
      "Professional tools for smooth, durable surfaces in plastering work."
    ],
    "FAM-03": [
      "Tiling Tools",
      "Precise, durable tools for tile and ceramic work."
    ],
    "FAM-04": [
      "Drywall Tools",
      "Professional tools for gypsum, filler and surface preparation work."
    ],
    "FAM-05": [
      "Insulation Tools",
      "Tools designed for thermal and acoustic insulation work."
    ],
    "FAM-06": [
      "Measuring Tools",
      "Professional measuring tools for accurate measuring and alignment on site."
    ],
    "FAM-07": [
      "Occupational Safety Equipment",
      "Occupational safety equipment designed to protect the user on site."
    ],
    "FAM-08": [
      "Promotional Display Stands",
      "Promotional and display solutions for presenting Dekor products at the point of sale."
    ],
    "FAM-09": [
      "dkr Brand Products",
      "Professional products offered under the dkr brand."
    ],
    "FAM-10": [
      "Custom Designs",
      "Custom products and promotional items made outside the standard range, in line with export and domestic market requests."
    ],
    "FAM-11": [
      "New Products",
      "Quick, single-point access to the latest additions to our product groups."
    ]
  },
  "de": {
    "FAM-01": [
      "Malerwerkzeuge",
      "Werkzeuge für saubere, professionelle Ergebnisse bei Malerarbeiten."
    ],
    "FAM-02": [
      "Putzwerkzeuge",
      "Professionelle Werkzeuge für glatte, dauerhafte Oberflächen bei Putzarbeiten."
    ],
    "FAM-03": [
      "Fliesenwerkzeuge",
      "Präzise und langlebige Werkzeuge für Fliesen- und Keramikarbeiten."
    ],
    "FAM-04": [
      "Trockenbauwerkzeuge",
      "Professionelle Werkzeuge für Gips-, Spachtel- und Untergrundvorbereitungsarbeiten."
    ],
    "FAM-05": [
      "Dämmwerkzeuge",
      "Werkzeuge für Wärme- und Schalldämmarbeiten."
    ],
    "FAM-06": [
      "Messwerkzeuge",
      "Professionelle Messwerkzeuge für genaues Messen und Ausrichten auf der Baustelle."
    ],
    "FAM-07": [
      "Arbeitsschutzausrüstung",
      "Arbeitsschutzausrüstung zum Schutz des Anwenders auf der Baustelle."
    ],
    "FAM-08": [
      "Werbe- und Präsentationsständer",
      "Werbe- und Präsentationslösungen, um Dekor-Produkte am Point of Sale zu präsentieren."
    ],
    "FAM-09": [
      "dkr Markenprodukte",
      "Professionelle Produkte der Marke dkr."
    ],
    "FAM-10": [
      "Sonderanfertigungen",
      "Sonderprodukte und Werbeartikel außerhalb des Standardsortiments, gefertigt nach Anforderungen aus Export und Inlandsmarkt."
    ],
    "FAM-11": [
      "Neue Produkte",
      "Schneller, zentraler Zugriff auf die neu in unsere Produktgruppen aufgenommenen Produkte."
    ]
  },
  "fr": {
    "FAM-01": [
      "Outils de peinture",
      "Outils conçus pour un résultat propre et professionnel dans les travaux de peinture."
    ],
    "FAM-02": [
      "Outils de plâtrage",
      "Outils professionnels pour des surfaces lisses et durables dans les travaux d’enduit."
    ],
    "FAM-03": [
      "Outils de carrelage",
      "Outils précis et durables pour la pose de carrelage et de céramique."
    ],
    "FAM-04": [
      "Outils de plaquiste",
      "Outils professionnels pour les travaux de plâtre, d’enduit de rebouchage et de préparation des surfaces."
    ],
    "FAM-05": [
      "Outils d’isolation",
      "Outils conçus pour les travaux d’isolation thermique et acoustique."
    ],
    "FAM-06": [
      "Outils de mesure",
      "Outils de mesure professionnels pour des mesures et des alignements précis sur chantier."
    ],
    "FAM-07": [
      "Équipements de sécurité au travail",
      "Équipements de sécurité au travail destinés à protéger l’utilisateur sur chantier."
    ],
    "FAM-08": [
      "Présentoirs promotionnels",
      "Solutions de promotion et de présentation pour mettre en valeur les produits Dekor sur les points de vente."
    ],
    "FAM-09": [
      "Produits de la marque dkr",
      "Produits professionnels proposés sous la marque dkr."
    ],
    "FAM-10": [
      "Créations sur mesure",
      "Produits spéciaux et articles promotionnels fabriqués hors gamme standard, selon les demandes de l’export et du marché intérieur."
    ],
    "FAM-11": [
      "Nouveaux produits",
      "Un accès rapide et centralisé aux produits récemment ajoutés à nos gammes."
    ]
  },
  "ru": {
    "FAM-01": [
      "Малярные инструменты",
      "Инструменты для чистого и профессионального результата при малярных работах."
    ],
    "FAM-02": [
      "Штукатурные инструменты",
      "Профессиональные инструменты для ровных и долговечных поверхностей при штукатурных работах."
    ],
    "FAM-03": [
      "Инструменты для плитки",
      "Точные и долговечные инструменты для работы с плиткой и керамикой."
    ],
    "FAM-04": [
      "Инструменты для гипсокартона",
      "Профессиональные инструменты для работ с гипсом, шпатлёвкой и подготовки поверхностей."
    ],
    "FAM-05": [
      "Инструменты для изоляции",
      "Инструменты для работ по тепло- и звукоизоляции."
    ],
    "FAM-06": [
      "Измерительные инструменты",
      "Профессиональные измерительные инструменты для точных измерений и выравнивания на объекте."
    ],
    "FAM-07": [
      "Средства охраны труда",
      "Средства охраны труда для защиты пользователя на объекте."
    ],
    "FAM-08": [
      "Рекламные и выставочные стенды",
      "Рекламные и выставочные решения для представления продукции Dekor в точках продаж."
    ],
    "FAM-09": [
      "Продукция марки dkr",
      "Профессиональная продукция, выпускаемая под маркой dkr."
    ],
    "FAM-10": [
      "Специальные разработки",
      "Специальные изделия и промопродукция вне стандартного ассортимента, изготавливаемые по запросам экспортного и внутреннего рынков."
    ],
    "FAM-11": [
      "Новые продукты",
      "Быстрый доступ в одном месте к новым продуктам, добавленным в наши товарные группы."
    ]
  },
  "az": {
    "FAM-01": [
      "Boya Alətləri",
      "Boya işlərində təmiz və peşəkar nəticə üçün hazırlanmış alətlər."
    ],
    "FAM-02": [
      "Suvaq Alətləri",
      "Suvaq işlərində hamar və davamlı səthlər üçün peşəkar alətlər."
    ],
    "FAM-03": [
      "Kafel Alətləri",
      "Kafel və keramika işləri üçün dəqiq və davamlı alətlər."
    ],
    "FAM-04": [
      "Alçı Alətləri",
      "Alçı, şpaklyovka və səth hazırlığı işləri üçün peşəkar alətlər."
    ],
    "FAM-05": [
      "İzolyasiya Alətləri",
      "İstilik və səs izolyasiyası işləri üçün hazırlanmış alətlər."
    ],
    "FAM-06": [
      "Ölçü Alətləri",
      "Tikinti sahəsində dəqiq ölçmə və düzləndirmə üçün peşəkar ölçü alətləri."
    ],
    "FAM-07": [
      "Əməyin Təhlükəsizliyi Avadanlıqları",
      "Tikinti sahəsində istifadəçini qorumaq üçün əməyin təhlükəsizliyi avadanlıqları."
    ],
    "FAM-08": [
      "Tanıtım və Nümayiş Stendləri",
      "Dekor məhsullarını satış nöqtələrində nümayiş etdirmək üçün tanıtım və nümayiş həlləri."
    ],
    "FAM-09": [
      "dkr Brend Məhsulları",
      "dkr brendi altında təqdim olunan peşəkar məhsullar."
    ],
    "FAM-10": [
      "Xüsusi Dizaynlar",
      "Standart məhsul çeşidindən kənar; ixracat və daxili bazar tələblərinə uyğun istehsal olunan xüsusi məhsullar və promosyon məhsulları."
    ],
    "FAM-11": [
      "Yeni Məhsullar",
      "Məhsul qruplarımıza yeni əlavə olunan məhsullara bir nöqtədən sürətli çıxış."
    ]
  },
  "ar": {
    "FAM-01": [
      "أدوات الطلاء",
      "أدوات مصممة لتحقيق نتائج نظيفة واحترافية في أعمال الطلاء."
    ],
    "FAM-02": [
      "أدوات اللياسة",
      "أدوات احترافية للحصول على أسطح ناعمة ومتينة في أعمال اللياسة."
    ],
    "FAM-03": [
      "أدوات البلاط",
      "أدوات دقيقة ومتينة لأعمال البلاط والسيراميك."
    ],
    "FAM-04": [
      "أدوات الجبس",
      "أدوات احترافية لأعمال الجبس والمعجون وتجهيز الأسطح."
    ],
    "FAM-05": [
      "أدوات العزل",
      "أدوات مصممة لأعمال العزل الحراري والصوتي."
    ],
    "FAM-06": [
      "أدوات القياس",
      "أدوات قياس احترافية للقياس الدقيق والمحاذاة في موقع العمل."
    ],
    "FAM-07": [
      "معدات السلامة المهنية",
      "معدات السلامة المهنية المخصصة لحماية المستخدم في موقع العمل."
    ],
    "FAM-08": [
      "منصات العرض الترويجية",
      "حلول ترويجية وعرض لتقديم منتجات Dekor في نقاط البيع."
    ],
    "FAM-09": [
      "منتجات علامة dkr",
      "منتجات احترافية تُقدَّم تحت علامة dkr."
    ],
    "FAM-10": [
      "التصاميم الخاصة",
      "منتجات خاصة ومنتجات ترويجية تُصنَّع خارج التشكيلة القياسية وفقًا لطلبات التصدير والسوق المحلية."
    ],
    "FAM-11": [
      "المنتجات الجديدة",
      "وصول سريع ومن مكان واحد إلى المنتجات المضافة حديثًا إلى مجموعات منتجاتنا."
    ]
  }
};

function ruPlural(n, one, few, many){
  const m10 = n % 10, m100 = n % 100;
  if(m10 === 1 && m100 !== 11) return one;
  if(m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const COUNT_LABEL = {
  tr: (n) => n + ' ÜRÜN',
  en: (n) => n + (n === 1 ? ' PRODUCT' : ' PRODUCTS'),
  de: (n) => n + (n === 1 ? ' PRODUKT' : ' PRODUKTE'),
  fr: (n) => n + (n === 1 ? ' PRODUIT' : ' PRODUITS'),
  ru: (n) => n + ' ' + ruPlural(n, 'ТОВАР', 'ТОВАРА', 'ТОВАРОВ'),
  az: (n) => n + ' MƏHSUL',
  ar: (n) => n + ' ' + (n >= 3 && n <= 10 ? 'منتجات' : n >= 11 ? 'منتجًا' : 'منتج'),
};

/** Localised "<n> products" label. */
export function countLabel(n, lang){
  return (COUNT_LABEL[lang] || COUNT_LABEL.tr)(n);
}

let _pending = null;
/** Published snapshot categories + total product count (memoised; null when unavailable). */
export function loadCatalog(){
  if(!_pending){
    _pending = fetch('/admin/api/public/products', { cache:'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && d.published !== false && d.categories ? { categories:d.categories, total:d.count } : null))
      .catch(() => null);
  }
  return _pending;
}

/** Live product count for one family; Yeni Ürünler (fam-11) drops products past their newUntil date. */
function liveCount(code, f){
  let n = f.productCount;
  if(code === 'FAM-11' && f.newUntil && typeof f.newUntil === 'object' && Array.isArray(f.productCodes)){
    const now = Date.now();
    n = f.productCodes.filter((c) => { const v = f.newUntil[c]; return !(v && Date.parse(v) < now); }).length;
  }
  return typeof n === 'number' && isFinite(n) ? n : null;
}

/**
 * Families for one language, in catalogue order: { code, accent, name, desc, count, countLabel, cover, link }.
 * `catalog` is the loadCatalog() result (or null for the static fallback).
 */
export function buildFamilies(lang, catalog){
  const text = TEXT[lang] || TEXT.tr;
  const cats = (catalog && catalog.categories) || null;
  return FAMILY_CODES.map((code) => {
    const f = cats ? cats[code.toLowerCase()] : null;
    const [name, desc] = text[code];
    const count = f ? liveCount(code, f) : null;
    const cover = COVERS[code] ? 'uploads/kategoriler/' + COVERS[code] + '.webp' : '';
    return {
      code,
      accent: ACCENTS[code],
      name: lang === 'tr' && f && f.name ? f.name : name,
      desc: lang === 'tr' && f && f.description ? f.description : desc,
      count,
      countLabel: count === null ? '' : countLabel(count, lang),
      cover,
      link: f && f.slug ? CATEGORY_ROUTE[lang] + '/' + f.slug : CATEGORY_ROUTE[lang],
    };
  });
}
