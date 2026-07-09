'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Star, Images } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { NewsArticleDrawer } from '@/components/news/NewsArticleDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { newsArticles as initialNewsArticles, newsCategoryTone, type NewsArticle } from '@/lib/mock-data';

const statusTone: Record<NewsArticle['status'], { tone: 'success' | 'warning'; label: string }> = {
  yayinda: { tone: 'success', label: 'Yayında' },
  taslak: { tone: 'warning', label: 'Taslak' },
};

/** News content management — real Newsroom articles (title, category, gallery, tags), grounded in project/news-data.js. */
export default function HaberlerPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(initialNewsArticles);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);

  const filtered = useMemo(() => {
    return newsArticles.filter((a) => {
      if (query && !a.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== 'all' && a.category !== category) return false;
      return true;
    });
  }, [newsArticles, query, category]);

  function addArticle() {
    const newArticle: NewsArticle = {
      id: `new-${Date.now()}`,
      slug: `yeni-makale-${Date.now()}`,
      category: 'News',
      date: new Date().toISOString().slice(0, 10),
      readingTime: '1 min read',
      title: 'Yeni Makale',
      excerpt: '',
      featured: false,
      status: 'taslak',
      gallery: [],
      tags: [],
    };
    setNewsArticles((prev) => [newArticle, ...prev]);
    setActiveArticle(newArticle);
  }

  function updateArticle(updated: NewsArticle) {
    setNewsArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setActiveArticle(updated);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setNewsArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Haberler"
        description="Newsroom makaleleri — Decor Newsroom ve Decor Article sayfalarını besleyen gerçek içerik kaynağı."
        actions={<Button icon={<Plus size={15} />} onClick={addArticle}>Yeni Makale</Button>}
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} makale</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Başlık ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-48">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Tüm Kategoriler</option>
            <option value="News">News</option>
            <option value="Trade Shows">Trade Shows</option>
            <option value="Training Academy">Training Academy</option>
            <option value="Company Life">Company Life</option>
          </Select>
        </div>
      </Toolbar>

      <Table>
        <Thead>
          <Tr>
            <Th>Başlık</Th>
            <Th>Kategori</Th>
            <Th>Durum</Th>
            <Th>Tarih</Th>
            <Th>Galeri</Th>
            <Th className="w-10" />
          </Tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <TableEmptyRow colSpan={6}>Arama kriterlerine uyan makale bulunamadı.</TableEmptyRow>}
          {filtered.map((article) => {
            const statusInfo = statusTone[article.status];
            return (
              <Tr key={article.id} interactive onClick={() => setActiveArticle(article)}>
                <Td className="max-w-md">
                  <div className="flex items-center gap-1.5">
                    {article.featured && <Star size={12} className="shrink-0 text-red dark:text-red-eyebrow" />}
                    <span className="truncate font-medium">{article.title}</span>
                  </div>
                </Td>
                <Td><Badge tone={newsCategoryTone[article.category]}>{article.category}</Badge></Td>
                <Td><Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge></Td>
                <Td className="text-steel dark:text-white/50">{article.date}</Td>
                <Td>
                  <span className="flex items-center gap-1 text-[12px] text-steel dark:text-white/50">
                    <Images size={11} /> {article.gallery.length}
                  </span>
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => setDeleteTarget(article)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Makaleyi sil">
                    <Trash2 size={16} />
                  </button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <NewsArticleDrawer article={activeArticle} onClose={() => setActiveArticle(null)} onUpdate={updateArticle} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Makaleyi sil"
        description={deleteTarget ? <>"{deleteTarget.title}" makalesini kalıcı olarak silmek üzeresiniz.</> : null}
        confirmLabel="Makaleyi Sil"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
