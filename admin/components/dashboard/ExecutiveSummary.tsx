import Link from 'next/link';
import { Sparkles, Users, Clock, DatabaseBackup, LogIn, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface ExecutiveInsight {
  text: string;
  href?: string;
}

interface ExecutiveSummaryProps {
  greetingName: string;
  insights: ExecutiveInsight[];
  activeUserCount: number;
  lastBackup: string;
  latestPublish: string;
  lastLogin: string;
  websiteStatus: string;
  isWebsiteHealthy: boolean;
  /** The single most recent real activity-feed entry, shown as a small live pulse — not a fake animation, just a fresh timestamp. */
  liveActivity?: string;
}

function timeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi Günler';
  return 'İyi Akşamlar';
}

/**
 * Executive Hero — the dashboard's opening statement. A greeting, a plain-language
 * "is the site okay" read, today's recommendations phrased as next steps (not raw
 * counters — those live in the KPI row below), and a thin status strip of real
 * timestamps. Answers: what should I focus on today?
 */
export function ExecutiveSummary({
  greetingName,
  insights,
  activeUserCount,
  lastBackup,
  latestPublish,
  lastLogin,
  websiteStatus,
  isWebsiteHealthy,
  liveActivity,
}: ExecutiveSummaryProps) {
  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">
          {timeBasedGreeting()}, {greetingName}
        </h2>
        <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-steel dark:text-white/40">
          <span className={`h-1.5 w-1.5 rounded-full ${isWebsiteHealthy ? 'bg-success' : 'bg-warning'}`} />
          Website Durumu: {websiteStatus}
        </span>
      </div>
      <p className="mb-4 text-[12px] text-steel dark:text-white/40">Bugün nereye odaklanmalıyım?</p>

      {liveActivity && (
        <div className="mb-3 flex items-center gap-2 rounded-soft bg-mist/60 px-3 py-2 text-[11.5px] text-steel dark:bg-white/[.03] dark:text-white/50">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          {liveActivity}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {insights.map((insight, i) => {
          const content = (
            <span className="flex items-start gap-2 text-body-sm text-near-black dark:text-white/85">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-ai" />
              {insight.text}
            </span>
          );
          return (
            <li key={i}>
              {insight.href ? (
                <Link href={insight.href} className="block rounded-soft transition-colors hover:bg-mist/60 dark:hover:bg-white/[.03]">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[11.5px] text-steel dark:border-white/[.06] dark:text-white/40">
        <span className="flex items-center gap-1">
          <Wifi size={11} /> Web sitesi {isWebsiteHealthy ? 'çevrimiçi' : 'kontrol gerekiyor'}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> Son yayın: {latestPublish}
        </span>
        <span className="flex items-center gap-1">
          <DatabaseBackup size={11} /> Son yedek: {lastBackup}
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} /> {activeUserCount} aktif editör
        </span>
        <span className="flex items-center gap-1">
          <LogIn size={11} /> Son giriş: {lastLogin}
        </span>
      </div>
    </Card>
  );
}
