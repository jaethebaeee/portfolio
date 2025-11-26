/**
 * Comprehensive input validation utilities for API endpoints
 */

import { validateKoreanPhoneNumber } from './phone-validation';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Validate and sanitize API request body
 */
export function validateRequestBody(body: any, schema: ValidationSchema): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    const fieldErrors = validateField(value, rules, field);

    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
    } else if (rules.sanitize) {
      sanitizedData[field] = sanitizeValue(value, rules);
    } else {
      sanitizedData[field] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'phone' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  sanitize?: boolean;
  customValidator?: (value: any) => string | null;
  arrayItemValidator?: (value: any, index: number) => string | null;
  objectSchema?: ValidationSchema;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

/**
 * Validate a single field
 */
function validateField(value: any, rules: ValidationRule, fieldName: string): string[] {
  const errors: string[] = [];

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName}은(는) 필수 입력 항목입니다.`);
    return errors; // Don't continue validation if required field is missing
  }

  // Skip further validation if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return errors;
  }

  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName}은(는) 문자열이어야 합니다.`);
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${fieldName}은(는) 숫자여야 합니다.`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          errors.push(`${fieldName}은(는) true 또는 false여야 합니다.`);
        }
        break;
      case 'phone':
        const phoneValidation = validateKoreanPhoneNumber(value);
        if (!phoneValidation.isValid) {
          errors.push(phoneValidation.error || `${fieldName}은(는) 올바른 전화번호 형식이 아닙니다.`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldName}은(는) 배열이어야 합니다.`);
        } else {
          // Array length validation
          if (rules.minLength !== undefined && value.length < rules.minLength) {
            errors.push(`${fieldName}은(는) 최소 ${rules.minLength}개의 항목이 필요합니다.`);
          }
          if (rules.maxLength !== undefined && value.length > rules.maxLength) {
            errors.push(`${fieldName}은(는) 최대 ${rules.maxLength}개의 항목까지 허용됩니다.`);
          }
          // Array item validation
          if (rules.arrayItemValidator) {
            value.forEach((item, index) => {
              const itemError = rules.arrayItemValidator!(item, index);
              if (itemError) {
                errors.push(`${fieldName}[${index}]: ${itemError}`);
              }
            });
          }
        }
        break;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`${fieldName}은(는) 객체여야 합니다.`);
        } else if (rules.objectSchema) {
          // Validate nested object schema
          const nestedValidation = validateRequestBody(value, rules.objectSchema);
          if (!nestedValidation.isValid) {
            nestedValidation.errors.forEach(error => {
              errors.push(`${fieldName}.${error}`);
            });
          }
        }
        break;
    }
  }

  // String-specific validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName}은(는) 최소 ${rules.minLength}자 이상이어야 합니다.`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName}은(는) 최대 ${rules.maxLength}자 이하여야 합니다.`);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${fieldName} 형식이 올바르지 않습니다.`);
    }
  }

  // Allowed values check
  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    errors.push(`${fieldName}은(는) 다음 값 중 하나여야 합니다: ${rules.allowedValues.join(', ')}`);
  }

  // Custom validator
  if (rules.customValidator) {
    const customError = rules.customValidator(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return errors;
}

/**
 * Sanitize a value based on rules
 */
function sanitizeValue(value: any, rules: ValidationRule): any {
  if (typeof value === 'string') {
    let sanitized = value.trim();

    // Basic XSS prevention
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    return sanitized;
  }

  if (rules.type === 'phone') {
    const phoneValidation = validateKoreanPhoneNumber(value);
    return phoneValidation.formatted || value;
  }

  return value;
}

/**
 * Validation schemas for different API endpoints
 */
export const validationSchemas = {
  generateMarketing: {
    prompt: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 500,
      sanitize: true,
    },
    count: {
      type: 'number' as const,
      allowedValues: [1, 3],
    },
  },

  sendKakaoMessage: {
    phoneNumber: {
      required: true,
      type: 'phone' as const,
      sanitize: true,
    },
    content: {
      type: 'string' as const,
      maxLength: 1000, // 카카오톡 텍스트 제한
      sanitize: true,
    },
    templateId: {
      type: 'string' as const,
      sanitize: true,
    },
    campaignId: {
      type: 'string' as const,
      sanitize: true,
    },
    patientId: {
      type: 'string' as const,
      sanitize: true,
    },
  },

  sendSMS: {
    recipientPhone: {
      type: 'phone' as const,
      sanitize: true,
    },
    content: {
      type: 'string' as const,
      maxLength: 2000, // LMS 길이 고려
      sanitize: true,
    },
  },

  updateWorkflow: {
    name: {
      type: 'string' as const,
      minLength: 1,
      maxLength: 200,
      sanitize: true,
    },
    description: {
      type: 'string' as const,
      maxLength: 1000,
      sanitize: true,
    },
    trigger_type: {
      type: 'string' as const,
      allowedValues: ['post_surgery', 'schedule'],
    },
    target_surgery_type: {
      type: 'string' as const,
      maxLength: 100,
      sanitize: true,
    },
    steps: {
      type: 'array' as const,
      arrayItemValidator: (item: any, index: number) => {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          return '각 스텝은 객체여야 합니다.';
        }
        if (typeof item.day !== 'number' || item.day < 0) {
          return 'day는 0 이상의 숫자여야 합니다.';
        }
        if (!['survey', 'photo'].includes(item.type)) {
          return 'type은 "survey" 또는 "photo"여야 합니다.';
        }
        if (item.title !== undefined && typeof item.title !== 'string') {
          return 'title은 문자열이어야 합니다.';
        }
        if (item.message_template !== undefined && typeof item.message_template !== 'string') {
          return 'message_template은 문자열이어야 합니다.';
        }
        return null;
      },
    },
    visual_data: {
      type: 'object' as const,
      objectSchema: {
        nodes: {
          type: 'array' as const,
        },
        edges: {
          type: 'array' as const,
        },
      },
    },
    is_active: {
      type: 'boolean' as const,
    },
  },
};

/**
 * Validate marketing prompt content
 */
export function validateMarketingPrompt(prompt: string): ValidationResult {
  const errors: string[] = [];

  if (!prompt || prompt.trim().length === 0) {
    errors.push('프롬프트는 필수 입력 항목입니다.');
  } else if (prompt.length > 500) {
    errors.push('프롬프트는 500자를 초과할 수 없습니다.');
  } else {
    // Check for potentially harmful content
    const harmfulPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(prompt)) {
        errors.push('프롬프트에 허용되지 않는 내용이 포함되어 있습니다.');
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? { prompt: prompt.trim() } : undefined,
  };
}

/**
 * Sanitize user input for safe display/storage
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 10000); // Reasonable length limit
}
