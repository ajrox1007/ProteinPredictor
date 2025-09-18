import { useQuery } from '@tanstack/react-query';
import { proteinService } from '@/lib/proteinService';
import { Protein, BindingSite, AiAnalysis } from '@shared/schema';

export function useProteinData(pdbId: string) {
  // Fetch protein details
  const { 
    data: protein,
    isLoading: isLoadingProtein,
    error: proteinError
  } = useQuery<Protein>({
    queryKey: [`/api/proteins/pdb/${pdbId}`],
    enabled: !!pdbId
  });
  
  // Fetch binding sites for the protein
  const {
    data: bindingSites = [],
    isLoading: isLoadingBindingSites,
    error: bindingSitesError
  } = useQuery<BindingSite[]>({
    queryKey: [`/api/proteins/${protein?.id}/binding-sites`],
    enabled: !!protein?.id
  });
  
  // Fetch AI analyses for the protein
  const {
    data: analyses = [],
    isLoading: isLoadingAnalyses,
    error: analysesError
  } = useQuery<AiAnalysis[]>({
    queryKey: [`/api/proteins/${protein?.id}/ai-analyses`],
    enabled: !!protein?.id
  });
  
  return {
    protein,
    isLoading: isLoadingProtein,
    error: proteinError,
    bindingSites,
    isLoadingBindingSites,
    bindingSitesError,
    analyses,
    isLoadingAnalyses,
    analysesError
  };
}
