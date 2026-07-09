import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { newsDetailSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Haber Detay Şablonu · Dekor Control Center' };

export default function HaberDetaySablonuPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Haber Detay Şablonu"
        description="Her haberin render edildiği paylaşılan şablon — /haberler/[slug]. Haber içeriği Haberler Sayfası'ndaki haber ızgarasından yönetilir."
      />
      <SectionListEditor
        initialSections={newsDetailSections}
        sitePath="/haberler/export-reach-60-countries"
        page={websitePages.find((p) => p.id === 'wp11b')}
      />
    </ContentContainer>
  );
}
