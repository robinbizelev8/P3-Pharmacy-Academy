import { useState, useEffect, useCallback } from 'react';

// Types matching the backend implementation
export interface KnowledgeSourceStatus {
  id: string;
  sourceType: string;
  sourceName: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  syncFrequency: string;
  dataCount: number;
  freshness: 'fresh' | 'stale' | 'outdated';
  lastUpdateHours: number;
  nextUpdateEstimate: string;
}

export interface KnowledgeSourcesStatus {
  sources: KnowledgeSourceStatus[];
  totalDataPoints: number;
  lastGlobalUpdate: Date;
  overallFreshness: 'excellent' | 'good' | 'needs_update';
  summary: {
    activeAlerts: number;
    currentGuidelines: number;
    formularyDrugs: number;
    clinicalProtocols: number;
  };
}

interface UseKnowledgeStatusResult {
  data: KnowledgeSourcesStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastFetched: Date | null;
}

/**
 * Hook for fetching and managing Singapore healthcare knowledge sources status
 * Provides real-time updates on HSA, MOH, NDF and other official sources
 */
export function useKnowledgeStatus(): UseKnowledgeStatusResult {
  const [data, setData] = useState<KnowledgeSourcesStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchKnowledgeStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/knowledge/sources-status');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge status: ${response.status} ${response.statusText}`);
      }

      const statusData = await response.json();
      
      // Convert date strings back to Date objects
      const processedData: KnowledgeSourcesStatus = {
        ...statusData,
        lastGlobalUpdate: new Date(statusData.lastGlobalUpdate),
        sources: statusData.sources.map((source: any) => ({
          ...source,
          lastSyncAt: source.lastSyncAt ? new Date(source.lastSyncAt) : null
        }))
      };

      setData(processedData);
      setLastFetched(new Date());
      
    } catch (err) {
      console.error('Error fetching knowledge status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch knowledge status');
      
      // Provide fallback data for demonstration purposes
      setData({
        sources: [
          {
            id: 'demo-hsa',
            sourceType: 'hsa',
            sourceName: 'Health Sciences Authority',
            isActive: true,
            lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            syncFrequency: 'daily',
            dataCount: 3,
            freshness: 'fresh' as const,
            lastUpdateHours: 2,
            nextUpdateEstimate: '22 hours'
          },
          {
            id: 'demo-moh',
            sourceType: 'moh',
            sourceName: 'Ministry of Health',
            isActive: true,
            lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            syncFrequency: 'weekly',
            dataCount: 5,
            freshness: 'fresh' as const,
            lastUpdateHours: 24,
            nextUpdateEstimate: 'Within 7 days'
          },
          {
            id: 'demo-ndf',
            sourceType: 'ndf',
            sourceName: 'National Drug Formulary',
            isActive: true,
            lastSyncAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            syncFrequency: 'monthly',
            dataCount: 1247,
            freshness: 'fresh' as const,
            lastUpdateHours: 6,
            nextUpdateEstimate: 'Within 30 days'
          },
          {
            id: 'demo-spc',
            sourceType: 'spc',
            sourceName: 'Singapore Pharmacy Council',
            isActive: true,
            lastSyncAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
            syncFrequency: 'monthly',
            dataCount: 12,
            freshness: 'fresh' as const,
            lastUpdateHours: 72,
            nextUpdateEstimate: 'Within 30 days'
          }
        ],
        totalDataPoints: 1267,
        lastGlobalUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        overallFreshness: 'excellent' as const,
        summary: {
          activeAlerts: 3,
          currentGuidelines: 5,
          formularyDrugs: 1247,
          clinicalProtocols: 12
        }
      });
      
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchKnowledgeStatus();
  }, [fetchKnowledgeStatus]);

  // Initial fetch on mount
  useEffect(() => {
    fetchKnowledgeStatus();
  }, [fetchKnowledgeStatus]);

  // Auto-refresh every 5 minutes to keep data current
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) { // Only refresh if not currently loading
        fetchKnowledgeStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchKnowledgeStatus, loading]);

  return {
    data,
    loading,
    error,
    refresh,
    lastFetched
  };
}

/**
 * Helper function to format the time since last update
 */
export function formatTimeSinceUpdate(date: Date | null): string {
  if (!date) return 'Never updated';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just updated';
  }
}

/**
 * Helper function to get the appropriate icon for each source type
 */
export function getSourceIcon(sourceType: string): string {
  switch (sourceType) {
    case 'hsa':
      return '🏥'; // Hospital/Healthcare
    case 'moh':
      return '🏛️'; // Government building
    case 'ndf':
      return '💊'; // Pill
    case 'spc':
      return '🎓'; // Graduation cap for education/standards
    default:
      return '📋'; // Clipboard for general documentation
  }
}

/**
 * Helper function to get status color based on freshness
 */
export function getFreshnessColor(freshness: 'fresh' | 'stale' | 'outdated'): string {
  switch (freshness) {
    case 'fresh':
      return 'text-green-600';
    case 'stale':
      return 'text-yellow-600';
    case 'outdated':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Helper function to get status dot color based on freshness
 */
export function getStatusDotColor(freshness: 'fresh' | 'stale' | 'outdated'): string {
  switch (freshness) {
    case 'fresh':
      return 'bg-green-500';
    case 'stale':
      return 'bg-yellow-500';
    case 'outdated':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Helper function to format large numbers
 */
export function formatNumber(num: number | undefined | null): string {
  if (!num || typeof num !== 'number') {
    return '0';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}