'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { activityFeed } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-body-sm font-medium text-near-black dark:text-white/85">{label}</span>
      {children}
    </label>
  );
}

// useSearchParams() opts a route out of static prerendering unless the
// component that calls it sits inside a Suspense boundary (Next.js 14 App
// Router requirement) — isolated here so the page export below can wrap it,
// keeping the route statically generated instead of forcing force-dynamic.
function SistemAyarlariContent() {
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyDealer, setNotifyDealer] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [smtpTls, setSmtpTls] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const { push } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'genel';

  function saveChanges() {
    push({ tone: 'success', title: 'Değişiklikler kaydedildi' });
  }

  function sendTestEmail() {
    push({ tone: 'info', title: 'Test e-postası gönderildi', description: 'noreply@dekortools.com adresine gönderildi.' });
  }

  function backupNow() {
    push({ tone: 'success', title: 'Yedekleme başlatıldı', description: 'Tamamlandığında bildirim alacaksınız.' });
  }

  return (
    <ContentContainer>
      <PageHeader title="Sistem Ayarları" description="Site bilgileri, domain, marka, e-posta, yedekleme ve denetim kaydı." />

      <Tabs
        defaultValue={initialTab}
        items={[
          { value: 'genel', label: 'Genel' },
          { value: 'marka', label: 'Marka' },
          { value: 'domain', label: 'Domain' },
          { value: 'eposta', label: 'E-posta / SMTP' },
          { value: 'yedekleme', label: 'Yedekleme' },
          { value: 'bildirimler', label: 'Bildirimler' },
          { value: 'denetim', label: 'Denetim Kaydı' },
        ]}
      >
        {(active) => (
          <>
            {active === 'genel' && (
              <Card className="max-w-2xl p-6">
                <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Şirket Bilgileri</h2>
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  <Field label="Şirket Adı">
                    <Input defaultValue="Dekor Tools — Hasdemir Kardeşler" />
                  </Field>
                  <Field label="Kuruluş Yılı">
                    <Input defaultValue="1964" />
                  </Field>
                  <Field label="Destek E-postası">
                    <Input defaultValue="destek@dekortools.com" />
                  </Field>
                  <Field label="İhracat E-postası">
                    <Input defaultValue="export@dekortools.com" />
                  </Field>
                  <div className="tablet:col-span-2">
                    <Field label="Kurumsal Açıklama">
                      <Textarea rows={3} defaultValue="Türkiye'nin en büyük profesyonel inşaat el aletleri üreticisi — 1964'ten beri, 60'tan fazla ülkeye ihracat." />
                    </Field>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 dark:border-white/[.06]">
                  <div className="flex items-center gap-3">
                    <Switch checked={maintenance} onChange={setMaintenance} label="Bakım modu" />
                    <span className="text-body-sm text-near-black dark:text-white/85">Bakım modu</span>
                  </div>
                  <Button onClick={saveChanges}>Değişiklikleri Kaydet</Button>
                </div>
              </Card>
            )}

            {active === 'marka' && (
              <Card className="max-w-2xl p-6">
                <h2 className="mb-1 font-display text-heading-md text-near-black dark:text-white">Marka Ayarları</h2>
                <p className="mb-4 text-body-sm text-steel dark:text-white/50">
                  Bu ayarlar IC Corporate Platform'un beyaz etiketli (white-label) mimarisinin temelidir — logo, renk ve isim gelecekteki her yeni müşteri için buradan değiştirilir.
                </p>
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  <Field label="Marka Adı">
                    <Input defaultValue="Dekor Tools" />
                  </Field>
                  <Field label="Platform Örneği">
                    <Input defaultValue="IC Corporate Platform" disabled />
                  </Field>
                  <Field label="Birincil Marka Rengi">
                    <div className="flex items-center gap-2">
                      <span className="h-9 w-9 shrink-0 rounded-soft border border-border bg-red dark:border-white/10" />
                      <Input defaultValue="#D32027" />
                    </div>
                  </Field>
                  <Field label="Teknik Vurgu Rengi">
                    <div className="flex items-center gap-2">
                      <span className="h-9 w-9 shrink-0 rounded-soft border border-border bg-info dark:border-white/10" />
                      <Input defaultValue="#0095DA" />
                    </div>
                  </Field>
                </div>
                <div className="mt-5 flex justify-end border-t border-border pt-4 dark:border-white/[.06]">
                  <Button onClick={saveChanges}>Değişiklikleri Kaydet</Button>
                </div>
              </Card>
            )}

            {active === 'domain' && (
              <Card className="max-w-2xl p-6">
                <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Domain Ayarları</h2>
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  <Field label="Ana Domain">
                    <Input defaultValue="dekortools.com" />
                  </Field>
                  <Field label="Yönetim Paneli Yolu">
                    <Input defaultValue="/admin" disabled />
                  </Field>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-soft bg-mist px-3.5 py-3 dark:bg-white/[.04]">
                  <div>
                    <p className="text-body-sm font-medium text-near-black dark:text-white">SSL Sertifikası</p>
                    <p className="text-[12px] text-steel dark:text-white/40">dekortools.com ve www.dekortools.com için geçerli</p>
                  </div>
                  <Badge tone="success" dot>Aktif</Badge>
                </div>
                <div className="mt-5 flex justify-end border-t border-border pt-4 dark:border-white/[.06]">
                  <Button onClick={saveChanges}>Değişiklikleri Kaydet</Button>
                </div>
              </Card>
            )}

            {active === 'eposta' && (
              <Card className="max-w-2xl p-6">
                <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">E-posta / SMTP</h2>
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  <Field label="SMTP Sunucu">
                    <Input defaultValue="smtp.dekortools.com" />
                  </Field>
                  <Field label="Port">
                    <Input defaultValue="587" />
                  </Field>
                  <Field label="Kullanıcı Adı">
                    <Input defaultValue="noreply@dekortools.com" />
                  </Field>
                  <Field label="Gönderen Adı">
                    <Input defaultValue="Dekor Tools" />
                  </Field>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-body-sm text-near-black dark:text-white/85">TLS şifreleme kullan</span>
                  <Switch checked={smtpTls} onChange={setSmtpTls} label="TLS şifreleme" />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 dark:border-white/[.06]">
                  <Button variant="secondary" onClick={sendTestEmail}>Test E-postası Gönder</Button>
                  <Button onClick={saveChanges}>Değişiklikleri Kaydet</Button>
                </div>
              </Card>
            )}

            {active === 'yedekleme' && (
              <Card className="max-w-2xl p-6">
                <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Yedekleme</h2>
                <div className="flex items-center justify-between rounded-soft bg-mist px-3.5 py-3 dark:bg-white/[.04]">
                  <div>
                    <p className="text-body-sm font-medium text-near-black dark:text-white">Otomatik Günlük Yedekleme</p>
                    <p className="text-[12px] text-steel dark:text-white/40">Son yedekleme: 3 saat önce · Sonraki: bu gece 03:00</p>
                  </div>
                  <Switch checked={autoBackup} onChange={setAutoBackup} label="Otomatik yedekleme" />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 dark:border-white/[.06]">
                  <span className="text-[12px] text-steel dark:text-white/40">Toplam 3 yedek dosyası · 1.2 GB</span>
                  <Button variant="secondary" onClick={backupNow}>Şimdi Yedekle</Button>
                </div>
              </Card>
            )}

            {active === 'bildirimler' && (
              <Card className="max-w-2xl p-6">
                <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Bildirim Tercihleri</h2>
                <div className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
                  <div className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="text-body-sm font-medium text-near-black dark:text-white">Yeni bayi başvurusu</p>
                      <p className="text-[12px] text-steel dark:text-white/40">Yeni bir bayilik başvurusu geldiğinde e-posta gönder.</p>
                    </div>
                    <Switch checked={notifyDealer} onChange={setNotifyDealer} />
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="text-body-sm font-medium text-near-black dark:text-white">Yeni form talebi</p>
                      <p className="text-[12px] text-steel dark:text-white/40">İletişim veya şikayet formu gönderildiğinde bildirim gönder.</p>
                    </div>
                    <Switch checked={notifyNewOrder} onChange={setNotifyNewOrder} />
                  </div>
                </div>
              </Card>
            )}

            {active === 'denetim' && (
              <Card className="max-w-2xl p-0">
                <ul className="divide-y divide-border dark:divide-white/[.06]">
                  {activityFeed.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                      <Avatar name={item.actor} size="sm" tone={item.actor === 'Sistem' ? 'ai' : 'neutral'} />
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm text-near-black dark:text-white/85">
                          <span className="font-medium">{item.actor}</span>{' '}
                          <span className="text-steel dark:text-white/50">{item.action}</span> {item.target}
                        </p>
                        <p className="mt-0.5 text-[12px] text-steel dark:text-white/40">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}
      </Tabs>
    </ContentContainer>
  );
}

export default function SistemAyarlariPage() {
  return (
    <Suspense fallback={null}>
      <SistemAyarlariContent />
    </Suspense>
  );
}
