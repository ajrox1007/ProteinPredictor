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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function DrugScreening() {
  const { toast } = useToast();
  const [selectedBindingSite, setSelectedBindingSite] = useState("rbd1");
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState(0);
  
  // Simulate screening process
  const runScreening = () => {
    setIsScreening(true);
    setScreeningProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setScreeningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScreening(false);
          toast({
            title: "Screening Complete",
            description: "Drug candidate screening has been completed successfully.",
            variant: "default"
          });
          return 100;
        }
        return prev + 2;
      });
    }, 300);
  };
  
  return (
    <div className="flex flex-col h-screen bg-neutral-50 font-sans text-neutral-400">
      <AppHeader />
      
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-6">Drug Candidate Screening</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Drug Design</CardTitle>
                  <CardDescription>
                    Design novel drug candidates for your target binding sites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Binding Site</label>
                      <Select 
                        value={selectedBindingSite} 
                        onValueChange={setSelectedBindingSite}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a binding site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rbd1">RBD Binding Site 1 (SARS-CoV-2)</SelectItem>
                          <SelectItem value="catalytic">Catalytic Pocket (ACE2)</SelectItem>
                          <SelectItem value="allosteric">Allosteric Site (Insulin Receptor)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Tabs defaultValue="generate" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="generate">Generate New</TabsTrigger>
                        <TabsTrigger value="optimize">Optimize Existing</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="generate" className="space-y-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Molecular Weight (Da)</label>
                              <div className="flex space-x-2">
                                <input 
                                  type="number" 
                                  className="w-full p-2 border border-neutral-200 rounded-md"
                                  placeholder="Min"
                                  defaultValue={300}
                                />
                                <input 
                                  type="number" 
                                  className="w-full p-2 border border-neutral-200 rounded-md"
                                  placeholder="Max"
                                  defaultValue={500}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">LogP</label>
                              <div className="flex space-x-2">
                                <input 
                                  type="number" 
                                  className="w-full p-2 border border-neutral-200 rounded-md"
                                  placeholder="Min"
                                  defaultValue={1}
                                  step={0.1}
                                />
                                <input 
                                  type="number" 
                                  className="w-full p-2 border border-neutral-200 rounded-md"
                                  placeholder="Max"
                                  defaultValue={5}
                                  step={0.1}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">H-Bond Donors</label>
                              <input 
                                type="number" 
                                className="w-full p-2 border border-neutral-200 rounded-md"
                                placeholder="Max"
                                defaultValue={5}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">H-Bond Acceptors</label>
                              <input 
                                type="number" 
                                className="w-full p-2 border border-neutral-200 rounded-md"
                                placeholder="Max"
                                defaultValue={10}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Generation Strategy</label>
                            <Select defaultValue="scaffold">
                              <SelectTrigger>
                                <SelectValue placeholder="Select generation strategy" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="denovo">De Novo Design</SelectItem>
                                <SelectItem value="scaffold">Scaffold-Based</SelectItem>
                                <SelectItem value="fragment">Fragment-Based</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={runScreening}
                          disabled={isScreening}
                        >
                          {isScreening ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Candidates...
                            </>
                          ) : 'Generate Drug Candidates'}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="optimize" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Drug Candidate</label>
                            <Select defaultValue="compound1">
                              <SelectTrigger>
                                <SelectValue placeholder="Select a compound" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compound1">Compound-RBD-001</SelectItem>
                                <SelectItem value="compound2">Compound-RBD-002</SelectItem>
                                <SelectItem value="compound3">Compound-RBD-003</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Optimization Goals</label>
                            <textarea 
                              className="w-full h-24 p-2 border border-neutral-200 rounded-md resize-none"
                              placeholder="Describe what properties you want to optimize..."
                              defaultValue="Improve solubility while maintaining binding affinity above 0.8"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Optimization Strategy</label>
                            <Select defaultValue="multiobj">
                              <SelectTrigger>
                                <SelectValue placeholder="Select optimization strategy" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiobj">Multi-objective</SelectItem>
                                <SelectItem value="binding">Binding affinity focus</SelectItem>
                                <SelectItem value="admet">ADMET properties focus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={runScreening}
                          disabled={isScreening}
                        >
                          {isScreening ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Optimizing Molecule...
                            </>
                          ) : 'Optimize Drug Candidate'}
                        </Button>
                      </TabsContent>
                    </Tabs>
                    
                    {isScreening && (
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Screening Progress</span>
                          <span>{screeningProgress}%</span>
                        </div>
                        <Progress value={screeningProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Drug Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-neutral-200 rounded-md bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-neutral-800">Compound-RBD-001</h3>
                          <p className="text-xs text-neutral-500">SMILES: CC1=CC=C(C=C1)NC(=O)CN1CCN(CC1)CC1=CC=NC=C1</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Analyze</Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-neutral-50 rounded-md">
                          <div className="font-medium text-neutral-700">Binding Affinity</div>
                          <div className="text-neutral-600">0.87</div>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-md">
                          <div className="font-medium text-neutral-700">Drug-likeness</div>
                          <div className="text-neutral-600">0.92</div>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-md">
                          <div className="font-medium text-neutral-700">Synthetic Accessibility</div>
                          <div className="text-neutral-600">0.78</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-md bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-neutral-800">Compound-RBD-002</h3>
                          <p className="text-xs text-neutral-500">SMILES: O=C(NC1CCNCC1)C1=CC=CC=C1N1CCNCC1</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Analyze</Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-neutral-50 rounded-md">
                          <div className="font-medium text-neutral-700">Binding Affinity</div>
                          <div className="text-neutral-600">0.81</div>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-md">
                          <div className="font-medium text-neutral-700">Drug-likeness</div>
                          <div className="text-neutral-600">0.89</div>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-md">
                          <div className="font-medium text-neutral-700">Synthetic Accessibility</div>
                          <div className="text-neutral-600">0.82</div>
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
                  <CardTitle>Drug Design Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mr-3 bg-primary/10 p-2 rounded-md text-primary">
                        <i className="mdi mdi-flask-empty-outline text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700">Generative AI Design</h3>
                        <p className="text-xs text-neutral-500">
                          Generate novel molecules with desired properties using advanced AI models
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="mr-3 bg-primary/10 p-2 rounded-md text-primary">
                        <i className="mdi mdi-tune-vertical text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700">Multi-parameter Optimization</h3>
                        <p className="text-xs text-neutral-500">
                          Optimize multiple molecular properties simultaneously to meet design criteria
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="mr-3 bg-primary/10 p-2 rounded-md text-primary">
                        <i className="mdi mdi-chart-bell-curve text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700">ADMET Prediction</h3>
                        <p className="text-xs text-neutral-500">
                          Predict absorption, distribution, metabolism, excretion, and toxicity properties
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Screening Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Molecules Generated</span>
                      <span className="font-medium text-neutral-800">124</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Promising Candidates</span>
                      <span className="font-medium text-neutral-800">8</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Binding Affinity</span>
                      <span className="font-medium text-neutral-800">0.76</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        Export Results
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