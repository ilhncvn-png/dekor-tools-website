import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { exportSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'İhracat Sayfası · Dekor Control Center' };

export default function IhracatSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="İhracat Sayfası" description="/ihracat sayfasının tüm bölümleri — dünya haritası, rakamlar, süreç, belgeler, OEM, lojistik, CTA." />
      <SectionListEditor initialSections={exportSections} sitePath="/ihracat" page={websitePages.find((p) => p.id === 'wp7')} />
    </ContentContainer>
  );
}
