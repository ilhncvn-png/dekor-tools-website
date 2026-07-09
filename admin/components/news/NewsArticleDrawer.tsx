'use client';

import { useEffect, useState } from 'react';
import { Save, Images, Clock, Tag, Star, Plus, X, Search } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { newsCategoryTone, mediaItems, type NewsArticle } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';

const statusTone: Record<NewsArticle['status'], { tone: 'success' | 'warning'; label: string }> = {
  yayinda: { tone: 'success', label: 'Yayında' },
  taslak: { tone: 'warning', label: 'Taslak' },
};

interface NewsArticleDrawerProps {
  article: NewsArticle | null;
  onClose: () => void;
  onUpdate?: (updated: NewsArticle) => void;
}

/** Full article editor drawer — mirrors project/Decor Article.dc.html's real fields, the actual "client edits a news article" interface. */
export function NewsArticleDrawer({ article, onClose, onUpdate }: NewsArticleDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(article);
  const [form, setForm] = useState(article);
  const [tagInput, setTagInput] = useState('');
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  useEffect(() => {
    if (article) {
      setDisplay(article);
      setForm(article);
    }
  }, [article]);

  if (!display || !form) return null;

  const statusInfo = statusTone[form.status];

  function field<K extends keyof NewsArticle>(key: K, value: NewsArticle[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function addTag() {
    if (!tagInput.trim() || !form) return;
    field('tags', [...form.tags, tagInput.trim()]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    if (!form) return;
    field('tags', form.tags.filter((t) => t !== tag));
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    setDisplay(form);
    push({ tone: 'success', title: 'Makale kaydedildi', description: `${form.title} güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(article)}
      onClose={onClose}
      title={display.title}
      description={`/${display.slug}`}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => window.open(`https://dekortools.com/haberler/${display.slug}`, '_blank', 'noopener,noreferrer')}
          >
            Makaleyi Görüntüle
          </Button>
          <Button icon={<Save size={14} />} className="flex-1" onClick={saveChanges}>Kaydet</Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge>
        <Badge tone={newsCategoryTone[form.category]}>{form.category}</Badge>
        {form.featured && (
          <Badge tone="ai">
            <Star size={9} className="mr-0.5 inline" />
            Öne Çıkan
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Başlık</p>
        <Input value={form.title} onChange={(e) => field('title', e.target.value)} />
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Özet</p>
        <Textarea rows={3} value={form.excerpt} onChange={(e) => field('excerpt', e.target.value)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Kategori</p>
          <Select value={form.category} onChange={(e) => field('category', e.target.value as NewsArticle['category'])}>
            <option value="News">News</option>
            <option value="Trade Shows">Trade Shows</option>
            <option value="Training Academy">Training Academy</option>
            <option value="Company Life">Company Life</option>
          </Select>
        </div>
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Durum</p>
          <Select value={form.status} onChange={(e) => field('status', e.target.value as NewsArticle['status'])}>
            <option value="yayinda">Yayında</option>
            <option value="taslak">Taslak</option>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
        <span className="text-[12.5px] text-near-black dark:text-white/80">Öne Çıkan Makale</span>
        <Switch checked={form.featured} onChange={(v) => field('featured', v)} label="Öne çıkan" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Yayın Tarihi</p>
          <Input type="date" className="mt-1" value={form.date} onChange={(e) => field('date', e.target.value)} />
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Clock size={10} /> Okuma Süresi
          </p>
          <Input className="mt-1" value={form.readingTime} onChange={(e) => field('readingTime', e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Images size={11} /> Makale Galerisi ({form.gallery.length})
          </p>
          <button type="button" onClick={() => setGalleryPickerOpen(true)} className="text-[11.5px] font-medium text-red dark:text-red-eyebrow">
            Galeriye Ekle
          </button>
        </div>
        {form.gallery.length === 0 ? (
          <p className="rounded-soft border border-dashed border-border px-3 py-3 text-center text-[12px] text-steel dark:border-white/10 dark:text-white/40">
            Henüz galeri görseli eklenmedi.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {form.gallery.map((mediaId) => {
              const media = mediaItems.find((m) => m.id === mediaId);
              return (
                <div key={mediaId} className="group relative aspect-square overflow-hidden rounded-soft" style={{ backgroundColor: media?.swatch ?? '#8A9097' }}>
                  <span className="absolute inset-x-0 bottom-0 truncate bg-near-black/60 px-1.5 py-1 text-[9.5px] text-white">{media?.title ?? mediaId}</span>
                  <button
                    type="button"
                    onClick={() => field('gallery', form.gallery.filter((id) => id !== mediaId))}
                    aria-label="Galeriden kaldır"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-near-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MediaPickerModal
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        filterType="image"
        onSelect={(item) => {
          if (!form.gallery.includes(item.id)) field('gallery', [...form.gallery, item.id]);
          push({ tone: 'success', title: 'Galeriye eklendi', description: item.title });
        }}
      />

      <div className="mt-4 rounded-soft border border-border p-3.5 dark:border-white/[.06]">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <Search size={11} /> Sayfa SEO
        </p>
        <div>
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Meta Başlık</p>
          <Input value={form.metaTitle ?? `${form.title} | Dekor Tools`} onChange={(e) => field('metaTitle', e.target.value)} maxLength={60} />
        </div>
        <div className="mt-2.5">
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Meta Açıklama</p>
          <Textarea rows={2} value={form.metaDescription ?? form.excerpt} onChange={(e) => field('metaDescription', e.target.value)} maxLength={160} />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <Tag size={10} /> Etiketler
        </p>
        <div className="flex flex-wrap gap-1.5">
          {form.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1 align-middle" aria-label={`${tag} etiketini sil`}>
                <X size={9} className="inline" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Yeni etiket..."
            className="flex-1"
          />
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addTag}>Ekle</Button>
        </div>
      </div>
    </Drawer>
  );
}
