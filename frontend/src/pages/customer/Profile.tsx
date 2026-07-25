import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  async function handleSave() {
    try {
      setLoading(true);
      await updateUserProfile(form);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
      <PageHeader title="Profile" description="Manage your account and preferences." />

      <div className="mt-8 flex items-center gap-4 rounded-xl border bg-card p-5 shadow-soft">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {user?.first_name?.charAt(0)}
            {user?.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-muted-foreground">
            {user?.email} • <span className="uppercase font-medium text-primary">{user?.role}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="account" className="mt-8">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 rounded-xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fn">First name</Label>
              <Input
                id="fn"
                value={form.first_name}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ln">Last name</Label>
              <Input
                id="ln"
                value={form.last_name}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="em">Email</Label>
              <Input
                id="em"
                type="email"
                value={form.email}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ph">Phone</Label>
              <Input
                id="ph"
                value={form.phone}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                value={form.username}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Input value={user?.role || "CUSTOMER"} disabled className="mt-1.5" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-6">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    setEditing(false);
                    if (user) {
                      setForm({
                        first_name: user.first_name || "",
                        last_name: user.last_name || "",
                        username: user.username || "",
                        email: user.email || "",
                        phone: user.phone || "",
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="address" className="mt-6 rounded-xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Street address</Label>
              <Input defaultValue="450 Sansome Street, Apt 8" className="mt-1.5" />
            </div>
            <div>
              <Label>City</Label>
              <Input defaultValue="San Francisco" className="mt-1.5" />
            </div>
            <div>
              <Label>Postal code</Label>
              <Input defaultValue="94111" className="mt-1.5" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Email preferences for order updates and promotions.
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfilePage;
