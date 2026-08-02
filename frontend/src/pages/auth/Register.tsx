import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { GoogleSignInModal } from "@/components/auth/GoogleSignInModal";
import { getGoogleClientId, triggerGoogleOAuth } from "@/utils/google-auth";

type FormData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
};

type FormErrors = Partial<Record<keyof FormData | "form", string>>;

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  if (pw.length < 6) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
    return { level: 2, label: "Fair", color: "bg-amber-500" };
  return { level: 3, label: "Strong", color: "bg-emerald-500" };
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSelectGoogleAccount = async (email: string, name: string, avatar?: string) => {
    try {
      setGoogleLoading(true);
      const googleUser = await loginWithGoogle(email, name, avatar);
      toast.success(`Welcome, ${googleUser.first_name}! Signed in with Google.`);
      navigate({ to: "/" });
    } catch {
      toast.error("Google registration failed.");
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
          navigate({ to: "/" });
          setGoogleLoading(false);
        },
        onError: (errorMsg) => {
          toast.error(errorMsg);
          setGoogleLoading(false);
        },
      });
    } catch {
      toast.error("Google registration failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.first_name.trim()) e.first_name = "First name is required.";
    if (!formData.last_name.trim()) e.last_name = "Last name is required.";
    if (!formData.username.trim()) e.username = "Username is required.";
    else if (formData.username.length < 3) e.username = "Username must be at least 3 characters.";
    if (!formData.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email address.";
    if (!formData.phone.trim()) e.phone = "Phone number is required.";
    if (!formData.password) e.password = "Password is required.";
    else if (formData.password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    try {
      setLoading(true);
      setErrors({});
      await register(formData);
      toast.success("Account created! Please sign in.");
      navigate({ to: "/auth/login" });
    } catch (error: any) {
      const responseData = error.response?.data;
      const apiMsg =
        responseData?.error ||
        responseData?.detail ||
        responseData?.message ||
        (typeof responseData === "string" ? responseData : error.message) ||
        "Registration failed.";
      setErrors({ form: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(formData.password);

  const field = (
    id: keyof FormData,
    label: string,
    type = "text",
    placeholder = "",
    autoComplete = ""
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={formData[id]}
        onChange={handleChange}
        className={`h-11 ${errors[id] ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
      />
      {errors[id] && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3 shrink-0" /> {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Start shopping in under a minute.</p>

      {/* Form-level error */}
      {errors.form && (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          {field("first_name", "First name", "text", "Jane")}
          {field("last_name", "Last name", "text", "Doe")}
        </div>

        {field("username", "Username", "text", "janedoe", "username")}
        {field("email", "Email address", "email", "you@example.com", "email")}
        {field("phone", "Phone number", "tel", "+91 99999 88888", "tel")}

        {/* Password with toggle + strength */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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

          {/* Strength bar */}
          {formData.password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      pwStrength.level >= n ? pwStrength.color : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className={`flex items-center gap-1 text-xs ${
                pwStrength.level === 3 ? "text-emerald-600" :
                pwStrength.level === 2 ? "text-amber-600" : "text-red-500"
              }`}>
                {pwStrength.level === 3
                  ? <CheckCircle2 className="size-3" />
                  : <AlertCircle className="size-3" />}
                {pwStrength.label} password
              </p>
            </div>
          )}

          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3 shrink-0" /> {errors.password}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link to="/" className="text-foreground underline underline-offset-2">Terms</Link>
          {" "}and{" "}
          <Link to="/" className="text-foreground underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full font-semibold gap-2"
        type="button"
        disabled={loading || googleLoading}
        onClick={handleContinueWithGoogle}
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-semibold text-foreground hover:underline">
          Sign in
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

export default RegisterPage;
