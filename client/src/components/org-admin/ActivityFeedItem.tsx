import { formatDistanceToNow } from "date-fns";

interface ActivityFeedItemProps {
  activityType: string;
  description: string;
  timestamp: Date | string;
  userId?: string;
  userName?: string;
}

const activityIcons: Record<string, string> = {
  login: "🔐",
  logout: "🚪",
  scenario_start: "▶️",
  scenario_complete: "✅",
  document_upload: "📄",
  document_view: "👁️",
  user_suspended: "⏸️",
  user_terminated: "🚫",
  user_reactivated: "✅",
  default: "📌"
};

export function ActivityFeedItem({
  activityType,
  description,
  timestamp,
  userName
}: ActivityFeedItemProps) {
  const icon = activityIcons[activityType] || activityIcons.default;
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className="flex items-start space-x-3 py-3 border-b last:border-0">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{description}</p>
        <div className="flex items-center mt-1 space-x-2">
          {userName && (
            <span className="text-xs text-gray-500">{userName}</span>
          )}
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
