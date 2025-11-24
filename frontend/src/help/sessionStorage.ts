export const storage = {
  setToken(token: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("authToken", token);
    }
  },
  
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("authToken");
    }
    return null;
  },
  
  setUser(user: any) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  },
  
  getUser(): any | null {
    if (typeof window !== "undefined") {
      const u = sessionStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    }
    return null;
  },
  
  clear() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
    }
  },
};