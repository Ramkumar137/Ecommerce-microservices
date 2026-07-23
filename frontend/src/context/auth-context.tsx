import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AuthService from "@/services/auth.service";
import type { LoginRequest, RegisterRequest, User, UpdateProfileRequest } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  updateUserProfile: (data: UpdateProfileRequest) => Promise<User>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // App load initialization: Token refresh & session verification
  useEffect(() => {
    async function initAuth() {
      try {
        const userSession = await AuthService.initializeAuthSession();
        setUser(userSession);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<User> => {
    const result = await AuthService.login(data);
    setUser(result.user);
    return result.user;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    return await AuthService.register(data);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    window.location.href = "/auth/login";
  };

  const updateUserProfile = async (data: UpdateProfileRequest): Promise<User> => {
    const updated = await AuthService.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const isAdmin =
    !!user &&
    typeof user.role === "string" &&
    (user.role.toUpperCase() === "ADMIN" || user.role.toUpperCase() === "ADMINISTRATOR");

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user && user.is_active !== false,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}