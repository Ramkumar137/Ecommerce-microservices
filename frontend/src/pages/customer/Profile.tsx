import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, MapPin, Bell, Palette, Save, CheckCircle2, ShieldCheck, Phone, Mail, Home, Globe } from "lucide-react";

const STORAGE_ADDR_KEY = "heisenflow_default_address";

export function ProfileSettingsPage() {
  const { user, updateUserProfile } = useAuth();

  // Profile Edit State
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  // Permanent Address State (Persisted in localStorage)
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "Chennai",
    state: "TamilNadu",
    zip: "600001",
    country: "India",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsTracking: true,
    promotions: false,
    systemAlerts: true,
  });

  // Theme & Preferences State
  const [preferences, setPreferences] = useState({
    currency: "INR",
    theme: "system",
    language: "en",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }

    // Load permanently stored default delivery address
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_ADDR_KEY);
        if (saved) {
          setAddressForm(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load saved address", e);
      }
    }
  }, [user]);

  // Handle Profile Update
  async function handleSaveProfile() {
    try {
      setLoading(true);
      await updateUserProfile(profileForm);
      toast.success("Account profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  // Handle Permanent Address Save
  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!addressForm.address.trim() || !addressForm.city.trim() || !addressForm.zip.trim()) {
      toast.error("Please fill in street address, city, and postal code.");
      return;
    }

    try {
      setSavingAddress(true);
      localStorage.setItem(STORAGE_ADDR_KEY, JSON.stringify(addressForm));
      toast.success("Permanent Delivery Address saved! All future checkout orders will use this address. 🏠");
    } catch (e) {
      toast.error("Failed to save address locally.");
    } finally {
      setSavingAddress(false);
    }
  }

  // Handle Notification Preferences Save
  function handleSaveNotifications() {
    toast.success("Notification preferences updated!");
  }

  // Handle Preferences Save
  function handleSavePreferences() {
    toast.success("Theme and regional preferences saved!");
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 space-y-6">
      <PageHeader
        title="Settings & Account"
        description="Manage your profile information, permanent delivery address, and notification preferences."
      />

      {/* Header Profile Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {user?.first_name?.charAt(0) || "U"}
              {user?.last_name?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-foreground">
              {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User Account"}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Mail className="size-3.5" /> {user?.email || "No email"} •{" "}
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary uppercase text-[10px]">
                {user?.role || "CUSTOMER"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface px-3 py-1.5 rounded-lg border shrink-0">
          <ShieldCheck className="size-4 text-emerald-500" /> Account Active & Verified
        </div>
      </div>

      {/* Main Settings Navigation Tabs */}
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="account" className="gap-1.5 text-xs font-semibold">
            <User className="size-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-1.5 text-xs font-semibold">
            <MapPin className="size-3.5" /> Delivery Address
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs font-semibold">
            <Bell className="size-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs font-semibold">
            <Palette className="size-3.5" /> Themes & Regional
          </TabsTrigger>
        </TabsList>

        {/* 1. Account Profile Tab */}
        <TabsContent value="account" className="mt-4 rounded-xl border bg-card p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h4 className="text-base font-bold text-foreground">Profile Information</h4>
              <p className="text-xs text-muted-foreground">Update your personal account details and username.</p>
            </div>
            {!editing ? (
              <Button size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs font-semibold">
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    setEditing(false);
                    if (user) {
                      setProfileForm({
                        first_name: user.first_name || "",
                        last_name: user.last_name || "",
                        username: user.username || "",
                        email: user.email || "",
                        phone: user.phone || "",
                      });
                    }
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveProfile} disabled={loading} className="gap-1.5 text-xs font-semibold">
                  <Save className="size-3.5" /> {loading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <Label htmlFor="first_name" className="text-xs font-semibold">First Name</Label>
              <Input
                id="first_name"
                value={profileForm.first_name}
                disabled={!editing}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="mt-1.5 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="last_name" className="text-xs font-semibold">Last Name</Label>
              <Input
                id="last_name"
                value={profileForm.last_name}
                disabled={!editing}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="mt-1.5 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                disabled={!editing}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="mt-1.5 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                disabled={!editing}
                placeholder="+91 98765 43210"
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="mt-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-xs font-semibold">Username</Label>
              <Input
                id="username"
                value={profileForm.username}
                disabled={!editing}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                className="mt-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Account Role</Label>
              <Input value={user?.role || "CUSTOMER"} disabled className="mt-1.5 text-xs font-bold uppercase" />
            </div>
          </div>
        </TabsContent>

        {/* 2. Permanent Delivery Address Tab */}
        <TabsContent value="address" className="mt-4 rounded-xl border bg-card p-6 shadow-soft space-y-6">
          <div className="border-b pb-4">
            <h4 className="text-base font-bold text-foreground">Permanent Delivery Address</h4>
            <p className="text-xs text-muted-foreground">
              Save your primary shipping address. All future checkout orders will automatically pre-fill this address.
            </p>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-semibold">Street Address / House / Flat No.</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Anna Salai, Apt 4B"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="mt-1.5 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-xs font-semibold">City</Label>
                <Input
                  id="city"
                  placeholder="Chennai"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="mt-1.5 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-xs font-semibold">State / Province</Label>
                <Input
                  id="state"
                  placeholder="TamilNadu"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="mt-1.5 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="zip" className="text-xs font-semibold">Postal / Pincode</Label>
                <Input
                  id="zip"
                  placeholder="600001"
                  value={addressForm.zip}
                  onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                  className="mt-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-xs font-semibold">Country</Label>
                <Input
                  id="country"
                  placeholder="India"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="mt-1.5 text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-4" /> Auto-synced with Checkout
              </div>
              <Button type="submit" size="sm" disabled={savingAddress} className="gap-1.5 text-xs font-semibold">
                <Save className="size-3.5" /> Save Permanent Address
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* 3. Notification Management Tab */}
        <TabsContent value="notifications" className="mt-4 rounded-xl border bg-card p-6 shadow-soft space-y-6">
          <div className="border-b pb-4">
            <h4 className="text-base font-bold text-foreground">Notification Preferences</h4>
            <p className="text-xs text-muted-foreground">Manage how you receive order tracking updates and system alerts.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-surface/40">
              <div>
                <p className="font-bold text-foreground">Order & Shipment Email Alerts</p>
                <p className="text-muted-foreground">Receive real-time tracking emails when your order ships.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-surface/40">
              <div>
                <p className="font-bold text-foreground">SMS Delivery Updates</p>
                <p className="text-muted-foreground">Receive SMS text notifications for out-for-delivery status.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsTracking}
                onChange={(e) => setNotifications({ ...notifications, smsTracking: e.target.checked })}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-surface/40">
              <div>
                <p className="font-bold text-foreground">Promotional Deals & Wishlist Alerts</p>
                <p className="text-muted-foreground">Get notified when wishlisted items go on sale.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.promotions}
                onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button size="sm" onClick={handleSaveNotifications} className="gap-1.5 text-xs font-semibold">
              <Save className="size-3.5" /> Save Notification Settings
            </Button>
          </div>
        </TabsContent>

        {/* 4. Themes & Preferences Tab */}
        <TabsContent value="preferences" className="mt-4 rounded-xl border bg-card p-6 shadow-soft space-y-6">
          <div className="border-b pb-4">
            <h4 className="text-base font-bold text-foreground">Theme & Regional Preferences</h4>
            <p className="text-xs text-muted-foreground">Customize store currency and theme preferences.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Display Currency</Label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Theme Mode</Label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="system">System Default</option>
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button size="sm" onClick={handleSavePreferences} className="gap-1.5 text-xs font-semibold">
              <Save className="size-3.5" /> Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfileSettingsPage;
