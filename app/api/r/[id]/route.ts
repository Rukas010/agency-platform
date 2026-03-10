import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackingId } = await params;

  if (!trackingId) {
    return new NextResponse('Invalid tracking link', { status: 400 });
  }

  try {
    // Find the review request by tracking ID
    const { data: reviewRequest, error: reqError } = await supabaseAdmin
      .from('review_requests')
      .select('*, review_campaigns(*, clients(*))')
      .eq('tracking_id', trackingId)
      .single();

    if (reqError || !reviewRequest) {
      console.error('Review request not found:', reqError);
      return new NextResponse('Review link not found', { status: 404 });
    }

    // Update click tracking (only on first click)
    if (!reviewRequest.clicked_at) {
      await supabaseAdmin
        .from('review_requests')
        .update({
          clicked_at: new Date().toISOString(),
          status: 'clicked',
        })
        .eq('id', reviewRequest.id);

      // Increment campaign total_clicked
      const campaign = reviewRequest.review_campaigns;
      if (campaign) {
        await supabaseAdmin
          .from('review_campaigns')
          .update({
            total_clicked: (campaign.total_clicked || 0) + 1,
          })
          .eq('id', campaign.id);
      }
    }

    // Get the Google Review link from the client
    const googleReviewLink =
      reviewRequest.review_campaigns?.clients?.google_review_link;

    if (!googleReviewLink) {
      console.error('No Google Review link found for client');
      return new NextResponse('Review page not available', { status: 404 });
    }

    // Redirect to the actual Google Review page
    return NextResponse.redirect(googleReviewLink);
  } catch (err) {
    console.error('Error in click tracking:', err);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}