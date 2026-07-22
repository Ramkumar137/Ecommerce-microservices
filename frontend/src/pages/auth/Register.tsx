import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

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

      await register(formData);

      toast.success("Registration successful.");

      navigate({
        to: "/auth/login",
      });
    } catch (error: any) {
    console.log("Register Error:", error);
    console.log("Response:", error.response);
    console.log("Data:", error.response?.data);

    toast.error(
      error.response?.data?.message ||
      JSON.stringify(error.response?.data) ||
      error.message ||
      "Registration failed."
    );
  }
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your account
      </h1>

      <p className="mt-1.5 text-sm text-muted-foreground">
        Start shopping in under a minute.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="first_name">First Name</Label>

            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="mt-1.5 h-11"
            />
          </div>

          <div>
            <Label htmlFor="last_name">Last Name</Label>

            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="mt-1.5 h-11"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="username">Username</Label>

          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>

          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>

          <Input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />

          <p className="mt-1.5 text-xs text-muted-foreground">
            Must be at least 8 characters.
          </p>
        </div>
        

        {/* <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <Checkbox className="mt-0.5" />

          <span>
            I agree to the{" "}
            <Link
              to="/auth/register"
              className="text-foreground underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/auth/register"
              className="text-foreground underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label> */}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;