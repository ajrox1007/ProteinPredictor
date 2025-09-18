import { useQuery } from "@tanstack/react-query";

export default function StatusBar() {
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    queryFn: async () => {
      // In a real app, this would fetch the actual system status
      return {
        aiModel: {
          name: "AlphaFold2 v2.3.1",
          status: "running"
        },
        gpu: {
          name: "Tesla T4",
          status: "running",
          memory: {
            used: 4.2,
            total: 16
          }
        },
        databases: {
          pdb: {
            status: "connected",
            lastSync: "2 minutes ago"
          }
        }
      };
    }
  });
  
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs px-4 py-1 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <i className={`mdi mdi-server ${systemStatus?.aiModel?.status === 'running' ? 'text-success' : 'text-error'}`}></i>
          <span>AI Model: {systemStatus?.aiModel?.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className={`mdi mdi-gpu ${systemStatus?.gpu?.status === 'running' ? 'text-success' : 'text-error'}`}></i>
          <span>GPU: {systemStatus?.gpu?.name} ({systemStatus?.gpu?.status === 'running' ? 'Running' : 'Stopped'})</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className={`mdi mdi-database ${systemStatus?.databases?.pdb?.status === 'connected' ? 'text-success' : 'text-error'}`}></i>
          <span>PDB: {systemStatus?.databases?.pdb?.status === 'connected' ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <i className="mdi mdi-memory text-neutral-400"></i>
          <span>Memory: {systemStatus?.gpu?.memory?.used}GB / {systemStatus?.gpu?.memory?.total}GB</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="mdi mdi-cloud-check text-success"></i>
          <span>Last sync: {systemStatus?.databases?.pdb?.lastSync}</span>
        </div>
      </div>
    </footer>
  );
}
