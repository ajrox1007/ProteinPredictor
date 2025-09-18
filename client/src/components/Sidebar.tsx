import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Protein } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TOOLS = [
  { 
    name: "3D Visualization", 
    icon: "mdi-cube-outline", 
    href: "/", 
    active: true 
  },
  { 
    name: "Structure Prediction", 
    icon: "mdi-dna", 
    href: "/structure-prediction" 
  },
  { 
    name: "Binding Site Analysis", 
    icon: "mdi-target", 
    href: "/binding-site-analysis" 
  },
  { 
    name: "Drug Screening", 
    icon: "mdi-flask-outline", 
    href: "/drug-screening" 
  },
  { 
    name: "MD Analysis", 
    icon: "mdi-chart-scatter-plot", 
    href: "/md-analysis" 
  },
];

type SidebarLinkProps = {
  href: string;
  icon: string;
  children: React.ReactNode;
  isActive?: boolean;
};

function SidebarLink({ href, icon, children, isActive }: SidebarLinkProps) {
  const [location] = useLocation();
  const active = isActive || location === href;
  
  // Active navigation for all pages
  return (
    <Link to={href} className={cn(
      "flex items-center space-x-3 px-3 py-2 rounded-md transition",
      active 
        ? "bg-primary-50 text-primary" 
        : "hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
    )}>
      <i className={`mdi ${icon} text-lg`}></i>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { data: recentProteins } = useQuery({
    queryKey: ['/api/proteins/recent'],
  }) || [];
  
  // Ensure recentProteins is always an array even if data is undefined
  const proteinsList = Array.isArray(recentProteins) ? recentProteins : [];
  
  const { data: databaseStatus } = useQuery({
    queryKey: ['/api/database/status'],
    queryFn: async () => {
      // In a real app, this would fetch actual database connection status
      return {
        pdb: { connected: true },
        chembl: { connected: true },
        drugbank: { connected: false }
      };
    }
  });
  
  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full">
      {/* Tools section */}
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-sm font-medium text-neutral-400 mb-3">TOOLS</h2>
        <nav>
          <ul className="space-y-1">
            {TOOLS.map((tool) => (
              <li key={tool.name}>
                <SidebarLink 
                  href={tool.href} 
                  icon={tool.icon} 
                  isActive={tool.active}
                >
                  {tool.name}
                </SidebarLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Recent Proteins section */}
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-sm font-medium text-neutral-400 mb-3">RECENT PROTEINS</h2>
        <ul className="space-y-1">
          {proteinsList.map((protein: Protein) => (
            <li key={protein.id}>
              <a href="#" 
                 onClick={(e) => {
                   e.preventDefault();
                   // Trigger protein selection via custom event
                   const event = new CustomEvent('select-protein', { 
                     detail: { pdbId: protein.pdbId }
                   });
                   window.dispatchEvent(event);
                 }}
                 className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition">
                <div className="flex-1">
                  <div className="text-sm font-medium">{protein.name}</div>
                  <div className="text-xs text-neutral-300">PDB: {protein.pdbId}</div>
                </div>
                {protein.pdbId === (window as any).selectedPdbId && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Database Connections section */}
      <div className="p-4 mt-auto border-t border-neutral-200">
        <h2 className="text-sm font-medium text-neutral-400 mb-3">DATABASE CONNECTIONS</h2>
        <div className="space-y-2">
          {databaseStatus?.pdb?.connected && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-100 rounded-md">
              <i className="mdi mdi-database-check text-success"></i>
              <div className="flex-1">
                <div className="text-sm font-medium text-success">PDB</div>
                <div className="text-xs text-neutral-400">Connected</div>
              </div>
            </div>
          )}
          
          {databaseStatus?.chembl?.connected && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-100 rounded-md">
              <i className="mdi mdi-database-check text-success"></i>
              <div className="flex-1">
                <div className="text-sm font-medium text-success">ChEMBL</div>
                <div className="text-xs text-neutral-400">Connected</div>
              </div>
            </div>
          )}
          
          {databaseStatus?.drugbank !== undefined && !databaseStatus.drugbank.connected && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md">
              <i className="mdi mdi-database-off text-neutral-400"></i>
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-400">DrugBank</div>
                <div className="text-xs text-neutral-300">Disconnected</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-primary-300 text-primary"
                onClick={() => alert("DrugBank database connection feature coming soon!")}
              >
                Connect
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
