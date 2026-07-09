import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { FormFieldEditor } from '@/components/website/FormFieldEditor';
import { careerApplicationForm } from '@/lib/mock-data';

export const metadata = { title: 'Kariyer Başvuru Formu · Dekor Control Center' };

export default function KariyerBasvuruFormuPage() {
  return (
    <ContentContainer>
      <PageHeader title="Kariyer Başvuru Formu" description="/kariyer sayfasındaki iş başvuru formunun alan yönetimi." />
      <FormFieldEditor form={careerApplicationForm} />
    </ContentContainer>
  );
}
