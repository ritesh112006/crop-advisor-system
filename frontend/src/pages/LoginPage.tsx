import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-card">
        <div className="flex flex-col items-center gap-2">
          <Sprout className="h-10 w-10 text-primary" />
          <h1 className="font-heading text-2xl font-bold">{t("loginTitle")}</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">{t("password")}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : t("login")}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">{t("signup")}</Link>
        </p>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary">
          ← {t("home")}
        </Link>
      </div>
    </div>
  );
}
