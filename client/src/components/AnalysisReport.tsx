import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, ChevronRight } from "lucide-react";
import { AiAnalysis, BindingSite } from "@shared/schema";

interface AnalysisReportProps {
  analysis: AiAnalysis;
  bindingSite?: BindingSite;
}

export default function AnalysisReport({ analysis, bindingSite }: AnalysisReportProps) {
  if (!analysis || !analysis.results) {
    return (
      <div className="p-6 text-center">
        <p>No analysis data available.</p>
      </div>
    );
  }

  // Parse the results based on analysis type
  const results = analysis.results as any;
  const analysisType = analysis.type;

  const handleDownloadPDF = () => {
    // Generate PDF content
    const analysisData = JSON.stringify(results, null, 2);
    const title = bindingSite 
      ? `Analysis Report: ${bindingSite.name}`
      : `Analysis Report: ${analysisType}`;

    // Create a hidden link element and trigger download
    const element = document.createElement("a");
    
    // Convert JSON data to readable text
    let content = `${title}\n\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    if (analysisType === "binding_site_analysis") {
      // Format binding site analysis data
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
      
      if (results.drug_development_challenges) {
        content += "DRUG DEVELOPMENT CHALLENGES\n";
        Object.entries(results.drug_development_challenges).forEach(([key, value]) => {
          content += `${key.replace(/_/g, ' ')}: ${value}\n`;
        });
        content += "\n";
      }
      
      if (results.drug_recommendations) {
        content += "DRUG RECOMMENDATIONS\n";
        Object.entries(results.drug_recommendations).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            content += `${key.replace(/_/g, ' ')}:\n`;
            (value as string[]).forEach(item => content += `  - ${item}\n`);
          } else {
            content += `${key.replace(/_/g, ' ')}: ${value}\n`;
          }
        });
      }
    } else if (analysisType === "structure_prediction") {
      // Format structure prediction data
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
      
      if (results.stability_assessment) {
        content += "STABILITY ASSESSMENT\n";
        Object.entries(results.stability_assessment).forEach(([key, value]) => {
          content += `${key.replace(/_/g, ' ')}: ${value}\n`;
        });
        content += "\n";
      }
      
      if (results.binding_sites) {
        content += "PREDICTED BINDING SITES\n";
        Object.entries(results.binding_sites).forEach(([siteKey, siteValue]) => {
          content += `${siteKey}:\n`;
          Object.entries(siteValue as object).forEach(([key, value]) => {
            content += `  ${key.replace(/_/g, ' ')}: ${value}\n`;
          });
          content += "\n";
        });
      }
    }
    
    // Create blob with the formatted content
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${analysisType.replace(/_/g, '-')}-report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Render structure prediction analysis
  const renderStructurePrediction = () => {
    return (
      <div className="space-y-6">
        {results.secondary_structure && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Secondary Structure</h4>
            <div className="space-y-2">
              {Object.entries(results.secondary_structure).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm border-b pb-1 last:border-0">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.functional_domains && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Functional Domains</h4>
            <div className="space-y-3">
              {Object.entries(results.functional_domains).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize text-sm">{key.replace(/_/g, ' ')}</div>
                  {Array.isArray(value) ? (
                    <ul className="list-disc pl-5 text-sm">
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
          </div>
        )}

        {results.stability_assessment && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Stability Assessment</h4>
            <div className="space-y-2">
              {Object.entries(results.stability_assessment).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm border-b pb-1 last:border-0">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.binding_sites && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Predicted Binding Sites</h4>
            {Object.entries(results.binding_sites).map(([siteKey, siteValue]) => (
              <div key={siteKey} className="mb-4 last:mb-0">
                <h5 className="font-medium text-md mb-2 capitalize">{siteKey.replace(/_/g, ' ')}</h5>
                <div className="space-y-1 pl-4">
                  {Object.entries(siteValue as object).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="capitalize font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render binding site analysis
  const renderBindingSiteAnalysis = () => {
    return (
      <div className="space-y-6">
        {results.pocket_characteristics && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Pocket Characteristics</h4>
            <div className="space-y-2">
              {Object.entries(results.pocket_characteristics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm border-b pb-1 last:border-0">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.key_interactions && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Key Interactions</h4>
            <div className="space-y-3">
              {Object.entries(results.key_interactions).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize text-sm">{key.replace(/_/g, ' ')}</div>
                  {Array.isArray(value) ? (
                    <ul className="list-disc pl-5 text-sm">
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
          </div>
        )}

        {results.drug_development_challenges && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Drug Development Challenges</h4>
            <div className="space-y-2">
              {Object.entries(results.drug_development_challenges).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm border-b pb-1 last:border-0">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.drug_recommendations && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-lg font-semibold mb-3">Drug Recommendations</h4>
            <div className="space-y-3">
              {Object.entries(results.drug_recommendations).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize text-sm">{key.replace(/_/g, ' ')}</div>
                  {Array.isArray(value) ? (
                    <ul className="list-disc pl-5 text-sm">
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {analysisType === "binding_site_analysis" 
            ? "Binding Site Analysis Report" 
            : "Structure Prediction Report"}
        </h3>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2">
          <Download size={16} />
          <span>Download Report</span>
        </Button>
      </div>
      
      <div className="bg-muted/40 p-3 rounded-md flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-1.5 rounded">
          <FileText size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {analysisType === "binding_site_analysis" 
              ? bindingSite?.name || "Binding Site Analysis" 
              : "Structure Prediction"}
          </p>
          <p className="text-xs text-muted-foreground">
            Analysis confidence: {(analysis.confidence || 0) * 100}%
          </p>
        </div>
        <div className="text-primary text-sm font-medium">
          {analysis.status === "completed" ? "Complete" : "In Progress"}
        </div>
      </div>

      {analysisType === "structure_prediction" 
        ? renderStructurePrediction() 
        : renderBindingSiteAnalysis()}
    </div>
  );
}