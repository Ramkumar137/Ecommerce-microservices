import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AuthService from "@/services/auth.service";
import { storage } from "@/utils/storage";
import { performFullLogout, isJwtExpired } from "@/utils/session";
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
  // Synchronously rehydrate user from storage on client mount if token is valid
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const token = storage.getAccessToken();
      if (!token || isJwtExpired(token)) return null;
      return storage.getUser();
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // App load initialization: Session verification & token validation (Client side only)
  useEffect(() => {
    async function initAuth() {
      try {
        const token = storage.getAccessToken();
        if (token && !isJwtExpired(token)) {
          const cachedUser = storage.getUser();
          if (cachedUser) {
            setUser(cachedUser);
          }
        }
        const userSession = await AuthService.initializeAuthSession();
        setUser(userSession);
      } catch {
        if (!storage.getAccessToken()) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }
    initAuth();

    const handleLogoutState = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:session-expired", handleLogoutState);
    window.addEventListener("auth:logout", handleLogoutState);
    return () => {
      window.removeEventListener("auth:session-expired", handleLogoutState);
      window.removeEventListener("auth:logout", handleLogoutState);
    };
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
    setUser(null);
    performFullLogout(false);
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