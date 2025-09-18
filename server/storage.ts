import { 
  User, 
  InsertUser, 
  Protein, 
  InsertProtein, 
  BindingSite, 
  InsertBindingSite, 
  AiAnalysis,
  InsertAiAnalysis,
  DrugCandidate,
  InsertDrugCandidate,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Protein operations
  getProtein(id: number): Promise<Protein | undefined>;
  getProteinByPdbId(pdbId: string): Promise<Protein | undefined>;
  getAllProteins(): Promise<Protein[]>;
  getRecentProteins(limit?: number): Promise<Protein[]>;
  createProtein(protein: InsertProtein): Promise<Protein>;
  updateProtein(id: number, protein: Partial<InsertProtein>): Promise<Protein | undefined>;
  deleteProtein(id: number): Promise<boolean>;

  // Binding Site operations
  getBindingSite(id: number): Promise<BindingSite | undefined>;
  getBindingSitesByProteinId(proteinId: number): Promise<BindingSite[]>;
  createBindingSite(bindingSite: InsertBindingSite): Promise<BindingSite>;
  updateBindingSite(id: number, bindingSite: Partial<InsertBindingSite>): Promise<BindingSite | undefined>;

  // AI Analysis operations
  getAiAnalysis(id: number): Promise<AiAnalysis | undefined>;
  getAiAnalysesByProteinId(proteinId: number): Promise<AiAnalysis[]>;
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  updateAiAnalysis(id: number, analysis: Partial<InsertAiAnalysis>): Promise<AiAnalysis | undefined>;

  // Drug Candidate operations
  getDrugCandidate(id: number): Promise<DrugCandidate | undefined>;
  getDrugCandidatesByBindingSiteId(bindingSiteId: number): Promise<DrugCandidate[]>;
  createDrugCandidate(drugCandidate: InsertDrugCandidate): Promise<DrugCandidate>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private proteins: Map<number, Protein>;
  private bindingSites: Map<number, BindingSite>;
  private aiAnalyses: Map<number, AiAnalysis>;
  private drugCandidates: Map<number, DrugCandidate>;
  private userIdCounter: number;
  private proteinIdCounter: number;
  private bindingSiteIdCounter: number;
  private aiAnalysisIdCounter: number;
  private drugCandidateIdCounter: number;

  constructor() {
    this.users = new Map();
    this.proteins = new Map();
    this.bindingSites = new Map();
    this.aiAnalyses = new Map();
    this.drugCandidates = new Map();
    this.userIdCounter = 1;
    this.proteinIdCounter = 1;
    this.bindingSiteIdCounter = 1;
    this.aiAnalysisIdCounter = 1;
    this.drugCandidateIdCounter = 1;

    // Seed with sample data for prototyping
    this.seedWithSampleData();
  }

  private seedWithSampleData() {
    // Create sample protein
    const sampleProtein: InsertProtein = {
      pdbId: "6VXX",
      name: "SARS-CoV-2 Spike Protein",
      description: "Spike glycoprotein of severe acute respiratory syndrome coronavirus 2",
      chains: "A, B, C",
      residues: 1288,
      structure: "...", // PDB structure would go here
      userId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to database and get ID
    const id = this.proteinIdCounter++;
    const protein: Protein = { ...sampleProtein, id };
    this.proteins.set(id, protein);
    
    // Create sample binding sites
    const bindingSite1: InsertBindingSite = {
      proteinId: protein.id,
      name: "Binding Site 1",
      description: "Receptor Binding Domain (RBD)",
      confidence: 0.93,
      druggabilityScore: 0.82,
      keyResidues: "K417, N487, Y489, Q493, Q498",
      coordinates: {},
    };
    
    const bindingSiteId1 = this.bindingSiteIdCounter++;
    const bindingSiteObj1: BindingSite = { ...bindingSite1, id: bindingSiteId1 };
    this.bindingSites.set(bindingSiteId1, bindingSiteObj1);

    const bindingSite2: InsertBindingSite = {
      proteinId: protein.id,
      name: "Binding Site 2",
      description: "S2 Subunit Interface",
      confidence: 0.78,
      druggabilityScore: 0.65,
      keyResidues: "L611, V615, L619, P862, N866",
      coordinates: {},
    };
    
    const bindingSiteId2 = this.bindingSiteIdCounter++;
    const bindingSiteObj2: BindingSite = { ...bindingSite2, id: bindingSiteId2 };
    this.bindingSites.set(bindingSiteId2, bindingSiteObj2);

    // Create sample AI Analyses
    const structurePrediction: InsertAiAnalysis = {
      proteinId: protein.id,
      type: "structure_prediction",
      status: "completed",
      results: {
        overallConfidence: 0.92,
        domainConfidence: {
          "N-terminal Domain": 0.78,
          "Receptor Binding Domain": 0.95,
          "C-terminal Domain": 0.88
        }
      },
      confidence: 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const analysisId1 = this.aiAnalysisIdCounter++;
    const analysisObj1: AiAnalysis = { ...structurePrediction, id: analysisId1 };
    this.aiAnalyses.set(analysisId1, analysisObj1);

    const bindingSiteAnalysis: InsertAiAnalysis = {
      proteinId: protein.id,
      type: "binding_site",
      status: "completed",
      results: {
        sites: [
          {
            name: "Binding Site 1",
            description: "Receptor Binding Domain (RBD)",
            confidence: 0.93,
            druggabilityScore: 0.82,
            keyResidues: "K417, N487, Y489, Q493, Q498"
          },
          {
            name: "Binding Site 2",
            description: "S2 Subunit Interface",
            confidence: 0.78,
            druggabilityScore: 0.65,
            keyResidues: "L611, V615, L619, P862, N866"
          }
        ]
      },
      confidence: 0.86,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const analysisId2 = this.aiAnalysisIdCounter++;
    const analysisObj2: AiAnalysis = { ...bindingSiteAnalysis, id: analysisId2 };
    this.aiAnalyses.set(analysisId2, analysisObj2);

    // Add a few more sample proteins
    this.createProtein({
      pdbId: "1R42",
      name: "Human ACE2",
      description: "Angiotensin-converting enzyme 2",
      chains: "A",
      residues: 805,
      structure: "",
      userId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.createProtein({
      pdbId: "4ZXB",
      name: "Insulin Receptor",
      description: "Insulin receptor tyrosine kinase domain",
      chains: "A, B",
      residues: 638,
      structure: "",
      userId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Protein operations
  async getProtein(id: number): Promise<Protein | undefined> {
    return this.proteins.get(id);
  }

  async getProteinByPdbId(pdbId: string): Promise<Protein | undefined> {
    return Array.from(this.proteins.values()).find(
      (protein) => protein.pdbId === pdbId,
    );
  }

  async getAllProteins(): Promise<Protein[]> {
    return Array.from(this.proteins.values());
  }

  async getRecentProteins(limit: number = 5): Promise<Protein[]> {
    return Array.from(this.proteins.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  async createProtein(insertProtein: InsertProtein): Promise<Protein> {
    const id = this.proteinIdCounter++;
    const protein: Protein = { ...insertProtein, id };
    this.proteins.set(id, protein);
    return protein;
  }

  async updateProtein(id: number, protein: Partial<InsertProtein>): Promise<Protein | undefined> {
    const existingProtein = this.proteins.get(id);
    if (!existingProtein) return undefined;

    const updatedProtein = { ...existingProtein, ...protein, updatedAt: new Date().toISOString() };
    this.proteins.set(id, updatedProtein);
    return updatedProtein;
  }

  async deleteProtein(id: number): Promise<boolean> {
    return this.proteins.delete(id);
  }

  // Binding Site operations
  async getBindingSite(id: number): Promise<BindingSite | undefined> {
    return this.bindingSites.get(id);
  }

  async getBindingSitesByProteinId(proteinId: number): Promise<BindingSite[]> {
    return Array.from(this.bindingSites.values()).filter(
      (site) => site.proteinId === proteinId,
    );
  }

  async createBindingSite(insertBindingSite: InsertBindingSite): Promise<BindingSite> {
    const id = this.bindingSiteIdCounter++;
    const bindingSite: BindingSite = { ...insertBindingSite, id };
    this.bindingSites.set(id, bindingSite);
    return bindingSite;
  }

  async updateBindingSite(id: number, bindingSite: Partial<InsertBindingSite>): Promise<BindingSite | undefined> {
    const existingBindingSite = this.bindingSites.get(id);
    if (!existingBindingSite) return undefined;

    const updatedBindingSite = { ...existingBindingSite, ...bindingSite };
    this.bindingSites.set(id, updatedBindingSite);
    return updatedBindingSite;
  }

  // AI Analysis operations
  async getAiAnalysis(id: number): Promise<AiAnalysis | undefined> {
    return this.aiAnalyses.get(id);
  }

  async getAiAnalysesByProteinId(proteinId: number): Promise<AiAnalysis[]> {
    return Array.from(this.aiAnalyses.values()).filter(
      (analysis) => analysis.proteinId === proteinId,
    );
  }

  async createAiAnalysis(insertAiAnalysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const id = this.aiAnalysisIdCounter++;
    const aiAnalysis: AiAnalysis = { ...insertAiAnalysis, id };
    this.aiAnalyses.set(id, aiAnalysis);
    return aiAnalysis;
  }

  async updateAiAnalysis(id: number, analysis: Partial<InsertAiAnalysis>): Promise<AiAnalysis | undefined> {
    const existingAnalysis = this.aiAnalyses.get(id);
    if (!existingAnalysis) return undefined;

    const updatedAnalysis = { 
      ...existingAnalysis, 
      ...analysis, 
      updatedAt: new Date().toISOString() 
    };
    this.aiAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  // Drug Candidate operations
  async getDrugCandidate(id: number): Promise<DrugCandidate | undefined> {
    return this.drugCandidates.get(id);
  }

  async getDrugCandidatesByBindingSiteId(bindingSiteId: number): Promise<DrugCandidate[]> {
    return Array.from(this.drugCandidates.values()).filter(
      (candidate) => candidate.bindingSiteId === bindingSiteId,
    );
  }

  async createDrugCandidate(insertDrugCandidate: InsertDrugCandidate): Promise<DrugCandidate> {
    const id = this.drugCandidateIdCounter++;
    const drugCandidate: DrugCandidate = { ...insertDrugCandidate, id };
    this.drugCandidates.set(id, drugCandidate);
    return drugCandidate;
  }
}

import { DatabaseStorage } from "./databaseStorage";

// Use database storage for persistence
export const storage = new DatabaseStorage();
