import { NextRequest, NextResponse } from 'next/server';
import { campaigns, ScheduledCampaign } from '../route';

// GET /api/scheduling/campaigns/[id] - Get specific campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = campaigns.find(c => c.id === id);

    if (!campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      campaign
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch campaign'
    }, { status: 500 });
  }
}

// PUT /api/scheduling/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignIndex = campaigns.findIndex(c => c.id === id);

    if (campaignIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    const updateData: Partial<ScheduledCampaign> = await request.json();

    // Update campaign
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      campaign: campaigns[campaignIndex]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update campaign'
    }, { status: 500 });
  }
}

// DELETE /api/scheduling/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignIndex = campaigns.findIndex(c => c.id === id);

    if (campaignIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    const deletedCampaign = campaigns.splice(campaignIndex, 1)[0];

    return NextResponse.json({
      success: true,
      campaign: deletedCampaign
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete campaign'
    }, { status: 500 });
  }
}
