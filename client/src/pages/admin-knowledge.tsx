import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin Knowledge Base Management Page
 * Allows administrators to initialize and manage Singapore healthcare knowledge sources
 */
export function AdminKnowledgePage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationResults, setInitializationResults] = useState<any>(null);
  const { toast } = useToast();

  const initializeKnowledgeBase = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/knowledge/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setInitializationResults(result.results);
        toast({
          title: "Knowledge Base Initialized",
          description: `Successfully populated ${result.results.total} knowledge entries from authentic Singapore healthcare sources.`,
        });
      } else {
        toast({
          title: "Initialization Failed",
          description: result.message || "Failed to initialize knowledge base",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      toast({
        title: "Initialization Error",
        description: "An error occurred while initializing the knowledge base",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Singapore Healthcare Knowledge Base Administration
          </h1>
          <p className="text-lg text-gray-600">
            Initialize and manage authentic Singapore healthcare knowledge sources for P³ Pharmacy Academy
          </p>
        </div>

        {/* Knowledge Base Initialization Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Knowledge Base Initialization
            </CardTitle>
            <CardDescription>
              Populate the knowledge base with authentic data from Singapore healthcare authorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Singapore Healthcare Sources</h3>
                  <p className="text-sm text-gray-600">
                    Initialize with MOH Guidelines, NDF Medications, HSA Safety Alerts, and SPC Standards
                  </p>
                </div>
                <Button 
                  onClick={initializeKnowledgeBase}
                  disabled={isInitializing}
                  data-testid="button-initialize-knowledge"
                >
                  {isInitializing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Initialize Knowledge Base
                    </>
                  )}
                </Button>
              </div>

              {initializationResults && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Initialization Complete</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {initializationResults.mohGuidelines}
                      </div>
                      <div className="text-sm text-green-600">MOH Guidelines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {initializationResults.ndfMedications}
                      </div>
                      <div className="text-sm text-blue-600">NDF Medications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-700">
                        {initializationResults.hsaAlerts}
                      </div>
                      <div className="text-sm text-orange-600">HSA Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {initializationResults.total}
                      </div>
                      <div className="text-sm text-purple-600">Total Entries</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Sources Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Singapore Healthcare Knowledge Sources</CardTitle>
            <CardDescription>
              Authentic data sources integrated into the pharmacy training platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* MOH Guidelines */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Ministry of Health Guidelines</h4>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Clinical
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Evidence-based clinical practice guidelines for diabetes, hypertension, and antimicrobial stewardship in Singapore healthcare settings.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ExternalLink className="w-3 h-3" />
                  <span>moh.gov.sg/hpp/doctors/guidelines</span>
                </div>
              </div>

              {/* NDF Medications */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">National Drug Formulary</h4>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Pharmaceutical
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Comprehensive drug monographs with Singapore-specific dosing, contraindications, pricing, and availability information.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ExternalLink className="w-3 h-3" />
                  <span>ndf.gov.sg</span>
                </div>
              </div>

              {/* HSA Safety Alerts */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">HSA Safety Alerts</h4>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Safety
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Real-time drug safety alerts, adverse reaction reports, and regulatory updates from Singapore's health authority.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ExternalLink className="w-3 h-3" />
                  <span>hsa.gov.sg/announcements/safety-alert</span>
                </div>
              </div>

              {/* SPC Standards */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Singapore Pharmacy Council Standards</h4>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    Professional
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Day-One Pharmacist Blueprint, competency frameworks, and professional practice standards for pharmacy training.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ExternalLink className="w-3 h-3" />
                  <span>spc.gov.sg</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Data Authenticity Notice</h4>
              <p className="text-sm text-blue-800">
                All knowledge sources are populated with authentic data from official Singapore healthcare authorities. 
                This ensures that AI evaluations and clinical recommendations are based on current Singapore healthcare standards and regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}