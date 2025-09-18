import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Protein } from "@shared/schema";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProteinInfoBarProps {
  protein?: Protein;
  isLoading: boolean;
}

export default function ProteinInfoBar({ protein, isLoading }: ProteinInfoBarProps) {
  if (isLoading) {
    return (
      <div className="bg-white border-b border-neutral-200 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }
  
  if (!protein) {
    return (
      <div className="bg-white border-b border-neutral-200 p-3 flex items-center justify-between">
        <div>No protein selected</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border-b border-neutral-200 p-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-neutral-700">{protein.name}</h2>
        <Badge variant="outline" className="px-2 py-0.5 bg-primary-100 text-primary-700 border-primary-200">
          PDB: {protein.pdbId}
        </Badge>
        <span className="text-neutral-400 text-sm">
          {protein.chains} | {protein.residues} residues
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm flex items-center space-x-1">
                <i className="mdi mdi-share-variant-outline"></i>
                <span>Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this protein analysis</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm flex items-center space-x-1">
                <i className="mdi mdi-download-outline"></i>
                <span>Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export analysis results</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-sm bg-secondary text-white hover:bg-secondary-600 flex items-center space-x-1"
              >
                <i className="mdi mdi-play"></i>
                <span>Run Analysis</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run AI analysis on this protein</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
