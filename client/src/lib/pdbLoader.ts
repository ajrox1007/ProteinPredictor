import * as THREE from 'three';

// Helper class for loading protein data from PDB format
export class PDBLoader {
  private residueColors: Record<string, number> = {
    'ALA': 0xC8C8C8, // Alanine (Hydrophobic) - Gray
    'ARG': 0x145AFF, // Arginine (Basic) - Blue
    'ASN': 0x00DCDC, // Asparagine (Polar) - Cyan
    'ASP': 0xE60A0A, // Aspartic Acid (Acidic) - Red
    'CYS': 0xE6E600, // Cysteine (Polar) - Yellow
    'GLN': 0x00DCDC, // Glutamine (Polar) - Cyan
    'GLU': 0xE60A0A, // Glutamic Acid (Acidic) - Red
    'GLY': 0xEBEBEB, // Glycine (Hydrophobic) - Light gray
    'HIS': 0x8282D2, // Histidine (Basic) - Light purple
    'ILE': 0x0F820F, // Isoleucine (Hydrophobic) - Green
    'LEU': 0x0F820F, // Leucine (Hydrophobic) - Green
    'LYS': 0x145AFF, // Lysine (Basic) - Blue
    'MET': 0xE6E600, // Methionine (Hydrophobic) - Yellow
    'PHE': 0x3232AA, // Phenylalanine (Hydrophobic) - Dark blue
    'PRO': 0xDC9682, // Proline (Hydrophobic) - Salmon
    'SER': 0xFA9600, // Serine (Polar) - Orange
    'THR': 0xFA9600, // Threonine (Polar) - Orange
    'TRP': 0xB45AB4, // Tryptophan (Hydrophobic) - Magenta
    'TYR': 0x3232AA, // Tyrosine (Polar) - Dark blue
    'VAL': 0x0F820F, // Valine (Hydrophobic) - Green
    'HOH': 0x00FFFF, // Water - Cyan
    'default': 0x7F7F7F, // Default color - Gray
  };

  private secondaryStructureColors: Record<string, number> = {
    'helix': 0x0F820F,     // Green
    'sheet': 0x4169E1,     // Royal blue
    'turn': 0xFFD700,      // Gold
    'coil': 0x778899,      // Light slate gray
    'default': 0x7F7F7F,   // Default color - Gray
  };

  constructor() {}

