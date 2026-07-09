import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { newsroomSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Haberler Sayfası · Dekor Control Center' };

export default function HaberlerSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader title="Haberler Sayfası" description="/haberler sayfasının hero ve haber ızgarası bölümleri." />
      <SectionListEditor initialSections={newsroomSections} sitePath="/haberler" page={websitePages.find((p) => p.id === 'wp11')} />
    </ContentContainer>
  );
}
