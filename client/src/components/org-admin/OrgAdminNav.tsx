import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  FlaskConical,
  BarChart3,
  Database
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/org-admin/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "User Management",
    href: "/org-admin/users",
    icon: Users
  },
  {
    label: "Documents",
    href: "/org-admin/documents",
    icon: FileText
  },
  {
    label: "Scenarios",
    href: "/org-admin/scenarios",
    icon: FlaskConical
  },
  {
    label: "Analytics",
    href: "/org-admin/analytics",
    icon: BarChart3
  },
  {
    label: "Knowledge Base",
    href: "/org-admin/knowledge",
    icon: Database
  }
];

export function OrgAdminNav() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
