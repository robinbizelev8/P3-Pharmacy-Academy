import { db } from "./db";
import { pharmacyScenarios, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Pharmacy training seed data
const seedScenarios = [
  {
    title: "Hypertension Management in Community Pharmacy",
    module: "practice",
    therapeuticArea: "cardiovascular", 
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA2",
    supervisionLevel: 3,
    patientAge: 58,
    patientGender: "male",
    patientBackground: "Mr. Tan is a 58-year-old taxi driver with recently diagnosed hypertension. He has concerns about medication side effects affecting his driving ability.",
    clinicalPresentation: "Blood pressure readings consistently above 160/95 mmHg. Patient reports headaches and dizziness. Current medication: Amlodipine 5mg daily started 2 weeks ago.",
    medicationHistory: "Previously on traditional Chinese medicine for general health. No known drug allergies. Occasional paracetamol for headaches.",
    assessmentObjectives: "Assess patient understanding of hypertension, evaluate medication adherence, address concerns about side effects, provide lifestyle counseling.",
    keyLearningOutcomes: ["Medication counseling for antihypertensives", "Blood pressure monitoring techniques", "Lifestyle modification advice", "Drug interaction screening"],
    difficulty: "intermediate",
    status: "active"
  },
  {
    title: "Diabetes Type 2 Medication Review",
    module: "practice",
    therapeuticArea: "endocrine",
    practiceArea: "hospital", 
    caseType: "complex",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 42,
    patientGender: "female",
    patientBackground: "Ms. Lim is a 42-year-old office worker with Type 2 diabetes for 5 years. She's been experiencing frequent hypoglycemic episodes.",
    clinicalPresentation: "HbA1c 8.2%, frequent blood glucose readings below 4.0 mmol/L. Currently on metformin 1g BD and gliclazide 80mg BD.",
    medicationHistory: "Started on metformin 3 years ago, gliclazide added 6 months ago. Takes multivitamins and fish oil supplements.",
    assessmentObjectives: "Review current diabetes management, assess hypoglycemia risk, optimize medication regimen, provide blood glucose monitoring education.",
    keyLearningOutcomes: ["Diabetes medication optimization", "Hypoglycemia management", "Blood glucose monitoring", "Patient counseling techniques"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Asthma Inhaler Technique Assessment",
    module: "prepare",
    therapeuticArea: "respiratory",
    practiceArea: "community",
    caseType: "acute", 
    professionalActivity: "PA1",
    supervisionLevel: 4,
    patientAge: 25,
    patientGender: "male",
    patientBackground: "Mr. Wong is a 25-year-old student with mild persistent asthma. He's been experiencing worsening symptoms despite medication.",
    clinicalPresentation: "Increased use of salbutamol inhaler (>3 times/week), night-time symptoms 2-3 times/week. Using Symbicort 160/4.5 one puff BD.",
    medicationHistory: "Diagnosed with asthma 2 years ago. Previously well-controlled on current regimen until recent month.",
    assessmentObjectives: "Assess inhaler technique, evaluate asthma control, identify potential triggers, provide device training.",
    keyLearningOutcomes: ["Inhaler technique assessment", "Asthma control evaluation", "Patient education techniques", "Device selection"],
    difficulty: "foundation",
    status: "active"
  }
];

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Check if scenarios already exist
    const existingScenarios = await db.select().from(pharmacyScenarios);
    
    if (existingScenarios.length === 0) {
      // Insert seed scenarios
      for (const scenario of seedScenarios) {
        await db.insert(pharmacyScenarios).values(scenario);
      }
      console.log(`Inserted ${seedScenarios.length} pharmacy training scenarios`);
    } else {
      console.log(`Database already contains ${existingScenarios.length} scenarios, skipping seeding`);
    }
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export default seedDatabase;