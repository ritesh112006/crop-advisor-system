import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, BarChart2, Landmark, LayoutDashboard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  const navLinks = [
    { label: t("home"), href: "/", icon: Home },
    { label: t("marketPrices"), href: "/market", icon: BarChart2 },
    { label: t("govtSchemes"), href: "/schemes", icon: Landmark },
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Crop Advisor System" className="h-8 w-8" />
          <span className="font-heading text-lg font-bold text-primary">Crop Advisor</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const NavIcon = l.icon;
            return (
              <Link
                key={l.href}
                to={l.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <NavIcon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
          <div className="mx-2 h-6 w-px bg-border" />
          <Link to="/dashboard/alerts" className="text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5" />
          </Link>
          <LanguageSwitcher />
          {user ? (
            <Button size="sm" variant="outline" onClick={signOut}>
              {t("logout")}
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">{t("login")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/dashboard/alerts" className="text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
          </Link>
          <LanguageSwitcher />
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => {
              const NavIcon = l.icon;
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <NavIcon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t">
              {user ? (
                <Button size="sm" variant="outline" className="w-full" onClick={() => { signOut(); setOpen(false); }}>
                  {t("logout")}
                </Button>
              ) : (
                <Button asChild size="sm" className="w-full">
                  <Link to="/login" onClick={() => setOpen(false)}>{t("login")}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
