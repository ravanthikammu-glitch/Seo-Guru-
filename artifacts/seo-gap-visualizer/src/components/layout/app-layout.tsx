import { useState } from "react";
import React from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, BarChart2, FileText, Network,
  Target, Download, Settings, ChevronLeft, ChevronRight,
  Sun, Moon, Bell, Search, TrendingUp, X, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS: { label: string; icon: React.ElementType; href: string; badge?: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "AI Intelligence", icon: Globe, href: "/intelligence", badge: "New" },
  { label: "Competitor Analysis", icon: BarChart2, href: "/dashboard" },
  { label: "Content Gaps", icon: FileText, href: "/dashboard" },
  { label: "Topic Map", icon: Network, href: "/dashboard" },
  { label: "Opportunities", icon: Target, href: "/dashboard" },
  { label: "Reports", icon: Download, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const NOTIFICATIONS = [
  { id: 1, title: "New gap detected", body: "Competitor published 3 articles on Technical SEO", time: "5m ago", unread: true },
  { id: 2, title: "Analysis complete", body: "Weekly competitor scan finished for ahrefs.com", time: "1h ago", unread: true },
  { id: 3, title: "Opportunity alert", body: "Crawl budget optimization score rose to 95", time: "3h ago", unread: false },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${collapsed ? "w-16" : "w-60"} shrink-0`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? "justify-center px-2" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-bold text-sidebar-foreground leading-none block">SEO Gap</span>
              <span className="text-xs text-muted-foreground leading-none">Visualizer</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href === "/dashboard" && (location === "/" || location === "/dashboard"));
            return (
              <Link key={item.label} href={item.href}>
                <div
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-primary/30">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className={`p-4 border-t border-border flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
          <button
            data-testid="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent w-full"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
          </button>
          <button
            data-testid="sidebar-collapse"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent w-full"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
          <div className="flex-1 relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="search-input"
              placeholder="Search keywords, topics..."
              className="pl-9 h-8 text-sm bg-background"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button
                data-testid="notification-bell"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold">Notifications</span>
                    <button onClick={() => setNotifOpen(false)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                        </div>
                        {n.unread && <span className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              JD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
