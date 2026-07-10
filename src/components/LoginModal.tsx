import { useState, FormEvent } from "react";
import { X, Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatusMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    
    setLoading(true);
    setStatusMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setStatusMessage({ type: "success", text: "Welcome back!" });
      // App.tsx listener will handle the UI switch
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div 
        className="absolute inset-0 bg-[#07050f]/85 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        id="login-modal-container"
        className="relative w-full max-w-md bg-[#131024] border border-purple-900/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-wide">Login</h2>
          <button 
            onClick={onClose}
            className="text-purple-400 hover:text-white p-1 rounded-lg bg-purple-950/20 hover:bg-purple-900/40 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mock Status Alerts */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-medium border ${
            statusMessage.type === "success" 
              ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" 
              : "bg-rose-950/40 border-rose-800/40 text-rose-300"
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Username Input */}
          <div className="space-y-1">
            <input
              type="text"
              id="login-email"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[#1b1633] text-purple-100 placeholder-purple-500 border border-purple-950/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Password Input */}
          <div className="relative space-y-1">
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-[#1b1633] text-purple-100 placeholder-purple-500 border border-purple-950/50 rounded-lg py-2.5 px-4 text-sm pr-10 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-[13px] text-purple-400 hover:text-purple-200 disabled:opacity-50"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(147,51,234,0.3)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-medium">
          <button 
            type="button"
            onClick={() => alert("Simulation: Reset link sent to your email!")}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot password?
          </button>
          <div className="text-purple-500">
            New here?{" "}
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
            >
              Register now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
