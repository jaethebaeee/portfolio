import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '@/lib/workflows';
import { Workflow } from '@/lib/database.types';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { validateRequestBody, validationSchemas } from '@/lib/input-validation';

/**
 * GET /api/workflows/[id] - 워크플로우 단일 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Rate limiting
    const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitResult.message || 'Too many requests',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const workflow = await getWorkflow(userId, id);

    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workflow });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('워크플로우 조회 오류:', error);
    }
    
    // Handle not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workflows/[id] - 워크플로우 업데이트
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Rate limiting
    const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitResult.message || 'Too many requests',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // INPUT VALIDATION: Validate workflow update inputs
    const validationErrors: string[] = [];

    // Validate name
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        validationErrors.push('name must be a string');
      } else if (body.name.length > 200) {
        validationErrors.push('name must be 200 characters or less');
      } else if (body.name.trim().length === 0) {
        validationErrors.push('name cannot be empty');
      }
    }

    // Validate trigger_type
    if (body.trigger_type !== undefined) {
      const validTriggerTypes = ['post_surgery', 'appointment', 'manual', 'keyword_received'];
      if (!validTriggerTypes.includes(body.trigger_type)) {
        validationErrors.push(`trigger_type must be one of: ${validTriggerTypes.join(', ')}`);
      }
    }

    // Validate visual_data structure
    if (body.visual_data !== undefined) {
      if (body.visual_data !== null && typeof body.visual_data !== 'object') {
        validationErrors.push('visual_data must be an object or null');
      } else if (body.visual_data !== null) {
        if (!Array.isArray(body.visual_data.nodes)) {
          validationErrors.push('visual_data.nodes must be an array');
        }
        if (!Array.isArray(body.visual_data.edges)) {
          validationErrors.push('visual_data.edges must be an array');
        }
      }
    }

    // Validate steps array structure
    if (body.steps !== undefined) {
      if (!Array.isArray(body.steps)) {
        validationErrors.push('steps must be an array');
      } else {
        body.steps.forEach((step: any, index: number) => {
          if (typeof step !== 'object' || step === null) {
            validationErrors.push(`steps[${index}] must be an object`);
          } else {
            if (step.day !== undefined && (typeof step.day !== 'number' || step.day < 0)) {
              validationErrors.push(`steps[${index}].day must be a non-negative number`);
            }
            if (step.type && !['survey', 'photo', 'message'].includes(step.type)) {
              validationErrors.push(`steps[${index}].type must be one of: survey, photo, message`);
            }
          }
        });
      }
    }

    // Validate is_active
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
      validationErrors.push('is_active must be a boolean');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    // Build update input (only include provided fields)
    const updates: Partial<Workflow> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.description !== undefined) updates.description = body.description;
    if (body.trigger_type !== undefined) updates.trigger_type = body.trigger_type;
    if (body.target_surgery_type !== undefined) updates.target_surgery_type = body.target_surgery_type;
    if (body.steps !== undefined) updates.steps = body.steps;
    if (body.visual_data !== undefined) updates.visual_data = body.visual_data;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const workflow = await updateWorkflow(userId, id, updates);
    return NextResponse.json({ workflow });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('워크플로우 업데이트 오류:', error);
    }
    
    // Handle not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id] - 워크플로우 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Rate limiting
    const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitResult.message || 'Too many requests',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteWorkflow(userId, id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('워크플로우 삭제 오류:', error);
    }
    
    // Handle not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

