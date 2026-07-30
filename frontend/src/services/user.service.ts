import { usersApi } from "@/api/users";
import { authService as rawAuthService } from "@/api/services/auth";
import type { User, UpdateProfileRequest } from "@/types/auth";

export class UserService {
  async getProfile(): Promise<User> {
    try {
      return await rawAuthService.getProfile();
    } catch (error) {
      console.error("[userService.getProfile error]", error);
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      return await rawAuthService.updateProfile(data);
    } catch (error) {
      console.error("[userService.updateProfile error]", error);
      throw error;
    }
  }

  async getAllUsersAdmin(): Promise<User[]> {
    try {
      return await usersApi.listAdmin();
    } catch (error) {
      console.error("[userService.getAllUsersAdmin error]", error);
      throw error;
    }
  }

  async getUserByIdAdmin(userId: string): Promise<User> {
    try {
      return await usersApi.getAdmin(userId);
    } catch (error) {
      console.error(`[userService.getUserByIdAdmin ${userId} error]`, error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
