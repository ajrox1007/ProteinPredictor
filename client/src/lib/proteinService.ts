import { apiRequest } from '@/lib/queryClient';
import { 
  Protein, 
  BindingSite, 
  AiAnalysis, 
  DrugCandidate 
} from '@shared/schema';

// Service for interacting with protein-related API endpoints
export const proteinService = {
  // Get a protein by its PDB ID
  async getProteinByPdbId(pdbId: string): Promise<Protein> {
    const res = await apiRequest('GET', `/api/proteins/pdb/${pdbId}`);
    return res.json();
  },
  
  // Get recent proteins
  async getRecentProteins(limit = 5): Promise<Protein[]> {
    const res = await apiRequest('GET', `/api/proteins/recent?limit=${limit}`);
    return res.json();
  },
  
  // Get binding sites for a protein
  async getBindingSites(proteinId: number): Promise<BindingSite[]> {
    const res = await apiRequest('GET', `/api/proteins/${proteinId}/binding-sites`);
    return res.json();
  },
  
  // Get AI analyses for a protein
  async getAiAnalyses(proteinId: number): Promise<AiAnalysis[]> {
    const res = await apiRequest('GET', `/api/proteins/${proteinId}/ai-analyses`);
    return res.json();
  },
  
  // Start a new AI analysis
  async startAnalysis(
    proteinId: number, 
    type: 'structure_prediction' | 'binding_site' | 'drug_screening'
  ): Promise<AiAnalysis> {
    const res = await apiRequest('POST', '/api/ai-analyses', {
      proteinId,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return res.json();
  },
  
  // Get drug candidates for a binding site
  async getDrugCandidates(bindingSiteId: number): Promise<DrugCandidate[]> {
    const res = await apiRequest('GET', `/api/binding-sites/${bindingSiteId}/drug-candidates`);
    return res.json();
  },
  
  // Start drug candidate screening
  async startDrugScreening(bindingSiteId: number): Promise<{ jobId: string }> {
    const res = await apiRequest('POST', '/api/drug-screening', { bindingSiteId });
    return res.json();
  },
  
  // Get system status (AI models, GPU, database connections)
  async getSystemStatus(): Promise<any> {
    const res = await apiRequest('GET', '/api/system/status');
    return res.json();
  },
  
  // Fetch a 3D structure file (PDB format)
  async fetchStructureFile(pdbId: string): Promise<string> {
    const res = await apiRequest('GET', `/api/structures/${pdbId}`);
    return res.text();
  }
};
