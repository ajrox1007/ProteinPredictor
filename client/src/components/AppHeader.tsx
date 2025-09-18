import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <header className="bg-white border-b border-neutral-200 py-2 px-4 flex justify-between items-center z-10">
      <div className="flex items-center space-x-2">
        <span className="text-primary text-2xl">
          <i className="mdi mdi-microscope"></i>
        </span>
        <h1 className="text-xl font-semibold text-primary">VirtuLab AI</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search proteins..."
            className="pl-8 pr-4 py-1 text-sm w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="mdi mdi-magnify absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-300"></i>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-1 text-primary hover:bg-primary-50"
              >
                <i className="mdi mdi-database-import-outline"></i>
                <span className="text-sm">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import protein structure from file or database</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="flex items-center space-x-1 bg-primary hover:bg-primary-600 text-white"
              >
                <i className="mdi mdi-content-save-outline"></i>
                <span className="text-sm">Save Project</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save current project state</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="w-8 h-8 bg-neutral-200 rounded-full flex justify-center items-center text-neutral-400">
          <i className="mdi mdi-account"></i>
        </div>
      </div>
    </header>
  );
}
