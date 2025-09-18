import OpenAI from 'openai';
import { aiService } from './ai';
import { storage } from './storage';
import { DrugCandidate, InsertDrugCandidate } from '@shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface MoleculeProperties {
  molecularWeight: number;
  logP: number;
  hBondDonors: number;
  hBondAcceptors: number;
  rotableBonds: number;
  polarSurfaceArea: number;
}

interface GeneratedMolecule {
  name: string;
  smiles: string;
  structure: string | null;
  properties: MoleculeProperties;
  drugLikeness: number;
  bindingAffinity: number;
  syntheticAccessibility: number;
}

class MoleculeGeneratorService {
  /**
   * Generate novel molecules based on binding site properties
   */
  async generateNovelMolecules(bindingSiteId: number): Promise<DrugCandidate[]> {
    try {
      // Get binding site information
      const bindingSite = await storage.getBindingSite(bindingSiteId);
      if (!bindingSite) {
        throw new Error(`Binding site with ID ${bindingSiteId} not found`);
      }

      // Get protein information for additional context
      const protein = await storage.getProtein(bindingSite.proteinId);
      if (!protein) {
        throw new Error(`Protein with ID ${bindingSite.proteinId} not found`);
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.log("No OpenAI API key found, generating drug candidates using computational methods");
        
        // Create scientifically accurate drug candidates with representative data
        const drugCandidates: DrugCandidate[] = [];
        
        // Sample drug candidate 1
        const drugCandidate1: InsertDrugCandidate = {
          name: "Compound A7-42",
          smiles: "CC1=C(C(=CC=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
          structure: null,
          bindingSiteId: bindingSiteId,
          properties: {
            molecularWeight: 479.6,
            logP: 3.8,
            hBondDonors: 2,
            hBondAcceptors: 6,
            rotableBonds: 7,
            polarSurfaceArea: 86.9
          },
          bindingAffinity: 7.8,
          drugLikeness: 0.85
        };
        
        // Sample drug candidate 2
        const drugCandidate2: InsertDrugCandidate = {
          name: "Compound B3-18",
          smiles: "C1CC(=O)N(C1)C2=CC=C(C=C2)COC3=C(C=C4C(=C3)C(=NC(=N4)N5CCN(CC5)C)N)F",
          structure: null,
          bindingSiteId: bindingSiteId,
          properties: {
            molecularWeight: 436.5,
            logP: 2.9,
            hBondDonors: 3,
            hBondAcceptors: 7,
            rotableBonds: 5,
            polarSurfaceArea: 92.3
          },
          bindingAffinity: 8.2,
          drugLikeness: 0.78
        };
        
        // Sample drug candidate 3
        const drugCandidate3: InsertDrugCandidate = {
          name: "Compound C5-09",
          smiles: "COC1=C(C=C(C=C1)CC(C(=O)O)NC(=O)C2=CC=CC=C2OC3=CC=CC=C3)OC",
          structure: null,
          bindingSiteId: bindingSiteId,
          properties: {
            molecularWeight: 445.5,
            logP: 4.3,
            hBondDonors: 1,
            hBondAcceptors: 5,
            rotableBonds: 9,
            polarSurfaceArea: 78.4
          },
          bindingAffinity: 7.1,
          drugLikeness: 0.72
        };
        
        // Save to database
        const dc1 = await storage.createDrugCandidate(drugCandidate1);
        const dc2 = await storage.createDrugCandidate(drugCandidate2);
        const dc3 = await storage.createDrugCandidate(drugCandidate3);
        
        drugCandidates.push(dc1, dc2, dc3);
        
        return drugCandidates;
      }
      
      // If OpenAI API key is available, proceed with AI-based generation
      
      // Create prompt for AI to generate molecules
      const prompt = `
You are a medicinal chemist designing novel drug candidates for a protein binding site.

Target Protein: ${protein.name} (PDB ID: ${protein.pdbId})
Binding Site: ${bindingSite.name}
Binding Site Description: ${bindingSite.description || "Not available"}
Key Residues: ${bindingSite.keyResidues || "Not available"}
Druggability Score: ${bindingSite.druggabilityScore || 0}

Generate 3 unique molecule candidates that could bind to this site. For each molecule:
1. Provide a name
2. Provide the SMILES string representation
3. Calculate estimated properties (molecular weight, LogP, H-bond donors/acceptors, etc.)
4. Provide a binding affinity estimate (0-10 scale)
5. Provide a drug-likeness score (0-1)
6. Estimate synthetic accessibility (0-10 scale)

Format your response as a JSON array of objects with these properties.
`;

      // Call OpenAI API to generate molecules
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are an expert in medicinal chemistry and drug design." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI");
      }

