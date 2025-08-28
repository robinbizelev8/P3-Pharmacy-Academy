import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Shield,
  Activity,
  Database,
  FileText,
  ExternalLink,
  Loader2
} from "lucide-react";
import { 
  useKnowledgeStatus, 
  formatTimeSinceUpdate, 
  getFreshnessColor, 
  getStatusDotColor, 
  formatNumber,
  type KnowledgeSourceStatus
} from "@/hooks/use-knowledge-status";

/**
 * Knowledge Sources Section Component
 * Displays real-time status of Singapore healthcare data sources
 * Shows transparency and credibility of the platform's knowledge base
 */
export function KnowledgeSourcesSection() {
  const { data, loading, error, refresh, lastFetched } = useKnowledgeStatus();

  if (loading && !data) {
    return (
      <div className="mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Evidence-Based Knowledge Sources
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real-time integration with official Singapore healthcare authorities ensures our training scenarios reflect current standards and safety requirements.
          </p>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading knowledge source status...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Evidence-Based Knowledge Sources
          </h2>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Unable to load knowledge source status. Please try again later.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="ml-3"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // Get icon for source type
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'hsa':
        return <Shield className="w-6 h-6" />;
      case 'moh':
        return <FileText className="w-6 h-6" />;
      case 'ndf':
        return <Database className="w-6 h-6" />;
      case 'spc':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  // Get display name for source
  const getSourceDisplayInfo = (source: KnowledgeSourceStatus) => {
    switch (source.sourceType) {
      case 'hsa':
        return {
          name: 'Health Sciences Authority',
          description: 'Drug safety alerts & product recalls',
          url: 'https://www.hsa.gov.sg',
          dataLabel: 'Active alerts'
        };
      case 'moh':
        return {
          name: 'Ministry of Health',
          description: 'Clinical practice guidelines',
          url: 'https://www.moh.gov.sg',
          dataLabel: 'Current guidelines'
        };
      case 'ndf':
        return {
          name: 'National Drug Formulary',
          description: 'Medication database & interactions',
          url: 'https://www.ndf.gov.sg',
          dataLabel: 'Medications'
        };
      case 'spc':
        return {
          name: 'Singapore Pharmacy Council',
          description: 'Professional standards & competencies',
          url: 'https://www.spc.gov.sg',
          dataLabel: 'Protocols'
        };
      default:
        return {
          name: source.sourceName,
          description: 'Healthcare information',
          url: '#',
          dataLabel: 'Items'
        };
    }
  };

  const getOverallStatusColor = () => {
    switch (data.overallFreshness) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-yellow-600';
      case 'needs_update':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getOverallStatusDot = () => {
    switch (data.overallFreshness) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-yellow-500';
      case 'needs_update':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="mb-20">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Evidence-Based Knowledge Sources
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Real-time integration with official Singapore healthcare authorities ensures our training scenarios reflect current standards and safety requirements.
        </p>
        
        {/* Overall Status */}
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getOverallStatusDot()}`}></div>
            <span className={`font-medium ${getOverallStatusColor()}`}>
              System Status: {data.overallFreshness === 'excellent' ? 'Excellent' : 
                            data.overallFreshness === 'good' ? 'Good' : 'Needs Update'}
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            {formatNumber(data.totalDataPoints)} total data points
          </div>
          <div className="text-gray-500 text-sm">
            Last updated: {formatTimeSinceUpdate(data.lastGlobalUpdate)}
          </div>
        </div>
        
        {/* Refresh Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
          disabled={loading}
          className="mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </>
          )}
        </Button>
      </div>

      {/* Knowledge Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data.sources
          .filter(source => source.isActive)
          .map((source) => {
            const displayInfo = getSourceDisplayInfo(source);
            const Icon = () => getSourceIcon(source.sourceType);
            
            return (
              <Card 
                key={source.id} 
                className="relative overflow-hidden hover:shadow-lg transition-shadow border-gray-200 bg-white"
              >
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  source.freshness === 'fresh' ? 'bg-green-500' :
                  source.freshness === 'stale' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        source.freshness === 'fresh' ? 'bg-green-100 text-green-600' :
                        source.freshness === 'stale' ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-red-100 text-red-600'
                      }`}>
                        <Icon />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold text-gray-900 leading-tight">
                          {displayInfo.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-600 mt-1">
                          {displayInfo.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusDotColor(source.freshness)}`}></div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Data count */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{displayInfo.dataLabel}:</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(source.dataCount)}
                      </span>
                    </div>
                    
                    {/* Last update */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Updated {formatTimeSinceUpdate(source.lastSyncAt)}</span>
                    </div>
                    
                    {/* Sync frequency */}
                    <div className="flex items-center justify-between text-xs">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {source.syncFrequency} sync
                      </Badge>
                      <span className="text-gray-500">
                        Next: {source.nextUpdateEstimate}
                      </span>
                    </div>
                    
                    {/* Source link */}
                    <a 
                      href={displayInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>View official source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {data.summary.activeAlerts}
            </div>
            <div className="text-sm text-gray-600">Active Safety Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {data.summary.currentGuidelines}
            </div>
            <div className="text-sm text-gray-600">Clinical Guidelines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatNumber(data.summary.formularyDrugs)}
            </div>
            <div className="text-sm text-gray-600">Formulary Medications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {data.summary.clinicalProtocols}
            </div>
            <div className="text-sm text-gray-600">Clinical Protocols</div>
          </div>
        </div>
        
        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Evidence-Based Training:</strong> All scenarios are generated using current Singapore healthcare data.
            {lastFetched && (
              <span className="ml-2 text-gray-500">
                Last verified: {formatTimeSinceUpdate(lastFetched)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}