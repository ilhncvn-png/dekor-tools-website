import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { SectionListEditor } from '@/components/website/SectionListEditor';
import { productsLandingSections, websitePages } from '@/lib/mock-data';

export const metadata = { title: 'Ürünler Sayfası · Dekor Control Center' };

export default function UrunlerSayfasiPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Ürünler Sayfası"
        description="Genel katalog sayfası (/urunler) — hero ve ürün aileleri bölümü burada yönetilir. Aile kartlarının sırası, görünürlüğü ve içeriği Kategori Yönetimi'nden (Ürün Aileleri) gelir."
      />
      <SectionListEditor initialSections={productsLandingSections} sitePath="/urunler" page={websitePages.find((p) => p.id === 'wp4')} />
    </ContentContainer>
  );
}
