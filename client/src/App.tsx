import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// Import the pages
import StructurePrediction from "@/pages/StructurePrediction";
import BindingSiteAnalysis from "@/pages/BindingSiteAnalysis";
import DrugScreening from "@/pages/DrugScreening";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/structure-prediction" component={StructurePrediction} />
      <Route path="/binding-site-analysis" component={BindingSiteAnalysis} />
      <Route path="/drug-screening" component={DrugScreening} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
