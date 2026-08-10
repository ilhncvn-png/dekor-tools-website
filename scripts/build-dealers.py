#!/usr/bin/env python3
"""Yetkili Bayiler veri üreticisi.

Kaynak:
  DEKOR_BAYILER_YAZIM_DUZELTILMIS.xlsx   (BAYİ İSİMLERİ | ADRES | LOGO ADI)
  bayi_logoları/                          (Logo Adı ile eşleşen PNG dosyaları)

Üretilen:
  project/uploads/bayi-logolari/*.png     (ASCII adlarla kopyalanmış logolar)
  project/dealers-data.js                 (export const DEALERS)

Excel veya logo klasörü güncellendikten sonra tekrar çalıştırmak yeterlidir;
HTML sayfalarına dokunmaya gerek yoktur.

Kullanım:  python3 scripts/build-dealers.py
"""

import json
import os
import re
import shutil
import unicodedata
import zipfile
from xml.etree import ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "DEKOR_BAYILER_YAZIM_DUZELTILMIS.xlsx")
LOGO_SRC_DIR = os.path.join(ROOT, "bayi_logoları")
LOGO_OUT_DIR = os.path.join(ROOT, "project", "uploads", "bayi-logolari")
DATA_OUT = os.path.join(ROOT, "project", "dealers-data.js")
LOGO_WEB_BASE = "/project/uploads/bayi-logolari/"
PLACEHOLDER = LOGO_WEB_BASE + "_placeholder.svg"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# 81 il + yurt dışı / KKTC. Adresin sonuna en yakın eşleşme il olarak kabul edilir.
PROVINCES = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara",
    "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman",
    "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
    "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne",
    "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun",
    "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
    "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
    "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya",
    "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
    "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun",
    "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
    "KKTC", "Hollanda",
]

TR_MAP = str.maketrans({
    "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g", "ı": "i", "İ": "i",
    "ö": "o", "Ö": "o", "ş": "s", "Ş": "s", "ü": "u", "Ü": "u",
})


def ascii_slug(text):
    """Türkçe karakterleri koruyarak sadeleştirilmiş, URL güvenli ad üretir."""
    s = unicodedata.normalize("NFC", text).translate(TR_MAP)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-{2,}", "-", s)


def read_xlsx(path):
    """xlsx dosyasını harici bağımlılık olmadan satır sözlüklerine çevirir."""
    with zipfile.ZipFile(path) as z:
        shared = [
            "".join(t.text or "" for t in si.iter("{%s}t" % NS["m"]))
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS)
        ]
        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))

    rows = []
    for row in sheet.find("m:sheetData", NS):
        cells = {}
        for cell in row:
            col = re.match(r"[A-Z]+", cell.get("r")).group()
            value = cell.find("m:v", NS)
            if value is None:
                cells[col] = ""
            elif cell.get("t") == "s":
                cells[col] = shared[int(value.text)]
            else:
                cells[col] = value.text or ""
        rows.append(cells)
    return rows


def detect_province(address):
    """Adres metnindeki en son il adını döndürür; bulunamazsa boş string."""
    best, best_pos = "", -1
    for province in PROVINCES:
        for match in re.finditer(re.escape(province), address, re.IGNORECASE):
            if match.start() > best_pos:
                best, best_pos = province, match.start()
    return best


def index_logos(directory):
    """Logo dosyalarını normalize edilmiş dosya adı köküne göre indeksler."""
    index = {}
    for filename in os.listdir(directory):
        if filename.startswith("."):
            continue
        stem = os.path.splitext(filename)[0]
        index[unicodedata.normalize("NFC", stem).lower()] = filename
    return index


def main():
    rows = read_xlsx(XLSX)
    header, records = rows[0], rows[1:]
    assert "BAYİ" in header.get("A", "").upper(), "Beklenmeyen sütun düzeni: %r" % header

    logos = index_logos(LOGO_SRC_DIR)
    os.makedirs(LOGO_OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(DATA_OUT), exist_ok=True)

    dealers, unmatched, matched_files = [], [], set()

    for i, row in enumerate(records, start=1):
        name = (row.get("A") or "").strip()
        address = (row.get("B") or "").strip()
        logo_name = (row.get("C") or "").strip()
        if not name:
            continue

        key = unicodedata.normalize("NFC", logo_name).lower()
        source = logos.get(key)
        if source:
            matched_files.add(source)
            target = ascii_slug(os.path.splitext(source)[0]) + os.path.splitext(source)[1].lower()
            shutil.copyfile(os.path.join(LOGO_SRC_DIR, source), os.path.join(LOGO_OUT_DIR, target))
            logo_url = LOGO_WEB_BASE + target
        else:
            unmatched.append({"row": i + 1, "dealer": name, "logo": logo_name})
            logo_url = PLACEHOLDER

        province = detect_province(address)
        initials = "".join(w[0] for w in re.findall(r"\w+", name)[:2]).upper()

        dealers.append({
            "code": "DLR·%03d" % i,
            "name": name,
            "address": address,
            "province": province,
            "logo": logo_url,
            "hasLogo": bool(source),
            "initials": initials,
            "slug": ascii_slug(name)[:60],
        })

    payload = json.dumps(dealers, ensure_ascii=False, indent=2)
    with open(DATA_OUT, "w", encoding="utf-8") as f:
        f.write(
            "// Dekor Yetkili Bayiler — OTOMATİK ÜRETİLDİ, elle düzenlemeyin.\n"
            "// Kaynak: DEKOR_BAYILER_YAZIM_DUZELTILMIS.xlsx + bayi_logoları/\n"
            "// Yeniden üretmek için: python3 scripts/build-dealers.py\n"
            "export const DEALERS = " + payload + ";\n"
        )

    unused = sorted(set(logos.values()) - matched_files)
    print("Aktarılan bayi sayısı : %d" % len(dealers))
    print("Kopyalanan logo       : %d -> %s" % (len(matched_files), os.path.relpath(LOGO_OUT_DIR, ROOT)))
    print("Veri dosyası          : %s" % os.path.relpath(DATA_OUT, ROOT))
    print("İl tespit edilemeyen  : %s" % ([d["name"] for d in dealers if not d["province"]] or "yok"))
    print("Eşleşmeyen logo adı   : %s" % (unmatched or "yok"))
    print("Excel'de kullanılmayan logo dosyaları: %s" % (unused or "yok"))


if __name__ == "__main__":
    main()
