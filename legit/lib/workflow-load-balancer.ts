/**
 * Workflow Load Balancer
 * Distributes workflow execution across multiple instances
 */

import { supabase } from './supabase';

export interface InstanceInfo {
  id: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'overloaded';
  load: number; // 0-100
  lastHeartbeat: number;
  capabilities: {
    maxConcurrency: number;
    supportedWorkflowTypes: string[];
    memoryUsage: number;
    cpuUsage: number;
  };
  metadata: {
    version: string;
    region: string;
    environment: string;
  };
}

export interface LoadBalancingStrategy {
  name: string;
  selectInstance(instances: InstanceInfo[], workflowType?: string): InstanceInfo | null;
}

export class RoundRobinStrategy implements LoadBalancingStrategy {
  name = 'round-robin';
  private lastIndex = -1;

  selectInstance(instances: InstanceInfo[], workflowType?: string): InstanceInfo | null {
    const healthyInstances = instances.filter(inst =>
      inst.status === 'healthy' &&
      (!workflowType || inst.capabilities.supportedWorkflowTypes.includes(workflowType))
    );

    if (healthyInstances.length === 0) return null;

    this.lastIndex = (this.lastIndex + 1) % healthyInstances.length;
    return healthyInstances[this.lastIndex];
  }
}

export class LeastLoadStrategy implements LoadBalancingStrategy {
  name = 'least-load';

  selectInstance(instances: InstanceInfo[], workflowType?: string): InstanceInfo | null {
    const healthyInstances = instances.filter(inst =>
      inst.status === 'healthy' &&
      inst.load < 80 && // Don't overload instances above 80%
      (!workflowType || inst.capabilities.supportedWorkflowTypes.includes(workflowType))
    );

    if (healthyInstances.length === 0) return null;

    // Return instance with lowest load
    return healthyInstances.reduce((min, current) =>
      current.load < min.load ? current : min
    );
  }
}

export class WeightedRoundRobinStrategy implements LoadBalancingStrategy {
  name = 'weighted-round-robin';
  private instanceWeights = new Map<string, number>();
  private currentWeights = new Map<string, number>();

  selectInstance(instances: InstanceInfo[], workflowType?: string): InstanceInfo | null {
    const healthyInstances = instances.filter(inst =>
      inst.status === 'healthy' &&
      (!workflowType || inst.capabilities.supportedWorkflowTypes.includes(workflowType))
    );

    if (healthyInstances.length === 0) return null;

    // Calculate weights based on instance capabilities
    healthyInstances.forEach(inst => {
      const weight = this.calculateWeight(inst);
      this.instanceWeights.set(inst.id, weight);
      if (!this.currentWeights.has(inst.id)) {
        this.currentWeights.set(inst.id, 0);
      }
    });

    // Find instance with highest current weight
    let selectedInstance: InstanceInfo | null = null;
    let maxWeight = -1;

    for (const instance of healthyInstances) {
      const currentWeight = this.currentWeights.get(instance.id) || 0;
      const instanceWeight = this.instanceWeights.get(instance.id) || 1;

      if (currentWeight + instanceWeight > maxWeight) {
        maxWeight = currentWeight + instanceWeight;
        selectedInstance = instance;
      }
    }

    if (selectedInstance) {
      // Update current weight
      const currentWeight = this.currentWeights.get(selectedInstance.id) || 0;
      const instanceWeight = this.instanceWeights.get(selectedInstance.id) || 1;
      this.currentWeights.set(selectedInstance.id, currentWeight + instanceWeight);
    }

    return selectedInstance;
  }

  private calculateWeight(instance: InstanceInfo): number {
    // Weight based on available capacity and performance
    const capacityWeight = (100 - instance.load) / 100; // Higher weight for lower load
    const performanceWeight = instance.capabilities.maxConcurrency / 10; // Higher concurrency = higher weight
    return capacityWeight * performanceWeight;
  }
}

export class GeographicStrategy implements LoadBalancingStrategy {
  name = 'geographic';

