'use client';

import { Plus, LayoutTemplate } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { sectionTemplates } from '@/lib/mock-data';

/** Reusable section-template library — building blocks Ana Sayfa Oluşturucu and Sayfa Yönetimi compose from. */
export default function BolumOlusturucuPage() {
  const { push } = useToast();

  return (
    <ContentContainer>
      <PageHeader
        title="Bölüm Oluşturucu"
        description="Yeniden kullanılabilir sayfa bölümleri — ana sayfa ve diğer sayfalar bu şablonlardan oluşturulur."
        actions={
          <Button
            icon={<Plus size={15} />}
            onClick={() => push({ tone: 'success', title: 'Yeni bölüm şablonu oluşturuldu', description: 'Sayfa oluşturucularda "Bölüm Ekle" ile kullanılabilir.' })}
          >
            Yeni Bölüm Şablonu
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {sectionTemplates.map((section) => (
          <Card key={section.id} interactive className="p-5">
            <div className="flex h-24 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/[.04] dark:text-white/25">
              <LayoutTemplate size={26} strokeWidth={1.4} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-display text-heading-sm text-near-black dark:text-white">{section.name}</h3>
              <Badge tone="neutral">{section.category}</Badge>
            </div>
            <p className="mt-1.5 text-body-sm text-steel dark:text-white/50">{section.description}</p>
            <p className="mt-3 border-t border-border pt-3 text-[12px] text-steel dark:border-white/[.06] dark:text-white/40">
              {section.usageCount} sayfada kullanılıyor
            </p>
          </Card>
        ))}
      </div>
    </ContentContainer>
  );
}
