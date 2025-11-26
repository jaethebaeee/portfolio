import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createProfile, getProfile, updateProfile } from '@/lib/profiles';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const profile = await getProfile(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { hospitalName, businessType, practiceSize, userRole, specialty } = body;

    if (!hospitalName) {
      return new NextResponse('Institution Name is required', { status: 400 });
    }

    const existingProfile = await getProfile(userId);
    let profile;

    if (existingProfile) {
        profile = await updateProfile(userId, {
          hospital_name: hospitalName,
          business_type: businessType || 'medical',
          practice_size: practiceSize || null,
          user_role: userRole || null,
          specialty: specialty || null
        });
    } else {
        profile = await createProfile(userId, {
          hospital_name: hospitalName,
          business_type: businessType || 'medical',
          practice_size: practiceSize || null,
          user_role: userRole || null,
          specialty: specialty || null
        });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

