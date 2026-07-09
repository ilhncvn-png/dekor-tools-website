import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { FormFieldEditor } from '@/components/website/FormFieldEditor';
import { dealerApplicationForm } from '@/lib/mock-data';

export const metadata = { title: 'Bayi Başvuru Formu · Dekor Control Center' };

export default function BayiBasvuruFormuPage() {
  return (
    <ContentContainer>
      <PageHeader title="Bayi Başvuru Formu" description="/bayi-ol sayfasındaki çok adımlı başvuru formunun alan yönetimi." />
      <FormFieldEditor form={dealerApplicationForm} />
    </ContentContainer>
  );
}
