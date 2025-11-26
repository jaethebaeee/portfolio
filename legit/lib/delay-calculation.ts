/**
 * Delay Calculation Utilities
 * Handles delay calculations including business days and holiday awareness
 */

import { isHoliday } from './holiday-api';

export interface DelayConfig {
  type: 'minutes' | 'hours' | 'days' | 'business_days';
  value: number;
  skipWeekends?: boolean;
  skipHolidays?: boolean;
}

/**
 * Calculate delay in milliseconds
 */
export async function calculateDelayMs(delay: DelayConfig, startDate: Date = new Date()): Promise<number> {
  switch (delay.type) {
    case 'minutes':
      return delay.value * 60 * 1000;
    
    case 'hours':
      return delay.value * 60 * 60 * 1000;
    
    case 'days':
      return delay.value * 24 * 60 * 60 * 1000;
    
    case 'business_days':
      return await calculateBusinessDaysMs(delay.value, startDate, delay.skipWeekends ?? true, delay.skipHolidays ?? true);
    
    default:
      return 0;
  }
}

/**
 * Calculate business days delay in milliseconds
 * Skips weekends and optionally holidays
 */
export async function calculateBusinessDaysMs(
  days: number,
  startDate: Date,
  skipWeekends: boolean = true,
  skipHolidays: boolean = true
): Promise<number> {
  let currentDate = new Date(startDate);
  let businessDaysAdded = 0;
  let totalDays = 0;
  const maxIterations = 365; // Prevent infinite loops
  let iterations = 0;

  while (businessDaysAdded < days && iterations < maxIterations) {
    iterations++;
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    totalDays++;

    // Check if it's a weekend
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (skipWeekends && isWeekend) {
      continue; // Skip weekends
    }

    // Check if it's a holiday
    if (skipHolidays) {
      const isHolidayDate = await isHoliday(currentDate);
      if (isHolidayDate) {
        continue; // Skip holidays
      }
    }

    businessDaysAdded++;
  }

  if (iterations >= maxIterations) {
    console.warn(`Business days calculation reached max iterations. Using ${totalDays} days.`);
  }

  return totalDays * 24 * 60 * 60 * 1000;
}

/**
 * Calculate the actual execution date for a delay
 * Returns the date when the delayed action should execute
 */
export async function calculateExecutionDate(
  delay: DelayConfig,
  startDate: Date = new Date()
): Promise<Date> {
  const delayMs = await calculateDelayMs(delay, startDate);
  return new Date(startDate.getTime() + delayMs);
}

/**
 * Validate delay configuration
 */
export async function validateDelay(delay: DelayConfig): Promise<{
  isValid: boolean;
  error?: string;
  warning?: string;
}> {
  if (!delay.type) {
    return { isValid: false, error: 'Delay type is required' };
  }

  if (delay.value === undefined || delay.value <= 0) {
    return { isValid: false, error: 'Delay value must be greater than 0' };
  }

  // Max delay validation: 30 days
  const maxDelayMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const delayMs = await calculateDelayMs(delay);

  if (delayMs > maxDelayMs) {
    return {
      isValid: false,
      error: `Delay cannot exceed 30 days. Current delay: ${delay.value} ${delay.type}`,
    };
  }

  // Warning for long delays
  if (delayMs > 7 * 24 * 60 * 60 * 1000) {
    return {
      isValid: true,
      warning: `Long delay detected (${delay.value} ${delay.type}). Consider using business_days for better scheduling.`,
    };
  }

  return { isValid: true };
}

/**
 * Format delay for display
 */
export function formatDelay(delay: DelayConfig): string {
  const labels = {
    minutes: '분',
    hours: '시간',
    days: '일',
    business_days: '영업일',
  };

  return `${delay.value}${labels[delay.type] || delay.type}`;
}

