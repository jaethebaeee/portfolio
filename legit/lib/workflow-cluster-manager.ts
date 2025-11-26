/**
 * Workflow Cluster Manager
 * Manages distributed workflow execution across multiple nodes
 */

import { supabase } from './supabase';
import { WorkflowLoadBalancer } from './workflow-load-balancer';
import { DistributedWorkflowEngine } from './distributed-workflow-engine';

export interface ClusterNode {
  id: string;
  host: string;
  port: number;
  status: 'active' | 'inactive' | 'failed';
  role: 'leader' | 'worker' | 'backup';
  lastSeen: number;
  capabilities: {
    maxWorkflows: number;
    supportedTypes: string[];
    memory: number;
    cpu: number;
  };
  metrics: {
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageExecutionTime: number;
  };
}

export interface ClusterConfig {
  nodeId: string;
  discoveryInterval: number;
  leaderElectionInterval: number;
  heartbeatInterval: number;
  failoverTimeout: number;
  maxNodes: number;
}

export class WorkflowClusterManager {
  private static instance: WorkflowClusterManager;
  private config: ClusterConfig;
  private nodes = new Map<string, ClusterNode>();
  private isLeader = false;
  private currentLeader: string | null = null;
  private loadBalancer = WorkflowLoadBalancer.getInstance();
  private distributedEngine = DistributedWorkflowEngine.getInstance();

