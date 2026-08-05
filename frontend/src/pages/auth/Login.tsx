import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { GoogleSignInModal } from "@/components/auth/GoogleSignInModal";
import { getGoogleClientId, triggerGoogleOAuth } from "@/utils/google-auth";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSelectGoogleAccount = async (email: string, name: string, avatar?: string) => {
    try {
      setGoogleLoading(true);
      const googleUser = await loginWithGoogle(email, name, avatar);
      toast.success(`Welcome, ${googleUser.first_name}! Signed in with Google.`);

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      if (redirect && redirect.startsWith("/")) {
        navigate({ to: redirect as any });
      } else {
        navigate({ to: "/" });
      }
    } catch {
      toast.error("Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleContinueWithGoogle = async () => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      // Fallback flow: Open interactive GoogleSignInModal
      setIsGoogleModalOpen(true);
      return;
    }

    // Primary OAuth Flow using GIS
    try {
      setGoogleLoading(true);
      await triggerGoogleOAuth({
        clientId,
        onSuccess: async ({ email, name, picture, token }) => {
          const googleUser = await loginWithGoogle(email, name, picture, token);
          toast.success(`Welcome, ${googleUser.first_name}! Signed in with Google.`);

          const redirect = new URLSearchParams(window.location.search).get("redirect");
          if (redirect && redirect.startsWith("/")) {
            navigate({ to: redirect as any });
          } else {
            navigate({ to: "/" });
          }
          setGoogleLoading(false);
        },
        onError: (errorMsg) => {
          toast.error(errorMsg);
          setGoogleLoading(false);
        },
      });
    } catch {
      toast.error("Google authentication failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!formData.email) next.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = "Enter a valid email address.";
    if (!formData.password) next.password = "Password is required.";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    try {
      setLoading(true);
      setErrors({});
      const loggedUser = await login(formData);
      toast.success("Welcome back!");

      const userRole = String(loggedUser?.role || "").toUpperCase();
      const redirect = new URLSearchParams(window.location.search).get("redirect");

      if (userRole === "ADMIN" || userRole === "ADMINISTRATOR") {
        navigate({ to: "/admin" });
      } else if (redirect && redirect.startsWith("/")) {
        navigate({ to: redirect as any });
      } else {
        navigate({ to: "/" });
      }
    } catch (error: any) {
      const responseData = error.response?.data;
      const apiMsg =
        responseData?.error ||
        responseData?.detail ||
        responseData?.message ||
        (typeof responseData === "string" ? responseData : error.message) ||
        "Invalid email or password.";
      setErrors({ form: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your HeisenFlow account.</p>

      {/* Form-level error */}
      {errors.form && (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
          />
          {errors.email && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/login" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`h-11 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3" /> {errors.password}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/auth/register" className="font-semibold text-foreground hover:underline">
          Sign up free
        </Link>
      </p>

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
}

export default LoginPage;
