'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload,
  Sun,
  Moon,
  Star,
  Clock,
  Package,
  FileText,
  Users,
  Settings,
  Blocks,
  TrendingUp,
  Image as ImageIcon,
  BadgeCheck,
  Newspaper,
  Handshake,
  FolderTree,
  Component,
  type LucideIcon,
} from 'lucide-react';
import { primaryNavigation } from '@/lib/navigation';
import {
  products, fileDocs, adminUsers, mediaItems, seoRows, certificates, newsArticles,
  dealers, categories, globalBanners,
  homepageSections, manufacturingSections, aboutSections, exportSections,
  dealerPageSections, supportSections, newsroomSections, careerSections,
  productDetailSections, categoryTemplateSections, newsDetailSections, contactPageSections,
  productsLandingSections, becomeDealerSections,
  type HomepageSection,
} from '@/lib/mock-data';

/** Every page-builder section array paired with the CMS route that edits it — the backbone of "search finds everything related". */
const SECTION_SOURCES: { sections: HomepageSection[]; route: string; page: string }[] = [
  { sections: homepageSections, route: '/ana-sayfa-olusturucu', page: 'Ana Sayfa' },
  { sections: manufacturingSections, route: '/uretim-sayfasi', page: 'Üretim' },
  { sections: aboutSections, route: '/hakkimizda-sayfasi', page: 'Hakkımızda' },
  { sections: exportSections, route: '/ihracat-sayfasi', page: 'İhracat' },
  { sections: dealerPageSections, route: '/bayi-sayfasi', page: 'Yetkili Bayiler' },
  { sections: becomeDealerSections, route: '/bayi-ol-sayfasi', page: 'Bayi Ol' },
  { sections: supportSections, route: '/destek-sayfasi', page: 'Destek' },
  { sections: newsroomSections, route: '/haberler-sayfasi', page: 'Newsroom' },
  { sections: careerSections, route: '/kariyer-sayfasi', page: 'Kariyer' },
  { sections: productDetailSections, route: '/urun-detay-sablonu', page: 'Ürün Detay Şablonu' },
  { sections: categoryTemplateSections, route: '/kategori-sablonu', page: 'Kategori Şablonu' },
  { sections: newsDetailSections, route: '/haber-detay-sablonu', page: 'Haber Detay Şablonu' },
  { sections: contactPageSections, route: '/iletisim-sayfasi', page: 'İletişim' },
  { sections: productsLandingSections, route: '/urunler-sayfasi', page: 'Ürünler' },
];
import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface FlatResult {
  key: string;
  section: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  shortcut?: string;
  run: () => void;
}

const RECENT_KEY = 'dcc-recent-commands';
const PINNED_KEY = 'dcc-pinned-commands';
const MAX_RECENT = 4;

