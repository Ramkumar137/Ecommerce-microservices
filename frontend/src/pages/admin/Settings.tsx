import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { ENV } from "@/config/env";
import { toast } from "sonner";
import {
  Store,
  User,
  Server,
  Truck,
  Bell,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

type SettingsTab = "general" | "profile" | "microservices" | "shipping" | "notifications";

function AdminSettings() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saving, setSaving] = useState(false);

  // Store General Settings State
  const [storeSettings, setStoreSettings] = useState({
    storeName: "HeisenFlow E-Commerce",
    supportEmail: "support@heisenflow.com",
    storePhone: "+91 98765 43210",
    currency: "INR (₹)",
    description: "Multi-microservice cloud e-commerce platform powered by AWS & Django.",
  });

  // Admin Profile State
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.first_name || "Admin",
    lastName: user?.last_name || "User",
    email: user?.email || "admin@heisenflow.com",
    phone: user?.phone || "+91 98765 43210",
    username: user?.username || "admin",
  });

  // Shipping & Tax State
  const [shippingSettings, setShippingSettings] = useState({
    standardCost: 599,
    expressCost: 1299,
    freeShippingThreshold: 4000,
    taxRate: 18,
  });

  // Notifications State
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewOrder: true,
    lowStockAlerts: true,
    lowStockThreshold: 5,
    paymentFailureAlerts: true,
    dailyAnalyticsSummary: false,
  });

  // Sync profile settings if user context changes
  useEffect(() => {
    if (user) {
      setProfileSettings((prev) => ({
        ...prev,
        firstName: user.first_name || prev.firstName,
        lastName: user.last_name || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        username: user.username || prev.username,
      }));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (activeTab === "profile" && updateUserProfile) {
        await updateUserProfile({
          first_name: profileSettings.firstName,
          last_name: profileSettings.lastName,
          username: profileSettings.username,
          phone: profileSettings.phone,
          email: profileSettings.email,
        });
      }

      toast.success("Settings updated successfully!");
    } catch (err: any) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "general", label: "Store Configuration", icon: Store },
    { id: "profile", label: "Admin Profile", icon: User },
    { id: "microservices", label: "Backend Services", icon: Server },
    { id: "shipping", label: "Shipping & Taxes", icon: Truck },
    { id: "notifications", label: "Alerts & Notifications", icon: Bell },
  ];

  return (
    <>
      <PageHeader
        title="Admin Settings"
        description="Manage store policies, administrator account profile, microservices endpoints, and alerts."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Tabs */}
        <aside className="space-y-1 text-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Form Content Area */}
        <div className="rounded-xl border bg-card p-6 shadow-soft space-y-6">
          {/* 1. General Store Settings */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">General Store Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update public store details displayed across customer checkout and receipts.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings((p) => ({ ...p, storeName: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={storeSettings.supportEmail}
                    onChange={(e) => setStoreSettings((p) => ({ ...p, supportEmail: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Contact Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings((p) => ({ ...p, storePhone: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Store Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    disabled
                    className="mt-1.5 bg-muted/40 font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={storeSettings.description}
                    onChange={(e) => setStoreSettings((p) => ({ ...p, description: e.target.value }))}
                    className="mt-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Admin Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Administrator Account Profile</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage your administrator contact details and security role.
                  </p>
                </div>
                <Badge variant="default" className="gap-1 font-semibold">
                  <ShieldCheck className="size-3.5" /> ADMIN ROLE
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings((p) => ({ ...p, firstName: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings((p) => ({ ...p, lastName: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings((p) => ({ ...p, email: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings((p) => ({ ...p, phone: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={profileSettings.username} disabled className="mt-1.5 bg-muted/40 font-mono text-xs" />
                </div>
                <div>
                  <Label htmlFor="userRole">Account Role</Label>
                  <Input id="userRole" value="ADMIN" disabled className="mt-1.5 bg-muted/40 font-semibold text-xs text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* 3. Microservices Connections */}
          {activeTab === "microservices" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Backend Microservices Status & Endpoints</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overview of connected AWS Lambda / REST API microservice endpoints.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t text-xs">
                {[
                  { name: "Analytics Service", url: ENV.ANALYTICS_API_URL, desc: "Real-time DynamoDB Direct Multi-Table Aggregator" },
                  { name: "Auth & User Service", url: ENV.AUTH_API_URL, desc: "Cognito JWT Authentication & User Accounts" },
                  { name: "Product Service", url: ENV.PRODUCT_API_URL, desc: "Catalog & Product Management" },
                  { name: "Order Service", url: ENV.ORDER_API_URL, desc: "Order Creation & Lifecycle Management" },
                  { name: "Payment Service", url: ENV.PAYMENT_API_URL, desc: "Transaction & Payment Processing" },
                  { name: "Inventory Service", url: ENV.INVENTORY_API_URL, desc: "Stock Tracking & Reservation" },
                  { name: "Cart Service", url: ENV.CART_API_URL, desc: "Customer Shopping Cart Management" },
                ].map((svc) => (
                  <div key={svc.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-lg border bg-surface/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-foreground">{svc.name}</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">Active</Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5">{svc.desc}</p>
                    </div>
                    <code className="font-mono text-[11px] text-muted-foreground bg-muted p-1.5 rounded-md truncate max-w-sm">
                      {svc.url}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Shipping & Taxes */}
          {activeTab === "shipping" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Shipping & Tax Rules</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure delivery costs, free shipping thresholds, and tax percentages.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div>
                  <Label htmlFor="stdCost">Standard Shipping Cost (₹)</Label>
                  <Input
                    id="stdCost"
                    type="number"
                    value={shippingSettings.standardCost}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, standardCost: Number(e.target.value) }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="expCost">Express Shipping Cost (₹)</Label>
                  <Input
                    id="expCost"
                    type="number"
                    value={shippingSettings.expressCost}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, expressCost: Number(e.target.value) }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="freeThresh">Free Shipping Threshold Amount (₹)</Label>
                  <Input
                    id="freeThresh"
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, freeShippingThreshold: Number(e.target.value) }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">GST / Tax Percentage (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={shippingSettings.taxRate}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, taxRate: Number(e.target.value) }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Alerts & Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">System Alerts & Notifications</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage automated email and dashboard notification preferences.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between p-3.5 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-foreground">New Order Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive real-time emails when customers place orders</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnNewOrder}
                    onCheckedChange={(val) => setNotificationSettings((p) => ({ ...p, emailOnNewOrder: val }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Low Stock Inventory Warnings</p>
                    <p className="text-xs text-muted-foreground">Highlight products when stock drops below minimum threshold</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(val) => setNotificationSettings((p) => ({ ...p, lowStockAlerts: val }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Failure Notifications</p>
                    <p className="text-xs text-muted-foreground">Get alerted immediately when a customer payment fails</p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentFailureAlerts}
                    onCheckedChange={(val) => setNotificationSettings((p) => ({ ...p, paymentFailureAlerts: val }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 border-t pt-5">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 font-medium"
            >
              {saving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSettings;
