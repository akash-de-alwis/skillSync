import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";

const Header: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/skill-posts/auth/check`, {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.status === "Authenticated");
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  const handleSignup = () => {
    // Assuming signup uses the same OAuth flow, redirect to Google OAuth
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8081/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      toast.success("Logged out successfully!");
      window.location.href = "/"; // Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const menuItems = [
    { title: "Home", path: "/" },
    { title: "Skill Sharing", path: "/skill-sharing" },
    { title: "Learning Progress", path: "/learning-progress" },
    { title: "Learning Plans", path: "/learning-plans" },
    { title: "Profile", path: "/profile" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple",
        scrolled || isMenuOpen
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-transparent"
      )}
    >
      <div className="content-container flex justify-between items-center h-16">
        <Link
          to="/"
          className="font-semibold text-xl tracking-tight transition-opacity hover:opacity-80"
        >
          SkillSync<span className="text-primary">Lab</span>
        </Link>

        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground/70"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <Link to="/profile">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogin}
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSignup}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-background z-40 flex flex-col pt-16 px-6 pb-6 transition-all duration-300 ease-apple",
            isMenuOpen ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <nav className="flex flex-col space-y-6 mt-10">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-lg font-medium transition-colors hover:text-primary flex items-center",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground/70"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleLogin}
                >
                  Log In
                </Button>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSignup}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;