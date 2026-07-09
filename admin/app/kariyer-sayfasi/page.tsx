import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { careerSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Kariyer Sayfası · Dekor Control Center' };

export default function KariyerSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Kariyer Sayfası" description="/kariyer sayfasının tüm bölümleri — hero, neden Dekor'da çalışmalı, açık pozisyonlar, başvuru CTA." />
      <SectionListEditor initialSections={careerSections} sitePath="/kariyer" page={websitePages.find((p) => p.id === 'wp13')} />
    </ContentContainer>
  );
}
