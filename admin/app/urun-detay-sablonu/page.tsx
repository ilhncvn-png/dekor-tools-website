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
        description="Bu ekran ürün kayıtlarını değil, tüm ürün detay sayfalarında (/urunler/[slug]) kullanılan ortak görünümü yönetir."
      />
      <SectionListEditor initialSections={productDetailSections} sitePath="/urunler/dekor-pro-siva-mastari-120cm" page={websitePages.find((p) => p.id === 'wp6')} />
    </ContentContainer>
  );
}