function readStoredKeys(storageKey: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Ctrl/Cmd+K command center — Modüller, Komutlar, Ürünler, Dosyalar,
 * Kullanıcılar, Ayarlar (all real navigation), plus Sabitlenenler
 * (pin/unpin, persisted) and Son Kullanılanlar (auto-tracked, persisted) —
 * both localStorage-backed since there's no backend yet. Not a full-text
 * content search engine (docs/architecture/11_SEARCH_ENGINE.md is later).
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [pinnedKeys, setPinnedKeys] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentKeys(readStoredKeys(RECENT_KEY));
    setPinnedKeys(readStoredKeys(PINNED_KEY));
  }, []);

  const allResults = useMemo<FlatResult[]>(() => {
    const modules: FlatResult[] = primaryNavigation.map((item) => ({
      key: `module:${item.href}`,
      section: 'Modüller',
      icon: item.icon,
      label: item.label,
      description: item.description,
      run: () => router.push(item.href),
    }));

    const commands: FlatResult[] = [
      {
        key: 'cmd-new-product',
        section: 'Komutlar',
        icon: Plus,
        label: 'Yeni Ürün Ekle',
        description: 'Ürün Yönetimi modülünü aç',
        shortcut: '⌘N',
        run: () => router.push('/urun-yonetimi'),
      },
      {
        key: 'cmd-upload-media',
        section: 'Komutlar',
        icon: Upload,
        label: 'Medya Yükle',
        description: 'Medya Kütüphanesi modülünü aç',
        run: () => router.push('/medya-kutuphanesi'),
      },
      {
        key: 'cmd-toggle-theme',
        section: 'Komutlar',
        icon: theme === 'dark' ? Sun : Moon,
        label: theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç',
        description: 'Görünüm temasını değiştir',
        run: () => toggleTheme(),
      },
    ];

    const productResults: FlatResult[] = products.map((p) => ({
      key: `product:${p.id}`,
      section: 'Ürünler',
      icon: Package,
      label: p.name,
      description: `${p.category} · ${p.sku}`,
      run: () => router.push('/urun-yonetimi'),
    }));

    const fileResults: FlatResult[] = fileDocs.map((f) => ({
      key: `file:${f.id}`,
      section: 'Dosyalar',
      icon: FileText,
      label: f.name,
      description: `${f.category} · ${f.format} · ${f.linkedTo ?? 'bağlantısız'}`,
      run: () => router.push('/dosya-merkezi'),
    }));

    const userResults: FlatResult[] = adminUsers.slice(0, 4).map((u) => ({
      key: `user:${u.id}`,
      section: 'Kullanıcılar',
      icon: Users,
      label: u.name,
      description: `${u.role} · ${u.email}`,
      run: () => router.push('/kullanicilar'),
    }));

    const sectionResults: FlatResult[] = SECTION_SOURCES.flatMap(({ sections, route, page }) =>
      sections.map((s) => ({
        key: `section:${s.id}`,
        section: 'Sayfa Bölümleri',
        icon: Blocks,
        label: `${s.name} — ${page}`,
        description: [s.title, s.eyebrow].filter(Boolean).join(' · ') || s.type,
        run: () => router.push(route),
      }))
    );

    const seoResults: FlatResult[] = seoRows.map((r) => ({
      key: `seo:${r.id}`,
      section: 'SEO',
      icon: TrendingUp,
      label: `${r.page} — SEO`,
      description: [r.title, ...r.keywords].filter(Boolean).join(' · '),
      run: () => router.push('/seo-yonetimi'),
    }));

    const mediaResults: FlatResult[] = mediaItems.map((m) => ({
      key: `media:${m.id}`,
      section: 'Medya',
      icon: ImageIcon,
      label: m.title,
      description: `${m.name} · ${m.folder}`,
      run: () => router.push('/medya-kutuphanesi'),
    }));

    const certResults: FlatResult[] = certificates.map((c) => ({
      key: `cert:${c.id}`,
      section: 'Sertifikalar',
      icon: BadgeCheck,
      label: c.name,
      description: `${c.issuer} · ${c.scope}`,
      run: () => router.push('/sertifikalar'),
    }));

    const newsResults: FlatResult[] = newsArticles.map((a) => ({
      key: `news:${a.id}`,
      section: 'Haberler',
      icon: Newspaper,
      label: a.title,
      description: `${a.category} · ${a.tags.join(', ')}`,
      run: () => router.push('/haberler'),
    }));

    const dealerResults: FlatResult[] = dealers.map((d) => ({
      key: `dealer:${d.id}`,
      section: 'Bayiler',
      icon: Handshake,
      label: d.company,
      description: `${d.country} · ${d.contact}`,
      run: () => router.push('/bayi-yonetimi'),
    }));

    const categoryResults: FlatResult[] = categories.map((c) => ({
      key: `category:${c.id}`,
      section: 'Kategoriler',
      icon: FolderTree,
      label: c.name,
      description: c.description,
      run: () => router.push('/kategori-yonetimi'),
    }));

    const bannerResults: FlatResult[] = globalBanners.map((b) => ({
      key: `banner:${b.id}`,
      section: 'Genel Bileşenler',
      icon: Component,
      label: b.name,
      description: b.placements.join(', '),
      run: () => router.push('/genel-bilesenler'),
    }));

    const settingsResults: FlatResult[] = [
      { key: 'settings-general', label: 'Şirket Bilgileri', description: 'Genel ayarlar' },
      { key: 'settings-brand', label: 'Marka Ayarları', description: 'Logo ve renkler' },
      { key: 'settings-domain', label: 'Domain Ayarları', description: 'Alan adı ve SSL' },
      { key: 'settings-smtp', label: 'E-posta / SMTP', description: 'Gönderim ayarları' },
      { key: 'settings-backup', label: 'Yedekleme', description: 'Otomatik yedekleme durumu' },
    ].map((s) => ({ ...s, section: 'Ayarlar', icon: Settings, run: () => router.push('/sistem-ayarlari') }));

    return [
      ...modules, ...commands, ...productResults, ...fileResults, ...userResults, ...settingsResults,
      ...sectionResults, ...seoResults, ...mediaResults, ...certResults, ...newsResults,
      ...dealerResults, ...categoryResults, ...bannerResults,
    ];
  }, [router, theme, toggleTheme]);

  const resultsByKey = useMemo(() => new Map(allResults.map((r) => [r.key, r])), [allResults]);

  const recentResults = recentKeys.map((k) => resultsByKey.get(k)).filter((r): r is FlatResult => Boolean(r));
  const pinnedResults = pinnedKeys.map((k) => resultsByKey.get(k)).filter((r): r is FlatResult => Boolean(r));

  // Default (no query) view stays a short, curated browse list — the full
  // content index (sections, SEO, media, dealers, etc.) only appears once
  // the user actually searches, so the palette isn't a 150-row dump on open.
  const DEFAULT_BROWSE_SECTIONS = new Set(['Modüller', 'Komutlar', 'Ayarlar']);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const pinnedSection = pinnedResults.map((r) => ({ ...r, section: 'Sabitlenenler' }));
      const recentSection = recentResults.map((r) => ({ ...r, section: 'Son Kullanılanlar' }));
      const browsable = allResults.filter((r) => DEFAULT_BROWSE_SECTIONS.has(r.section));
      return [...pinnedSection, ...recentSection, ...browsable];
    }
    return allResults.filter((item) => item.label.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, allResults, recentKeys, pinnedKeys]);

  const sections = useMemo(() => {
    const seen = new Map<string, FlatResult[]>();
    for (const r of results) {
      if (!seen.has(r.section)) seen.set(r.section, []);
      seen.get(r.section)!.push(r);
    }
    return Array.from(seen.entries());
  }, [results]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  function runResult(target: FlatResult) {
    target.run();
    const next = [target.key, ...recentKeys.filter((k) => k !== target.key)].slice(0, MAX_RECENT);
    setRecentKeys(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    onClose();
  }

  function togglePin(key: string, event: React.MouseEvent) {
    event.stopPropagation();
    const next = pinnedKeys.includes(key) ? pinnedKeys.filter((k) => k !== key) : [...pinnedKeys, key];
    setPinnedKeys(next);
    window.localStorage.setItem(PINNED_KEY, JSON.stringify(next));
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) runResult(target);
    } else if (event.key === 'Escape') {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-near-black/50 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Komut Paleti"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-soft border border-border bg-white shadow-elevation-lg dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 dark:border-white/10">
              <Search size={16} className="text-steel dark:text-white/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Modül, ürün, dosya veya kullanıcı ara..."
                aria-label="Komut paleti arama"
                className="flex-1 bg-transparent text-sm text-near-black outline-none placeholder:text-steel/60 dark:text-white dark:placeholder:text-white/30"
              />
              <kbd className="rounded-sharp border border-border px-1.5 py-0.5 font-mono text-[10px] text-steel dark:border-white/10 dark:text-white/40">
                ESC
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-steel dark:text-white/40">Sonuç bulunamadı.</p>
              )}
              {sections.map(([section, items]) => (
                <div key={section} className="mb-1 last:mb-0">
                  <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-steel dark:text-white/40">
                    {section}
                  </div>
                  {items.map((item) => {
                    const index = results.indexOf(item);
                    const Icon = item.icon;
                    const isPinned = pinnedKeys.includes(item.key);
                    return (
                      <button
                        key={`${section}-${item.key}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => runResult(item)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-soft px-3 py-2.5 text-left text-sm transition-colors',
                          index === activeIndex
                            ? 'bg-red/10 text-red dark:bg-red/15 dark:text-red-eyebrow'
                            : 'text-near-black dark:text-white/80'
                        )}
                      >
                        <Icon size={16} strokeWidth={1.8} className="shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{item.label}</span>
                          {item.description && (
                            <span className="block truncate text-[12px] font-normal text-steel dark:text-white/40">
                              {item.description}
                            </span>
                          )}
                        </span>
                        {item.shortcut && (
                          <kbd className="shrink-0 rounded-sharp border border-current/20 px-1.5 py-0.5 font-mono text-[10px] opacity-60">
                            {item.shortcut}
                          </kbd>
                        )}
                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => togglePin(item.key, e)}
                          className={cn(
                            'shrink-0 rounded-soft p-1 opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/10',
                            isPinned && 'opacity-100'
                          )}
                          aria-label={isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                        >
                          <Star size={13} className={isPinned ? 'fill-current text-warning' : ''} />
                        </span>
                        {index === activeIndex && <CornerDownLeft size={13} className="shrink-0 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1px] text-steel dark:border-white/10 dark:text-white/30">
              <span className="flex items-center gap-1">
                <ArrowUp size={11} />
                <ArrowDown size={11} />
                Gezin
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft size={11} />
                Git
              </span>
              <span className="ml-auto flex items-center gap-1">
                <Clock size={11} />
                Son kullanılanlar otomatik kaydedilir
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
