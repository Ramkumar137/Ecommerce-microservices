import { useState } from "react";
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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "payment" | "inventory" | "system";
  adminLink?: string;
  customerLink?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "New Order Placed",
    message: "Order #ord-8921 placed worth ₹9,000.",
    time: "5m ago",
    read: false,
    type: "order",
    adminLink: "/admin/orders",
    customerLink: "/orders",
  },
  {
    id: "n-2",
    title: "Payment Processed",
    message: "Payment of ₹9,000 completed successfully via UPI.",
    time: "12m ago",
    read: false,
    type: "payment",
    adminLink: "/admin/payments",
    customerLink: "/orders",
  },
  {
    id: "n-3",
    title: "Low Stock Warning",
    message: "Wireless Noise-Canceling Earphones stock below 5 items.",
    time: "45m ago",
    read: true,
    type: "inventory",
    adminLink: "/admin/inventory",
    customerLink: "/products",
  },
  {
    id: "n-4",
    title: "Microservices Operational",
    message: "Direct DynamoDB Aggregator & AWS Lambda endpoints online.",
    time: "2h ago",
    read: true,
    type: "system",
  },
];

export function NotificationPopover() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleItemClick = (n: NotificationItem) => {
    markAsRead(n.id);
    const targetLink = isAdmin ? n.adminLink : n.customerLink;
    if (targetLink) {
      navigate({ to: targetLink as any });
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="size-4 text-emerald-500 shrink-0" />;
      case "payment":
        return <CreditCard className="size-4 text-blue-500 shrink-0" />;
      case "inventory":
        return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
      default:
        return <CheckCircle2 className="size-4 text-primary shrink-0" />;
    }
  };

  return (
    <Popover>
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
                key={n.id}
                className={`group flex items-start gap-3 p-3.5 transition-colors text-xs hover:bg-muted/40 cursor-pointer ${
                  !n.read ? "bg-primary/5" : ""
                }`}
                onClick={() => handleItemClick(n)}
              >
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted/60">
                  {getIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{n.time}</span>
                  </div>
                  <p className="text-muted-foreground leading-normal line-clamp-2">{n.message}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDismiss(e, n.id)}
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
