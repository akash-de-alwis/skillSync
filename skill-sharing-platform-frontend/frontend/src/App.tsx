import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

// Pages
import Index from "./pages/Index";
import SkillSharing from "./pages/SkillSharing";
import LearningProgress from "./pages/LearningProgress";
import LearningPlans from "./pages/LearningPlans";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login"; // New Login page
import Signup from "./components/auth/Signup"; // New Signup page
import { a } from "node_modules/framer-motion/dist/types.d-B50aGbjN";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/skill-posts/auth/check`, { withCredentials: true });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Simple loading state while checking auth
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Toaster />
            <Sonner />
            <Header />
            <main className="flex-1 pt-16">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/skill-sharing"
                    element={isAuthenticated ? <SkillSharing /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/learning-progress"
                    element={isAuthenticated ? <LearningProgress /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/learning-plans"
                    element={isAuthenticated ? <LearningPlans /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/profile"
                    element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;