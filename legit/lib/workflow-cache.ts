/**
 * Workflow Execution Caching System
 * Caches execution plans and results for better performance
 */

import { Workflow, Patient, Appointment } from './database.types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ExecutionPlan {
  nodes: string[];
  dependencies: Map<string, string[]>;
  executionOrder: Map<string, number>;
}

interface CacheKey {
  workflowId: string;
  patientId: string;
  appointmentId: string;
  daysPassed: number;
}

export class WorkflowCache {
  private static instance: WorkflowCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): WorkflowCache {
    if (!WorkflowCache.instance) {
      WorkflowCache.instance = new WorkflowCache();
    }
    return WorkflowCache.instance;
  }

  private generateKey(key: CacheKey): string {
    return `${key.workflowId}:${key.patientId}:${key.appointmentId}:${key.daysPassed}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  // Cache execution plans
  cacheExecutionPlan(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    daysPassed: number,
    plan: ExecutionPlan,
    ttl?: number
  ): void {
    const key: CacheKey = {
      workflowId: workflow.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      daysPassed
    };

    const cacheKey = this.generateKey(key);
    this.cache.set(cacheKey, {
      data: plan,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });

    // Periodic cleanup
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup();
    }
  }

  getExecutionPlan(
    workflow: Workflow,
    patient: Patient,
    appointment: Appointment,
    daysPassed: number
  ): ExecutionPlan | null {
    const key: CacheKey = {
      workflowId: workflow.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      daysPassed
    };

    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }

    return null;
  }

  // Cache duplicate check results
  private duplicateCheckCache = new Map<string, CacheEntry<boolean>>();

  cacheDuplicateCheck(
    workflowId: string,
    patientId: string,
    nodeId: string,
    appointmentId: string,
    result: boolean,
    ttl?: number
  ): void {
    const key = `${workflowId}:${patientId}:${nodeId}:${appointmentId}`;
    this.duplicateCheckCache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl: ttl || 5 * 60 * 1000 // 5 minutes
    });
  }

  getDuplicateCheck(
    workflowId: string,
    patientId: string,
    nodeId: string,
    appointmentId: string
  ): boolean | null {
    const key = `${workflowId}:${patientId}:${nodeId}:${appointmentId}`;
    const entry = this.duplicateCheckCache.get(key);

    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }

    return null;
  }

  // Cache workflow validation results
  private validationCache = new Map<string, CacheEntry<any>>();

  cacheWorkflowValidation(
    workflowId: string,
    nodes: any[],
    edges: any[],
    result: any,
    ttl?: number
  ): void {
    const key = `validation:${workflowId}:${JSON.stringify(nodes).length}:${JSON.stringify(edges).length}`;
    this.validationCache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl: ttl || 10 * 60 * 1000 // 10 minutes
    });
  }

  getWorkflowValidation(
    workflowId: string,
    nodes: any[],
    edges: any[]
  ): any | null {
    const key = `validation:${workflowId}:${JSON.stringify(nodes).length}:${JSON.stringify(edges).length}`;
    const entry = this.validationCache.get(key);

    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }

    return null;
  }

  // Cache message templates
  private templateCache = new Map<string, CacheEntry<string>>();

  cacheMessageTemplate(
    templateId: string,
    variables: Record<string, string>,
    result: string,
    ttl?: number
  ): void {
    const key = `template:${templateId}:${JSON.stringify(variables)}`;
    this.templateCache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl: ttl || 60 * 60 * 1000 // 1 hour
    });
  }

  getMessageTemplate(
    templateId: string,
    variables: Record<string, string>
  ): string | null {
    const key = `template:${templateId}:${JSON.stringify(variables)}`;
    const entry = this.templateCache.get(key);

    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }

    return null;
  }

  // Statistics
  getStats(): {
    executionPlans: number;
    duplicateChecks: number;
    validations: number;
    templates: number;
    totalSize: number;
  } {
    return {
      executionPlans: this.cache.size,
      duplicateChecks: this.duplicateCheckCache.size,
      validations: this.validationCache.size,
      templates: this.templateCache.size,
      totalSize: this.cache.size + this.duplicateCheckCache.size +
                 this.validationCache.size + this.templateCache.size
    };
  }

  // Clear all caches
  clear(): void {
    this.cache.clear();
    this.duplicateCheckCache.clear();
    this.validationCache.clear();
    this.templateCache.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    this.cleanup();

    for (const [key, entry] of this.duplicateCheckCache.entries()) {
      if (this.isExpired(entry)) {
        this.duplicateCheckCache.delete(key);
      }
    }

    for (const [key, entry] of this.validationCache.entries()) {
      if (this.isExpired(entry)) {
        this.validationCache.delete(key);
      }
    }

    for (const [key, entry] of this.templateCache.entries()) {
      if (this.isExpired(entry)) {
        this.templateCache.delete(key);
      }
    }
  }
}

// Singleton instance
export const workflowCache = WorkflowCache.getInstance();
