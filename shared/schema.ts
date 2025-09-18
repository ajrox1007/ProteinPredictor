import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Protein model
export const proteins = pgTable("proteins", {
  id: serial("id").primaryKey(),
  pdbId: text("pdb_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  chains: text("chains"),
  residues: integer("residues"),
  structure: text("structure"), // PDB format or reference to file
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertProteinSchema = createInsertSchema(proteins).pick({
  pdbId: true,
  name: true,
  description: true,
  chains: true,
  residues: true,
  structure: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Binding Site model
export const bindingSites = pgTable("binding_sites", {
  id: serial("id").primaryKey(),
  proteinId: integer("protein_id").notNull().references(() => proteins.id),
  name: text("name").notNull(),
  description: text("description"),
  confidence: doublePrecision("confidence").notNull(),
  druggabilityScore: doublePrecision("druggability_score"),
  keyResidues: text("key_residues"),
  coordinates: jsonb("coordinates"), // JSON with 3D coordinates
});

export const insertBindingSiteSchema = createInsertSchema(bindingSites).pick({
  proteinId: true,
  name: true,
  description: true,
  confidence: true,
  druggabilityScore: true,
  keyResidues: true,
  coordinates: true,
});

// AI Analysis model
export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  proteinId: integer("protein_id").notNull().references(() => proteins.id),
  type: text("type").notNull(), // "structure_prediction", "binding_site", "drug_screening"
  status: text("status").notNull(), // "pending", "running", "completed", "failed"
  results: jsonb("results"), // JSON with analysis results
  confidence: doublePrecision("confidence"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).pick({
  proteinId: true,
  type: true,
  status: true,
  results: true,
  confidence: true,
  createdAt: true,
  updatedAt: true,
});

// Drug Candidate model
export const drugCandidates = pgTable("drug_candidates", {
  id: serial("id").primaryKey(),
  bindingSiteId: integer("binding_site_id").references(() => bindingSites.id),
  name: text("name").notNull(),
  smiles: text("smiles").notNull(), // SMILES representation of molecule
  bindingAffinity: doublePrecision("binding_affinity"),
  drugLikeness: doublePrecision("drug_likeness"),
  structure: text("structure"), // Molecular structure data
  properties: jsonb("properties"), // ADMET properties
});

export const insertDrugCandidateSchema = createInsertSchema(drugCandidates).pick({
  bindingSiteId: true,
  name: true,
  smiles: true,
  bindingAffinity: true,
  drugLikeness: true,
  structure: true,
  properties: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProtein = z.infer<typeof insertProteinSchema>;
export type Protein = typeof proteins.$inferSelect;

export type InsertBindingSite = z.infer<typeof insertBindingSiteSchema>;
export type BindingSite = typeof bindingSites.$inferSelect;

export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;

export type InsertDrugCandidate = z.infer<typeof insertDrugCandidateSchema>;
export type DrugCandidate = typeof drugCandidates.$inferSelect;
