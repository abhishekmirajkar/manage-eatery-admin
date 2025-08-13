import { logger } from "@/lib/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

interface PasswordResetResponse {
  success: boolean;
  token?: string;
  error?: string;
}

interface ResetPasswordResponse {
  success: boolean;
  error?: string;
}

export const passwordResetService = {
  async verifyEmailForReset(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.data && data.data.token) {
          return {
            success: true,
            token: data.data.token,
          };
        } else {
          logger.error("Token not found in password reset response");
          return {
            success: false,
            error: "Invalid response from server - token missing",
          };
        }
      } else {
        return {
          success: false,
          error: data.error || "User with this email not found",
        };
      }
    } catch (error) {
      logger.error("Email verification error:", error);
      return {
        success: false,
        error: "Failed to verify email. Please try again.",
      };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to reset password",
        };
      }
    } catch (error) {
      logger.error("Password reset error:", error);
      return {
        success: false,
        error: "Failed to reset password. Please try again.",
      };
    }
  },
};