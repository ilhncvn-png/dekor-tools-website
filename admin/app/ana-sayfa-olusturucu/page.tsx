import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { homepageSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Ana Sayfa Oluşturucu · Dekor Control Center' };

export default function AnaSayfaOlusturucuPage() {
  return (
    <ContentContainer>
      <PageHeader title="Ana Sayfa Oluşturucu" description="Ana sayfa bölümlerini sürükleyip sıralayın, görünürlüğünü yönetin, önizleyin." />
      <SectionListEditor initialSections={homepageSections} sitePath="/" page={websitePages.find((p) => p.id === 'wp1')} />
    </ContentContainer>
  );
}
