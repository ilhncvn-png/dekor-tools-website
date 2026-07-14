import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { categoryTemplateSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Kategori Şablonu · Dekor Control Center' };

export default function KategoriSablonuPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Kategori Sayfası Şablonu"
        description="Bu ekran kategori kayıtlarını değil, tüm kategori sayfalarında (/urunler/[kategori]) kullanılan ortak görünümü yönetir."
      />
      <SectionListEditor initialSections={categoryTemplateSections} sitePath="/urunler/siva-alci" page={websitePages.find((p) => p.id === 'wp5')} />
    </ContentContainer>
  );
}
