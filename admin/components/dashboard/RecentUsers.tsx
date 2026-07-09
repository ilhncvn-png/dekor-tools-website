import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { RecentUserActivity } from '@/lib/mock-data';

interface RecentUsersProps {
  users: RecentUserActivity[];
}

/** "Son Kullanıcılar" widget — who's online, last login, new invitations. */
export function RecentUsers({ users }: RecentUsersProps) {
  const onlineCount = users.filter((u) => u.online).length;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">Son Kullanıcılar</h2>
        <span className="flex items-center gap-1.5 text-[12px] text-steel dark:text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {onlineCount} çevrimiçi
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
        {users.map((user) => (
          <li key={user.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="relative shrink-0">
              <Avatar name={user.name} size="sm" tone={user.online ? 'red' : 'neutral'} />
              {user.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white dark:ring-surface-dark-raised" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{user.name}</p>
                {user.isNewInvite && <Badge tone="info">Yeni Davet</Badge>}
              </div>
              <p className="truncate text-[11px] text-steel dark:text-white/40">{user.role}</p>
            </div>
            <span className="shrink-0 text-[11px] text-steel dark:text-white/40">{user.lastLogin}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
