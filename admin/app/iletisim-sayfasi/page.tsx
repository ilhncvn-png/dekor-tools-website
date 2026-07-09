import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { contactPageSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'İletişim Sayfası · Dekor Control Center' };

export default function IletisimSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="İletişim Sayfası" description="/iletisim sayfasının tüm bölümleri — form, ofis bilgisi, harita, departman yönlendirme, CTA." />
      <SectionListEditor initialSections={contactPageSections} sitePath="/iletisim" page={websitePages.find((p) => p.id === 'wp14')} />
    </ContentContainer>
  );
}
