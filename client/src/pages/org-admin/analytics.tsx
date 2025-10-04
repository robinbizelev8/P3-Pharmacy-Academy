import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  useOrganizationAnalytics,
  useActivityLogs,
  useUsageStatistics,
} from "@/hooks/use-org-admin-data";
import { OrgAdminNav } from "@/components/org-admin/OrgAdminNav";
import { StatsCard } from "@/components/org-admin/StatsCard";
import {
  BarChart3,
  Download,
  FileDown,
  Search,
  ArrowLeft,
  Users,
  Activity,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, string> = {
  login: "🔐",
  logout: "🚪",
  scenario_start: "▶️",
  scenario_complete: "✅",
  document_upload: "📄",
  document_view: "👁️",
  user_suspended: "⏸️",
  user_terminated: "🚫",
  user_reactivated: "✅",
  default: "📌",
};

export default function OrgAdminAnalytics() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Date range state
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Filters state
  const [search, setSearch] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [periodType, setPeriodType] = useState<string>("week");

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useOrganizationAnalytics({
    startDate: dateFrom ? dateFrom.toISOString() : undefined,
    endDate: dateTo ? dateTo.toISOString() : undefined,
  });

  const { data: activityLogs, isLoading: activityLoading } = useActivityLogs({
    activityType: activityTypeFilter !== "all" ? activityTypeFilter : undefined,
    startDate: dateFrom ? dateFrom.toISOString() : undefined,
    endDate: dateTo ? dateTo.toISOString() : undefined,
  });

  const { data: usageStats, isLoading: usageLoading } = useUsageStatistics({
    periodType,
  });

  // Redirect if not org admin
  if (user?.role !== 'org_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access analytics.
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = analytics?.metrics || {};
  const activities = activityLogs?.activityLogs || [];

  // Filter activities by search (client-side)
  const filteredActivities = search
    ? activities.filter((a: any) =>
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.userId?.toLowerCase().includes(search.toLowerCase())
      )
    : activities;

  const handleExportCSV = () => {
    try {
      const csvData = filteredActivities.map((a: any) => ({
        Type: a.activityType,
        Description: a.description,
        User: a.userId,
        Timestamp: new Date(a.createdAt || a.timestamp).toISOString(),
      }));

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: Record<string, string>) => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Activity logs exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export activity logs.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality coming soon.",
    });
  };

  const getActivityIcon = (activityType: string) => {
    return activityIcons[activityType] || activityIcons.default;
  };

  const getActivityBadge = (activityType: string) => {
    const colors: Record<string, string> = {
      login: "bg-blue-100 text-blue-800",
      logout: "bg-gray-100 text-gray-800",
      scenario_start: "bg-green-100 text-green-800",
      scenario_complete: "bg-purple-100 text-purple-800",
      document_upload: "bg-yellow-100 text-yellow-800",
      document_view: "bg-cyan-100 text-cyan-800",
      user_suspended: "bg-orange-100 text-orange-800",
      user_terminated: "bg-red-100 text-red-800",
      user_reactivated: "bg-green-100 text-green-800",
    };
    return (
      <Badge variant="outline" className={colors[activityType] || "bg-gray-100 text-gray-800"}>
        {activityType.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">P³ Pharmacy Academy</h1>
              <span className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Organization Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || 'Admin'} {user?.lastName || ''}
              </span>
              <button
                onClick={async () => {
                  const { logout } = await import('@/lib/auth-logout');
                  await logout();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-navigation */}
      <OrgAdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Monitor usage patterns and organizational performance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-gray-500">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {(dateFrom || dateTo) && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setDateFrom(undefined);
                        setDateTo(undefined);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Period</label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Sessions"
            value={analyticsLoading ? "..." : stats.totalSessions || 0}
            icon={Activity}
            description="Training sessions completed"
          />
          <StatsCard
            title="Active Users"
            value={analyticsLoading ? "..." : stats.activeUsers || 0}
            icon={Users}
            description="Currently active accounts"
          />
          <StatsCard
            title="Avg Competency"
            value={analyticsLoading ? "..." : `${stats.averageCompetencyScore || 0}%`}
            icon={TrendingUp}
            description="Across all assessments"
          />
          <StatsCard
            title="Total Documents"
            value={analyticsLoading ? "..." : stats.totalDocuments || 0}
            icon={BarChart3}
            description="In knowledge base"
          />
        </div>

        {/* Usage Statistics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Session Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Loading chart data...
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Engagement chart visualization</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {usageStats?.statistics?.length || 0} data points available
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module Completion Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Module Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Loading chart data...
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Module completion chart</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Prepare • Practice • Perform
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity Types</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="scenario_start">Scenario Start</SelectItem>
                  <SelectItem value="scenario_complete">Scenario Complete</SelectItem>
                  <SelectItem value="document_upload">Document Upload</SelectItem>
                  <SelectItem value="document_view">Document View</SelectItem>
                  <SelectItem value="user_suspended">User Suspended</SelectItem>
                  <SelectItem value="user_terminated">User Terminated</SelectItem>
                  <SelectItem value="user_reactivated">User Reactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Table */}
            {activityLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading activities...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No activity logs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Activity Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.slice(0, 50).map((activity: any, index: number) => (
                      <TableRow key={activity.id || index}>
                        <TableCell>
                          <span className="text-xl">{getActivityIcon(activity.activityType)}</span>
                        </TableCell>
                        <TableCell>{getActivityBadge(activity.activityType)}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {activity.description || `${activity.activityType} activity`}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {activity.userId || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {activity.createdAt || activity.timestamp
                            ? formatDistanceToNow(new Date(activity.createdAt || activity.timestamp), {
                                addSuffix: true,
                              })
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredActivities.length > 50 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Showing 50 of {filteredActivities.length} activities. Use export for full data.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