  // Timers
  private discoveryTimer: NodeJS.Timeout | null = null;
  private leaderElectionTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ClusterConfig> = {}) {
    this.config = {
      nodeId: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discoveryInterval: 30000, // 30 seconds
      leaderElectionInterval: 60000, // 1 minute
      heartbeatInterval: 10000, // 10 seconds
      failoverTimeout: 30000, // 30 seconds
      maxNodes: 10,
      ...config
    };
  }

  static getInstance(): WorkflowClusterManager {
    if (!WorkflowClusterManager.instance) {
      WorkflowClusterManager.instance = new WorkflowClusterManager();
    }
    return WorkflowClusterManager.instance;
  }

  // Initialize cluster
  async initialize(): Promise<void> {
    console.log(`Initializing workflow cluster node: ${this.config.nodeId}`);

    // Register self
    await this.registerNode();

    // Start cluster processes
    this.startDiscovery();
    this.startLeaderElection();
    this.startHeartbeat();

    console.log('✓ Workflow cluster initialized');
  }

  // Register this node in the cluster
  private async registerNode(): Promise<void> {
    const nodeInfo: ClusterNode = {
      id: this.config.nodeId,
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT || '3000'),
      status: 'active',
      role: 'worker', // Will be updated by leader election
      lastSeen: Date.now(),
      capabilities: {
        maxWorkflows: 100,
        supportedTypes: ['trigger', 'action', 'condition', 'delay', 'time_window'],
        memory: 1024 * 1024 * 1024, // 1GB
        cpu: 4
      },
      metrics: {
        activeWorkflows: 0,
        completedWorkflows: 0,
        failedWorkflows: 0,
        averageExecutionTime: 0
      }
    };

    this.nodes.set(this.config.nodeId, nodeInfo);

    // Persist to database
    await supabase
      .from('cluster_nodes')
      .upsert({
        node_id: nodeInfo.id,
        host: nodeInfo.host,
        port: nodeInfo.port,
        status: nodeInfo.status,
        role: nodeInfo.role,
        capabilities: nodeInfo.capabilities,
        metrics: nodeInfo.metrics,
        last_seen: new Date(nodeInfo.lastSeen).toISOString()
      });
  }

  // Start node discovery
  private startDiscovery(): void {
    this.discoveryTimer = setInterval(() => {
      this.discoverNodes();
    }, this.config.discoveryInterval);
  }

  // Discover other nodes in the cluster
  private async discoverNodes(): Promise<void> {
    try {
      // Query database for active nodes
      const { data: nodes, error } = await supabase
        .from('cluster_nodes')
        .select('*')
        .eq('status', 'active')
        .gt('last_seen', new Date(Date.now() - 60000).toISOString()); // Active in last minute

      if (error) {
        console.error('Failed to discover nodes:', error);
        return;
      }

      // Update local node registry
      const discoveredNodes = new Map<string, ClusterNode>();
      for (const nodeData of nodes || []) {
        const node: ClusterNode = {
          id: nodeData.node_id,
          host: nodeData.host,
          port: nodeData.port,
          status: nodeData.status,
          role: nodeData.role,
          lastSeen: new Date(nodeData.last_seen).getTime(),
          capabilities: nodeData.capabilities,
          metrics: nodeData.metrics
        };
        discoveredNodes.set(node.id, node);
      }

      this.nodes = discoveredNodes;

      // Update load balancer
      for (const node of discoveredNodes.values()) {
        this.loadBalancer.registerInstance({
          id: node.id,
          host: node.host,
          port: node.port,
          status: node.status === 'active' ? 'healthy' : 'unhealthy',
          load: (node.metrics.activeWorkflows / node.capabilities.maxWorkflows) * 100,
          lastHeartbeat: node.lastSeen,
          capabilities: {
            maxConcurrency: node.capabilities.maxWorkflows,
            supportedWorkflowTypes: node.capabilities.supportedTypes,
            memoryUsage: node.capabilities.memory,
            cpuUsage: node.capabilities.cpu
          },
          metadata: {
            version: '1.0.0',
            region: process.env.REGION || 'us-east-1',
            environment: process.env.NODE_ENV || 'development'
          }
        });
      }

    } catch (error) {
      console.error('Node discovery failed:', error);
    }
  }

  // Start leader election
  private startLeaderElection(): void {
    this.leaderElectionTimer = setInterval(() => {
      this.electLeader();
    }, this.config.leaderElectionInterval);
  }

  // Leader election algorithm (simplified)
  private async electLeader(): Promise<void> {
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'active')
      .sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID for deterministic election

    if (activeNodes.length === 0) return;

    // Simple leader election: node with smallest ID becomes leader
    const newLeader = activeNodes[0];

    if (this.currentLeader !== newLeader.id) {
      console.log(`New leader elected: ${newLeader.id} (was: ${this.currentLeader})`);
      this.currentLeader = newLeader.id;
      this.isLeader = (newLeader.id === this.config.nodeId);
    }

    // Update roles
    for (const node of activeNodes) {
      const role = node.id === newLeader.id ? 'leader' :
                   activeNodes.indexOf(node) < 3 ? 'worker' : 'backup';

      if (node.role !== role) {
        node.role = role;
        await this.updateNodeRole(node.id, role);
      }
    }
  }

  // Start heartbeat
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  // Send heartbeat to cluster
  private async sendHeartbeat(): Promise<void> {
    try {
      const node = this.nodes.get(this.config.nodeId);
      if (!node) return;

      // Update metrics
      const engineStats = this.distributedEngine.getSystemStats();
      node.metrics = {
        activeWorkflows: engineStats.workers?.totalJobsProcessed || 0,
        completedWorkflows: engineStats.workers?.totalJobsProcessed || 0,
        failedWorkflows: engineStats.workers?.totalJobsFailed || 0,
        averageExecutionTime: engineStats.workers?.averageProcessingTime || 0
      };

      node.lastSeen = Date.now();

      // Update database
      await supabase
        .from('cluster_nodes')
        .update({
          status: 'active',
          metrics: node.metrics,
          last_seen: new Date(node.lastSeen).toISOString()
        })
        .eq('node_id', this.config.nodeId);

    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }

  // Update node role
  private async updateNodeRole(nodeId: string, role: ClusterNode['role']): Promise<void> {
    await supabase
      .from('cluster_nodes')
      .update({ role })
      .eq('node_id', nodeId);
  }

  // Get cluster status
  getClusterStatus(): {
    nodeId: string;
    isLeader: boolean;
    currentLeader: string | null;
    totalNodes: number;
    activeNodes: number;
    leaderNode: ClusterNode | null;
    nodeStats: ClusterNode[];
  } {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.status === 'active');
    const leaderNode = this.nodes.get(this.currentLeader || '') || null;

    return {
      nodeId: this.config.nodeId,
      isLeader: this.isLeader,
      currentLeader: this.currentLeader,
      totalNodes: this.nodes.size,
      activeNodes: activeNodes.length,
      leaderNode,
      nodeStats: Array.from(this.nodes.values())
    };
  }

  // Execute workflow on optimal cluster node
  async executeWorkflowOnCluster(
    workflow: any,
    patient: any,
    appointment: any,
    context: { daysPassed: number },
    options: {
      preferredNode?: string;
      workflowType?: string;
      priority?: 'low' | 'normal' | 'high' | 'critical';
    } = {}
  ): Promise<{
    success: boolean;
    nodeId?: string;
    result?: any;
    error?: string;
  }> {
    // If this node is the leader, coordinate execution
    if (this.isLeader) {
      return await this.coordinateWorkflowExecution(workflow, patient, appointment, context, options);
    }

    // If this node is a worker, execute directly
    if (this.nodes.get(this.config.nodeId)?.role === 'worker') {
      try {
        const result = await this.distributedEngine.executeWorkflow(
          workflow, patient, appointment, context, {
            enableParallelism: true,
            enableCaching: true,
            enableCircuitBreaker: true,
            enableMetrics: true,
            enableStatePersistence: true
          }
        );

        return {
          success: result.success,
          nodeId: this.config.nodeId,
          result: result
        };
      } catch (error: any) {
        return {
          success: false,
          nodeId: this.config.nodeId,
          error: error.message
        };
      }
    }

    return {
      success: false,
      error: 'Node is not configured for workflow execution'
    };
  }

  // Coordinate workflow execution across cluster
  private async coordinateWorkflowExecution(
    workflow: any,
    patient: any,
    appointment: any,
    context: { daysPassed: number },
    options: any
  ): Promise<{
    success: boolean;
    nodeId?: string;
    result?: any;
    error?: string;
  }> {
    // Select optimal node
    let targetNodeId = options.preferredNode;

    if (!targetNodeId) {
      const targetInstance = this.loadBalancer.selectInstance(options.workflowType);
      targetNodeId = targetInstance?.id;
    }

    if (!targetNodeId) {
      return {
        success: false,
        error: 'No available nodes for workflow execution'
      };
    }

    // If target is this node, execute directly
    if (targetNodeId === this.config.nodeId) {
      return await this.executeWorkflowOnCluster(workflow, patient, appointment, context, options);
    }

    // Otherwise, delegate to target node
    // In a real implementation, this would use RPC/inter-node communication
    // For now, assume the target node will handle it
    console.log(`Delegating workflow execution to node: ${targetNodeId}`);

    return {
      success: true,
      nodeId: targetNodeId,
      result: { delegated: true, targetNode: targetNodeId }
    };
  }

  // Handle node failure
  async handleNodeFailure(nodeId: string): Promise<void> {
    console.warn(`Handling failure of node: ${nodeId}`);

    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Mark node as failed
    node.status = 'failed';
    await supabase
      .from('cluster_nodes')
      .update({ status: 'failed' })
      .eq('node_id', nodeId);

    // If this was the leader, trigger new election
    if (this.currentLeader === nodeId) {
      console.log('Leader failed, triggering new election');
      this.currentLeader = null;
      await this.electLeader();
    }

    // Redistribute workflows from failed node
    await this.redistributeWorkflows(nodeId);
  }

  // Redistribute workflows from failed node
  private async redistributeWorkflows(failedNodeId: string): Promise<void> {
    try {
      // Find workflows that were running on the failed node
      // In a real implementation, you'd query for active workflows on that node
      // and redistribute them to healthy nodes

      console.log(`Redistributing workflows from failed node: ${failedNodeId}`);

      // Query for orphaned workflows
      const { data: orphanedWorkflows, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('status', 'running')
        .lt('updated_at', new Date(Date.now() - 300000).toISOString()); // Older than 5 minutes

      if (error) {
        console.error('Failed to query orphaned workflows:', error);
        return;
      }

      // Redistribute each orphaned workflow
      for (const workflow of orphanedWorkflows || []) {
        try {
          // Reset status and re-queue
          await supabase
            .from('workflow_executions')
            .update({
              status: 'pending',
              error_message: 'Redistributed due to node failure'
            })
            .eq('id', workflow.id);

          console.log(`Redistributed workflow: ${workflow.id}`);
        } catch (error) {
          console.error(`Failed to redistribute workflow ${workflow.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Workflow redistribution failed:', error);
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down workflow cluster manager...');

    // Clear timers
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }

    if (this.leaderElectionTimer) {
      clearInterval(this.leaderElectionTimer);
      this.leaderElectionTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Mark self as inactive
    await supabase
      .from('cluster_nodes')
      .update({ status: 'inactive' })
      .eq('node_id', this.config.nodeId);

    console.log('✓ Workflow cluster manager shutdown complete');
  }
}

// Singleton instance
export const workflowClusterManager = WorkflowClusterManager.getInstance();

// Process-level shutdown handlers
if (typeof process !== 'undefined') {
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down cluster gracefully...');
    await workflowClusterManager.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down cluster gracefully...');
    await workflowClusterManager.shutdown();
    process.exit(0);
  });
}
