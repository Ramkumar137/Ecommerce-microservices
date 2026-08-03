import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import {
  Bell,
  ShoppingBag,
  CreditCard,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationsApi, type Notification } from "@/api/notifications";

const POLL_INTERVAL_MS = 30_000;

function getIcon(type: string) {
  const t = type?.toUpperCase() ?? "";
  if (t.startsWith("ORDER"))
    return <ShoppingBag className="size-4 text-emerald-500 shrink-0" />;
  if (t.startsWith("PAYMENT"))
    return <CreditCard className="size-4 text-blue-500 shrink-0" />;
  if (t === "LOW_STOCK" || t === "INVENTORY_LOW")
    return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
  return <CheckCircle2 className="size-4 text-primary shrink-0" />;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationPopover() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch {
      // silently ignore — user may not be authenticated yet
    }
  }, [user]);

  // Fetch on mount and poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fetch when popover opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" as const })));
    } catch {
      // ignore
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, status: "READ" as const } : n
        )
      );
    } catch {
      // ignore
    }
  };

  const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
  };

  const handleItemClick = (n: Notification) => {
    markAsRead(n.notificationId);
    const type = n.type?.toUpperCase() ?? "";
    const target = isAdmin
      ? type.startsWith("ORDER") ? "/admin/orders"
        : type.startsWith("PAYMENT") ? "/admin/payments"
        : type === "LOW_STOCK" || type === "INVENTORY_LOW" ? "/admin/inventory"
        : null
      : type.startsWith("ORDER") || type.startsWith("PAYMENT") ? "/orders"
        : null;
    if (target) navigate({ to: target as any });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-foreground hover:bg-muted"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 grid size-2.5 place-items-center rounded-full bg-primary ring-2 ring-background">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-surface/50">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0.2 h-4 font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <CheckCheck className="size-3.5" /> Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notificationId}
                className={`group flex items-start gap-3 p-3.5 transition-colors text-xs hover:bg-muted/40 cursor-pointer ${
                  n.status === "UNREAD" ? "bg-primary/5" : ""
                }`}
                onClick={() => handleItemClick(n)}
              >
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted/60">
                  {getIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">
                      {n.title || n.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-normal line-clamp-2">
                    {n.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDismiss(e, n.notificationId)}
                  className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 p-1 rounded-sm hover:bg-muted shrink-0"
                  title="Dismiss notification"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPopover;
