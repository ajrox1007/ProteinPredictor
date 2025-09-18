import React, { useState, useEffect } from "react";
import { Protein } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Search, Database, Filter } from "lucide-react";

// Using a simplified spinner
const Spinner = ({ size = "lg" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8";
  return (
    <div className={`${sizeClass} animate-spin rounded-full border-2 border-current border-t-transparent text-primary`}></div>
  );
};

interface ProteinBrowserProps {
  onSelectProtein: (protein: Protein) => void;
  buttonText?: string;
}

export default function ProteinBrowser({ onSelectProtein, buttonText = "Browse All Proteins" }: ProteinBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProteins, setFilteredProteins] = useState<Protein[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "pdbId" | "recent">("recent");

  // Fetch all proteins
  const { data: proteins, isLoading, error } = useQuery({
    queryKey: ["/api/proteins"],
    queryFn: async () => {
      const response = await fetch("/api/proteins");
      if (!response.ok) {
        throw new Error("Failed to fetch proteins");
      }
      return response.json();
    }
  });

  // Update filtered proteins when data, search or sort changes
  useEffect(() => {
    if (!proteins) return;
    
    let filtered = [...proteins];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.pdbId.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "pdbId") {
      filtered.sort((a, b) => a.pdbId.localeCompare(b.pdbId));
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    setFilteredProteins(filtered);
  }, [proteins, searchQuery, sortBy]);

  const handleSelectProtein = (protein: Protein) => {
    onSelectProtein(protein);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Protein Database</DialogTitle>
        </DialogHeader>
        
        {/* Search and filter bar */}
        <div className="flex items-center gap-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, PDB ID, or description" 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Sort by Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("pdbId")}>
                Sort by PDB ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Separator />
        
        {/* Protein list */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              Error loading proteins. Please try again.
            </div>
          ) : filteredProteins.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No proteins found matching your search.
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredProteins.map((protein) => (
                <div
                  key={protein.id}
                  className="flex items-center justify-between p-3 hover:bg-secondary rounded-md cursor-pointer"
                  onClick={() => handleSelectProtein(protein)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline">
                      <h4 className="text-sm font-medium truncate">{protein.name}</h4>
                      <span className="ml-2 text-xs text-muted-foreground">({protein.pdbId})</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {protein.description || "No description available"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2" onClick={(e) => {
                    e.stopPropagation();
                    handleSelectProtein(protein);
                  }}>
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}