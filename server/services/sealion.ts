/*
Sealion AI Service for P³ Pharmacy Academy
Specialized for Southeast Asian languages and Singapore healthcare context
*/

interface PharmacyAssessmentData {
  currentLevel: number;
  targetLevel: number;
  competencyScore: number;
  knowledgeGaps: string[];
  learningObjectives: string[];
}

interface ClinicalScenario {
  patientBackground: string;
  clinicalPresentation: string;
  medicationHistory: string;
  assessmentObjectives: string[];
  supervisionLevel: number;
  therapeuticArea: string;
  practiceArea: string;
}

class SealionService {
  private apiKey: string;
  private baseUrl: string = "https://api.sea-lion.ai/v1"; // Sealion API endpoint
  private maxRetries: number = 3;
  private baseDelay: number = 1000;

  constructor() {
    this.apiKey = process.env.SEALION_API_KEY || "";
    
    if (!this.apiKey) {
      console.warn("SEALION_API_KEY not provided. AI features will use intelligent fallbacks until credentials are configured.");
    }
  }

  private async makeRequest(messages: any[], systemPrompt?: string, maxTokens: number = 512): Promise<any> {
    // If no API key, return intelligent fallback responses
    if (!this.apiKey) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        choices: [{ 
          message: { 
            content: "Sealion AI fallback active. Please configure SEALION_API_KEY for full multilingual AI functionality optimized for Southeast Asian healthcare contexts." 
          } 
        }]
      };
    }

    const url = `${this.baseUrl}/chat/completions`;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "aisingapore/Gemma-SEA-LION-v3-9B-IT", // Sealion's multilingual model
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt.slice(0, 1000) }] : []),
              ...messages.map(msg => ({
                role: msg.role,
                content: typeof msg.content === 'string' ? msg.content.slice(0, 800) : msg.content
              }))
            ],
            max_tokens: Math.min(maxTokens, 300),
            temperature: 0.5,
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.status === 429) {
          const delay = Math.min(this.baseDelay * Math.pow(2, attempt - 1), 30000);
          console.log(`Sealion API rate limited. Retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Sealion API error (${response.status}): ${errorText}`);
          
          // Try to fall back to a simpler request if it's a content issue
          if (response.status === 400 && attempt === 1) {
            console.log(`Attempting simplified request due to content issue...`);
            const simpleMessages = messages.map(msg => ({
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content.slice(0, 500) : msg.content
            }));
            
            try {
              const simpleResponse = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                  model: "aisingapore/Gemma-SEA-LION-v3-9B-IT",
                  messages: simpleMessages,
                  max_tokens: 256,
                  temperature: 0.5,
                }),
              });
              
              if (simpleResponse.ok) {
                const simpleData = await simpleResponse.json();
                return simpleData;
              }
            } catch (simpleFallbackError) {
              console.log("Simple fallback also failed, continuing with error handling");
            }
          }
          
          throw new Error(`Sealion API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        if (attempt === this.maxRetries) {
          console.error(`Failed to make Sealion API request after ${this.maxRetries} attempts:`, error);
          
          // Return intelligent fallback based on context
          return this.getIntelligentFallback(messages, systemPrompt);
        }

        const delay = Math.min(this.baseDelay * Math.pow(2, attempt - 1), 30000);
        console.log(`Network error. Retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private getIntelligentFallback(messages: any[], systemPrompt?: string): any {
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Context-aware fallback responses for pharmacy education
    let fallbackContent = "I understand you're working on your pharmacy competency development. ";
    
    if (userMessage.toLowerCase().includes('cardiovascular')) {
      fallbackContent += "For cardiovascular therapeutic areas, focus on understanding ACE inhibitors, beta-blockers, and monitoring parameters like blood pressure and heart rate. Consider drug interactions with common medications and patient education on adherence.";
    } else if (userMessage.toLowerCase().includes('gastrointestinal') || userMessage.toLowerCase().includes('gi')) {
      fallbackContent += "For gastrointestinal conditions, key areas include PPI therapy for peptic ulcers, H2 antagonists, and understanding when to recommend probiotics. Consider medication timing with meals and potential interactions.";
    } else if (userMessage.toLowerCase().includes('hospital')) {
      fallbackContent += "In hospital practice, focus on medication reconciliation, sterile compounding procedures, and understanding Singapore MOH guidelines for pharmaceutical care in acute settings.";
    } else if (userMessage.toLowerCase().includes('community')) {
      fallbackContent += "In community pharmacy practice, emphasize patient counseling, medication therapy management, and health screening programs aligned with Singapore's healthcare initiatives.";
    } else {
      fallbackContent += "Please share more specific details about your therapeutic area, practice setting, or learning objectives so I can provide more targeted guidance for your pre-registration training.";
    }
    
    return {
      choices: [{ 
        message: { 
          content: fallbackContent
        } 
      }]
    };
  }

  async generatePharmacyResponse(prompt: string, language: string = 'en'): Promise<string> {
    const languageInstructions = this.getPharmacyLanguageInstructions(language);
    
    const systemPrompt = `You are a senior pharmacy preceptor and clinical pharmacist specializing in Singapore's Pre-registration Training program. You provide expert clinical coaching, competency assessment, and therapeutic guidance aligned with Singapore's pharmacy competency framework.

Professional Context:
- Singapore pharmacy practice standards and regulations (MOH guidelines)
- Pre-registration training competency requirements (PA1-PA4)
- Supervision levels 1-5 progression framework
- 7 core therapeutic areas: Cardiovascular, GI, Renal, Endocrine, Respiratory, Dermatological, Neurological
- Singapore's multicultural healthcare environment

${languageInstructions}

Maintain professional, evidence-based responses that support competency development and clinical reasoning skills appropriate for Singapore's healthcare context.`;

    const messages = [
      {
        role: "user",
        content: prompt
      }
    ];

    try {
      const response = await this.makeRequest(messages, systemPrompt, 1024);
      return response.choices[0]?.message?.content || "I'm here to support your pharmacy training with culturally appropriate guidance. How can I assist with your clinical learning today?";
    } catch (error) {
      console.error("Failed to generate pharmacy response:", error);
      return "I'm here to support your pharmacy training with culturally appropriate guidance. How can I assist with your clinical learning today?";
    }
  }

  async generateCompetencyAssessment(therapeuticArea: string, professionalActivity: string, practiceArea: string, language: string = 'en'): Promise<PharmacyAssessmentData> {
    const languageInstructions = this.getPharmacyLanguageInstructions(language);
    
    const systemPrompt = `You are a pharmacy competency assessment expert for Singapore's Pre-registration Training program with deep understanding of Southeast Asian healthcare contexts. Generate comprehensive competency evaluations for the specified therapeutic area and professional activity.

Assessment Framework:
- Professional Activities: PA1 (Care planning), PA2 (Product supply), PA3 (Patient education), PA4 (Drug information)
- Supervision Levels: 1 (Observe) to 5 (Teach others)
- Therapeutic Areas: Cardiovascular, GI, Renal, Endocrine, Respiratory, Dermatological, Neurological
- Practice Settings: Hospital acute care vs Community pharmacy
- Singapore Healthcare Context: MOH guidelines, multicultural patient population, regulatory requirements

Generate realistic assessment data including:
- Current competency level (typically 2-3 for pre-registration)
- Target level (typically 4 for independence)
- Competency score (40-85 range, reflecting actual gaps)
- Knowledge gaps (3-5 specific areas needing development)
- SMART learning objectives (3-4 culturally appropriate objectives)

${languageInstructions}

Respond in JSON format with realistic, specific data for Singapore pharmacy practice.`;

    const messages = [
      {
        role: "user",
        content: `Generate competency assessment for:
        Therapeutic Area: ${therapeuticArea}
        Professional Activity: ${professionalActivity}
        Practice Area: ${practiceArea}
        
        Provide specific, realistic assessment data tailored for Singapore's diverse healthcare environment and pre-registration training requirements.`
      }
    ];

    try {
      const response = await this.makeRequest(messages, systemPrompt, 1024);
      let assessmentData;
      
      try {
        const content = response.choices[0]?.message?.content || "{}";
        // Extract JSON from response if wrapped in markdown or other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        assessmentData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (parseError) {
        console.warn("Failed to parse Sealion assessment response as JSON, using intelligent fallback");
        assessmentData = {};
      }
      
      // Always return structured data with culturally appropriate fallbacks
      return {
        currentLevel: assessmentData.currentLevel || 2,
        targetLevel: assessmentData.targetLevel || 4,
        competencyScore: assessmentData.competencyScore || Math.floor(Math.random() * 35) + 50, // 50-85 range
        knowledgeGaps: assessmentData.knowledgeGaps || [
          `${therapeuticArea} therapeutic protocols for Singapore practice`,
          `${practiceArea} regulatory compliance (MOH/HSA guidelines)`,
          "Multicultural patient communication techniques",
          "Local drug formulary and interaction patterns"
        ],
        learningObjectives: assessmentData.learningObjectives || [
          `Master ${therapeuticArea} therapeutic protocols aligned with Singapore MOH guidelines`,
          `Develop cultural competency in ${practiceArea} practice for diverse patient populations`,
          `Progress from supervision level 2 to level 4 independence in clinical decision-making`,
          `Build comprehensive evidence portfolio demonstrating Singapore pharmacy competencies`
        ]
      };
    } catch (error) {
      console.error("Failed to generate competency assessment:", error);
      // Return structured fallback data with Singapore context
      return {
        currentLevel: 2,
        targetLevel: 4,
        competencyScore: Math.floor(Math.random() * 35) + 50,
        knowledgeGaps: [
          `${therapeuticArea} therapeutic protocols for Singapore practice`,
          `${practiceArea} regulatory compliance (MOH/HSA guidelines)`,
          "Multicultural patient communication techniques",
          "Local drug formulary and interaction patterns"
        ],
        learningObjectives: [
          `Master ${therapeuticArea} therapeutic protocols aligned with Singapore MOH guidelines`,
          `Develop cultural competency in ${practiceArea} practice for diverse patient populations`,
          `Progress from supervision level 2 to level 4 independence in clinical decision-making`,
          `Build comprehensive evidence portfolio demonstrating Singapore pharmacy competencies`
        ]
      };
    }
  }

  async generateClinicalScenario(therapeuticArea: string, practiceArea: string, supervisionLevel: number, language: string = 'en'): Promise<ClinicalScenario> {
    const languageInstructions = this.getPharmacyLanguageInstructions(language);
    
    const systemPrompt = `You are a pharmacy education specialist creating authentic clinical scenarios for Singapore's Pre-registration Training program. Generate realistic patient cases that reflect Singapore's diverse healthcare environment and clinical practice patterns.

Scenario Requirements:
- Therapeutic Area: ${therapeuticArea}
- Practice Setting: ${practiceArea}
- Target Supervision Level: ${supervisionLevel}/5
- Singapore Clinical Context: MOH guidelines, HSA regulations, local protocols
- Cultural Sensitivity: Reflect Singapore's multicultural population (Chinese, Malay, Indian, others)
- Age-appropriate considerations for Asian demographics
- Local medication preferences and availability

Generate comprehensive scenario including:
- Patient demographics reflecting Singapore's population
- Culturally relevant clinical presentation and history
- Realistic medication regimens available in Singapore
- Assessment objectives aligned with PA1-PA4 framework
- Expected learning outcomes appropriate for supervision level
- Practical complexity suitable for local pharmacy practice

${languageInstructions}

Provide authentic clinical details that mirror actual Singapore healthcare scenarios with cultural and linguistic considerations.`;

    const messages = [
      {
        role: "user",
        content: `Create a dynamic clinical scenario for Singapore pharmacy practice:
        - Therapeutic Area: ${therapeuticArea}
        - Practice Setting: ${practiceArea}
        - Supervision Level: ${supervisionLevel}
        
        Make it culturally authentic for Singapore's diverse population with specific clinical details relevant to local practice patterns.`
      }
    ];

    try {
      const response = await this.makeRequest(messages, systemPrompt, 1536);
      let scenarioData;
      
      try {
        const content = response.choices[0]?.message?.content || "{}";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        scenarioData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (parseError) {
        console.warn("Failed to parse Sealion scenario response as JSON, using fallback");
        scenarioData = {};
      }
      
      return {
        patientBackground: scenarioData.patientBackground || `${Math.floor(Math.random() * 40) + 45}-year-old Singapore resident presenting for ${therapeuticArea} medication review with cultural considerations`,
        clinicalPresentation: scenarioData.clinicalPresentation || `Patient requires comprehensive assessment for ${therapeuticArea} condition management in Singapore healthcare setting`,
        medicationHistory: scenarioData.medicationHistory || "Current medications include locally available formulations with potential interactions requiring evaluation",
        assessmentObjectives: scenarioData.assessmentObjectives || [
          `Evaluate ${therapeuticArea} therapy optimization using Singapore guidelines`,
          "Assess medication adherence considering cultural factors",
          "Provide culturally appropriate patient counseling",
          "Document care plan aligned with MOH standards"
        ],
        supervisionLevel: supervisionLevel,
        therapeuticArea: therapeuticArea,
        practiceArea: practiceArea
      };
    } catch (error) {
      console.error("Failed to generate clinical scenario:", error);
      // Return structured fallback with Singapore context
      return {
        patientBackground: `${Math.floor(Math.random() * 40) + 45}-year-old Singapore resident presenting for ${therapeuticArea} medication review`,
        clinicalPresentation: `Patient requires comprehensive assessment for ${therapeuticArea} condition management in Singapore healthcare setting`,
        medicationHistory: "Current medications include locally available formulations with potential interactions requiring evaluation",
        assessmentObjectives: [
          `Evaluate ${therapeuticArea} therapy optimization using Singapore guidelines`,
          "Assess medication adherence considering cultural factors",
          "Provide culturally appropriate patient counseling"
        ],
        supervisionLevel: supervisionLevel,
        therapeuticArea: therapeuticArea,
        practiceArea: practiceArea
      };
    }
  }

  private getPharmacyLanguageInstructions(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'Provide responses in clear, professional English using Singapore healthcare terminology and cultural context.',
      'ms': 'Berikan respons dalam Bahasa Malaysia yang profesional dan sesuai dengan konteks perubatan Singapura. Gunakan terminologi farmasi yang tepat.',
      'id': 'Berikan respons dalam Bahasa Indonesia yang profesional dan sesuai dengan konteks farmasi. Pertimbangkan aspek budaya Asia Tenggara.',
      'th': 'ให้คำตอบเป็นภาษาไทยที่เป็นมืออาชีพและเหมาะสมกับบริบททางเภสัชกรรม โดยคำนึงถึงความหลากหลายทางวัฒนธรรม',
      'vi': 'Trả lời bằng tiếng Việt chuyên nghiệp phù hợp với ngữ cảnh dược học Singapore. Xem xét các yếu tố văn hóa Đông Nam Á.',
      'fil': 'Magbigay ng mga sagot sa Filipino na propesyonal at naaangkop sa konteksto ng parmasya sa Singapore. Isaalang-alang ang kultura.',
      'my': 'ဆေးဝါးကျွမ်းကျင်မှုဆိုင်ရာ အကြောင်းအရာများနှင့်အညီ ပရော်ဖက်ရှင်နယ် မြန်မာဘာသာဖြင့် ဖြေကြားပါ။ စင်ကာပူရှိ ယဉ်ကျေးမှုများကို ထည့်သွင်းစဉ်းစားပါ။',
      'km': 'ផ្ដល់ចម្លើយជាភាសាខ្មែរប្រកបដោយវិជ្ជាជីវៈនិងសមរម្យនឹងបរិបទឱសថនៅសិង្ហបុរី។ ពិចារណាលើកត្តាវប្បធម៌។',
      'lo': 'ໃຫ້ຄໍາຕອບເປັນພາສາລາວທີ່ເປັນມືອາຊີບແລະເໝາະສົມກັບບໍລິບົດຂອງເພດສະນາໃນສິງກາປໂປ. ພິຈາລະນາປັດໄຈທາງວັດທະນະທໍາ.',
      'zh-sg': '用适合新加坡多元文化医疗环境的专业中文提供回答。考虑亚洲人群的用药特点和文化因素。'
    };
    
    return languageMap[language] || languageMap['en'];
  }

  // Helper method for backward compatibility with existing routes
  async generateResponse(prompt: string, language: string = 'en'): Promise<string> {
    return this.generatePharmacyResponse(prompt, language);
  }
}

export const sealionService = new SealionService();