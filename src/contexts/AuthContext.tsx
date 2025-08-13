
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authAPI } from "@/lib/api/apiService";
import { logger } from "@/lib/logger";
import { User, AuthTokens, AuthContextType } from "@/types/auth";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check if user is already logged in from localStorage
      const storedTokens = localStorage.getItem("authTokens");
      const storedUser = localStorage.getItem("user");
      
      if (storedTokens && storedUser) {
        try {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);
          
          setTokens(parsedTokens);
          setUser(parsedUser);
          
          // Validate token with server
          const isValid = await validateTokenInternal(parsedTokens.access_token);
          
          if (isValid) {
            setIsAuthenticated(true);
          } else {
            // Try to refresh token
            const refreshed = await refreshTokenInternal(parsedTokens.refresh_token);
            if (!refreshed) {
              logout();
            }
          }
        } catch (error) {
          logger.error("Error parsing stored auth data:", error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const validateTokenInternal = async (accessToken: string): Promise<boolean> => {
    try {
      // Temporarily set the token for the API call
      const originalToken = localStorage.getItem("authTokens");
      localStorage.setItem("authTokens", JSON.stringify({ access_token: accessToken }));
      
      const response = await authAPI.validateToken();
      
      // Restore original token
      if (originalToken) {
        localStorage.setItem("authTokens", originalToken);
      } else {
        localStorage.removeItem("authTokens");
      }
      
      return response.success;
    } catch (error) {
      logger.error("Token validation failed:", error);
      return false;
    }
  };

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
      logger.error("Token refresh failed:", error);
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
      logger.error("Login failed:", error);
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

  const validateToken = async (): Promise<boolean> => {
    if (!tokens?.access_token) {
      return false;
    }
    
    const isValid = await validateTokenInternal(tokens.access_token);
    
    if (!isValid) {
      // Try to refresh token if validation fails
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        return false;
      }
      return true;
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      user, 
      getAccessToken, 
      refreshToken,
      validateToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
