
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

type ResetStep = 'email' | 'password';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Email verification and token generation
  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Handle the response structure: { success: true, data: { token: "...", email: "..." } }
        if (data.data && data.data.token) {
          setResetToken(data.data.token);
          setResetStep('password');
          toast.success("Email verified! Please enter your new password.");
        } else {
          console.error("Token not found in response:", data);
          toast.error("Invalid response from server - token missing");
        }
      } else {
        toast.error(data.error || "User with this email not found");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Failed to verify email. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  // Step 2: Password reset with token
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsResetting(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsResetting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: resetToken,
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Password reset successfully! You can now log in with your new password.");
        setShowResetModal(false);
        resetForm();
        // Pre-fill login form with the email
        setEmail(resetEmail);
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const resetForm = () => {
    setResetStep('email');
    setResetEmail("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const openResetModal = () => {
    resetForm();
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    resetForm();
  };

  const goBackToEmailStep = () => {
    setResetStep('email');
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={openResetModal}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Step Password Reset Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="sm:max-w-[425px]">
          {resetStep === 'email' ? (
            // Step 1: Email Verification
            <form onSubmit={handleEmailVerification}>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your email address to verify your account and reset your password.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={isResetting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeResetModal}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isResetting}>
                  {isResetting ? "Verifying..." : "Verify Email"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            // Step 2: New Password Entry
            <form onSubmit={handlePasswordReset}>
              <DialogHeader>
                <DialogTitle>Set New Password</DialogTitle>
                <DialogDescription>
                  Email verified! Enter your new password for {resetEmail}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Email verified successfully
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isResetting}
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isResetting}
                    minLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goBackToEmailStep}
                  disabled={isResetting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isResetting}>
                  {isResetting ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
