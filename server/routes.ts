import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai";
import { moleculeGenerator } from "./moleculeGenerator";
import { z } from "zod";
import fetch from "node-fetch";
import {
  insertProteinSchema,
  insertBindingSiteSchema,
  insertAiAnalysisSchema,
  insertDrugCandidateSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proteins endpoints
  app.get("/api/proteins", async (_req: Request, res: Response) => {
    try {
      const proteins = await storage.getAllProteins();
      res.json(proteins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proteins" });
    }
  });

  app.get("/api/proteins/recent", async (_req: Request, res: Response) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 5;
      const proteins = await storage.getRecentProteins(limit);
      res.json(proteins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent proteins" });
    }
  });

  app.get("/api/proteins/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid protein ID" });
      }

      const protein = await storage.getProtein(id);
      if (!protein) {
        return res.status(404).json({ message: "Protein not found" });
      }

      res.json(protein);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protein" });
    }
  });

  app.get("/api/proteins/pdb/:pdbId", async (req: Request, res: Response) => {
    try {
      const pdbId = req.params.pdbId;
      const protein = await storage.getProteinByPdbId(pdbId);
      if (!protein) {
        return res.status(404).json({ message: "Protein not found" });
      }

      res.json(protein);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protein" });
    }
  });

  app.post("/api/proteins", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProteinSchema.parse(req.body);
      const protein = await storage.createProtein({
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      res.status(201).json(protein);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid protein data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protein" });
    }
  });

  app.put("/api/proteins/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid protein ID" });
      }

      const validatedData = insertProteinSchema.partial().parse(req.body);
      const updatedProtein = await storage.updateProtein(id, {
        ...validatedData,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedProtein) {
        return res.status(404).json({ message: "Protein not found" });
      }

      res.json(updatedProtein);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid protein data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protein" });
    }
  });

  app.delete("/api/proteins/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid protein ID" });
      }

      const deleted = await storage.deleteProtein(id);
      if (!deleted) {
        return res.status(404).json({ message: "Protein not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete protein" });
    }
  });
  
  // PDB Structure fetching endpoint for 3D visualization
  app.get("/api/proteins/fetch-structure/:pdbId", async (req: Request, res: Response) => {
    try {
      const pdbId = req.params.pdbId.toUpperCase();
      
      // Validate PDB ID format (typically 4 characters)
      if (!/^[A-Z0-9]{4}$/.test(pdbId)) {
        return res.status(400).json({ message: "Invalid PDB ID format" });
      }
      
      // Check if we already have the structure in our database
      const existingProtein = await storage.getProteinByPdbId(pdbId);
      if (existingProtein && existingProtein.structure) {
        return res.type('text/plain').send(existingProtein.structure);
      }
      
      // Fetch from RCSB PDB database
      const response = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
      
      if (!response.ok) {
        return res.status(404).json({ message: `PDB structure for ${pdbId} not found` });
      }
      
      const pdbData = await response.text();
      
      // If we already have this protein in our database, update it with the structure
      if (existingProtein) {
        await storage.updateProtein(existingProtein.id, {
          structure: pdbData
        });
      }
      
      // Return the PDB data as plain text
      res.type('text/plain').send(pdbData);
    } catch (error) {
      console.error(`Error fetching PDB structure: ${error}`);
      res.status(500).json({ message: "Failed to fetch PDB structure" });
    }
  });

  // Binding Sites endpoints
  app.get("/api/binding-sites/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid binding site ID" });
      }

      const bindingSite = await storage.getBindingSite(id);
      if (!bindingSite) {
        return res.status(404).json({ message: "Binding site not found" });
      }

      res.json(bindingSite);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch binding site" });
    }
  });

  app.get("/api/proteins/:proteinId/binding-sites", async (req: Request, res: Response) => {
    try {
      const proteinId = parseInt(req.params.proteinId);
      if (isNaN(proteinId)) {
        return res.status(400).json({ message: "Invalid protein ID" });
      }

      const bindingSites = await storage.getBindingSitesByProteinId(proteinId);
      res.json(bindingSites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch binding sites" });
    }
  });

  app.post("/api/binding-sites", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBindingSiteSchema.parse(req.body);
      const bindingSite = await storage.createBindingSite(validatedData);
      res.status(201).json(bindingSite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid binding site data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create binding site" });
    }
  });

  // AI Analysis endpoints
  app.get("/api/ai-analyses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }

      const analysis = await storage.getAiAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  app.get("/api/proteins/:proteinId/ai-analyses", async (req: Request, res: Response) => {
    try {
      const proteinId = parseInt(req.params.proteinId);
      if (isNaN(proteinId)) {
        return res.status(400).json({ message: "Invalid protein ID" });
      }

      const analyses = await storage.getAiAnalysesByProteinId(proteinId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  app.post("/api/ai-analyses", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAiAnalysisSchema.parse(req.body);
      const analysis = await storage.createAiAnalysis({
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      res.status(201).json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analysis data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create analysis" });
    }
  });

  app.put("/api/ai-analyses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }

      const validatedData = insertAiAnalysisSchema.partial().parse(req.body);
      const updatedAnalysis = await storage.updateAiAnalysis(id, {
        ...validatedData,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedAnalysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(updatedAnalysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analysis data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update analysis" });
    }
  });

  // Drug Candidate endpoints
  app.get("/api/drug-candidates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid drug candidate ID" });
      }

      const drugCandidate = await storage.getDrugCandidate(id);
      if (!drugCandidate) {
        return res.status(404).json({ message: "Drug candidate not found" });
      }

      res.json(drugCandidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drug candidate" });
    }
  });

  app.get("/api/binding-sites/:bindingSiteId/drug-candidates", async (req: Request, res: Response) => {
    try {
      const bindingSiteId = parseInt(req.params.bindingSiteId);
      if (isNaN(bindingSiteId)) {
        return res.status(400).json({ message: "Invalid binding site ID" });
      }

      const drugCandidates = await storage.getDrugCandidatesByBindingSiteId(bindingSiteId);
      res.json(drugCandidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drug candidates" });
    }
  });

  app.post("/api/drug-candidates", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDrugCandidateSchema.parse(req.body);
      const drugCandidate = await storage.createDrugCandidate(validatedData);
      res.status(201).json(drugCandidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid drug candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create drug candidate" });
    }
  });

  // AI-enhanced routes
  app.post("/api/proteins/:proteinId/analyze", async (req: Request, res: Response) => {
    try {
      const proteinId = parseInt(req.params.proteinId);
      if (isNaN(proteinId)) {
        return res.status(400).json({ message: "Invalid protein ID" });
      }

      // Get the protein data
      const protein = await storage.getProtein(proteinId);
      if (!protein) {
        return res.status(404).json({ message: "Protein not found" });
      }

      // Perform AI analysis on the protein structure
      const analysis = await aiService.analyzeProteinStructure(
        protein.pdbId,
        proteinId,
        protein.structure || ""
      );

      res.json({
        message: "Protein analysis completed successfully",
        analysis
      });
    } catch (error) {
      console.error("Error in AI protein analysis:", error);
      res.status(500).json({ message: "Failed to analyze protein" });
    }
  });

  app.post("/api/binding-sites/:bindingSiteId/analyze", async (req: Request, res: Response) => {
    try {
      const bindingSiteId = parseInt(req.params.bindingSiteId);
      if (isNaN(bindingSiteId)) {
        return res.status(400).json({ message: "Invalid binding site ID" });
      }

      // Get the binding site data
      const bindingSite = await storage.getBindingSite(bindingSiteId);
      if (!bindingSite) {
        return res.status(404).json({ message: "Binding site not found" });
      }

      // Get the protein data
      const protein = await storage.getProtein(bindingSite.proteinId);
      if (!protein) {
        return res.status(404).json({ message: "Protein not found" });
      }

      // Perform AI analysis on the binding site
      const analysis = await aiService.analyzeBindingSites(
        bindingSite.proteinId,
        {
          bindingSite,
          protein
        }
      );

      res.json({
        message: "Binding site analysis completed successfully",
        analysis
      });
    } catch (error) {
      console.error("Error in AI binding site analysis:", error);
      res.status(500).json({ message: "Failed to analyze binding site" });
    }
  });

  app.post("/api/binding-sites/:bindingSiteId/generate-drugs", async (req: Request, res: Response) => {
    try {
      const bindingSiteId = parseInt(req.params.bindingSiteId);
      if (isNaN(bindingSiteId)) {
        return res.status(400).json({ message: "Invalid binding site ID" });
      }

      // Get the binding site data
      const bindingSite = await storage.getBindingSite(bindingSiteId);
      if (!bindingSite) {
        return res.status(404).json({ message: "Binding site not found" });
      }

      // Use new molecule generator for AI-powered novel molecule design
      const drugCandidates = await moleculeGenerator.generateNovelMolecules(bindingSiteId);

      res.json({
        message: "Novel drug candidates generated successfully using AI",
        drugCandidates
      });
    } catch (error) {
      console.error("Error generating novel drug candidates:", error);
      res.status(500).json({ message: "Failed to generate novel drug candidates" });
    }
  });
  
  // New endpoint for optimizing existing drug candidates with AI
  app.post("/api/drug-candidates/:drugCandidateId/optimize", async (req: Request, res: Response) => {
    try {
      const drugCandidateId = parseInt(req.params.drugCandidateId);
      if (isNaN(drugCandidateId)) {
        return res.status(400).json({ message: "Invalid drug candidate ID" });
      }
      
      const { optimizationGoals } = req.body;
      if (!optimizationGoals) {
        return res.status(400).json({ 
          message: "Missing optimization goals", 
          example: "Improve solubility while maintaining binding affinity" 
        });
      }

      // Get the drug candidate data
      const drugCandidate = await storage.getDrugCandidate(drugCandidateId);
      if (!drugCandidate) {
        return res.status(404).json({ message: "Drug candidate not found" });
      }

      // Optimize the drug candidate using AI
      const optimizedCandidate = await moleculeGenerator.optimizeMolecule(
        drugCandidateId,
        optimizationGoals
      );

      res.json({
        message: "Drug candidate optimized successfully",
        originalCandidate: drugCandidate,
        optimizedCandidate
      });
    } catch (error) {
      console.error("Error optimizing drug candidate:", error);
      res.status(500).json({ message: "Failed to optimize drug candidate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
