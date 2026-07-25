const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const USER = "user";

export const storage = {
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN, token);
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN);
  },

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN, token);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN);
  },

  setUser(user: any) {
    localStorage.setItem(USER, JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : null;
  },

  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem(USER);
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  },
};