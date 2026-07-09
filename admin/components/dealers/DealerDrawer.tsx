'use client';

import { useEffect, useState } from 'react';
import { Save, Check, X, FileSignature, Mail, Phone, MapPin, Home, Link2, ImageUp } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { mediaItems, exportMapCountries, type Dealer } from '@/lib/mock-data';
import { dealerStatusTone } from '@/lib/status-tones';
import { useToast } from '@/components/ui/Toast';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';

interface DealerDrawerProps {
  dealer: Dealer | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (dealer: Dealer) => void;
  onUpdate?: (updated: Dealer) => void;
}

const knownCountries = Array.from(new Set(exportMapCountries.map((c) => c.country)));
const knownRegions = Array.from(new Set(exportMapCountries.map((c) => c.region)));

/** Full dealer editor drawer — company/country/region/logo/address/phone/email/website/status, the real "client manages a dealer" interface, shared by incoming applications and manually created records. */
export function DealerDrawer({ dealer, onClose, onApprove, onReject, onUpdate }: DealerDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(dealer);
  const [form, setForm] = useState(dealer);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);

  useEffect(() => {
    if (dealer) {
      setDisplay(dealer);
      setForm(dealer);
    }
  }, [dealer]);

  if (!display || !form) return null;

  const logoMedia = form.logo ? mediaItems.find((m) => m.id === form.logo) : null;
  const statusInfo = dealerStatusTone[form.status];

  function field<K extends keyof Dealer>(key: K, value: Dealer[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    setDisplay(form);
    push({ tone: 'success', title: 'Bayi kaydedildi', description: `${form.company} güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(dealer)}
      onClose={onClose}
      title={display.company || 'Yeni Bayi'}
      description={display.country || 'Yeni kayıt'}
      footer={
        form.status === 'inceleniyor' && form.source === 'basvuru' ? (
          <div className="flex items-center justify-between gap-2">
            <Button variant="danger" icon={<X size={14} />} className="flex-1" onClick={() => onReject?.(display)}>Reddet</Button>
            <Button variant="success" icon={<Check size={14} />} className="flex-1" onClick={() => onApprove?.(display.id)}>Onayla</Button>
          </div>
        ) : (
          <Button icon={<Save size={14} />} className="w-full" onClick={saveChanges}>Kaydet</Button>
        )
      }
    >
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Firma Adı</p>
        <Input value={form.company} onChange={(e) => field('company', e.target.value)} placeholder="Firma adı" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Ülke</p>
          <Input value={form.country} onChange={(e) => field('country', e.target.value)} list="dealer-countries" placeholder="Ülke" />
          <datalist id="dealer-countries">
            {knownCountries.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Bölge</p>
          <Input value={form.region} onChange={(e) => field('region', e.target.value)} list="dealer-regions" placeholder="Bölge" />
          <datalist id="dealer-regions">
            {knownRegions.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge>
        {form.country && (
          <Badge tone="neutral">
            <MapPin size={10} className="mr-1 inline" />
            {form.country}
          </Badge>
        )}
        <Badge tone={form.source === 'manuel' ? 'info' : 'neutral'}>{form.source === 'manuel' ? 'Manuel Eklendi' : 'Başvuru'}</Badge>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Yetkili Kişi</p>
        <Input value={form.contact} onChange={(e) => field('contact', e.target.value)} placeholder="Yetkili adı" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-body-sm font-medium text-near-black dark:text-white/85">
            <Mail size={11} /> E-posta
          </p>
          <Input value={form.email} onChange={(e) => field('email', e.target.value)} placeholder="ornek@firma.com" />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-body-sm font-medium text-near-black dark:text-white/85">
            <Phone size={11} /> Telefon
          </p>
          <Input value={form.phone} onChange={(e) => field('phone', e.target.value)} placeholder="+90 ..." />
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Adres</p>
        <Textarea rows={2} value={form.address} onChange={(e) => field('address', e.target.value)} placeholder="Açık adres" />
      </div>

      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1 text-body-sm font-medium text-near-black dark:text-white/85">
          <Link2 size={11} /> Web Sitesi
        </p>
        <Input value={form.website} onChange={(e) => field('website', e.target.value)} placeholder="https://" />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Durum</p>
        <Select value={form.status} onChange={(e) => field('status', e.target.value as Dealer['status'])}>
          <option value="onaylandi">Onaylandı</option>
          <option value="inceleniyor">İnceleniyor</option>
          <option value="reddedildi">Reddedildi</option>
        </Select>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Tahmini Hacim</p>
          <Input className="mt-1" value={form.volume} onChange={(e) => field('volume', e.target.value)} />
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Atanan Kişi</p>
          <Input className="mt-1" value={form.assignedTo} onChange={(e) => field('assignedTo', e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
            <Home size={12} /> Bayi Ağı Haritasında Göster
          </span>
          <Switch checked={form.listedOnWebsite} onChange={(v) => field('listedOnWebsite', v)} label="Web sitesi bayi listesi" />
        </div>
        {form.listedOnWebsite && (
          <div className="rounded-soft border border-border p-3 dark:border-white/[.06]">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
              <MapPin size={11} /> Yetkili Bayiler dizin bilgileri (/yetkili-bayiler)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-[11.5px] text-near-black dark:text-white/70">Şehir</p>
                <Input value={form.city ?? ''} onChange={(e) => field('city', e.target.value)} placeholder="ör. İzmir" />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] text-near-black dark:text-white/70">Dizin Durumu</p>
                <Select value={form.directoryStatus ?? 'Authorized'} onChange={(e) => field('directoryStatus', e.target.value as Dealer['directoryStatus'])}>
                  <option value="Premium Partner">Premium Partner</option>
                  <option value="Authorized">Authorized</option>
                </Select>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[11.5px] text-near-black dark:text-white/70">Ürün Kategorileri (virgülle ayırın)</p>
              <Input
                value={(form.categories ?? []).join(', ')}
                onChange={(e) => field('categories', e.target.value.split(',').map((c) => c.trim()).filter(Boolean))}
                placeholder="ör. Painting, Measurement"
              />
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[11.5px] text-near-black dark:text-white/70">Partnerlik Etiketi</p>
              <Input value={form.partnerSince ?? ''} onChange={(e) => field('partnerSince', e.target.value)} placeholder="ör. Partner since 2016" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
            <FileSignature size={12} /> Bayi Sözleşmesi
          </span>
          <Switch checked={form.contractSigned} onChange={(v) => field('contractSigned', v)} label="Bayi sözleşmesi imzalandı" />
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
            <ImageUp size={12} /> Bayi Logosu
          </span>
          {logoMedia ? (
            <button type="button" onClick={() => setLogoPickerOpen(true)} className="flex items-center gap-1.5">
              <span className="h-5 w-10 shrink-0 rounded-sharp" style={{ backgroundColor: logoMedia.swatch }} />
              <Badge tone="success">Değiştir</Badge>
            </button>
          ) : (
            <Button
              variant="secondary"
              className="!h-7 !px-2.5 !text-[11.5px]"
              onClick={() => setLogoPickerOpen(true)}
            >
              Logo Yükle
            </Button>
          )}
        </div>
      </div>

      <MediaPickerModal
        open={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        filterType="image"
        onSelect={(item) => {
          field('logo', item.id);
          push({ tone: 'success', title: 'Bayi logosu güncellendi', description: item.title });
        }}
      />

      <div className="mt-4">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Notlar</p>
        <Textarea rows={2} value={form.notes} onChange={(e) => field('notes', e.target.value)} />
      </div>

      <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">
        {form.source === 'manuel' ? 'Eklenme' : 'Başvuru'} tarihi: {display.submittedAt}
      </p>
    </Drawer>
  );
}
