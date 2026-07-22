import { createContext, useContext, useEffect, useState, ReactNode, } from "react";

import AuthService from "@/services/auth.service";
import { LoginRequest, RegisterRequest } from "@/api/auth";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
    }

    setLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const result = await AuthService.login(data);
    setUser(result.user);
  };

  const register = async (data: RegisterRequest) => {
  return await AuthService.register(data);
};

  const logout = () => {
    AuthService.logout();
    setUser(null);

    window.location.href = "/";
  };

  function updateUser(updatedUser: User) {
    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}