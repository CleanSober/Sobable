import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import sobableLogo from "@/assets/sobable-logo.png";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "reset" ? "reset" : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && mode !== "reset") navigate("/");
  }, [user, navigate, mode]);

  // Detect password recovery event from URL
  useEffect(() => {
    if (initialMode === "reset") {
      setMode("reset");
    }
  }, [initialMode]);

  const validateEmail = () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 255) {
      toast.error("Email is too long");
      return false;
    }
    if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validatePassword = (isSignup: boolean) => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (password.length > 128) {
      toast.error("Password is too long");
      return false;
    }
    if (isSignup && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error("Password must include uppercase, lowercase, and a number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      if (!validateEmail()) return;
      setLoading(true);
      try {
        const { error } = await resetPassword(email.trim());
        if (error) {
          toast.error(error.message);
        } else {
          setResetSent(true);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!validatePassword(true)) return;
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setLoading(true);
      try {
        const { error } = await updatePassword(password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password updated successfully!");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!validateEmail() || !validatePassword(mode === "signup")) return;

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        const { error, needsConfirmation } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else if (needsConfirmation) {
          toast.success("Check your email to confirm your account before signing in.", { duration: 6000 });
          switchMode("login");
        } else {
          toast.success("Account created! Welcome to your recovery journey.");
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) {
        toast.error(result.error.message || `Failed to sign in with ${provider}`);
      }
    } catch (err) {
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setResetSent(false);
  };

  const getHeaderText = () => {
    switch (mode) {
      case "login": return { title: "Welcome back to your journey", cta: "Sign In" };
      case "signup": return { title: "Start your recovery journey", cta: "Create Account" };
      case "forgot": return { title: "Reset your password", cta: "Send Reset Link" };
      case "reset": return { title: "Choose a new password", cta: "Update Password" };
    }
  };

  const header = getHeaderText();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px]"
          style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative inline-block mb-3"
          >
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-50"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.5))",
                transform: "scale(1.3)",
              }}
            />
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-elevated">
              <img src={sobableLogo} alt="Sobable" className="w-full h-full object-cover" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
          </motion.div>

          <h1 className="text-2xl font-bold mb-1 text-gradient">Sobable</h1>
          <p className="text-sm text-muted-foreground">{header.title}</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + (resetSent ? "-sent" : "")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Forgot Password - Success State */}
              {mode === "forgot" && resetSent ? (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    We sent a password reset link to
                  </p>
                  <p className="text-sm font-medium text-foreground mb-5">{email}</p>
                  <p className="text-xs text-muted-foreground mb-5">
                    Didn't receive it? Check your spam folder or try again.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm"
                      onClick={() => setResetSent(false)}
                    >
                      Try again
                    </Button>
                    <button
                      onClick={() => switchMode("login")}
                      className="w-full text-sm text-primary font-medium py-2 hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Social Login (only for login/signup) */}
                  {(mode === "login" || mode === "signup") && (
                    <>
                      <div className="space-y-2.5 mb-5">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 bg-secondary/30 border-border/50 hover:bg-secondary/60 transition-all text-sm font-medium"
                          onClick={() => handleSocialLogin("google")}
                          disabled={socialLoading !== null}
                        >
                          {socialLoading === "google" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              Continue with Google
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 bg-secondary/30 border-border/50 hover:bg-secondary/60 transition-all text-sm font-medium"
                          onClick={() => handleSocialLogin("apple")}
                          disabled={socialLoading !== null}
                        >
                          {socialLoading === "apple" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                              </svg>
                              Continue with Apple
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border/40" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-3 bg-card text-muted-foreground">or with email</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Back button for forgot/reset modes */}
                  {(mode === "forgot" || mode === "reset") && (
                    <button
                      onClick={() => switchMode("login")}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </button>
                  )}

                  {/* Reset mode icon */}
                  {mode === "reset" && (
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                        <KeyRound className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Email field (not shown in reset mode) */}
                    {mode !== "reset" && (
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50 text-sm"
                          required
                        />
                      </div>
                    )}

                    {mode === "forgot" && (
                      <p className="text-xs text-muted-foreground">
                        Enter the email address associated with your account and we'll send you a link to reset your password.
                      </p>
                    )}

                    {/* Password field (login, signup, reset) */}
                    {mode !== "forgot" && (
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={mode === "reset" ? "New password (8+ chars, Aa1)" : mode === "signup" ? "Password (8+ chars, Aa1)" : "Password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {/* Confirm password (reset mode) */}
                    {mode === "reset" && (
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50 text-sm"
                          required
                        />
                      </div>
                    )}

                    {/* Forgot password link (login mode) */}
                    {mode === "login" && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 font-semibold gradient-primary btn-glow text-primary-foreground"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {header.cta}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Toggle login/signup */}
                  {(mode === "login" || mode === "signup") && (
                    <div className="mt-5">
                      {mode === "login" ? (
                        <div className="text-center space-y-3">
                          <p className="text-sm text-muted-foreground">Don't have an account yet?</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 font-semibold border-primary/50 text-primary hover:bg-primary/10 transition-all"
                            onClick={() => switchMode("signup")}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create Your Free Account
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button
                            onClick={() => switchMode("login")}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Already have an account? <span className="text-primary font-medium">Sign in</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-muted-foreground text-xs mt-5"
        >
          Your journey to recovery starts here ✨
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
