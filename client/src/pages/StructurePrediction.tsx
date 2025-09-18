import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import { useProteinData } from "@/hooks/use-protein-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function StructurePrediction() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState("alphafold");
  const [pdbId, setPdbId] = useState("");
  const [sequenceInput, setSequenceInput] = useState("");
  
  // Simulate prediction process
  const runPrediction = () => {
    if (!sequenceInput.trim() && !pdbId.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a protein sequence or PDB ID",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          toast({
            title: "Structure Prediction Complete",
            description: "Your protein structure has been successfully predicted.",
            variant: "default"
          });
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };
  
  return (
    <div className="flex flex-col h-screen bg-neutral-50 font-sans text-neutral-400">
      <AppHeader />
      
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-6">Structure Prediction</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Structure Prediction</CardTitle>
                <CardDescription>
                  Use state-of-the-art AI models to predict protein structure from sequence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sequence" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="sequence">From Sequence</TabsTrigger>
                    <TabsTrigger value="pdb">From PDB ID</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sequence" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sequence-input">Protein Sequence</Label>
                      <textarea 
                        id="sequence-input"
                        className="w-full h-32 p-2 border border-neutral-200 rounded-md"
                        placeholder="Enter protein sequence (FASTA format)"
                        value={sequenceInput}
                        onChange={(e) => setSequenceInput(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdb" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pdb-id">PDB ID</Label>
                      <Input 
                        id="pdb-id"
                        placeholder="e.g., 6VXX"
                        value={pdbId}
                        onChange={(e) => setPdbId(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-select">Prediction Model</Label>
                      <Select 
                        value={selectedModel} 
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger id="model-select">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alphafold">AlphaFold 2.3.1</SelectItem>
                          <SelectItem value="esm">ESM-Fold</SelectItem>
                          <SelectItem value="rosetta">RoseTTAFold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={runPrediction}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Predicting Structure...
                        </>
                      ) : 'Run Prediction'}
                    </Button>
                    
                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Progress</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>
                  Your recent structure prediction jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-neutral-800">SARS-CoV-2 Spike</h3>
                        <p className="text-xs text-neutral-500">PDB ID: 6VXX • May 18, 2025</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    <div className="mt-2 text-xs text-neutral-600">
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium">AlphaFold 2.3.1</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-neutral-800">Human Insulin Receptor</h3>
                        <p className="text-xs text-neutral-500">PDB ID: 1IR3 • May 15, 2025</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    <div className="mt-2 text-xs text-neutral-600">
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium">ESM-Fold</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <StatusBar />
    </div>
  );
}