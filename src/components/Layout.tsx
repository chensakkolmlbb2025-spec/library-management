import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, User, Home } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleDashboard = () => {
    switch (profile?.role) {
      case "STUDENT":
        return "/student";
      case "STAFF":
        return "/staff";
      case "ADMIN":
        return "/admin";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-navbar sticky top-0 z-50 shadow-lg">
        <div className="max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="glass-strong p-2.5 rounded-xl border-2 border-white/60 shadow-sm">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">
                  University Library
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {profile?.role || "System"}
                </p>
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-2">
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="btn-secondary px-4 py-2 rounded-xl font-medium group"
                >
                  <BookOpen className="h-4 w-4 mr-2 group-hover:text-white transition-colors" />
                  <span className="text-sm">Catalog</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(getRoleDashboard())}
                  className="btn-secondary px-4 py-2 rounded-xl font-medium group"
                >
                  <Home className="h-4 w-4 mr-2 group-hover:text-white transition-colors" />
                  <span className="text-sm">Dashboard</span>
                </Button>
              </nav>

              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="btn-secondary p-2 rounded-xl group"
                >
                  <BookOpen className="h-4 w-4 text-foreground group-hover:text-white transition-colors" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(getRoleDashboard())}
                  className="btn-secondary p-2 rounded-xl group"
                >
                  <Home className="h-4 w-4 text-foreground group-hover:text-white transition-colors" />
                </Button>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-white/40 mx-2"></div>

              {/* User Profile */}
              <div className="glass-strong rounded-xl px-3 py-2 flex items-center gap-2 border-2 border-white/60 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {profile?.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-semibold hidden lg:inline max-w-[120px] truncate text-foreground">
                  {profile?.full_name}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="glass-strong px-3 py-2 rounded-xl hover:bg-destructive hover:text-white transition-all border-2 border-white/60 hover:border-destructive text-destructive font-medium shadow-sm group"
              >
                <LogOut className="h-4 w-4 group-hover:text-white transition-colors" />
                <span className="hidden sm:inline ml-2 text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 max-w-[98vw]">{children}</main>
    </div>
  );
};
