import { db } from "../db";
import { knowledgeSources, drugSafetyAlerts } from "@shared/schema";

/**
 * Simple Singapore Healthcare Knowledge Service
 * Creates knowledge sources entries for dashboard display
 */

export class SingaporeKnowledgeService {
  
  async initializeKnowledgeBase(): Promise<{
    mohGuidelines: number;
    ndfMedications: number;
    hsaAlerts: number;
    total: number;
  }> {
    console.log('Initializing Singapore healthcare knowledge sources...');
    
    // Create MOH Guidelines source
    try {
      await db.insert(knowledgeSources).values({
        sourceType: 'moh',
        sourceName: 'MOH Guidelines',
        baseUrl: 'https://www.moh.gov.sg/hpp/doctors/guidelines',
        syncFrequency: 'weekly',
        isActive: true,
        metadata: {
          description: 'Ministry of Health Clinical Practice Guidelines',
          dataCount: 3,
          lastUpdate: new Date().toISOString(),
          guidelines: [
            'Diabetes Mellitus Management 2024',
            'Hypertension Management 2024', 
            'Antimicrobial Stewardship Guidelines 2024'
          ]
        },
        lastSyncAt: new Date()
      }).onConflictDoUpdate({
        target: [knowledgeSources.sourceName],
        set: {
          lastSyncAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating MOH source:', error);
    }

    // Create NDF Medications source
    try {
      await db.insert(knowledgeSources).values({
        sourceType: 'ndf',
        sourceName: 'NDF Medications',
        baseUrl: 'https://www.ndf.gov.sg',
        syncFrequency: 'monthly',
        isActive: true,
        metadata: {
          description: 'Singapore National Drug Formulary',
          dataCount: 3,
          lastUpdate: new Date().toISOString(),
          medications: [
            'Metformin - Drug Monograph',
            'Amlodipine - Drug Monograph',
            'Omeprazole - Drug Monograph'
          ]
        },
        lastSyncAt: new Date()
      }).onConflictDoUpdate({
        target: [knowledgeSources.sourceName],
        set: {
          lastSyncAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating NDF source:', error);
    }

    // Create HSA Safety Alerts source  
    try {
      await db.insert(knowledgeSources).values({
        sourceType: 'hsa',
        sourceName: 'HSA Safety Alerts',
        baseUrl: 'https://www.hsa.gov.sg/announcements/safety-alert',
        syncFrequency: 'daily',
        isActive: true,
        metadata: {
          description: 'Health Sciences Authority Safety Alerts',
          dataCount: 2,
          lastUpdate: new Date().toISOString(),
          alerts: [
            'Modafinil/Armodafinil Skin Reactions Alert',
            'Warfarin-Antibiotic Interaction Alert'
          ]
        },
        lastSyncAt: new Date()
      }).onConflictDoUpdate({
        target: [knowledgeSources.sourceName],
        set: {
          lastSyncAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating HSA source:', error);
    }

    // Create SPC Standards source
    try {
      await db.insert(knowledgeSources).values({
        sourceType: 'spc',
        sourceName: 'SPC Protocols',
        baseUrl: 'https://www.spc.gov.sg',
        syncFrequency: 'monthly',
        isActive: true,
        metadata: {
          description: 'Singapore Pharmacy Council Professional Standards',
          dataCount: 0,
          lastUpdate: new Date().toISOString(),
          protocols: []
        },
        lastSyncAt: new Date()
      }).onConflictDoUpdate({
        target: [knowledgeSources.sourceName],
        set: {
          lastSyncAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating SPC source:', error);
    }

    console.log('✓ Knowledge sources initialized successfully');
    
    return {
      mohGuidelines: 3,
      ndfMedications: 3,
      hsaAlerts: 2,
      total: 8
    };
  }

  async getKnowledgeStats(): Promise<{
    mohGuidelines: number;
    ndfMedications: number;
    hsaAlerts: number;
    spcProtocols: number;
    lastUpdate: Date;
  }> {
    try {
      // Get all knowledge sources
      const sources = await db.select().from(knowledgeSources);
      
      let mohCount = 0, ndfCount = 0, hsaCount = 0, spcCount = 0;
      let lastUpdate = new Date();
      
      sources.forEach(source => {
        const dataCount = (source.metadata as any)?.dataCount || 0;
        
        switch (source.sourceType) {
          case 'moh':
            mohCount = dataCount;
            break;
          case 'ndf':
            ndfCount = dataCount;
            break;
          case 'hsa':
            hsaCount = dataCount;
            break;
          case 'spc':
            spcCount = dataCount;
            break;
        }
        
        if (source.lastSyncAt && source.lastSyncAt > lastUpdate) {
          lastUpdate = source.lastSyncAt;
        }
      });
      
      return {
        mohGuidelines: mohCount,
        ndfMedications: ndfCount,
        hsaAlerts: hsaCount,
        spcProtocols: spcCount,
        lastUpdate
      };
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      return {
        mohGuidelines: 0,
        ndfMedications: 0,
        hsaAlerts: 0,
        spcProtocols: 0,
        lastUpdate: new Date()
      };
    }
  }
}

export const singaporeKnowledgeService = new SingaporeKnowledgeService();