import { FileText, Image as ImageIcon, Video, FileSpreadsheet, PenTool, Shapes, Figma, FileCode2, Archive, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { RecentFile, RecentFileType } from '@/lib/mock-data';

const typeIcon: Record<RecentFileType, typeof FileText> = {
  PDF: FileText,
  AI: PenTool,
  SVG: Shapes,
  FIG: Figma,
  DOCX: FileCode2,
  XLSX: FileSpreadsheet,
  MP4: Video,
  JPG: ImageIcon,
  PNG: ImageIcon,
  ZIP: Archive,
};

const typeTone: Record<RecentFileType, string> = {
  PDF: 'bg-danger-soft text-danger',
  AI: 'bg-orange-soft text-orange',
  SVG: 'bg-ai-soft text-ai',
  FIG: 'bg-ai-soft text-ai',
  DOCX: 'bg-info-soft text-info',
  XLSX: 'bg-success-soft text-success',
  MP4: 'bg-ai-soft text-ai',
  JPG: 'bg-info-soft text-info',
  PNG: 'bg-info-soft text-info',
  ZIP: 'bg-mist text-steel dark:bg-white/10 dark:text-white/60',
};

interface RecentFilesProps {
  files: RecentFile[];
}

/** "Son Dosyalar" widget — proper per-format icon, uploader, version, download count, preview action. */
export function RecentFiles({ files }: RecentFilesProps) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Son Dosyalar</h2>
      <ul className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
        {files.map((file) => {
          const Icon = typeIcon[file.type];
          return (
            <li key={file.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-soft ${typeTone[file.type]}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-near-black dark:text-white">
                  {file.name}
                  <span className="ml-1.5 font-mono text-[10px] text-steel dark:text-white/40">{file.version}</span>
                </p>
                <p className="truncate text-[11px] text-steel dark:text-white/40">
                  {file.category} · {file.uploadedBy} · {file.uploadedAt}
                </p>
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-steel dark:text-white/40">
                {file.downloads > 0 ? `${file.downloads.toLocaleString('tr-TR')} indirme` : 'Yeni'}
              </span>
              {file.previewable && (
                <button
                  type="button"
                  className="shrink-0 rounded-soft p-1.5 text-steel transition-colors hover:bg-mist hover:text-near-black dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                  aria-label="Önizle"
                >
                  <Eye size={14} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
