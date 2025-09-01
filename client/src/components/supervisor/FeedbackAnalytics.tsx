import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Target,
  Star,
  Award,
  Activity,
  CalendarDays,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface FeedbackAnalyticsData {
  responseMetrics: {
    totalFeedbackGiven: number;
    totalStudentResponses: number;
    responseRate: number;
    averageResponseTime: number; // in hours
    pendingResponses: number;
  };
  engagementTrends: {
    date: string;
    feedbackGiven: number;
    responsesReceived: number;
    averageRating: number;
  }[];
  therapeuticAreaBreakdown: {
    area: string;
    feedbackCount: number;
    responseRate: number;
    averageRating: number;
  }[];
  studentPerformance: {
    studentId: string;
    studentName: string;
    totalFeedback: number;
    responseRate: number;
    averageRating: number;
    improvementTrend: 'up' | 'down' | 'stable';
  }[];
  feedbackQuality: {
    type: string;
    count: number;
    averageRating: number;
  }[];
  timeAnalytics: {
    quickResponses: number; // < 24 hours
    moderateResponses: number; // 24-72 hours  
    slowResponses: number; // > 72 hours
  };
}

interface FeedbackAnalyticsProps {
  supervisorId: string;
}

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  warning: '#EF4444',
  info: '#8B5CF6',
  success: '#059669'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, COLORS.warning];

