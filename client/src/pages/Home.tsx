import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ProteinInfoBar from "@/components/ProteinInfoBar";
import ProteinViewer from "@/components/ProteinViewer";
import AnalysisPanel from "@/components/AnalysisPanel";
import StatusBar from "@/components/StatusBar";
import ProteinBrowser from "@/components/ProteinBrowser";
import { useProteinData } from "@/hooks/use-protein-data";
import { useQuery } from "@tanstack/react-query";
import { Protein } from "@shared/schema";
import { Database } from "lucide-react";

export default function Home() {
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [selectedPdbId, setSelectedPdbId] = useState("6VXX");
  
  // Fetch all available proteins
  const { data: allProteins = [] } = useQuery<Protein[]>({
    queryKey: ['/api/proteins'],
  });
  
  const { 
    protein, 
    isLoading: isLoadingProtein, 
    analyses, 
    bindingSites 
  } = useProteinData(selectedPdbId);

  // Listen for protein selection events from the sidebar
  useEffect(() => {
    const handleProteinSelect = (event: any) => {
      if (event.detail && event.detail.pdbId) {
        setSelectedPdbId(event.detail.pdbId);
      }
    };
    
    // Set the active protein ID to a global variable for the sidebar to access
    (window as any).selectedPdbId = selectedPdbId;
    
    window.addEventListener('select-protein', handleProteinSelect);
    return () => {
      window.removeEventListener('select-protein', handleProteinSelect);
    };
  }, [selectedPdbId]);
  
  const toggleAnalysisPanel = () => {
    setShowAnalysisPanel(!showAnalysisPanel);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 font-sans text-neutral-400">
      <AppHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-auto bg-neutral-100">
          <div className="flex items-center justify-between p-2">
            {protein && (
              <ProteinInfoBar 
                protein={protein} 
                isLoading={isLoadingProtein} 
              />
            )}
            <ProteinBrowser 
              onSelectProtein={(selectedProtein) => {
                setSelectedPdbId(selectedProtein.pdbId);
                // Also dispatch global event for other components
                window.dispatchEvent(new CustomEvent('select-protein', { 
                  detail: { pdbId: selectedProtein.pdbId }
                }));
              }}
              buttonText="Access All Proteins"
            />
          </div>
          
          <div className="flex-1 flex overflow-auto">
            <ProteinViewer 
              protein={protein}
              bindingSites={bindingSites}
              showAnalysisPanel={showAnalysisPanel}
              toggleAnalysisPanel={toggleAnalysisPanel}
            />
            
            {showAnalysisPanel && (
              <AnalysisPanel 
                closePanel={() => setShowAnalysisPanel(false)}
                analyses={analyses}
                bindingSites={bindingSites}
                protein={protein}
              />
            )}
          </div>
        </main>
      </div>
      
      <StatusBar />
    </div>
  );
}
