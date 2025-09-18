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
  users,
  proteins,
  bindingSites,
  aiAnalyses,
  drugCandidates
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Protein operations
  async getProtein(id: number): Promise<Protein | undefined> {
    const [protein] = await db.select().from(proteins).where(eq(proteins.id, id));
    return protein || undefined;
  }

  async getProteinByPdbId(pdbId: string): Promise<Protein | undefined> {
    const [protein] = await db.select().from(proteins).where(eq(proteins.pdbId, pdbId));
    return protein || undefined;
  }

  async getAllProteins(): Promise<Protein[]> {
    return db.select().from(proteins);
  }

  async getRecentProteins(limit: number = 5): Promise<Protein[]> {
    return db
      .select()
      .from(proteins)
      .orderBy(desc(proteins.updatedAt))
      .limit(limit);
  }

  async createProtein(protein: InsertProtein): Promise<Protein> {
    const [result] = await db
      .insert(proteins)
      .values(protein)
      .returning();
    return result;
  }

  async updateProtein(id: number, proteinData: Partial<InsertProtein>): Promise<Protein | undefined> {
    const [updatedProtein] = await db
      .update(proteins)
      .set({ ...proteinData, updatedAt: new Date().toISOString() })
      .where(eq(proteins.id, id))
      .returning();
    return updatedProtein || undefined;
  }

  async deleteProtein(id: number): Promise<boolean> {
    const [deletedProtein] = await db
      .delete(proteins)
      .where(eq(proteins.id, id))
      .returning();
    return !!deletedProtein;
  }

  // Binding Site operations
  async getBindingSite(id: number): Promise<BindingSite | undefined> {
    const [bindingSite] = await db.select().from(bindingSites).where(eq(bindingSites.id, id));
    return bindingSite || undefined;
  }

  async getBindingSitesByProteinId(proteinId: number): Promise<BindingSite[]> {
    return db
      .select()
      .from(bindingSites)
      .where(eq(bindingSites.proteinId, proteinId));
  }

  async createBindingSite(bindingSite: InsertBindingSite): Promise<BindingSite> {
    const [result] = await db
      .insert(bindingSites)
      .values(bindingSite)
      .returning();
    return result;
  }

  async updateBindingSite(id: number, bindingSiteData: Partial<InsertBindingSite>): Promise<BindingSite | undefined> {
    const [updatedBindingSite] = await db
      .update(bindingSites)
      .set(bindingSiteData)
      .where(eq(bindingSites.id, id))
      .returning();
    return updatedBindingSite || undefined;
  }

  // AI Analysis operations
  async getAiAnalysis(id: number): Promise<AiAnalysis | undefined> {
    const [analysis] = await db.select().from(aiAnalyses).where(eq(aiAnalyses.id, id));
    return analysis || undefined;
  }

  async getAiAnalysesByProteinId(proteinId: number): Promise<AiAnalysis[]> {
    return db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.proteinId, proteinId));
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [result] = await db
      .insert(aiAnalyses)
      .values(analysis)
      .returning();
    return result;
  }

  async updateAiAnalysis(id: number, analysisData: Partial<InsertAiAnalysis>): Promise<AiAnalysis | undefined> {
    const [updatedAnalysis] = await db
      .update(aiAnalyses)
      .set({ ...analysisData, updatedAt: new Date().toISOString() })
      .where(eq(aiAnalyses.id, id))
      .returning();
    return updatedAnalysis || undefined;
  }

  // Drug Candidate operations
  async getDrugCandidate(id: number): Promise<DrugCandidate | undefined> {
    const [drugCandidate] = await db.select().from(drugCandidates).where(eq(drugCandidates.id, id));
    return drugCandidate || undefined;
  }

  async getDrugCandidatesByBindingSiteId(bindingSiteId: number): Promise<DrugCandidate[]> {
    return db
      .select()
      .from(drugCandidates)
      .where(eq(drugCandidates.bindingSiteId, bindingSiteId));
  }

  async createDrugCandidate(drugCandidate: InsertDrugCandidate): Promise<DrugCandidate> {
    const [result] = await db
      .insert(drugCandidates)
      .values(drugCandidate)
      .returning();
    return result;
  }

  // Seed database with initial data
  async seedDatabase(): Promise<void> {
    // Check if we already have data
    const proteinCount = await db.select({ count: sql<number>`count(*)` }).from(proteins);
    if (proteinCount[0].count > 0) {
      return; // Database already has data
    }

    // Create sample protein
    const [sampleProtein] = await db
      .insert(proteins)
      .values({
        pdbId: "6VXX",
        name: "SARS-CoV-2 Spike Protein",
        description: "Spike glycoprotein of severe acute respiratory syndrome coronavirus 2",
        chains: "A, B, C",
        residues: 1288,
        structure: "...", // PDB structure would go here
        userId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Create sample binding sites
    await db
      .insert(bindingSites)
      .values([
        {
          proteinId: sampleProtein.id,
          name: "Binding Site 1",
          description: "Receptor Binding Domain (RBD)",
          confidence: 0.93,
          druggabilityScore: 0.82,
          keyResidues: "K417, N487, Y489, Q493, Q498",
          coordinates: {},
        },
        {
          proteinId: sampleProtein.id,
          name: "Binding Site 2",
          description: "S2 Subunit Interface",
          confidence: 0.78,
          druggabilityScore: 0.65,
          keyResidues: "L611, V615, L619, P862, N866",
          coordinates: {},
        }
      ]);

    // Create sample AI analyses
    await db
      .insert(aiAnalyses)
      .values([
        {
          proteinId: sampleProtein.id,
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
        },
        {
          proteinId: sampleProtein.id,
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
        }
      ]);

    // Add a few more sample proteins
    await db
      .insert(proteins)
      .values([
        {
          pdbId: "1R42",
          name: "Human ACE2",
          description: "Angiotensin-converting enzyme 2",
          chains: "A",
          residues: 805,
          structure: "",
          userId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          pdbId: "4ZXB",
          name: "Insulin Receptor",
          description: "Insulin receptor tyrosine kinase domain",
          chains: "A, B",
          residues: 638,
          structure: "",
          userId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
  }
}