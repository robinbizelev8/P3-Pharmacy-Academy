import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Practice from "@/pages/practice";
import Prepare from "@/pages/prepare";
import Perform from "@/pages/perform";
import { AdminKnowledgePage } from "@/pages/admin-knowledge";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import SupervisorDashboard from "@/pages/supervisor/dashboard";
import Profile from "@/pages/profile";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import AssessmentReportPage from "@/pages/assessment-report";

import { useAuth } from "@/hooks/use-auth";
import { PharmacyNavigation } from "@/components/navigation/pharmacy-navigation";

function Router() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      {user && <PharmacyNavigation />}
      <main className={user ? "pt-20" : ""}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/student/dashboard" component={StudentDashboard} />
          <Route path="/supervisor/dashboard" component={SupervisorDashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/prepare" component={Prepare} />
          <Route path="/practice" component={Practice} />
          <Route path="/practice/*" component={Practice} />
          <Route path="/perform" component={Perform} />
          <Route path="/perform/assessment-report/:assessmentId" component={AssessmentReportPage} />
          <Route path="/admin/knowledge" component={AdminKnowledgePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;