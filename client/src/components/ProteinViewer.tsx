import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import pdbLoader from "../lib/pdbLoader";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Protein, BindingSite } from "@shared/schema";
import { useVisualization } from "@/hooks/use-visualization";

interface ProteinViewerProps {
  protein?: Protein;
  bindingSites?: BindingSite[];
  showAnalysisPanel: boolean;
  toggleAnalysisPanel: () => void;
}

// Residue information shown when hovering over a protein residue
interface ResidueInfo {
  id: string;
  chain: string;
  type: string;
  secondaryStructure: string;
  solventAccessibility: string;
  aiPrediction: {
    confidence: number;
    description: string;
  };
}

export default function ProteinViewer({ 
  protein, 
  bindingSites, 
  showAnalysisPanel, 
  toggleAnalysisPanel 
}: ProteinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredResidue, setHoveredResidue] = useState<ResidueInfo | null>(null);
  const { initialize, changeRepresentation, toggleBindingSites, toggleSurface } = useVisualization();

  // Example hover info (in a real app, this would be from the 3D viewer events)
  const sampleResidueInfo: ResidueInfo = {
    id: "GLU 484",
    chain: "A",
    type: "Glutamic Acid",
    secondaryStructure: "α-helix",
    solventAccessibility: "23.4%",
    aiPrediction: {
      confidence: 0.8,
      description: "High probability binding site residue"
    }
  };

  // Initialize 3D viewer
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize Three.js scene with white background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 15; // Position camera farther back for better view
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    
    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light for highlights and shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Add a subtle hemisphere light for better color gradation
    const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202050, 0.5);
    scene.add(hemisphereLight);
    
    // Add loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.style.position = 'absolute';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.color = 'white';
    loadingElement.style.fontWeight = 'bold';
    loadingElement.style.fontSize = '16px';
    loadingElement.innerText = 'Loading protein structure...';
    containerRef.current.appendChild(loadingElement);
    
    // Get binding sites for highlighting
    const bindingSiteData = bindingSites || [];
    
    // Load the actual protein structure from PDB using our PDBLoader
    const pdbId = protein?.pdbId || '6VXX'; // Use SARS-CoV-2 spike as fallback
    
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    // Load the protein structure
    pdbLoader.createProteinVisualization(pdbId, scene, bindingSiteData)
      .then(result => {
        if (!isMounted) return;
        
        // Remove loading indicator when done
        if (containerRef.current && containerRef.current.contains(loadingElement)) {
          containerRef.current.removeChild(loadingElement);
        }
        
        // Setup raycasting for hover interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onMouseMove = (event: MouseEvent) => {
          if (!containerRef.current) return;
          
          // Calculate mouse position in normalized device coordinates
          const rect = containerRef.current.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          
          // Update the raycaster
          raycaster.setFromCamera(mouse, camera);
          
          // Find intersects with residue objects
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          for (const intersect of intersects) {
            const object = intersect.object;
            
            // Check if it's a residue with userData
            if (object.userData && object.userData.residue) {
              const residueData = object.userData;
              
              // Create residue info for display
              const hoverInfo: ResidueInfo = {
                id: residueData.residue,
                chain: residueData.chain || 'A',
                type: residueData.residue.substring(0, 3),
                secondaryStructure: residueData.secondaryStructure || 'α-helix',
                solventAccessibility: '25.4%',
                aiPrediction: {
                  confidence: residueData.isBindingSite ? 0.9 : 0.3,
                  description: residueData.isBindingSite 
                    ? "High probability binding site residue" 
                    : "Low probability for binding interaction"
                }
              };
              
              // Set the hovered residue for UI display
              setHoveredResidue(hoverInfo);
              return;
            }
          }
        };
        
        // Add mouse move listener
        containerRef.current?.addEventListener('mousemove', onMouseMove);
      })
      .catch(error => {
        console.error('Failed to create protein visualization:', error);
        if (containerRef.current && containerRef.current.contains(loadingElement)) {
          loadingElement.innerText = 'Error loading protein structure';
        }
      });
    
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [protein, bindingSites]);

  // Simulate hovering over a residue
  useEffect(() => {
    setHoveredResidue(sampleResidueInfo);
  }, []);

  return (
    <div className="flex-1 relative">
      {/* The 3D protein canvas */}
      <div 
        ref={containerRef} 
        className="protein-canvas w-full h-full"
        style={{ 
          background: "radial-gradient(circle, rgba(24,24,46,1) 0%, rgba(9,9,21,1) 100%)"
        }}
      ></div>
      
      {/* Visualization controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center space-x-2 border border-neutral-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-rotate-orbit text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rotate view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-magnify-plus-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom in</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-magnify-minus-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-5 border-r border-neutral-200"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
                onClick={() => changeRepresentation('line')}
              >
                <i className="mdi mdi-vector-polyline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Line representation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
                onClick={() => changeRepresentation('cartoon')}
              >
                <i className="mdi mdi-cube-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cartoon representation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
                onClick={() => changeRepresentation('ball-and-stick')}
              >
                <i className="mdi mdi-ball text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ball and stick representation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
                onClick={() => changeRepresentation('surface')}
              >
                <i className="mdi mdi-water-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Surface representation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-5 border-r border-neutral-200"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-animation-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Animation controls</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-camera-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Take screenshot</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-ruler text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Measure distances</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* AI Analysis overlay toggle */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col space-y-2 border border-neutral-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className={`p-2 rounded-md text-white hover:bg-primary-600 ${showAnalysisPanel ? 'bg-primary' : 'bg-neutral-400'}`}
                variant={showAnalysisPanel ? "default" : "secondary"}
                onClick={toggleAnalysisPanel}
              >
                <i className="mdi mdi-molecule text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle AI analysis panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
                onClick={toggleBindingSites}
              >
                <i className="mdi mdi-target text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show binding sites</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
                onClick={toggleSurface}
              >
                <i className="mdi mdi-chart-bell-curve text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show confidence heatmap</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-0.5 border-t border-neutral-200 mx-1"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600">
                <i className="mdi mdi-cog-outline text-lg"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visualization settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Hover information box (simulating on-protein hover) */}
      {hoveredResidue && (
        <div className="absolute left-4 top-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-neutral-200 max-w-xs">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-neutral-700">Residue Information</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-neutral-600 h-6 w-6"
              onClick={() => setHoveredResidue(null)}
            >
              <i className="mdi mdi-close text-sm"></i>
            </Button>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-neutral-500">Residue:</span>
              <span className="text-xs font-medium">{hoveredResidue.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-neutral-500">Chain:</span>
              <span className="text-xs font-medium">{hoveredResidue.chain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-neutral-500">Secondary Structure:</span>
              <span className="text-xs font-medium">{hoveredResidue.secondaryStructure}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-neutral-500">Solvent Accessibility:</span>
              <span className="text-xs font-medium">{hoveredResidue.solventAccessibility}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-200">
              <span className="text-xs text-neutral-500">AI Prediction:</span>
              <div className="flex items-center mt-1">
                <div className="h-2 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-info" 
                    style={{ width: `${hoveredResidue.aiPrediction.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-info ml-2">
                  {(hoveredResidue.aiPrediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">{hoveredResidue.aiPrediction.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
