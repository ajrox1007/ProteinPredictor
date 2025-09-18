import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Protein, BindingSite } from "@shared/schema";

interface AIAnalysisControlsProps {
  protein?: Protein;
  bindingSite?: BindingSite;
  onAnalysisComplete?: () => void;
}

export default function AIAnalysisControls({ 
  protein, 
  bindingSite, 
  onAnalysisComplete 
}: AIAnalysisControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for protein structure analysis
  const proteinAnalysisMutation = useMutation({
    mutationFn: async (proteinId: number) => {
      return fetch(`/api/proteins/${proteinId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }).then(res => {
        if (!res.ok) throw new Error("Failed to analyze protein");
        return res.json();
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Protein structure analysis completed successfully.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/proteins/${protein?.id}/ai-analyses`] });
      if (onAnalysisComplete) onAnalysisComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze protein structure.",
        variant: "destructive"
      });
    }
  });

  // Mutation for binding site analysis
  const bindingSiteAnalysisMutation = useMutation({
    mutationFn: async (bindingSiteId: number) => {
      return fetch(`/api/binding-sites/${bindingSiteId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }).then(res => {
        if (!res.ok) throw new Error("Failed to analyze binding site");
        return res.json();
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Binding site analysis completed successfully.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/proteins/${protein?.id}/ai-analyses`] });
      if (onAnalysisComplete) onAnalysisComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze binding site.",
        variant: "destructive"
      });
    }
  });

  // Mutation for drug candidate generation
  const drugGenerationMutation = useMutation({
    mutationFn: async (bindingSiteId: number) => {
      return fetch(`/api/binding-sites/${bindingSiteId}/generate-drugs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }).then(res => {
        if (!res.ok) throw new Error("Failed to generate drug candidates");
        return res.json();
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Drug Candidates Generated",
        description: `Successfully generated ${data.drugCandidates?.length || 0} drug candidates.`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/binding-sites/${bindingSite?.id}/drug-candidates`] });
      if (onAnalysisComplete) onAnalysisComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate drug candidates.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">AI Analysis Tools</h3>
      
      <div className="space-y-2">
        {protein && (
          <Button
            onClick={() => proteinAnalysisMutation.mutate(protein.id)}
            disabled={proteinAnalysisMutation.isPending}
            className="w-full justify-start"
            variant="outline"
          >
            <i className="mdi mdi-dna mr-2 text-primary"></i>
            {proteinAnalysisMutation.isPending ? "Analyzing..." : "Analyze Protein Structure"}
          </Button>
        )}
        
        {bindingSite && (
          <>
            <Button
              onClick={() => bindingSiteAnalysisMutation.mutate(bindingSite.id)}
              disabled={bindingSiteAnalysisMutation.isPending}
              className="w-full justify-start"
              variant="outline"
            >
              <i className="mdi mdi-target mr-2 text-primary"></i>
              {bindingSiteAnalysisMutation.isPending ? "Analyzing..." : "Analyze Binding Site"}
            </Button>
            
            <Button
              onClick={() => drugGenerationMutation.mutate(bindingSite.id)}
              disabled={drugGenerationMutation.isPending}
              className="w-full justify-start"
              variant="outline"
            >
              <i className="mdi mdi-flask-outline mr-2 text-primary"></i>
              {drugGenerationMutation.isPending ? "Generating..." : "Generate Drug Candidates"}
            </Button>
          </>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        All analyses are performed using state-of-the-art AI models from OpenAI.
      </div>
    </div>
  );
}