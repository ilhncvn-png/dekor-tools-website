'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, Pencil, Plus, ExternalLink, Trash2, EyeOff } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NavItemDrawer } from '@/components/navigation/NavItemDrawer';
import { navigationMenu as seedNavigationMenu, type NavMenuItem } from '@/lib/mock-data';
import { getNavigationMenu, saveNavigationMenu } from '@/lib/actions/navigation-actions';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

function reorder(items: NavMenuItem[], index: number, direction: -1 | 1): NavMenuItem[] {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((it, i) => ({ ...it, order: i + 1 }));
}

/** Menu hierarchy editor — nested items, external-link flags, real reordering, visibility, add/edit/delete. */
export default function NavigasyonYonetimiPage() {
  const { push } = useToast();
  const [menu, setMenu] = useState<NavMenuItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ nm1: true });
  const [activeItem, setActiveItem] = useState<NavMenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavMenuItem | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      const rows = await getNavigationMenu();
      if (rows.length === 0) {
        // First run: seed the real current navigation into the CMS, then use it.
        await saveNavigationMenu(seedNavigationMenu);
        setMenu(seedNavigationMenu);
      } else {
        setMenu(rows);
      }
    } catch {
      push({ tone: 'danger', title: 'Menü yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Persist the whole tree after every mutation (optimistic local + DB write).
  const persist = useCallback(async (next: NavMenuItem[]) => {
    setMenu(next);
    const result = await saveNavigationMenu(next);
    if (!result.success) push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error });
  }, [push]);

  function updateItem(updated: NavMenuItem) {
    const next = menu.map((it) => {
      if (it.id === updated.id) return updated;
      if (it.children?.some((c) => c.id === updated.id)) {
        return { ...it, children: it.children.map((c) => (c.id === updated.id ? updated : c)) };
      }
      return it;
    });
    setActiveItem(updated);
    void persist(next);
  }

  function addRootItem() {
    const newItem: NavMenuItem = { id: `nm-${Date.now()}`, label: 'Yeni Öğe', href: '/', icon: null, external: false, order: menu.length + 1, visible: true };
    setMenu((prev) => [...prev, newItem]);
    setActiveItem(newItem);
  }

  function addChildItem(parentId: string) {
    const newChild: NavMenuItem = { id: `nm-child-${Date.now()}`, label: 'Yeni Alt Öğe', href: '/', icon: null, external: false, order: 1, visible: true };
    setMenu((prev) =>
      prev.map((it) => (it.id === parentId ? { ...it, children: [...(it.children ?? []), newChild] } : it))
    );
    setExpanded((prev) => ({ ...prev, [parentId]: true }));
    setActiveItem(newChild);
  }

  function moveRoot(index: number, direction: -1 | 1) {
    void persist(reorder(menu, index, direction));
  }

  function moveChild(parentId: string, index: number, direction: -1 | 1) {
    void persist(menu.map((it) => (it.id === parentId && it.children ? { ...it, children: reorder(it.children, index, direction) } : it)));
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const next = menu
      .filter((it) => it.id !== deleteTarget.id)
      .map((it) => (it.children ? { ...it, children: it.children.filter((c) => c.id !== deleteTarget.id) } : it));
    setDeleteTarget(null);
    void persist(next);
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Navigasyon Yönetimi"
        description="Menü hiyerarşisi ve iç/dış bağlantılar."
        actions={<Button icon={<Plus size={15} />} onClick={addRootItem}>Menü Öğesi Ekle</Button>}
      />

      <Card className="p-0">
        <ul className="divide-y divide-border dark:divide-white/[.06]">
          {menu.map((item, index) => {
            const isOpen = expanded[item.id];
            return (
              <li key={item.id}>
                <div className="flex items-center gap-2 px-4 py-3.5">
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button type="button" onClick={() => moveRoot(index, -1)} disabled={index === 0} className="flex h-6 w-6 items-center justify-center rounded-soft text-steel hover:bg-mist disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/5" aria-label="Yukarı taşı">
                      <ChevronUp size={13} />
                    </button>
                    <button type="button" onClick={() => moveRoot(index, 1)} disabled={index === menu.length - 1} className="flex h-6 w-6 items-center justify-center rounded-soft text-steel hover:bg-mist disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/5" aria-label="Aşağı taşı">
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  {item.children ? (
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="shrink-0 text-steel dark:text-white/40"
                      aria-label={isOpen ? 'Daralt' : 'Genişlet'}
                    >
                      <ChevronRight size={16} className={cn('transition-transform duration-fast', isOpen && 'rotate-90')} />
                    </button>
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{item.label}</p>
                    <p className="font-mono text-[11px] text-steel dark:text-white/40">{item.href}</p>
                  </div>
                  {item.visible === false && (
                    <Badge tone="neutral">
                      <EyeOff size={9} className="mr-0.5 inline" />
                      Gizli
                    </Badge>
                  )}
                  {item.external && (
                    <Badge tone="info">
                      <ExternalLink size={9} className="mr-0.5 inline" />
                      Dış Bağlantı
                    </Badge>
                  )}
                  <button type="button" onClick={() => setActiveItem(item)} className="shrink-0 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white" aria-label="Düzenle">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(item)} className="shrink-0 text-steel hover:text-danger dark:text-white/40" aria-label="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
                {item.children && isOpen && (
                  <ul className="border-t border-border bg-mist/40 dark:border-white/[.06] dark:bg-white/[.02]">
                    {item.children.map((child, childIndex) => (
                      <li key={child.id} className="flex items-center gap-2 py-3 pl-10 pr-4">
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button type="button" onClick={() => moveChild(item.id, childIndex, -1)} disabled={childIndex === 0} className="flex h-6 w-6 items-center justify-center rounded-soft text-steel hover:bg-mist disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/5" aria-label="Yukarı taşı">
                            <ChevronUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveChild(item.id, childIndex, 1)} disabled={childIndex === (item.children?.length ?? 0) - 1} className="flex h-6 w-6 items-center justify-center rounded-soft text-steel hover:bg-mist disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/5" aria-label="Aşağı taşı">
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-near-black dark:text-white/85">{child.label}</p>
                          <p className="font-mono text-[11px] text-steel dark:text-white/40">{child.href}</p>
                        </div>
                        {child.visible === false && <Badge tone="neutral"><EyeOff size={9} className="mr-0.5 inline" />Gizli</Badge>}
                        <button type="button" onClick={() => setActiveItem(child)} className="shrink-0 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white" aria-label="Düzenle">
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(child)} className="shrink-0 text-steel hover:text-danger dark:text-white/40" aria-label="Sil">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                    <li className="py-2.5 pl-10 pr-4">
                      <button type="button" onClick={() => addChildItem(item.id)} className="flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
                        <Plus size={11} /> Alt Öğe Ekle
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <NavItemDrawer item={activeItem} onClose={() => setActiveItem(null)} onUpdate={updateItem} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Menü öğesini sil"
        description={deleteTarget ? <>&quot;{deleteTarget.label}&quot; menü öğesini kalıcı olarak silmek üzeresiniz.</> : null}
        confirmLabel="Sil"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