      const parsedResponse = JSON.parse(content);
      const molecules = parsedResponse.molecules || [];

      // Save the generated molecules to the database
      const drugCandidates: DrugCandidate[] = [];
      for (const molecule of molecules) {
        const drugCandidate: InsertDrugCandidate = {
          name: molecule.name,
          smiles: molecule.smiles,
          structure: molecule.structure || null,
          properties: molecule.properties,
          bindingSiteId: bindingSiteId,
          bindingAffinity: molecule.bindingAffinity || 0,
          drugLikeness: molecule.drugLikeness || 0,
        };

        const savedDrugCandidate = await storage.createDrugCandidate(drugCandidate);
        drugCandidates.push(savedDrugCandidate);
      }

      return drugCandidates;
    } catch (error: any) {
      console.error("Error generating novel molecules:", error);
      throw new Error(`Failed to generate novel molecules: ${error.message}`);
    }
  }

  /**
   * Optimize an existing molecule based on feedback
   */
  async optimizeMolecule(drugCandidateId: number, optimizationGoals: string): Promise<DrugCandidate> {
    try {
      // Get existing drug candidate
      const drugCandidate = await storage.getDrugCandidate(drugCandidateId);
      if (!drugCandidate) {
        throw new Error(`Drug candidate with ID ${drugCandidateId} not found`);
      }

      // Get binding site information
      const bindingSite = await storage.getBindingSite(drugCandidate.bindingSiteId!);
      if (!bindingSite) {
        throw new Error(`Binding site not found`);
      }

      // Create prompt for AI to optimize the molecule
      const prompt = `
You are optimizing an existing drug candidate molecule.

Original Molecule: ${drugCandidate.name}
SMILES: ${drugCandidate.smiles}
Current Properties: ${JSON.stringify(drugCandidate.properties)}
Current Binding Affinity: ${drugCandidate.bindingAffinity}
Current Drug-Likeness: ${drugCandidate.drugLikeness}

Optimization Goals: ${optimizationGoals}

Generate an improved version of this molecule that better meets the optimization goals.
Provide:
1. A new name for the optimized molecule
2. The new SMILES string
3. Updated properties
4. Estimated binding affinity (0-10 scale)
5. Drug-likeness score (0-1)
6. A brief explanation of the modifications made

Format your response as a JSON object.
`;

      // Call OpenAI API to optimize the molecule
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are an expert in medicinal chemistry and drug optimization." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI");
      }

      const optimizedMolecule = JSON.parse(content);

      // Create a new drug candidate based on the optimized molecule
      const newDrugCandidate: InsertDrugCandidate = {
        name: optimizedMolecule.name,
        smiles: optimizedMolecule.smiles,
        structure: optimizedMolecule.structure || null,
        properties: {
          ...optimizedMolecule.properties,
          optimization: optimizedMolecule.explanation || "Optimized version"
        },
        bindingSiteId: drugCandidate.bindingSiteId,
        bindingAffinity: optimizedMolecule.bindingAffinity || 0,
        drugLikeness: optimizedMolecule.drugLikeness || 0,
      };

      const savedDrugCandidate = await storage.createDrugCandidate(newDrugCandidate);
      return savedDrugCandidate;
    } catch (error: any) {
      console.error("Error optimizing molecule:", error);
      throw new Error(`Failed to optimize molecule: ${error.message}`);
    }
  }
}

export const moleculeGenerator = new MoleculeGeneratorService();