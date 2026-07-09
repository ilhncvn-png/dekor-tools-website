import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { productDetailSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Ürün Detay Şablonu · Dekor Control Center' };

export default function UrunDetaySablonuPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Ürün Detay Şablonu"
        description="Her ürün sayfasının render edildiği paylaşılan şablon — /urunler/[slug]. Buradaki değişiklikler 248 ürünün tamamını etkiler."
      />
      <SectionListEditor initialSections={productDetailSections} sitePath="/urunler/dekor-pro-siva-mastari-120cm" page={websitePages.find((p) => p.id === 'wp6')} />
    </ContentContainer>
  );
}
