import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Legacy interview components removed
import { 
  ClipboardList, 
  Play, 
  Users, 
  TrendingUp, 
  Plus, 
  Search,
  ArrowLeft 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("");

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => setLocation("/practice")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">P³ Interview Academy</h1>
              <span className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || 'Admin'}
              </span>
              <a
                href="/api/logout"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Log out
              </a>
            </div>
          </div>
        </div>
      </header>

      <AdminOverview 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        setLocation={setLocation}
      />
    </div>
  );
}

interface AdminOverviewProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stageFilter: string;
  setStageFilter: (stage: string) => void;
  setLocation: (path: string) => void;
}

function AdminOverview({ 
  searchTerm, 
  setSearchTerm, 
  stageFilter, 
  setStageFilter, 
  setLocation 
}: AdminOverviewProps) {
  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ["/api/practice/scenarios"],
    queryFn: () => fetch("/api/practice/scenarios").then(res => res.ok ? res.json() : []).catch(() => [])
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/practice/sessions"],
    queryFn: () => fetch("/api/practice/sessions").then(res => res.ok ? res.json() : []).catch(() => [])
  });

  // Calculate stats
  const totalScenarios = scenarios?.length || 0;
  const activeSessions = sessions?.filter(s => s.status === 'in_progress').length || 0;
  const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
  
  const averageRating = completedSessions > 0 
    ? sessions
        ?.filter(s => s.status === 'completed' && s.overallScore)
        ?.reduce((sum, s) => sum + parseFloat(s.overallScore || '0'), 0) / completedSessions
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Scenario Management</h2>
            <p className="text-gray-600">Create and manage interview practice scenarios</p>
          </div>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create New Scenario (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScenarios}</div>
            <p className="text-xs text-muted-foreground">
              Active interview scenarios
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              Total completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {averageRating > 0 ? 'Out of 5.0 stars' : 'No ratings yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interview Scenarios</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search scenarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stages</SelectItem>
                  <SelectItem value="phone-screening">Phone/Initial Screening</SelectItem>
                  <SelectItem value="functional-team">Functional/Team</SelectItem>
                  <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                  <SelectItem value="subject-matter">Subject-Matter Expertise</SelectItem>
                  <SelectItem value="executive-final">Executive/Final Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* ScenarioTable temporarily disabled for type fixes */}
          <div className="text-center text-gray-500">
            <p>Scenario management is being updated for the new pharmacy training system.</p>
            <p className="text-sm mt-2">Check back soon for scenario creation and management features.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
