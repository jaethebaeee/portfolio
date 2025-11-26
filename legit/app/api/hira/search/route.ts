import { NextRequest, NextResponse } from 'next/server';
import { searchHospitals } from '@/lib/hira-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchHospitals(query);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('HIRA API Search Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital data' },
      { status: 500 }
    );
  }
}

