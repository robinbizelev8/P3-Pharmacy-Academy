import { db } from '../db.js';
import { 
  learningResources, 
  drugSafetyAlerts,
  guidelineUpdates,
  singaporeFormulary,
  clinicalProtocols,
  InsertLearningResource 
} from '../../shared/schema.js';
import { singaporeHealthcareService } from './singapore-healthcare.js';
import { eq, and } from 'drizzle-orm';

/**
 * Resource Seeder Service
 * Automatically creates learning resources from Singapore healthcare data
 * Converts HSA alerts, MOH guidelines, and NDF entries into structured learning materials
 */
class ResourceSeederService {

  /**
   * Seed learning resources with current Singapore healthcare data
   */
  async seedAllResources(): Promise<{ created: number; updated: number; errors: string[] }> {
    console.log('Starting comprehensive resource seeding from Singapore healthcare data...');
    
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      // Sync latest data first
      await singaporeHealthcareService.syncAllSources();

      // Seed from HSA alerts
      const hsaResults = await this.seedFromHSAAlerts();
      created += hsaResults.created;
      updated += hsaResults.updated;
      errors.push(...hsaResults.errors);

      // Seed from MOH guidelines  
      const mohResults = await this.seedFromMOHGuidelines();
      created += mohResults.created;
      updated += mohResults.updated;
      errors.push(...mohResults.errors);

      // Seed from Singapore formulary
      const ndfResults = await this.seedFromNDFData();
      created += ndfResults.created;
      updated += ndfResults.updated;
      errors.push(...ndfResults.errors);

      // Seed Singapore-specific protocols
      const protocolResults = await this.seedSingaporeProtocols();
      created += protocolResults.created;
      updated += protocolResults.updated;
      errors.push(...protocolResults.errors);

      console.log(`Resource seeding completed: ${created} created, ${updated} updated, ${errors.length} errors`);

    } catch (error) {
      errors.push(`Resource seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { created, updated, errors };
  }

  /**
   * Create learning resources from HSA safety alerts
   */
  private async seedFromHSAAlerts(): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      console.log('Seeding resources from HSA safety alerts...');

      const alerts = await db
        .select()
        .from(drugSafetyAlerts)
        .where(eq(drugSafetyAlerts.isActive, true));

      for (const alert of alerts) {
        try {
          const resourceData: InsertLearningResource = {
            title: alert.title,
            description: `${alert.description}\n\nAction Required: ${alert.actionRequired || 'Review alert details'}`,
            resourceType: alert.alertType === 'product_recall' ? 'drug_recall' : 'hsa_alert',
            therapeuticArea: (alert.therapeuticAreas && alert.therapeuticAreas.length > 0) ? alert.therapeuticAreas[0] : 'general',
            practiceArea: 'hospital', // Default, will create community version if needed
            professionalActivity: this.getPAForAlert(alert.alertType),
            contentUrl: alert.sourceUrl || null,
            content: this.formatHSAAlertContent(alert),
            metadata: {
              alertId: alert.alertId,
              severity: alert.severity,
              affectedProducts: alert.affectedProducts,
              targetAudience: alert.targetAudience,
              publishedDate: alert.publishedDate,
              impactAssessment: alert.impactAssessment
            },
            difficultyLevel: this.getSeverityDifficulty(alert.severity),
            estimatedDuration: this.getAlertDuration(alert.alertType),
            isActive: true
          };

          // Check if resource already exists
          const existing = await this.findExistingResource(
            resourceData.title,
            resourceData.resourceType,
            resourceData.therapeuticArea
          );

          if (existing) {
            await this.updateLearningResource(existing.id, resourceData);
            updated++;
          } else {
            await this.createLearningResource(resourceData);
            created++;
          }

          // Create community version if applicable
          if (alert.targetAudience && (alert.targetAudience.includes('pharmacist') || alert.targetAudience.includes('consumer'))) {
            const communityResourceData = {
              ...resourceData,
              title: `${resourceData.title} (Community Practice)`,
              practiceArea: 'community',
              description: `${resourceData.description}\n\nCommunity pharmacy implications and patient counseling considerations.`
            };

            const existingCommunity = await this.findExistingResource(
              communityResourceData.title,
              communityResourceData.resourceType,
              communityResourceData.therapeuticArea
            );

            if (existingCommunity) {
              await this.updateLearningResource(existingCommunity.id, communityResourceData);
              updated++;
            } else {
              await this.createLearningResource(communityResourceData);
              created++;
            }
          }

        } catch (error) {
          errors.push(`HSA alert resource creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`HSA alerts seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { created, updated, errors };
  }

  /**
   * Create learning resources from MOH guidelines
   */
  private async seedFromMOHGuidelines(): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      console.log('Seeding resources from MOH clinical guidelines...');

      const guidelines = await db
        .select()
        .from(guidelineUpdates)
        .where(eq(guidelineUpdates.isActive, true));

      for (const guideline of guidelines) {
        try {
          const therapeuticAreas = guideline.therapeuticAreas || ['general'];
          const practiceAreas = guideline.practiceAreas || ['hospital', 'community'];
          
          for (const therapeuticArea of therapeuticAreas) {
            for (const practiceArea of practiceAreas) {
              const resourceData: InsertLearningResource = {
                title: `${guideline.title} (v${guideline.currentVersion})`,
                description: `Official MOH clinical practice guideline for ${therapeuticArea} management. ${guideline.changesSummary || 'Current evidence-based recommendations for Singapore clinical practice.'}`,
                resourceType: 'guideline',
                therapeuticArea: therapeuticArea,
                practiceArea: practiceArea,
                professionalActivity: this.getPAForGuideline(guideline.guidelineType),
                contentUrl: guideline.contentUrl || null,
                content: this.formatMOHGuidelineContent(guideline),
                metadata: {
                  version: guideline.currentVersion,
                  effectiveDate: guideline.effectiveDate,
                  expiryDate: guideline.expiryDate,
                  impactLevel: guideline.impactLevel,
                  changesSummary: guideline.changesSummary,
                  documentHash: guideline.documentHash
                },
                difficultyLevel: this.getImpactDifficulty(guideline.impactLevel),
                estimatedDuration: 45, // Standard guideline review time
                isActive: true
              };

              const existing = await this.findExistingResource(
                resourceData.title,
                resourceData.resourceType,
                resourceData.therapeuticArea
              );

              if (existing) {
                await this.updateLearningResource(existing.id, resourceData);
                updated++;
              } else {
                await this.createLearningResource(resourceData);
                created++;
              }
            }
          }

        } catch (error) {
          errors.push(`MOH guideline resource creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`MOH guidelines seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { created, updated, errors };
  }

  /**
   * Create learning resources from Singapore drug formulary
   */
  private async seedFromNDFData(): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      console.log('Seeding resources from Singapore National Drug Formulary...');

      const drugs = await db
        .select()
        .from(singaporeFormulary)
        .where(eq(singaporeFormulary.isActive, true));

      // Group drugs by therapeutic area for comprehensive resources
      const drugsByTherapeuticArea = new Map<string, any[]>();
      
      for (const drug of drugs) {
        const therapeuticAreas = drug.therapeuticAreas || ['general'];
        for (const therapeuticArea of therapeuticAreas) {
          if (!drugsByTherapeuticArea.has(therapeuticArea)) {
            drugsByTherapeuticArea.set(therapeuticArea, []);
          }
          drugsByTherapeuticArea.get(therapeuticArea)!.push(drug);
        }
      }

      // Create comprehensive therapeutic area formulary resources
      for (const [therapeuticArea, areaDrugs] of Array.from(drugsByTherapeuticArea.entries())) {
        try {
          const practiceAreas = ['hospital', 'community'];
          
          for (const practiceArea of practiceAreas) {
            const resourceData: InsertLearningResource = {
              title: `Singapore Drug Formulary - ${this.capitalizeFirst(therapeuticArea)}`,
              description: `Comprehensive drug formulary for ${therapeuticArea} therapy in Singapore. Includes indications, contraindications, interactions, monitoring parameters, and subsidy information for ${areaDrugs.length} medications.`,
              resourceType: 'formulary_update',
              therapeuticArea: therapeuticArea,
              practiceArea: practiceArea,
              professionalActivity: 'PA2', // Accurate supply of health products
              contentUrl: 'https://www.ndf.gov.sg/about-drugs/ndf-a-to-z-listing',
              content: this.formatFormularyContent(areaDrugs, practiceArea),
              metadata: {
                drugCount: areaDrugs.length,
                ndfVersion: areaDrugs[0]?.ndfVersion || '2025.1',
                lastReviewDate: new Date(),
                includedDrugs: areaDrugs.map((d: any) => ({
                  name: d.drugName,
                  class: d.therapeuticClass,
                  subsidy: d.subsidyStatus
                }))
              },
              difficultyLevel: 3, // Intermediate level for formulary knowledge
              estimatedDuration: Math.min(60, Math.max(15, areaDrugs.length * 2)), // 2 min per drug, capped
              isActive: true
            };

            const existing = await this.findExistingResource(
              resourceData.title,
              resourceData.resourceType,
              resourceData.therapeuticArea
            );

            if (existing) {
              await this.updateLearningResource(existing.id, resourceData);
              updated++;
            } else {
              await this.createLearningResource(resourceData);
              created++;
            }
          }

        } catch (error) {
          errors.push(`NDF formulary resource creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`NDF data seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { created, updated, errors };
  }

  /**
   * Create Singapore-specific clinical protocols
   */
  private async seedSingaporeProtocols(): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      console.log('Seeding Singapore-specific clinical protocols...');

      const protocols = this.getSingaporeProtocols();

      for (const protocol of protocols) {
        try {
          const resourceData: InsertLearningResource = {
            title: protocol.title,
            description: protocol.description,
            resourceType: 'singapore_protocol',
            therapeuticArea: protocol.therapeuticArea,
            practiceArea: protocol.practiceArea,
            professionalActivity: protocol.professionalActivity,
            contentUrl: protocol.sourceUrl || null,
            content: protocol.content,
            metadata: {
              protocolType: protocol.type,
              culturalConsiderations: protocol.culturalConsiderations,
              languageSupport: protocol.languageSupport,
              localAdaptations: protocol.localAdaptations
            },
            difficultyLevel: protocol.difficultyLevel,
            estimatedDuration: protocol.estimatedDuration,
            isActive: true
          };

          const existing = await this.findExistingResource(
            resourceData.title,
            resourceData.resourceType,
            resourceData.therapeuticArea
          );

          if (existing) {
            await this.updateLearningResource(existing.id, resourceData);
            updated++;
          } else {
            await this.createLearningResource(resourceData);
            created++;
          }

        } catch (error) {
          errors.push(`Singapore protocol resource creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`Singapore protocols seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { created, updated, errors };
  }

  // Helper methods

  private async findExistingResource(title: string, resourceType: string, therapeuticArea: string): Promise<any> {
    const [existing] = await db
      .select()
      .from(learningResources)
      .where(and(
        eq(learningResources.title, title),
        eq(learningResources.resourceType, resourceType),
        eq(learningResources.therapeuticArea, therapeuticArea)
      ))
      .limit(1);
    
    return existing;
  }

  private async createLearningResource(resourceData: InsertLearningResource): Promise<void> {
    await db.insert(learningResources).values(resourceData);
  }

  private async updateLearningResource(id: string, resourceData: InsertLearningResource): Promise<void> {
    await db
      .update(learningResources)
      .set({ ...resourceData, updatedAt: new Date() })
      .where(eq(learningResources.id, id));
  }

  private formatHSAAlertContent(alert: any): string {
    return `# HSA Safety Alert

## Alert Details
- **Alert ID**: ${alert.alertId}
- **Severity**: ${alert.severity.toUpperCase()}
- **Published**: ${alert.publishedDate.toDateString()}
- **Target Audience**: ${alert.targetAudience.join(', ')}

## Affected Products
${alert.affectedProducts?.length ? alert.affectedProducts.map((p: string) => `- ${p}`).join('\n') : 'See alert details'}

## Clinical Action Required
${alert.actionRequired || 'Review alert details and assess patient impact'}

## Professional Responsibilities
- Review current patients on affected medications
- Counsel patients on risks and alternatives
- Report adverse events to HSA if encountered
- Update clinical protocols as needed

## Key Learning Points
- Stay current with HSA safety communications
- Implement systematic medication safety reviews
- Maintain effective patient communication about drug safety
- Document safety-related interventions appropriately`;
  }

  private formatMOHGuidelineContent(guideline: any): string {
    return `# MOH Clinical Practice Guideline

## Guideline Information
- **Version**: ${guideline.currentVersion}
- **Effective Date**: ${guideline.effectiveDate.toDateString()}
- **Expiry Date**: ${guideline.expiryDate?.toDateString() || 'Not specified'}
- **Impact Level**: ${guideline.impactLevel}

## Recent Changes
${guideline.changesSummary || 'Current evidence-based recommendations'}

## Clinical Application
This guideline provides evidence-based recommendations for Singapore healthcare practice. Key considerations include:

- Local healthcare delivery context
- Singapore population demographics
- Healthcare system integration
- Cultural and linguistic diversity

## Professional Development
- Review guideline recommendations regularly
- Apply evidence-based practice principles
- Integrate with local clinical protocols
- Maintain competency in guideline implementation

## Implementation Notes
Guidelines should be adapted to individual patient circumstances and local practice settings while maintaining adherence to core evidence-based principles.`;
  }

  private formatFormularyContent(drugs: any[], practiceArea: string): string {
    const drugList = drugs.slice(0, 10) // Show first 10 drugs as examples
      .map(drug => `### ${drug.drugName}
- **Class**: ${drug.therapeuticClass}
- **Indications**: ${drug.indications.join(', ')}
- **Monitoring**: ${drug.monitoringParameters.join(', ')}
- **Subsidy**: ${drug.subsidyStatus}
- **Key Interactions**: ${drug.drugInteractions?.major?.join(', ') || 'None major'}`)
      .join('\n\n');

    return `# Singapore National Drug Formulary - ${practiceArea.charAt(0).toUpperCase() + practiceArea.slice(1)} Practice

## Overview
Comprehensive drug formulary covering ${drugs.length} medications for Singapore ${practiceArea} pharmacy practice.

## Key Medications

${drugList}

${drugs.length > 10 ? `\n... and ${drugs.length - 10} additional medications` : ''}

## ${practiceArea.charAt(0).toUpperCase() + practiceArea.slice(1)} Practice Considerations
- Subsidy status and patient accessibility
- Monitoring requirements in ${practiceArea} settings
- Drug interaction screening protocols
- Patient counseling priorities
- Inventory management considerations

## Professional Application
- Reference for medication selection
- Support for clinical decision-making
- Patient counseling resource
- Interaction screening guidance
- Therapeutic monitoring protocols`;
  }

  private getSingaporeProtocols(): any[] {
    return [
      {
        title: 'Multicultural Patient Communication in Singapore Pharmacy Practice',
        description: 'Protocol for effective communication with Singapore\'s diverse patient population, including cultural considerations and language support strategies.',
        type: 'communication_protocol',
        therapeuticArea: 'general',
        practiceArea: 'community',
        professionalActivity: 'PA3',
        content: this.getMulticulturalProtocolContent(),
        culturalConsiderations: ['Chinese', 'Malay', 'Indian', 'Other ethnicities'],
        languageSupport: ['English', 'Mandarin', 'Malay', 'Tamil'],
        localAdaptations: 'Singapore healthcare system integration',
        difficultyLevel: 2,
        estimatedDuration: 30,
        sourceUrl: 'https://www.healthhub.sg/'
      },
      {
        title: 'Singapore Hospital Medication Reconciliation Protocol',
        description: 'Standardized protocol for medication reconciliation in Singapore hospital settings, aligned with MOH guidelines and local practice standards.',
        type: 'clinical_protocol',
        therapeuticArea: 'general',
        practiceArea: 'hospital',
        professionalActivity: 'PA1',
        content: this.getMedRecProtocolContent(),
        culturalConsiderations: ['Family involvement in care', 'Traditional medicine use'],
        languageSupport: ['English', 'Mandarin', 'Malay', 'Tamil'],
        localAdaptations: 'Singapore public healthcare system workflow',
        difficultyLevel: 3,
        estimatedDuration: 45,
        sourceUrl: 'https://www.moh.gov.sg/'
      }
    ];
  }

  private getMulticulturalProtocolContent(): string {
    return `# Multicultural Patient Communication Protocol

## Cultural Communication Framework

### Chinese Patients
- **Family involvement**: Often family members participate in healthcare decisions
- **Traditional medicine**: May use TCM alongside Western medicine
- **Communication style**: May be indirect, respect for authority figures
- **Language**: Mandarin, Hokkien, Teochew, Cantonese dialects

### Malay Patients  
- **Religious considerations**: Islamic practices may affect medication timing
- **Family dynamics**: Extended family involvement in care decisions
- **Dietary restrictions**: Halal requirements for medications
- **Language**: Bahasa Melayu

### Indian Patients
- **Diverse backgrounds**: Tamil, Hindi, Bengali communities
- **Ayurvedic medicine**: Traditional practices alongside modern medicine
- **Vegetarian considerations**: Medication capsule composition
- **Language**: Tamil, Hindi, other regional languages

## Communication Best Practices
1. **Use professional interpreters** when language barriers exist
2. **Allow extra time** for culturally sensitive consultations
3. **Respect cultural practices** while ensuring medication safety
4. **Involve family appropriately** while respecting patient autonomy
5. **Document cultural preferences** for continuity of care

## Practical Applications
- Medication timing with religious practices
- Dietary restrictions and medication formulations
- Traditional medicine interaction screening
- Family education and involvement protocols`;
  }

  private getMedRecProtocolContent(): string {
    return `# Singapore Hospital Medication Reconciliation Protocol

## Protocol Overview
Systematic approach to medication reconciliation aligned with Singapore healthcare standards and MOH guidelines.

## Step-by-Step Process

### 1. Information Gathering
- **Patient/family interview**: Current medications, allergies, adverse reactions
- **Electronic health records**: Review hospital and primary care records
- **Community pharmacy contact**: Verify dispensing history
- **Traditional medicine assessment**: Document concurrent use

### 2. Medication Verification
- **Drug name confirmation**: Generic and brand name verification
- **Dosage and frequency**: Exact strength and administration schedule
- **Indication matching**: Therapeutic rationale for each medication
- **Duration of therapy**: Start date and planned duration

### 3. Clinical Assessment
- **Drug interaction screening**: Using Singapore formulary database
- **Therapeutic duplication**: Identify redundant therapies
- **Contraindication review**: Patient-specific factors
- **Monitoring requirements**: Laboratory and clinical parameters

### 4. Documentation and Communication
- **Standardized forms**: Use hospital medication reconciliation templates
- **Physician notification**: Communicate discrepancies promptly
- **Patient counseling**: Explain any medication changes
- **Discharge planning**: Coordinate with community pharmacy

## Singapore-Specific Considerations
- **Subsidy schemes**: Medisave, CHAS card implications
- **Polyclinic coordination**: Integration with primary care
- **Traditional medicine**: Document and assess interactions
- **Cultural sensitivity**: Language and family involvement`;
  }

  // Utility methods

  private getPAForAlert(alertType: string): string {
    switch (alertType) {
      case 'safety_alert':
      case 'adr_bulletin':
        return 'PA2'; // Accurate supply of health products
      case 'product_recall':
        return 'PA2'; // Accurate supply of health products  
      case 'regulatory_update':
        return 'PA4'; // Drug information and health product enquiry
      default:
        return 'PA2';
    }
  }

  private getPAForGuideline(guidelineType: string): string {
    switch (guidelineType) {
      case 'clinical':
        return 'PA1'; // Develop and implement care plans
      case 'therapeutic':
        return 'PA1'; // Develop and implement care plans
      case 'safety':
        return 'PA2'; // Accurate supply of health products
      case 'competency':
        return 'PA4'; // Drug information and health product enquiry
      default:
        return 'PA1';
    }
  }

  private getSeverityDifficulty(severity: string): number {
    switch (severity) {
      case 'low': return 2;
      case 'medium': return 3;
      case 'high': return 4;
      case 'urgent': return 5;
      default: return 3;
    }
  }

  private getImpactDifficulty(impactLevel: string): number {
    switch (impactLevel) {
      case 'low': return 2;
      case 'medium': return 3;
      case 'high': return 4;
      case 'critical': return 5;
      default: return 3;
    }
  }

  private getAlertDuration(alertType: string): number {
    switch (alertType) {
      case 'safety_alert': return 15;
      case 'product_recall': return 10;
      case 'adr_bulletin': return 20;
      case 'regulatory_update': return 25;
      default: return 15;
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const resourceSeederService = new ResourceSeederService();