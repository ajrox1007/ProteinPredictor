import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function BindingSiteAnalysis() {
  const { toast } = useToast();
  const [selectedProtein, setSelectedProtein] = useState("6vxx");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Simulate analysis process
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          toast({
            title: "Analysis Complete",
            description: "Binding site analysis has been successfully completed.",
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
          <h1 className="text-2xl font-semibold text-neutral-800 mb-6">Binding Site Analysis</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Protein Binding Site Identification</CardTitle>
                  <CardDescription>
                    Identify potential binding sites using AI-powered analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Protein</label>
                      <Select 
                        value={selectedProtein} 
                        onValueChange={setSelectedProtein}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a protein" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6vxx">SARS-CoV-2 Spike (6VXX)</SelectItem>
                          <SelectItem value="1r42">Human ACE2 (1R42)</SelectItem>
                          <SelectItem value="1ir3">Insulin Receptor (1IR3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Tabs defaultValue="automatic" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="automatic">Automatic Detection</TabsTrigger>
                        <TabsTrigger value="manual">Manual Selection</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="automatic" className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-neutral-600">
                            Use our AI algorithms to automatically detect potential binding sites based on structural and biochemical properties.
                          </p>
                          
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">Detection Sensitivity</label>
                              <span className="text-xs font-medium">Medium</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="3" 
                              defaultValue="2"
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>Low</span>
                              <span>Medium</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={runAnalysis}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : 'Run Binding Site Analysis'}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-neutral-600">
                            Manually select residues or regions of interest to analyze as potential binding sites.
                          </p>
                          
                          <div className="p-4 border border-neutral-200 rounded-md bg-neutral-50">
                            <div className="text-sm font-medium mb-2">Selected Residues</div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">GLU 484</Badge>
                              <Badge variant="outline">LYS 417</Badge>
                              <Badge variant="outline">TYR 453</Badge>
                              <Badge variant="outline">+ Add</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={runAnalysis}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : 'Analyze Selected Residues'}
                        </Button>
                      </TabsContent>
                    </Tabs>
                    
                    {isAnalyzing && (
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Analysis Progress</span>
                          <span>{analysisProgress}%</span>
                        </div>
                        <Progress value={analysisProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recently Analyzed Binding Sites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-800">RBD Binding Site 1</h3>
                          <p className="text-xs text-neutral-500">SARS-CoV-2 Spike • May 18, 2025</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Analyze</Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-neutral-600">
                        <div className="flex justify-between">
                          <span>Druggability Score:</span>
                          <span className="font-medium">0.82</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Key residues:</span>
                          <span className="font-medium">K417, F486, Y489, Q493, Q498</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-800">Catalytic Pocket</h3>
                          <p className="text-xs text-neutral-500">Human ACE2 • May 15, 2025</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Analyze</Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-neutral-600">
                        <div className="flex justify-between">
                          <span>Druggability Score:</span>
                          <span className="font-medium">0.75</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Key residues:</span>
                          <span className="font-medium">H374, E375, H378, E402, H505</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Analysis Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mr-3 bg-primary/10 p-2 rounded-md text-primary">
                        <i className="mdi mdi-magnify-scan text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700">Automatic Detection</h3>
                        <p className="text-xs text-neutral-500">
                          AI algorithms identify potential binding sites based on structural features and biochemical properties
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="mr-3 bg-primary/10 p-2 rounded-md text-primary">
                        <i className="mdi mdi-chart-bar text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700">Druggability Assessment</h3>
                        <p className="text-xs text-neutral-500">
                          Calculate druggability scores to evaluate binding sites as potential drug targets
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="mr-3 bg-primary/10 p-2 rounded-md text-primary">
                        <i className="mdi mdi-molecule text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700">Pharmacophore Mapping</h3>
                        <p className="text-xs text-neutral-500">
                          Generate pharmacophore models based on the binding site properties
                        </p>
                      </div>
                    </li>
                  </ul>
                  
                  <Separator className="my-4" />
                  
                  <div className="rounded-md bg-neutral-50 p-3 border border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-700 mb-1">Analysis Method</h3>
                    <p className="text-xs text-neutral-600">
                      Our AI-powered binding site analysis combines geometric algorithms, energy calculations, and machine learning to identify and characterize potential binding sites with high accuracy.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Binding Site Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Binding Sites</span>
                      <span className="font-medium text-neutral-800">12</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Druggability Sites</span>
                      <span className="font-medium text-neutral-800">4</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Analysis Success Rate</span>
                      <span className="font-medium text-neutral-800">92%</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        View Detailed Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <StatusBar />
    </div>
  );
}