  selectInstance(instances: InstanceInfo[], workflowType?: string): InstanceInfo | null {
    const healthyInstances = instances.filter(inst =>
      inst.status === 'healthy' &&
      (!workflowType || inst.capabilities.supportedWorkflowTypes.includes(workflowType))
    );

    if (healthyInstances.length === 0) return null;

    // For now, prefer instances in the same region
    // In a real implementation, you'd get the client's region
    const clientRegion = process.env.REGION || 'us-east-1';

    const sameRegionInstances = healthyInstances.filter(inst =>
      inst.metadata.region === clientRegion
    );

    if (sameRegionInstances.length > 0) {
      // Use least load among same region instances
      return sameRegionInstances.reduce((min, current) =>
        current.load < min.load ? current : min
      );
    }

    // Fallback to any healthy instance
    return healthyInstances[0];
  }
}

export class WorkflowLoadBalancer {
  private static instance: WorkflowLoadBalancer;
  private instances = new Map<string, InstanceInfo>();
  private strategies = new Map<string, LoadBalancingStrategy>();
  private currentStrategy: LoadBalancingStrategy;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(strategy: LoadBalancingStrategy = new LeastLoadStrategy()) {
    this.currentStrategy = strategy;
    this.initializeStrategies();
    this.startHeartbeatMonitoring();
    this.startCleanupProcess();
  }

  static getInstance(): WorkflowLoadBalancer {
    if (!WorkflowLoadBalancer.instance) {
      WorkflowLoadBalancer.instance = new WorkflowLoadBalancer();
    }
    return WorkflowLoadBalancer.instance;
  }

  private initializeStrategies(): void {
    this.strategies.set('round-robin', new RoundRobinStrategy());
    this.strategies.set('least-load', new LeastLoadStrategy());
    this.strategies.set('weighted-round-robin', new WeightedRoundRobinStrategy());
    this.strategies.set('geographic', new GeographicStrategy());
  }

  // Register instance
  registerInstance(instance: InstanceInfo): void {
    this.instances.set(instance.id, instance);
    console.log(`Registered instance: ${instance.id} (${instance.host}:${instance.port})`);
  }

  // Update instance status
  updateInstance(instanceId: string, updates: Partial<InstanceInfo>): void {
    const existing = this.instances.get(instanceId);
    if (existing) {
      this.instances.set(instanceId, { ...existing, ...updates });
    }
  }

  // Unregister instance
  unregisterInstance(instanceId: string): void {
    this.instances.delete(instanceId);
    console.log(`Unregistered instance: ${instanceId}`);
  }

  // Select instance for workflow execution
  selectInstance(workflowType?: string): InstanceInfo | null {
    const instances = Array.from(this.instances.values());
    return this.currentStrategy.selectInstance(instances, workflowType);
  }

  // Get all instances
  getInstances(): InstanceInfo[] {
    return Array.from(this.instances.values());
  }

  // Get healthy instances
  getHealthyInstances(): InstanceInfo[] {
    return Array.from(this.instances.values()).filter(inst => inst.status === 'healthy');
  }

  // Get instance by ID
  getInstance(instanceId: string): InstanceInfo | null {
    return this.instances.get(instanceId) || null;
  }

  // Change load balancing strategy
  setStrategy(strategyName: string): boolean {
    const strategy = this.strategies.get(strategyName);
    if (strategy) {
      this.currentStrategy = strategy;
      console.log(`Load balancing strategy changed to: ${strategyName}`);
      return true;
    }
    return false;
  }

  // Get current strategy
  getCurrentStrategy(): string {
    return this.currentStrategy.name;
  }

  // Get available strategies
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  // Send heartbeat
  async sendHeartbeat(instanceId: string, load: number, capabilities: Partial<InstanceInfo['capabilities']>): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    // Update instance info
    this.instances.set(instanceId, {
      ...instance,
      status: load < 90 ? 'healthy' : 'overloaded',
      load,
      lastHeartbeat: Date.now(),
      capabilities: { ...instance.capabilities, ...capabilities }
    });

