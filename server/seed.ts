import { db } from "./db";
import { pharmacyScenarios, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Pharmacy training seed data - 3 scenarios per therapeutic area
const seedScenarios = [
  // CARDIOVASCULAR (3 scenarios)
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
    title: "Acute Myocardial Infarction Hospital Discharge",
    module: "practice",
    therapeuticArea: "cardiovascular",
    practiceArea: "hospital",
    caseType: "acute",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 65,
    patientGender: "female",
    patientBackground: "Mrs. Chen, 65, post-STEMI with PCI. Being discharged on dual antiplatelet therapy. Lives alone and concerned about medication complexity.",
    clinicalPresentation: "Day 3 post-MI, stable. Prescribed aspirin 100mg, clopidogrel 75mg, atorvastatin 80mg, metoprolol 50mg BD, ramipril 5mg daily.",
    medicationHistory: "Previously on occasional paracetamol only. No known allergies. Family history of heart disease.",
    assessmentObjectives: "Ensure understanding of dual antiplatelet therapy, assess bleeding risk awareness, provide discharge counseling, arrange follow-up.",
    keyLearningOutcomes: ["Post-MI medication management", "Dual antiplatelet therapy counseling", "Bleeding risk assessment", "Cardiac rehabilitation education"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Heart Failure Medication Optimization",
    module: "practice",
    therapeuticArea: "cardiovascular",
    practiceArea: "community",
    caseType: "complex",
    professionalActivity: "PA4",
    supervisionLevel: 1,
    patientAge: 72,
    patientGender: "male",
    patientBackground: "Mr. Kumar, 72, with NYHA Class II heart failure. Multiple comorbidities including diabetes and CKD stage 3.",
    clinicalPresentation: "Worsening breathlessness, ankle edema. Current: furosemide 40mg, ramipril 2.5mg, bisoprolol 2.5mg, spironolactone 25mg.",
    medicationHistory: "Heart failure for 3 years. Also on metformin 500mg BD, insulin glargine 20 units nocte. Creatinine 180 μmol/L.",
    assessmentObjectives: "Optimize heart failure medications, assess renal function impact, evaluate fluid status, coordinate with GP for dose adjustments.",
    keyLearningOutcomes: ["Heart failure pharmacotherapy", "Renal function monitoring", "Drug interactions in complex patients", "Interprofessional collaboration"],
    difficulty: "advanced",
    status: "active"
  },

  // RESPIRATORY (3 scenarios)
  {
    title: "Asthma Inhaler Technique Assessment",
    module: "practice",
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
  },
  {
    title: "COPD Exacerbation Management",
    module: "practice",
    therapeuticArea: "respiratory",
    practiceArea: "hospital",
    caseType: "acute",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 68,
    patientGender: "male",
    patientBackground: "Mr. Raj, 68-year-old ex-smoker with severe COPD, admitted with exacerbation. Wife concerned about medication changes.",
    clinicalPresentation: "Increased dyspnea, purulent sputum, fever. Started on prednisolone 30mg daily, augmentin 625mg TDS, nebulized bronchodilators.",
    medicationHistory: "Regular: tiotropium 18mcg daily, symbicort 160/4.5 2 puffs BD. Recent antibiotic course completed 3 weeks ago.",
    assessmentObjectives: "Review exacerbation treatment, assess antibiotic appropriateness, plan step-down therapy, provide discharge education.",
    keyLearningOutcomes: ["COPD exacerbation management", "Steroid tapering protocols", "Antibiotic stewardship", "Inhaler optimization"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Cystic Fibrosis Enzyme Replacement",
    module: "practice",
    therapeuticArea: "respiratory",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA4",
    supervisionLevel: 1,
    patientAge: 16,
    patientGender: "female",
    patientBackground: "Sarah, 16, with cystic fibrosis. Transitioning to adult care. Complex medication regimen affecting school attendance.",
    clinicalPresentation: "Poor weight gain, steatorrhea, frequent chest infections. On creon, vitamins, dornase alfa, azithromycin prophylaxis.",
    medicationHistory: "Multiple hospitalizations. Currently: creon 25000 with meals, dornase alfa 2.5mg daily, azithromycin 250mg 3x/week, multivitamins.",
    assessmentObjectives: "Optimize enzyme replacement therapy, assess vitamin levels, improve adherence strategies, support transition to adult services.",
    keyLearningOutcomes: ["Cystic fibrosis management", "Enzyme replacement optimization", "Adolescent adherence support", "Transition planning"],
    difficulty: "advanced",
    status: "active"
  },

  // ENDOCRINE (3 scenarios)
  {
    title: "Type 1 Diabetes Insulin Adjustment",
    module: "practice",
    therapeuticArea: "endocrine",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA2",
    supervisionLevel: 3,
    patientAge: 28,
    patientGender: "female",
    patientBackground: "Ms. Lee, 28, with Type 1 diabetes for 15 years. Planning pregnancy, needs improved glycemic control.",
    clinicalPresentation: "HbA1c 8.1%, frequent morning hyperglycemia. Current: insulin glargine 24 units nocte, rapid insulin 6-8-6 units with meals.",
    medicationHistory: "Well-established Type 1 diabetes. Takes folic acid 5mg daily. No complications. Last HbA1c 6 months ago was 7.8%.",
    assessmentObjectives: "Optimize pre-conception glucose control, adjust insulin regimen, provide pregnancy planning advice, arrange specialist referral.",
    keyLearningOutcomes: ["Type 1 diabetes management", "Pre-conception counseling", "Insulin optimization", "Blood glucose monitoring"],
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
    title: "Thyroid Hormone Replacement Monitoring",
    module: "practice",
    therapeuticArea: "endocrine",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA4",
    supervisionLevel: 1,
    patientAge: 45,
    patientGender: "female",
    patientBackground: "Mrs. Patel, 45, post-thyroidectomy for thyroid cancer. Complex interactions with multiple medications.",
    clinicalPresentation: "Fatigue, weight gain despite levothyroxine 125mcg daily. Recent TSH 8.2 mU/L. Also on warfarin, simvastatin, iron supplements.",
    medicationHistory: "Thyroidectomy 2 years ago. On warfarin for atrial fibrillation, simvastatin for hyperlipidemia, iron for anemia.",
    assessmentObjectives: "Optimize thyroid replacement therapy, assess drug interactions, coordinate monitoring, evaluate absorption issues.",
    keyLearningOutcomes: ["Thyroid hormone optimization", "Drug interaction management", "Therapeutic monitoring", "Complex medication coordination"],
    difficulty: "advanced",
    status: "active"
  },

  // GASTROINTESTINAL (3 scenarios)
  {
    title: "PPI Therapy Optimization",
    module: "practice",
    therapeuticArea: "gastrointestinal",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA2",
    supervisionLevel: 3,
    patientAge: 54,
    patientGender: "male",
    patientBackground: "Mr. Krishnan, 54, with GERD on long-term omeprazole. Concerned about bone health and vitamin deficiencies.",
    clinicalPresentation: "Well-controlled GERD symptoms on omeprazole 20mg daily for 3 years. Recent low B12 and magnesium levels.",
    medicationHistory: "Omeprazole started for severe heartburn. Also takes alendronate weekly for osteopenia. No H. pylori history.",
    assessmentObjectives: "Review PPI appropriateness, assess vitamin deficiencies, evaluate bone health, consider step-down therapy.",
    keyLearningOutcomes: ["PPI optimization", "Long-term PPI effects", "Vitamin deficiency management", "GERD lifestyle counseling"],
    difficulty: "intermediate",
    status: "active"
  },
  {
    title: "Inflammatory Bowel Disease Management",
    module: "practice",
    therapeuticArea: "gastrointestinal",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 32,
    patientGender: "female",
    patientBackground: "Ms. Zhang, 32, with Crohn's disease flare. Starting biological therapy. Anxious about immunosuppression risks.",
    clinicalPresentation: "Active Crohn's flare with bloody diarrhea, abdominal pain. Starting prednisolone 40mg and planning adalimumab induction.",
    medicationHistory: "Previously on mesalazine and azathioprine. Failed multiple treatments. No contraindications to biologics.",
    assessmentObjectives: "Initiate biological therapy safely, provide immunosuppression counseling, monitor for side effects, coordinate specialist care.",
    keyLearningOutcomes: ["Biological therapy initiation", "Immunosuppression counseling", "IBD management", "Patient anxiety management"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Hepatic Encephalopathy Prevention",
    module: "practice",
    therapeuticArea: "gastrointestinal",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA4",
    supervisionLevel: 1,
    patientAge: 58,
    patientGender: "male",
    patientBackground: "Mr. Singh, 58, with decompensated cirrhosis and recurrent hepatic encephalopathy. Complex medication management needed.",
    clinicalPresentation: "History of confusion episodes. On lactulose 20ml TDS, rifaximin 550mg BD. Recent episode despite compliance.",
    medicationHistory: "Cirrhosis due to alcohol. Multiple medications: spironolactone, propranolol, lactulose, rifaximin, multivitamins.",
    assessmentObjectives: "Optimize hepatic encephalopathy prevention, assess medication metabolism, evaluate compliance, coordinate liver transplant preparation.",
    keyLearningOutcomes: ["Hepatic encephalopathy management", "Cirrhosis pharmacotherapy", "Drug metabolism in liver disease", "Transplant preparation"],
    difficulty: "advanced",
    status: "active"
  },

  // RENAL (3 scenarios)
  {
    title: "Chronic Kidney Disease Medication Review",
    module: "practice",
    therapeuticArea: "renal",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA2",
    supervisionLevel: 3,
    patientAge: 67,
    patientGender: "male",
    patientBackground: "Mr. Abdullah, 67, with CKD stage 4. Multiple medications requiring dose adjustments and monitoring.",
    clinicalPresentation: "eGFR 25 ml/min, rising creatinine. On ramipril, simvastatin, calcium carbonate, calcitriol. Preparing for dialysis.",
    medicationHistory: "CKD secondary to diabetes. Previously on metformin (stopped). Regular medications need renal dose adjustment.",
    assessmentObjectives: "Review renal dosing, assess bone mineral metabolism, evaluate cardiovascular protection, prepare for renal replacement therapy.",
    keyLearningOutcomes: ["Renal dose adjustment", "CKD-MBD management", "Cardiovascular protection in CKD", "Pre-dialysis preparation"],
    difficulty: "intermediate",
    status: "active"
  },
  {
    title: "Acute Kidney Injury Drug-Induced",
    module: "practice",
    therapeuticArea: "renal",
    practiceArea: "hospital",
    caseType: "acute",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 75,
    patientGender: "female",
    patientBackground: "Mrs. Williams, 75, admitted with AKI following contrast CT. Multiple nephrotoxic medications to review.",
    clinicalPresentation: "Creatinine increased from 120 to 280 μmol/L post-contrast. Currently on ramipril, diclofenac, gentamicin for UTI.",
    medicationHistory: "Baseline mild CKD. Recent UTI treated with gentamicin. Contrast study for abdominal pain 48 hours ago.",
    assessmentObjectives: "Identify and discontinue nephrotoxic drugs, optimize fluid management, monitor renal recovery, prevent further injury.",
    keyLearningOutcomes: ["Drug-induced AKI management", "Nephrotoxic drug identification", "Renal recovery monitoring", "Contrast nephropathy prevention"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Dialysis Medication Management",
    module: "practice",
    therapeuticArea: "renal",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA4",
    supervisionLevel: 1,
    patientAge: 52,
    patientGender: "male",
    patientBackground: "Mr. Thompson, 52, on hemodialysis 3x/week. Complex medication regimen with timing considerations around dialysis.",
    clinicalPresentation: "End-stage renal disease on maintenance hemodialysis. Medications: sevelamer, calcitriol, EPO, iron sucrose, multiple others.",
    medicationHistory: "Dialysis for 2 years. Medications require timing around dialysis sessions. History of poor adherence to phosphate binders.",
    assessmentObjectives: "Optimize dialysis-related medications, coordinate timing with dialysis schedule, improve adherence, manage complications.",
    keyLearningOutcomes: ["Dialysis medication management", "Phosphate binder optimization", "EPO therapy", "Medication timing in dialysis"],
    difficulty: "advanced",
    status: "active"
  },

  // NEUROLOGICAL (3 scenarios)
  {
    title: "Epilepsy Medication Adherence",
    module: "practice",
    therapeuticArea: "neurological",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA2",
    supervisionLevel: 3,
    patientAge: 23,
    patientGender: "female",
    patientBackground: "Ms. Rodriguez, 23, university student with epilepsy. Recent breakthrough seizures, questioning medication adherence.",
    clinicalPresentation: "Two seizures in past month after 18 months seizure-free. On lamotrigine 200mg BD. Stress from exams, irregular sleep.",
    medicationHistory: "Epilepsy diagnosed at 18. Well-controlled on lamotrigine. No recent dose changes. Takes oral contraceptive pill.",
    assessmentObjectives: "Assess adherence factors, evaluate seizure triggers, review drug interactions, provide lifestyle counseling.",
    keyLearningOutcomes: ["Epilepsy medication adherence", "Seizure trigger identification", "Drug interactions with contraceptives", "Student lifestyle management"],
    difficulty: "intermediate",
    status: "active"
  },
  {
    title: "Parkinson's Disease Complex Regimen",
    module: "practice",
    therapeuticArea: "neurological",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 68,
    patientGender: "male",
    patientBackground: "Mr. Johnson, 68, with Parkinson's disease for 8 years. Motor fluctuations developing, medication optimization needed.",
    clinicalPresentation: "Wearing-off effects before next dose, dyskinesias. Current: levodopa/carbidopa 25/100 TDS, ropinirole 2mg TDS.",
    medicationHistory: "Progressive Parkinson's. Started on ropinirole, levodopa added 3 years ago. Recent dose increases not fully effective.",
    assessmentObjectives: "Optimize Parkinson's medications, manage motor fluctuations, assess for advanced therapies, coordinate specialist care.",
    keyLearningOutcomes: ["Parkinson's medication optimization", "Motor fluctuation management", "Advanced Parkinson's therapies", "Movement disorder expertise"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Multiple Sclerosis Disease-Modifying Therapy",
    module: "practice",
    therapeuticArea: "neurological",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA4",
    supervisionLevel: 1,
    patientAge: 35,
    patientGender: "female",
    patientBackground: "Ms. Davis, 35, newly diagnosed MS. Starting disease-modifying therapy. Concerns about family planning and side effects.",
    clinicalPresentation: "Relapsing-remitting MS, first episode 6 months ago. MRI shows multiple lesions. Considering interferon beta-1a.",
    medicationHistory: "Recent steroid course for acute relapse. No other regular medications. Planning pregnancy in next 2 years.",
    assessmentObjectives: "Initiate DMT safely, provide counseling on benefits/risks, address pregnancy concerns, establish monitoring plan.",
    keyLearningOutcomes: ["MS disease-modifying therapies", "Reproductive health in MS", "DMT counseling", "Long-term MS management"],
    difficulty: "advanced",
    status: "active"
  },

  // DERMATOLOGICAL (3 scenarios)
  {
    title: "Atopic Dermatitis Topical Therapy",
    module: "practice",
    therapeuticArea: "dermatological",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA1",
    supervisionLevel: 4,
    patientAge: 8,
    patientGender: "male",
    patientBackground: "Tommy, 8 years old, with moderate atopic dermatitis. Parents concerned about steroid use and seeking alternatives.",
    clinicalPresentation: "Widespread eczema affecting face, arms, legs. Currently using hydrocortisone 1% cream and emollients.",
    medicationHistory: "Eczema since infancy. Previous courses of stronger topical steroids with temporary improvement.",
    assessmentObjectives: "Optimize topical therapy regimen, address steroid phobia, provide proper application techniques, consider step-up therapy.",
    keyLearningOutcomes: ["Atopic dermatitis management", "Topical steroid counseling", "Emollient therapy", "Pediatric considerations"],
    difficulty: "foundation",
    status: "active"
  },
  {
    title: "Psoriasis Systemic Treatment",
    module: "practice",
    therapeuticArea: "dermatological",
    practiceArea: "hospital",
    caseType: "complex",
    professionalActivity: "PA3",
    supervisionLevel: 2,
    patientAge: 42,
    patientGender: "female",
    patientBackground: "Ms. Patel, 42, with severe psoriasis and psoriatic arthritis. Starting methotrexate therapy after topical treatment failure.",
    clinicalPresentation: "Extensive plaque psoriasis affecting >20% body surface area. Joint pain and swelling. Failed topical therapies.",
    medicationHistory: "Various topical treatments including calcipotriol, betamethasone. No previous systemic therapy. No contraindications.",
    assessmentObjectives: "Initiate methotrexate safely, provide monitoring plan, counsel on side effects, coordinate with rheumatology.",
    keyLearningOutcomes: ["Systemic psoriasis therapy", "Methotrexate monitoring", "Psoriatic arthritis management", "Multidisciplinary care"],
    difficulty: "advanced",
    status: "active"
  },
  {
    title: "Acne Treatment Optimization",
    module: "practice",
    therapeuticArea: "dermatological",
    practiceArea: "community",
    caseType: "chronic",
    professionalActivity: "PA2",
    supervisionLevel: 3,
    patientAge: 17,
    patientGender: "female",
    patientBackground: "Sarah, 17, with moderate acne. Current treatments not working well, considering oral therapy. Concerns about side effects.",
    clinicalPresentation: "Moderate inflammatory acne on face and back. Using benzoyl peroxide 5% gel and clindamycin 1% lotion.",
    medicationHistory: "Topical treatments for 6 months with minimal improvement. On oral contraceptive pill for contraception.",
    assessmentObjectives: "Evaluate current therapy effectiveness, consider oral antibiotic therapy, address psychological impact, provide skincare education.",
    keyLearningOutcomes: ["Acne treatment ladder", "Antibiotic therapy in acne", "Contraceptive interactions", "Adolescent counseling"],
    difficulty: "intermediate",
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