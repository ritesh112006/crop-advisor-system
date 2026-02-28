import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sprout, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const indianStates = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function SignupPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          location: state,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      localStorage.setItem("farmerName", fullName);
      localStorage.setItem("farmerEmail", email);
      localStorage.setItem("farmerLocation", state);
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-8 shadow-card text-center">
          <Sprout className="mx-auto h-10 w-10 text-primary" />
          <h2 className="font-heading text-xl font-bold">{t("verifyEmail")}</h2>
          <p className="text-sm text-muted-foreground">Check your inbox at <strong>{email}</strong></p>
          <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline">{t("login")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-card">
        <div className="flex flex-col items-center gap-2">
          <Sprout className="h-10 w-10 text-primary" />
          <h1 className="font-heading text-2xl font-bold">{t("signupTitle")}</h1>
          <p className="text-sm text-muted-foreground">Join CropAdvisor — smarter farming starts here</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("fullName")}</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("password")}</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {/* State only */}
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {t("state") || "State"}
            </label>
            <select value={state} onChange={(e) => setState(e.target.value)} required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t("select") || "Select State"}</option>
              {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : t("signup")}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">{t("login")}</Link>
        </p>
      </div>
    </div>
  );
}
