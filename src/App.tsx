import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
// Import your AuthProvider here if you have it, for example:
// import { AuthProvider } from "@/context/AuthContext"; 

import Index from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const fixStorageKeys = () => {
  const currentUserId = localStorage.getItem("currentUserId");
  if (currentUserId && !localStorage.getItem("userId")) {
    localStorage.setItem("userId", currentUserId);
  }
};

const App = () => {
  useEffect(() => {
    fixStorageKeys();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* If you have an AuthProvider, wrap everything inside it here: */}
        {/* <AuthProvider> */}
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        {/* </AuthProvider> */}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
