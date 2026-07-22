import { authApi } from "@/api";
import { storage } from "@/utils/storage";
import { LoginRequest, RegisterRequest } from "@/api/auth";
import { LoginResponse } from "@/types/auth";

class AuthService {
  async register(data: RegisterRequest) {
    const response = await authApi.register(data);
    return response.data;
  }

  async login(data: LoginRequest) {
    const response = await authApi.login(data);

    const loginData: LoginResponse = response.data;

    storage.setAccessToken(loginData.access_token);
    storage.setRefreshToken(loginData.refresh_token);
    storage.setUser(loginData.user);

    return loginData;
  }

  logout() {
    storage.clear();
  }

  getCurrentUser() {
    return storage.getUser();
  }

  isAuthenticated() {
    return !!storage.getAccessToken();
  }
}

export default new AuthService();