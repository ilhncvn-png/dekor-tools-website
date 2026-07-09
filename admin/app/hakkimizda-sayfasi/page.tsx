import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { aboutSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Hakkımızda Sayfası · Dekor Control Center' };

export default function HakkimizdaSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Hakkımızda Sayfası" description="/hakkimizda sayfasının tüm bölümleri — hikaye, misyon, vizyon, zaman çizelgesi, Ar-Ge, değerler, CTA." />
      <SectionListEditor initialSections={aboutSections} sitePath="/hakkimizda" page={websitePages.find((p) => p.id === 'wp2')} />
    </ContentContainer>
  );
}