    // Persist heartbeat to database
    try {
      await supabase
        .from('workflow_instances')
        .upsert({
          instance_id: instanceId,
          load,
          capabilities: { ...instance.capabilities, ...capabilities },
          last_heartbeat: new Date().toISOString(),
          status: load < 90 ? 'healthy' : 'overloaded'
        });
    } catch (error) {
      console.error('Failed to persist heartbeat:', error);
    }
  }

  // Start heartbeat monitoring
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, 30000); // Check every 30 seconds
  }

  // Check heartbeats and mark unhealthy instances
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    for (const [instanceId, instance] of this.instances.entries()) {
      if (now - instance.lastHeartbeat > timeout) {
        console.warn(`Instance ${instanceId} missed heartbeat, marking as unhealthy`);
        this.instances.set(instanceId, {
          ...instance,
          status: 'unhealthy'
        });
      }
    }
  }

  // Start cleanup process
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInstances();
    }, 300000); // Clean up every 5 minutes
  }

  // Clean up old/unhealthy instances
  private cleanupInstances(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [instanceId, instance] of this.instances.entries()) {
      if (instance.status === 'unhealthy' && now - instance.lastHeartbeat > maxAge) {
        console.log(`Cleaning up old unhealthy instance: ${instanceId}`);
        this.instances.delete(instanceId);
      }
    }
  }

  // Get load balancer statistics
  getStats(): {
    totalInstances: number;
    healthyInstances: number;
    unhealthyInstances: number;
    overloadedInstances: number;
    averageLoad: number;
    strategy: string;
    instanceStats: Array<{
      id: string;
      status: string;
      load: number;
      region: string;
    }>;
  } {
    const instances = Array.from(this.instances.values());
    const healthy = instances.filter(inst => inst.status === 'healthy');
    const unhealthy = instances.filter(inst => inst.status === 'unhealthy');
    const overloaded = instances.filter(inst => inst.status === 'overloaded');

    const averageLoad = instances.length > 0
      ? instances.reduce((sum, inst) => sum + inst.load, 0) / instances.length
      : 0;

    return {
      totalInstances: instances.length,
      healthyInstances: healthy.length,
      unhealthyInstances: unhealthy.length,
      overloadedInstances: overloaded.length,
      averageLoad,
      strategy: this.currentStrategy.name,
      instanceStats: instances.map(inst => ({
        id: inst.id,
        status: inst.status,
        load: inst.load,
        region: inst.metadata.region
      }))
    };
  }

  // Emergency failover
  emergencyFailover(): InstanceInfo | null {
    // Find the healthiest available instance
    const healthyInstances = Array.from(this.instances.values())
      .filter(inst => inst.status === 'healthy')
      .sort((a, b) => a.load - b.load); // Sort by load ascending

    return healthyInstances[0] || null;
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down workflow load balancer...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Mark all instances as unhealthy
    for (const [instanceId, instance] of this.instances.entries()) {
      this.instances.set(instanceId, {
        ...instance,
        status: 'unhealthy'
      });
    }

    console.log('✓ Workflow load balancer shutdown complete');
  }
}

// Singleton instance
export const workflowLoadBalancer = WorkflowLoadBalancer.getInstance();

// Auto-register current instance
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  const instanceId = process.env.INSTANCE_ID || `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const instanceInfo: InstanceInfo = {
    id: instanceId,
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '3000'),
    status: 'healthy',
    load: 0,
    lastHeartbeat: Date.now(),
    capabilities: {
      maxConcurrency: 5,
      supportedWorkflowTypes: ['trigger', 'action', 'condition', 'delay', 'time_window'],
      memoryUsage: 0,
      cpuUsage: 0
    },
    metadata: {
      version: process.env.npm_package_version || '1.0.0',
      region: process.env.REGION || 'us-east-1',
      environment: process.env.NODE_ENV || 'development'
    }
  };

  workflowLoadBalancer.registerInstance(instanceInfo);

  // Send periodic heartbeats
  setInterval(async () => {
    try {
      // Calculate current load (simplified)
      const memUsage = process.memoryUsage();
      const memoryLoad = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      await workflowLoadBalancer.sendHeartbeat(instanceId, memoryLoad, {
        memoryUsage: memUsage.heapUsed,
        cpuUsage: 0 // Would need additional monitoring
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, 30000); // Every 30 seconds
}
