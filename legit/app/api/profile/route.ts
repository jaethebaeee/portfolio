import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProfile } from '@/lib/profiles';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const profile = await getProfile(userId);

    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
