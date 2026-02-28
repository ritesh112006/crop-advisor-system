import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wheat, Brain, CloudSun,
  Bell, FileText, Settings, Menu, X, Home, ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  const sidebarItems = [
    { icon: LayoutDashboard, label: t("overview"), href: "/dashboard" },
    { icon: Wheat, label: t("myCrops"), href: "/dashboard/crops" },
    { icon: Brain, label: t("cropRecommendation"), href: "/dashboard/recommendation" },
    { icon: CloudSun, label: t("weather"), href: "/dashboard/weather" },
    { icon: Bell, label: t("alerts"), href: "/dashboard/alerts" },
    { icon: FileText, label: t("reports"), href: "/dashboard/reports" },
    { icon: Settings, label: t("settings"), href: "/dashboard/settings" },
  ];

  const alertCount = 2;

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR — static (sticky) on all screen sizes ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground
          md:sticky md:top-0 md:h-screen md:max-h-screen md:z-auto
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo header */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4 shrink-0">
          <img src="/logo.svg" alt="Crop Advisor" className="h-8 w-8" />
          <span className="font-heading text-base font-bold text-sidebar-foreground">Crop Advisor</span>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Back to Home — pinned at TOP of sidebar nav */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors border border-sidebar-border/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <Home className="h-4 w-4" />
            <span>{t("backToHome")}</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 my-1 border-t border-sidebar-border/40" />

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.href === "/dashboard/alerts" && alertCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout at bottom */}
        <div className="border-t border-sidebar-border p-4 shrink-0">
          {user && (
            <Button size="sm" variant="outline" className="w-full" onClick={signOut}>
              {t("logout")}
            </Button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-md md:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-heading text-lg font-semibold text-foreground">{t("dashboard")}</h1>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/dashboard/alerts" className="relative text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {alertCount}
                </span>
              )}
            </Link>
            <Link to="/dashboard/settings" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors">
              <span className="text-xs font-bold text-primary">
                {(localStorage.getItem("farmerName") || "F").charAt(0).toUpperCase()}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
