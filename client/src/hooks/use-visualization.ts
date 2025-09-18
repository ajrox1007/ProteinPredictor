import { useState, useCallback } from 'react';

type VisualizationStyle = 'cartoon' | 'line' | 'ball-and-stick' | 'surface';

interface VisualizationOptions {
  style: VisualizationStyle;
  colorScheme: string;
  showLabels: boolean;
  showBindingSites: boolean;
  showSurface: boolean;
}

export function useVisualization() {
  const [options, setOptions] = useState<VisualizationOptions>({
    style: 'cartoon',
    colorScheme: 'default',
    showLabels: false,
    showBindingSites: true,
    showSurface: false,
  });

  // Initialize the visualization
  const initialize = useCallback((containerRef: HTMLElement, pdbId: string) => {
    console.log('Initializing visualization for', pdbId);
    // In a real implementation, this would initialize the 3D viewer
    return {
      viewer: {},
      destroy: () => console.log('Cleaning up visualization'),
    };
  }, []);

  // Change the visualization representation style
  const changeRepresentation = useCallback((style: VisualizationStyle) => {
    console.log('Changing representation to:', style);
    setOptions(prev => ({ ...prev, style }));
  }, []);

  // Toggle binding site visibility
  const toggleBindingSites = useCallback(() => {
    setOptions(prev => ({ ...prev, showBindingSites: !prev.showBindingSites }));
  }, []);

  // Toggle surface visibility
  const toggleSurface = useCallback(() => {
    setOptions(prev => ({ ...prev, showSurface: !prev.showSurface }));
  }, []);

  // Change color scheme
  const changeColorScheme = useCallback((colorScheme: string) => {
    setOptions(prev => ({ ...prev, colorScheme }));
  }, []);

  return {
    options,
    initialize,
    changeRepresentation,
    toggleBindingSites,
    toggleSurface,
    changeColorScheme,
  };
}