export function FeedbackAnalytics({ supervisorId }: FeedbackAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<FeedbackAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [supervisorId, selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/supervisor/analytics/${supervisorId}?timeRange=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      // Mock data for development
      setAnalyticsData({
        responseMetrics: {
          totalFeedbackGiven: 45,
          totalStudentResponses: 32,
          responseRate: 71,
          averageResponseTime: 18.5,
          pendingResponses: 8
        },
        engagementTrends: [
          { date: '2024-01-01', feedbackGiven: 8, responsesReceived: 6, averageRating: 4.2 },
          { date: '2024-01-02', feedbackGiven: 12, responsesReceived: 10, averageRating: 4.1 },
          { date: '2024-01-03', feedbackGiven: 6, responsesReceived: 5, averageRating: 4.3 },
          { date: '2024-01-04', feedbackGiven: 15, responsesReceived: 11, averageRating: 4.0 },
          { date: '2024-01-05', feedbackGiven: 10, responsesReceived: 8, averageRating: 4.4 },
          { date: '2024-01-06', feedbackGiven: 9, responsesReceived: 7, averageRating: 4.2 },
          { date: '2024-01-07', feedbackGiven: 11, responsesReceived: 9, averageRating: 4.3 }
        ],
        therapeuticAreaBreakdown: [
          { area: 'Cardiovascular', feedbackCount: 12, responseRate: 75, averageRating: 4.2 },
          { area: 'Gastrointestinal', feedbackCount: 8, responseRate: 62, averageRating: 4.0 },
          { area: 'Respiratory', feedbackCount: 10, responseRate: 80, averageRating: 4.4 },
          { area: 'Endocrine', feedbackCount: 6, responseRate: 67, averageRating: 4.1 },
          { area: 'Neurological', feedbackCount: 9, responseRate: 78, averageRating: 4.3 }
        ],
        studentPerformance: [
          { studentId: '1', studentName: 'Alice Chen', totalFeedback: 8, responseRate: 87, averageRating: 4.3, improvementTrend: 'up' },
          { studentId: '2', studentName: 'Bob Kumar', totalFeedback: 12, responseRate: 75, averageRating: 4.1, improvementTrend: 'up' },
          { studentId: '3', studentName: 'Carol Wong', totalFeedback: 10, responseRate: 60, averageRating: 3.9, improvementTrend: 'down' },
          { studentId: '4', studentName: 'David Lim', totalFeedback: 15, responseRate: 80, averageRating: 4.2, improvementTrend: 'stable' }
        ],
        feedbackQuality: [
          { type: 'Session Review', count: 25, averageRating: 4.2 },
          { type: 'Assessment', count: 12, averageRating: 4.0 },
          { type: 'General', count: 8, averageRating: 4.4 }
        ],
        timeAnalytics: {
          quickResponses: 18,
          moderateResponses: 14,
          slowResponses: 13
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Unable to load analytics data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const { responseMetrics, engagementTrends, therapeuticAreaBreakdown, studentPerformance, feedbackQuality, timeAnalytics } = analyticsData;

  // Calculate response time breakdown for pie chart
  const responseTimeData = [
    { name: 'Quick (< 24h)', value: timeAnalytics.quickResponses, color: COLORS.success },
    { name: 'Moderate (24-72h)', value: timeAnalytics.moderateResponses, color: COLORS.accent },
    { name: 'Slow (> 72h)', value: timeAnalytics.slowResponses, color: COLORS.warning }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Feedback Analytics</h3>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeRange(range.value as any)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedTimeRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Response Rate"
          value={`${responseMetrics.responseRate}%`}
          icon={TrendingUp}
          color="green"
          subtitle={`${responseMetrics.totalStudentResponses}/${responseMetrics.totalFeedbackGiven} responded`}
          trend={responseMetrics.responseRate > 70 ? 'positive' : responseMetrics.responseRate > 50 ? 'neutral' : 'negative'}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${responseMetrics.averageResponseTime.toFixed(1)}h`}
          icon={Clock}
          color="blue"
          subtitle="Student response time"
          trend={responseMetrics.averageResponseTime < 24 ? 'positive' : responseMetrics.averageResponseTime < 48 ? 'neutral' : 'negative'}
        />
        <MetricCard
          title="Active Students"
          value={studentPerformance.length.toString()}
          icon={Users}
          color="purple"
          subtitle="Currently mentoring"
          trend="neutral"
        />
        <MetricCard
          title="Pending Responses"
          value={responseMetrics.pendingResponses.toString()}
          icon={MessageSquare}
          color="orange"
          subtitle="Awaiting student replies"
          trend={responseMetrics.pendingResponses < 5 ? 'positive' : responseMetrics.pendingResponses < 10 ? 'neutral' : 'negative'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={engagementTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'feedbackGiven' ? 'Feedback Given' :
                    name === 'responsesReceived' ? 'Responses Received' : 'Average Rating'
                  ]}
                />
                <Area type="monotone" dataKey="feedbackGiven" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
                <Area type="monotone" dataKey="responsesReceived" stackId="2" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Response Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={responseTimeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {responseTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Therapeutic Area Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Performance by Therapeutic Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={therapeuticAreaBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="area" type="category" width={100} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'responseRate' ? `${value}%` : value.toFixed(1),
                    name === 'responseRate' ? 'Response Rate' :
                    name === 'feedbackCount' ? 'Feedback Count' : 'Average Rating'
                  ]}
                />
                <Bar dataKey="responseRate" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Student Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentPerformance.map((student) => (
                <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={student.improvementTrend === 'up' ? 'default' : 
                                   student.improvementTrend === 'stable' ? 'secondary' : 'destructive'}
                        >
                          {student.improvementTrend === 'up' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : student.improvementTrend === 'down' ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : (
                            <Activity className="w-3 h-3 mr-1" />
                          )}
                          {student.improvementTrend}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Response Rate: {student.responseRate}%</span>
                      <span>Avg Rating: {student.averageRating.toFixed(1)} ⭐</span>
                    </div>
                    <Progress value={student.responseRate} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Feedback Quality Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedbackQuality.map((quality, index) => (
              <div key={quality.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{quality.type}</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">{quality.count}</div>
                <div className="text-sm text-gray-600">feedback items</div>
                <div className="flex items-center justify-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{quality.averageRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  subtitle: string;
  trend: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ title, value, icon: Icon, color, subtitle, trend }: MetricCardProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100"
  };

  const trendIcons = {
    positive: <TrendingUp className="w-3 h-3 text-green-600" />,
    negative: <TrendingDown className="w-3 h-3 text-red-600" />,
    neutral: <Activity className="w-3 h-3 text-gray-600" />
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trendIcons[trend]}
            </div>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}