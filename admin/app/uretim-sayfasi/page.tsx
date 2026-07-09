import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { manufacturingSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Üretim Sayfası · Dekor Control Center' };

export default function UretimSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Üretim Sayfası" description="/uretim sayfasının tüm bölümleri — hero, süreç, rakamlar, felsefe, kapanış CTA." />
      <SectionListEditor initialSections={manufacturingSections} sitePath="/uretim" page={websitePages.find((p) => p.id === 'wp3')} />
    </ContentContainer>
  );
}
