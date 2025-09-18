import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { DrugCandidate } from '@shared/schema';

interface MoleculeDesignControlsProps {
  bindingSiteId?: number;
  drugCandidates?: DrugCandidate[];
  onDesignComplete?: () => void;
}

export default function MoleculeDesignControls({
  bindingSiteId,
  drugCandidates = [],
  onDesignComplete
}: MoleculeDesignControlsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationGoals, setOptimizationGoals] = useState("");
  const [selectedDrugCandidate, setSelectedDrugCandidate] = useState<number | null>(null);
  const [generatedMolecules, setGeneratedMolecules] = useState<DrugCandidate[]>([]);

  const handleGenerateMolecules = async () => {
    if (!bindingSiteId) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/binding-sites/${bindingSiteId}/generate-drugs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      setGeneratedMolecules(data.drugCandidates || []);
      
      if (onDesignComplete) {
        onDesignComplete();
      }
    } catch (error) {
      console.error("Error generating molecules:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeMolecule = async () => {
    if (!selectedDrugCandidate) {
      alert("Please select a drug candidate to optimize");
      return;
    }
    
    if (!optimizationGoals.trim()) {
      alert("Please specify optimization goals");
      return;
    }
    
    setIsOptimizing(true);
    try {
      const response = await fetch(`/api/drug-candidates/${selectedDrugCandidate}/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          optimizationGoals
        })
      });
      
      const data = await response.json();
      alert("Molecule optimized successfully!");
      
      if (onDesignComplete) {
        onDesignComplete();
      }
    } catch (error) {
      console.error("Error optimizing molecule:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="mt-4">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="generate" className="flex-1">Generate Molecules</TabsTrigger>
          <TabsTrigger value="optimize" className="flex-1">Optimize Molecules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-2">
          <Card className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Generate Novel Drug Molecules</h4>
              <p className="text-xs text-gray-500">
                Use AI to design new molecules that target the selected binding site.
              </p>
            </div>
            
            <Button 
              onClick={handleGenerateMolecules}
              disabled={!bindingSiteId || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <span className="mr-2">Generating...</span>
                  <Progress value={60} className="w-[80px] h-[4px]" />
                </>
              ) : (
                "Generate Novel Molecules"
              )}
            </Button>
            
            {generatedMolecules.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Generated Molecules</h5>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {generatedMolecules.map(molecule => (
                    <div key={molecule.id} className="p-2 bg-blue-50 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{molecule.name}</span>
                        <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                          Score: {(molecule.drugLikeness || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs mt-1 font-mono overflow-hidden text-ellipsis">
                        {molecule.smiles}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="optimize" className="mt-2">
          <Card className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Optimize Existing Molecules</h4>
              <p className="text-xs text-gray-500">
                Use AI to improve the properties of an existing molecule.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="molecule-select">Select a molecule to optimize</Label>
                <select 
                  id="molecule-select"
                  className="w-full border border-gray-300 rounded p-2 mt-1"
                  onChange={(e) => setSelectedDrugCandidate(Number(e.target.value))}
                  value={selectedDrugCandidate || ""}
                >
                  <option value="">Select a molecule</option>
                  {drugCandidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="optimization-goals">Optimization Goals</Label>
                <Textarea 
                  id="optimization-goals"
                  placeholder="e.g., Improve solubility while maintaining binding affinity"
                  className="mt-1"
                  value={optimizationGoals}
                  onChange={(e) => setOptimizationGoals(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleOptimizeMolecule}
                disabled={!selectedDrugCandidate || !optimizationGoals.trim() || isOptimizing}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <span className="mr-2">Optimizing...</span>
                    <Progress value={75} className="w-[80px] h-[4px]" />
                  </>
                ) : (
                  "Optimize Molecule"
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}