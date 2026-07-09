import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { dealerPageSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Yetkili Bayiler Sayfası · Dekor Control Center' };

export default function BayiSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Yetkili Bayiler Sayfası" description="/yetkili-bayiler sayfasının tüm bölümleri — harita, bayi kartları, kaynaklar, CTA." />
      <SectionListEditor
        initialSections={dealerPageSections}
        sitePath="/yetkili-bayiler"
        page={websitePages.find((p) => p.id === 'wp8')}
      />
    </ContentContainer>
  );
}
