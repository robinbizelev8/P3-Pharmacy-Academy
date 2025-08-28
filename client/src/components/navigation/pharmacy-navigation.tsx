import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Stethoscope, 
  Award, 
  User,
  Menu,
  X,
  Home,
  LogOut,
  GraduationCap,
  Activity,
  Target,
  MessageCircle,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/generated_images/P3_Pharmacy_Academy_Logo_e0d57123.png";

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    color: "bg-slate-600",
    gradient: "from-slate-500 to-slate-700",
    description: "Overview"
  },
  {
    name: "Prepare",
    href: "/prepare",
    icon: BookOpen,
    color: "bg-blue-600",
    gradient: "from-blue-500 to-indigo-600",
    description: "Foundation Building"
  },
  {
    name: "Practice", 
    href: "/practice",
    icon: MessageCircle,
    color: "bg-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
    description: "Scenarios & Assessment"
  },
  {
    name: "Perform",
    href: "/perform", 
    icon: Trophy,
    color: "bg-purple-600",
    gradient: "from-purple-500 to-violet-600",
    description: "Competency Dashboard"
  }
];

export function PharmacyNavigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Redirect to login page
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-50 to-blue-50/50 backdrop-blur-md border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src={logoImage} alt="P³ Pharmacy Academy" className="w-20 h-20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div className="relative group">
                    <div className={cn(
                      "flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-300",
                      isActive
                        ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg`
                        : "hover:bg-white/70 text-gray-700 hover:text-gray-900 hover:shadow-sm"
                    )}>
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        isActive 
                          ? "bg-white/20" 
                          : "bg-white/80 group-hover:bg-white"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight">{item.name}</span>
                        <span className={cn(
                          "text-xs leading-tight",
                          isActive ? "text-white/80" : "text-gray-500"
                        )}>{item.description}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </div>
              </div>
              
              <Link href="/student/dashboard">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl" title="Student Dashboard">
                  <Activity className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/profile">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-white/70 rounded-xl">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
              
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-3 hover:bg-gray-100 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-gradient-to-b from-gray-50 to-blue-50/30 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-3 px-4 mb-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div 
                      className={cn(
                        "flex flex-col items-center p-4 rounded-2xl transition-all duration-300 relative",
                        isActive
                          ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg`
                          : "bg-white/80 text-gray-600 hover:bg-white hover:shadow-sm"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "p-3 rounded-xl mb-2",
                        isActive ? "bg-white/20" : "bg-white"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-sm text-center">{item.name}</span>
                      <span className={cn(
                        "text-xs text-center mt-1",
                        isActive ? "text-white/70" : "text-gray-500"
                      )}>{item.description}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="mx-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-white rounded-xl">
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}