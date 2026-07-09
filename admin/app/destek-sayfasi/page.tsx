import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { supportSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Destek Sayfası · Dekor Control Center' };

export default function DestekSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Destek Sayfası" description="/destek sayfasının tüm bölümleri — kategoriler, SSS, indirilenler, CTA." />
      <SectionListEditor initialSections={supportSections} sitePath="/destek" page={websitePages.find((p) => p.id === 'wp12')} />
    </ContentContainer>
  );
}
