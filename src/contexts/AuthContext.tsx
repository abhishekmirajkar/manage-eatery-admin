
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
  getAccessToken: () => string | null;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedTokens = localStorage.getItem("authTokens");
    const storedUser = localStorage.getItem("user");
    
    if (storedTokens && storedUser) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);
        
        // Check if token is not expired (with some buffer)
        const tokenData = JSON.parse(atob(parsedTokens.access_token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenData.exp > currentTime + 60) { // 60 seconds buffer
          setTokens(parsedTokens);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Try to refresh token
          refreshTokenInternal(parsedTokens.refresh_token);
        }
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        logout();
      }
    }
  }, []);

  const refreshTokenInternal = async (refreshTokenValue: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const newTokens = data.data.tokens;
          setTokens(newTokens);
          setIsAuthenticated(true);
          localStorage.setItem("authTokens", JSON.stringify(newTokens));
          return true;
        }
      }
      
      logout();
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const { customer, tokens: authTokens } = data.data;
        
        setTokens(authTokens);
        setUser(customer);
        setIsAuthenticated(true);
        
        localStorage.setItem("authTokens", JSON.stringify(authTokens));
        localStorage.setItem("user", JSON.stringify(customer));
        
        toast.success("Logged in successfully");
        return true;
      } else {
        toast.error(data.error || "Invalid credentials");
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setTokens(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const getAccessToken = (): string | null => {
    return tokens?.access_token || null;
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refresh_token) {
      return false;
    }
    return refreshTokenInternal(tokens.refresh_token);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      user, 
      getAccessToken, 
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
