import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

function LoginPage() {
  const navigate = useNavigate();

  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const loggedUser = await login(formData);

      toast.success("Login successful");

      const userRole = String(loggedUser?.role || "").toUpperCase();

      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");

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
        "Sign in failed.";
      toast.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>

      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to your HeisenFlow account.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <div>
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>

            <Link
              to="/auth/login"
              className="text-xs text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>

          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox />
          Remember me for 30 days
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6 grid gap-2">
        <Button variant="outline" size="lg">
          Continue with Google
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?

        <Link
          to="/auth/register"
          className="ml-1 font-medium text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;