import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { becomeDealerSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Bayi Ol Sayfası · Dekor Control Center' };

export default function BayiOlSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Bayi Ol Sayfası" description="/bayi-ol sayfasının tüm bölümleri — hero, neden ortak olmalı, gereksinimler, süreç, başvuru formu girişi, kapanış CTA." />
      <SectionListEditor
        initialSections={becomeDealerSections}
        sitePath="/bayi-ol"
        page={websitePages.find((p) => p.id === 'wp9')}
      />
    </ContentContainer>
  );
}
