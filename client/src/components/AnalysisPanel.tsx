import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AiAnalysis, BindingSite, Protein, DrugCandidate } from "@shared/schema";
import AIAnalysisControls from "./AIAnalysisControls";
import MoleculeDesignControls from "./MoleculeDesignControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, File } from "lucide-react";

interface AnalysisPanelProps {
  closePanel: () => void;
  analyses?: AiAnalysis[];
  bindingSites?: BindingSite[];
  protein?: Protein;
}

export default function AnalysisPanel({ closePanel, analyses, bindingSites, protein }: AnalysisPanelProps) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [visualizationType, setVisualizationType] = useState("confidence");
  const [colorScheme, setColorScheme] = useState("thermal");
  
  // Find structure prediction and binding site analyses
  const structurePrediction = analyses?.find(a => a.type === "structure_prediction");
  const bindingSiteAnalysis = analyses?.find(a => a.type === "binding_site_analysis");
  
  // Get the currently selected binding site (if any exists)
  const selectedBindingSite = bindingSites && bindingSites.length > 0 ? bindingSites[0] : undefined;
  
  // Active visualizations
  const [activeVisualizations, setActiveVisualizations] = useState([
    { id: 1, name: "Binding Probability", color: "bg-success" },
    { id: 2, name: "Structure Confidence", color: "bg-primary" }
  ]);
  
  // Remove visualization
  const removeVisualization = (id: number) => {
    setActiveVisualizations(activeVisualizations.filter(v => v.id !== id));
  };
  
  // Generate report content and trigger download
  const handleDownloadReport = (analysisType: string) => {
    // Get the appropriate analysis
    const analysis = analysisType === "structure" ? structurePrediction : bindingSiteAnalysis;
    if (!analysis || !analysis.results) return;
    
    // Create the report title
    const title = analysisType === "structure" 
      ? `Structure Analysis Report for ${protein?.name || "Unknown Protein"}`
      : `Binding Site Analysis Report for ${selectedBindingSite?.name || "Unknown Binding Site"}`;
    
    // Create the report content
    let content = `${title}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Add analysis details based on type
    const results = analysis.results as any;
    
    if (analysisType === "structure" && results) {
      if (results.secondary_structure) {
        content += "SECONDARY STRUCTURE\n";
        Object.entries(results.secondary_structure).forEach(([key, value]) => {
          content += `${key.replace(/_/g, ' ')}: ${value}\n`;
        });
        content += "\n";
      }
      
      if (results.functional_domains) {
        content += "FUNCTIONAL DOMAINS\n";
        Object.entries(results.functional_domains).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            content += `${key.replace(/_/g, ' ')}:\n`;
            (value as string[]).forEach(item => content += `  - ${item}\n`);
          } else {
            content += `${key.replace(/_/g, ' ')}: ${value}\n`;
          }
        });
        content += "\n";
      }
    } else if (results) {
      if (results.pocket_characteristics) {
        content += "POCKET CHARACTERISTICS\n";
        Object.entries(results.pocket_characteristics).forEach(([key, value]) => {
          content += `${key.replace(/_/g, ' ')}: ${value}\n`;
        });
        content += "\n";
      }
      
      if (results.key_interactions) {
        content += "KEY INTERACTIONS\n";
        Object.entries(results.key_interactions).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            content += `${key.replace(/_/g, ' ')}:\n`;
            (value as string[]).forEach(item => content += `  - ${item}\n`);
          } else {
            content += `${key.replace(/_/g, ' ')}: ${value}\n`;
          }
        });
        content += "\n";
      }
    }
    
    // Create the download link
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${analysisType}-analysis-report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Render the analysis details with proper formatting
  const renderAnalysisDetails = (analysis: AiAnalysis) => {
    if (!analysis || !analysis.results) return null;
    const results = analysis.results as any;
    
    if (analysis.type === "structure_prediction") {
      return (
        <div className="space-y-4">
          {results.secondary_structure && (
            <div className="p-3 bg-neutral-50 rounded-md">
              <h5 className="text-sm font-semibold mb-2">Secondary Structure</h5>
              {Object.entries(results.secondary_structure).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          
          {results.functional_domains && (
            <div className="p-3 bg-neutral-50 rounded-md">
              <h5 className="text-sm font-semibold mb-2">Functional Domains</h5>
              {Object.entries(results.functional_domains).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</div>
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside text-sm pl-2">
                      {(value as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm pl-2">{String(value)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {results.pocket_characteristics && (
            <div className="p-3 bg-neutral-50 rounded-md">
              <h5 className="text-sm font-semibold mb-2">Pocket Characteristics</h5>
              {Object.entries(results.pocket_characteristics).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          
          {results.key_interactions && (
            <div className="p-3 bg-neutral-50 rounded-md">
              <h5 className="text-sm font-semibold mb-2">Key Interactions</h5>
              {Object.entries(results.key_interactions).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</div>
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside text-sm pl-2">
                      {(value as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm pl-2">{String(value)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };
  
  return (
    <div className="w-96 bg-white border-l border-neutral-200 flex flex-col">
      <div className="p-3 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-medium text-neutral-700">AI Analysis</h3>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="p-1 hover:bg-neutral-100 rounded-md">
            <i className="mdi mdi-refresh text-neutral-500"></i>
          </Button>
          <Button variant="ghost" size="icon" className="p-1 hover:bg-neutral-100 rounded-md" onClick={closePanel}>
            <i className="mdi mdi-close text-neutral-500"></i>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
            <TabsTrigger value="run">Run Analysis</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="flex-1 overflow-auto">
          {/* Structure Prediction Section */}
          <div className="px-3 py-4 border-b border-neutral-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-neutral-700">Structure Prediction</h4>
              {structurePrediction && (
                <Badge variant="outline" className="px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                  Completed
                </Badge>
              )}
            </div>
            
            {structurePrediction && structurePrediction.results && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-neutral-500">Overall Confidence</label>
                    <span className="text-xs font-medium text-success">
                      {structurePrediction.confidence ? (structurePrediction.confidence * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={structurePrediction.confidence ? structurePrediction.confidence * 100 : 0}
                    className="h-2 bg-neutral-200"
                  />
                </div>
                
                {/* Add View Report Button */}
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Detailed Report
                </Button>
              </div>
            )}
            
            {!structurePrediction && (
              <div className="text-center py-6">
                <div className="text-neutral-400 mb-2">
                  <i className="mdi mdi-molecule-co2 text-3xl"></i>
                </div>
                <p className="text-sm text-neutral-500">No structure prediction available.</p>
                <p className="text-xs text-neutral-400 mt-1">Run AI analysis to predict the protein structure.</p>
              </div>
            )}
          </div>
          
          {/* Binding Sites Section */}
          <div className="px-3 py-4 border-b border-neutral-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-neutral-700">Binding Sites</h4>
              <span className="text-xs text-neutral-500">{bindingSites?.length || 0} detected</span>
            </div>
            
            {bindingSites && bindingSites.length > 0 ? (
              <div className="space-y-3">
                {bindingSites.map(site => (
                  <div key={site.id} className="border border-neutral-200 rounded-md p-2">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">{site.name}</h5>
                      <Badge className="text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 border-none">
                        {(site.druggabilityScore || 0) >= 0.7 ? "High" : "Medium"}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-neutral-500">Druggability Score</label>
                        <span className="text-xs font-medium text-primary">
                          {((site.druggabilityScore || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={(site.druggabilityScore || 0) * 100} className="h-2 bg-neutral-200" />
                    </div>
                    <div className="mt-2 text-xs text-neutral-600">
                      <span className="font-medium block">Key Residues:</span>
                      <span className="font-mono">{site.keyResidues || "Not specified"}</span>
                    </div>
                    
                    {/* Add View Report Button */}
                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                      View Detailed Analysis
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-neutral-400 mb-2">
                  <i className="mdi mdi-target text-3xl"></i>
                </div>
                <p className="text-sm text-neutral-500">No binding sites detected yet.</p>
                <p className="text-xs text-neutral-400 mt-1">Run binding site analysis to identify potential drug targets.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="detailed" className="flex-1 overflow-auto">
          <div className="p-3">
            <h4 className="text-sm font-semibold mb-4">Detailed Analysis Reports</h4>
            
            {/* Structure Prediction Report */}
            {structurePrediction && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium">Structure Prediction Report</h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadReport("structure")}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  {renderAnalysisDetails(structurePrediction)}
                </div>
              </div>
            )}
            
            {/* Binding Site Analysis Report */}
            {bindingSiteAnalysis && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium">Binding Site Analysis Report</h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadReport("binding")}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  {renderAnalysisDetails(bindingSiteAnalysis)}
                </div>
              </div>
            )}
            
            {/* No Reports Available */}
            {!structurePrediction && !bindingSiteAnalysis && (
              <div className="text-center py-10">
                <File className="mx-auto h-10 w-10 text-neutral-300 mb-3" />
                <h5 className="text-base font-medium mb-2">No Analysis Reports Available</h5>
                <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
                  Run an analysis first to generate detailed reports that can be viewed and downloaded.
                </p>
                <Button>Run Analysis</Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="run" className="flex-1 overflow-auto">
          <div className="p-3">
            <h4 className="text-sm font-semibold mb-2">Run Analysis</h4>
            <p className="text-xs text-neutral-500 mb-4">
              Generate detailed reports using advanced AI analysis tools
            </p>
            
            <div className="space-y-4">
              {/* Structure Analysis */}
              <div className="border rounded-md p-3">
                <h5 className="text-sm font-medium mb-2">Protein Structure Analysis</h5>
                <p className="text-xs text-neutral-500 mb-3">
                  Analyze protein structure to understand key domains and binding potential
                </p>
                <AIAnalysisControls protein={protein} />
              </div>
              
              {/* Binding Site Analysis */}
              {selectedBindingSite && (
                <div className="border rounded-md p-3">
                  <h5 className="text-sm font-medium mb-2">Binding Site Analysis</h5>
                  <p className="text-xs text-neutral-500 mb-3">
                    Analyze the selected binding site for druggability and key interactions
                  </p>
                  <AIAnalysisControls protein={protein} bindingSite={selectedBindingSite} />
                </div>
              )}
              
              {/* Drug Candidate Generation */}
              {selectedBindingSite && (
                <div className="border rounded-md p-3">
                  <h5 className="text-sm font-medium mb-2">Drug Candidate Generation</h5>
                  <p className="text-xs text-neutral-500 mb-3">
                    Generate and optimize potential drug candidates for the binding site
                  </p>
                  <MoleculeDesignControls bindingSiteId={selectedBindingSite.id} />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}