  async fetchPDBFile(pdbId: string): Promise<string> {
    try {
      // Try to fetch from PDB directly (might be blocked by CORS)
      const response = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDB file for ${pdbId}`);
      }
      
      return await response.text();
    } catch (error) {
      // Fallback to our API route that can proxy the request
      try {
        const fallbackResponse = await fetch(`/api/proteins/fetch-structure/${pdbId}`);
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch PDB file for ${pdbId} from fallback`);
        }
        return await fallbackResponse.text();
      } catch (fallbackError) {
        console.error('Failed to fetch PDB file:', fallbackError);
        throw fallbackError;
      }
    }
  }

  parseAtoms(pdbData: string) {
    const atoms: any[] = [];
    const lines = pdbData.split('\n');
    
    for (let line of lines) {
      if (line.startsWith('ATOM')) {
        const atom = {
          serial: parseInt(line.substring(6, 11).trim()),
          name: line.substring(12, 16).trim(),
          altLoc: line.substring(16, 17).trim(),
          resName: line.substring(17, 20).trim(),
          chainID: line.substring(21, 22).trim(),
          resSeq: parseInt(line.substring(22, 26).trim()),
          x: parseFloat(line.substring(30, 38).trim()),
          y: parseFloat(line.substring(38, 46).trim()),
          z: parseFloat(line.substring(46, 54).trim()),
          occupancy: parseFloat(line.substring(54, 60).trim()),
          tempFactor: parseFloat(line.substring(60, 66).trim()),
          element: line.substring(76, 78).trim(),
          charge: line.substring(78, 80).trim(),
        };
        atoms.push(atom);
      }
    }
    
    return atoms;
  }

  parseSecondaryStructure(pdbData: string) {
    const structures: any[] = [];
    const lines = pdbData.split('\n');
    
    for (let line of lines) {
      if (line.startsWith('HELIX')) {
        structures.push({
          type: 'helix',
          startChain: line.substring(19, 20).trim(),
          startRes: parseInt(line.substring(21, 25).trim()),
          endChain: line.substring(31, 32).trim(),
          endRes: parseInt(line.substring(33, 37).trim()),
        });
      } else if (line.startsWith('SHEET')) {
        structures.push({
          type: 'sheet',
          startChain: line.substring(21, 22).trim(),
          startRes: parseInt(line.substring(22, 26).trim()),
          endChain: line.substring(32, 33).trim(),
          endRes: parseInt(line.substring(33, 37).trim()),
        });
      }
    }
    
    return structures;
  }

  getResidueColor(resName: string): number {
    return this.residueColors[resName] || this.residueColors['default'];
  }

  getStructureColor(type: string): number {
    return this.secondaryStructureColors[type] || this.secondaryStructureColors['default'];
  }

  createBackboneTrace(atoms: any[]): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const caAtoms = atoms.filter(atom => atom.name === 'CA');
    
    // Group CA atoms by chain
    const chainMap: Record<string, any[]> = {};
    for (const atom of caAtoms) {
      if (!chainMap[atom.chainID]) {
        chainMap[atom.chainID] = [];
      }
      chainMap[atom.chainID].push(atom);
    }
    
    // Sort atoms by residue sequence within each chain
    for (const chain in chainMap) {
      chainMap[chain].sort((a, b) => a.resSeq - b.resSeq);
    }
    
    // Create tube geometry for each chain
    for (const chain in chainMap) {
      const chainAtoms = chainMap[chain];
      if (chainAtoms.length < 2) continue;
      
      const points: THREE.Vector3[] = [];
      for (const atom of chainAtoms) {
        points.push(new THREE.Vector3(atom.x, atom.y, atom.z));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, chainAtoms.length * 4, 0.3, 8, false);
      const material = new THREE.MeshStandardMaterial({
        color: 0x3949ab,
        roughness: 0.4,
        metalness: 0.3,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      meshes.push(mesh);
    }
    
    return meshes;
  }

  createSecondaryStructure(atoms: any[], secondaryStructure: any[]): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    
    // Create different representations for each secondary structure
    for (const structure of secondaryStructure) {
      const structureAtoms = atoms.filter(atom => 
        atom.chainID === structure.startChain &&
        atom.resSeq >= structure.startRes &&
        atom.resSeq <= structure.endRes &&
        atom.name === 'CA'
      );
      
      if (structureAtoms.length < 2) continue;
      
      const points: THREE.Vector3[] = [];
      for (const atom of structureAtoms) {
        points.push(new THREE.Vector3(atom.x, atom.y, atom.z));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const radius = structure.type === 'helix' ? 0.6 : 0.4;
      const geometry = new THREE.TubeGeometry(curve, structureAtoms.length * 4, radius, 8, false);
      const material = new THREE.MeshStandardMaterial({
        color: this.getStructureColor(structure.type),
        roughness: 0.4,
        metalness: 0.3,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      meshes.push(mesh);
    }
    
    return meshes;
  }

  createResidues(atoms: any[], bindingSites?: any[]): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    
    // Get all CA atoms (central carbon atom of each residue)
    const caAtoms = atoms.filter(atom => atom.name === 'CA');
    
    // Create spheres for each residue
    for (const atom of caAtoms) {
      // Check if this residue is part of a binding site
      const isBindingSite = bindingSites && bindingSites.some(site => {
        const keyResidues = site.keyResidues || '';
        return keyResidues.includes(`${atom.resName}${atom.resSeq}`);
      });
      
      // Use a larger sphere and different color for binding site residues
      const radius = isBindingSite ? 0.8 : 0.4;
      const color = isBindingSite ? 0xff5252 : this.getResidueColor(atom.resName);
      
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: isBindingSite ? 0.7 : 0.4,
        emissive: isBindingSite ? color : 0x000000,
        emissiveIntensity: isBindingSite ? 0.3 : 0,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(atom.x, atom.y, atom.z);
      
      // Add user data for interactivity
      mesh.userData = {
        residue: `${atom.resName}${atom.resSeq}`,
        chain: atom.chainID,
        isBindingSite: isBindingSite,
      };
      
      meshes.push(mesh);
    }
    
    return meshes;
  }

  createSurface(atoms: any[]): THREE.Mesh {
    // Create a simplified molecular surface using our convex hull function
    const points: THREE.Vector3[] = [];
    
    // Use a subset of atoms to create the surface
    const surfaceAtoms = atoms.filter(atom => {
      // Only use one atom per residue (CA) for a cleaner surface
      return atom.name === 'CA';
    });
    
    for (const atom of surfaceAtoms) {
      points.push(new THREE.Vector3(atom.x, atom.y, atom.z));
    }
    
    // Instead of creating a large background sphere, create a true molecular surface
    // using the actual points of the protein
    const geometry = createConvexHull(points);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: false,
    });
    
    return new THREE.Mesh(geometry, material);
  }

  // Main method to create a complete protein visualization
  async createProteinVisualization(pdbId: string, scene: THREE.Scene, bindingSites?: any[]) {
    try {
      const pdbData = await this.fetchPDBFile(pdbId);
      const atoms = this.parseAtoms(pdbData);
      const secondaryStructure = this.parseSecondaryStructure(pdbData);
      
      // Remove any existing protein objects from the scene
      scene.children.forEach(child => {
        if (child.userData && child.userData.isProteinPart) {
          scene.remove(child);
        }
      });
      
      // Center the protein
      const center = this.calculateCenter(atoms);
      
      // Create different representations and add them to the scene
      const backbone = this.createBackboneTrace(atoms);
      backbone.forEach(mesh => {
        mesh.userData = { isProteinPart: true };
        mesh.position.sub(center);
        scene.add(mesh);
      });
      
      const structures = this.createSecondaryStructure(atoms, secondaryStructure);
      structures.forEach(mesh => {
        mesh.userData = { isProteinPart: true };
        mesh.position.sub(center);
        scene.add(mesh);
      });
      
      const residues = this.createResidues(atoms, bindingSites);
      residues.forEach(mesh => {
        mesh.userData = { isProteinPart: true, ...mesh.userData };
        mesh.position.sub(center);
        scene.add(mesh);
      });
      
      // Create surface representation
      const surface = this.createSurface(atoms);
      surface.userData = { isProteinPart: true, isSurface: true };
      surface.position.sub(center);
      scene.add(surface);
      
      return { atoms, secondaryStructure };
    } catch (error) {
      console.error('Failed to create protein visualization:', error);
      return null;
    }
  }

  private calculateCenter(atoms: any[]): THREE.Vector3 {
    let sumX = 0, sumY = 0, sumZ = 0;
    const count = atoms.length;
    
    for (const atom of atoms) {
      sumX += atom.x;
      sumY += atom.y;
      sumZ += atom.z;
    }
    
    return new THREE.Vector3(sumX / count, sumY / count, sumZ / count);
  }
}

// Create a simplified convex hull geometry
// In a real app, you'd import ConvexGeometry from three/examples/jsm/geometries/ConvexGeometry.js
function createConvexHull(points: THREE.Vector3[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  
  // Create a simple polyhedron from the provided points
  const positions: number[] = [];
  const indices: number[] = [];
  
  // Add all point positions
  points.forEach(point => {
    positions.push(point.x, point.y, point.z);
  });
  
  // Create triangles - simplified tetrahedron-like shape
  // This is a simplified approach and won't produce a true convex hull
  if (points.length >= 4) {
    // Create base triangles
    for (let i = 1; i < points.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    
    // Create top triangles
    for (let i = 1; i < points.length - 1; i++) {
      indices.push(points.length - 1, i, i + 1);
    }
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  
  return geometry;
}

export default new PDBLoader();