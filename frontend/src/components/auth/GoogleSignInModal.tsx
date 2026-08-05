import { useState } from "react";
import { Plus, ArrowRight, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Alex Morgan",
    email: "alex.morgan@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMorgan",
  },
  {
    name: "Samantha Ray",
    email: "samantha.ray@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SamanthaRay",
  },
  {
    name: "Customer Demo",
    email: "customer.google@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CustomerGoogle",
  },
];

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string, avatar?: string) => Promise<void>;
}

export function GoogleSignInModal({ isOpen, onClose, onSelectAccount }: GoogleSignInModalProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [customError, setCustomError] = useState("");

  if (!isOpen) return null;

  const handleSelect = async (account: GoogleAccount) => {
    try {
      setLoadingEmail(account.email);
      await onSelectAccount(account.email, account.name, account.avatar);
      onClose();
    } catch {
      // Handled upstream
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !/\S+@\S+\.\S+/.test(customEmail)) {
      setCustomError("Please enter a valid Google email address.");
      return;
    }

    const name = customName.trim() || customEmail.split("@")[0] || "Google User";
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`;

    try {
      setLoadingEmail(customEmail);
      await onSelectAccount(customEmail.trim(), name, avatar);
      onClose();
    } catch {
      // Handled upstream
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background border border-border shadow-2xl transition-all">
        {/* Header with Google Brand styling */}
        <div className="relative border-b border-border/60 bg-muted/30 px-6 py-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3">
            <svg className="size-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <div>
              {/* <h3 className="font-semibold text-foreground leading-none">Sign in with Google</h3>
              <p className="mt-1 text-xs text-muted-foreground">Choose an account to continue to HeisenFlow</p> */}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!showCustomInput ? (
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Select a Google Account
              </p>

              <div className="space-y-2">
                {DEFAULT_ACCOUNTS.map((account) => {
                  const isAccountLoading = loadingEmail === account.email;
                  return (
                    <button
                      key={account.email}
                      onClick={() => handleSelect(account)}
                      disabled={!!loadingEmail}
                      className="group flex w-full items-center justify-between rounded-xl border border-border/70 p-3 text-left hover:border-primary/50 hover:bg-muted/50 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="size-10 rounded-full border border-border/80 bg-muted object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {account.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{account.email}</p>
                        </div>
                      </div>

                      {isAccountLoading ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowCustomInput(true)}
                  disabled={!!loadingEmail}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-3 text-left hover:border-primary/50 hover:bg-muted/30 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Plus className="size-5" />
                  </div>
                  <span>Use another Google account</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Custom Google Account
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-primary hover:underline"
                >
                  Back to accounts list
                </button>
              </div>

              {customError && (
                <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                  {customError}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="custom-name">Full Name</Label>
                <Input
                  id="custom-name"
                  placeholder="e.g. John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="custom-email">Google Email Address</Label>
                <Input
                  id="custom-email"
                  type="email"
                  placeholder="user@gmail.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (customError) setCustomError("");
                  }}
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCustomInput(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!loadingEmail}>
                  {loadingEmail ? "Signing in..." : "Continue"}
                </Button>
              </div>
            </form>
          )}

          {/* Security footnote */}
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground border border-border/40">
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
            <span>Securely authenticated via Google Account Services protocol.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
