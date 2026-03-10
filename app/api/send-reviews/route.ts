import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendSMS } from '@/lib/twilio';

type RequestBody = {
  campaignId: string;
  contactIds: string[];
};

export async function POST(req: Request) {
  try {
    const { campaignId, contactIds } = (await req.json()) as RequestBody;

    if (!campaignId || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'campaignId and contactIds are required.' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid Authorization header.' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or ANON key is not configured.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in send-reviews:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const {
      data: reseller,
      error: resellerError,
    } = await supabaseAdmin
      .from('resellers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (resellerError || !reseller) {
      console.error('Reseller fetch error:', resellerError);
      return NextResponse.json(
        { success: false, error: 'No reseller profile found for user.' },
        { status: 403 }
      );
    }

    const {
      data: campaign,
      error: campaignError,
    } = await supabaseAdmin
      .from('review_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign fetch error:', campaignError);
      return NextResponse.json(
        { success: false, error: 'Campaign not found.' },
        { status: 404 }
      );
    }

    const {
      data: client,
      error: clientError,
    } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', campaign.client_id)
      .single();

    if (clientError || !client) {
      console.error('Client fetch error:', clientError);
      return NextResponse.json(
        { success: false, error: 'Client not found for campaign.' },
        { status: 404 }
      );
    }

    if (client.reseller_id !== reseller.id) {
      console.error(
        'Client does not belong to reseller',
        client.reseller_id,
        reseller.id
      );
      return NextResponse.json(
        { success: false, error: 'You do not have access to this client.' },
        { status: 403 }
      );
    }

    if (!client.google_review_link) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client has no Google Review link configured',
        },
        { status: 400 }
      );
    }

    const {
      data: contacts,
      error: contactsError,
    } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .in('id', contactIds);

    if (contactsError) {
      console.error('Contacts fetch error:', contactsError);
      return NextResponse.json(
        { success: false, error: 'Failed to load contacts.' },
        { status: 500 }
      );
    }

    const contactsWithPhone = (contacts || []).filter(
      (c) => c.phone && c.phone.trim() !== ''
    );

    if (contactsWithPhone.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contacts with valid phone numbers.' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL is not set.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const contact of contactsWithPhone) {
      const trackingId = crypto.randomUUID();
      const reviewLink = `${baseUrl}/api/r/${trackingId}`;

      // Replace template variables (case-insensitive, multiple formats)
      let personalizedMessage = (campaign.message_template || '')
        .replace(/\{customer_name\}/gi, contact.name || '')
        .replace(/\{name\}/gi, contact.name || '')
        .replace(/\{business_name\}/gi, client.business_name || '')
        .replace(/\{business\}/gi, client.business_name || '')
        .replace(/\{review_link\}/gi, reviewLink)
        .replace(/\{link\}/gi, reviewLink);

      try {
        const {
          data: inserted,
          error: insertError,
        } = await supabaseAdmin
          .from('review_requests')
          .insert([
            {
              campaign_id: campaignId,
              contact_id: contact.id,
              tracking_id: trackingId,
              channel: 'sms',
              status: 'sending',
              message_content: personalizedMessage,
              sent_at: null,
            },
          ])
          .select('id')
          .single();

        if (insertError || !inserted) {
          throw insertError || new Error('Failed to insert review_request');
        }

        const requestId = inserted.id;

        const smsResult = await sendSMS(contact.phone, personalizedMessage);

        if (smsResult.success) {
          sentCount += 1;

          await supabaseAdmin
            .from('review_requests')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', requestId);
        } else {
          failedCount += 1;

          await supabaseAdmin
            .from('review_requests')
            .update({
              status: 'failed',
            })
            .eq('id', requestId);
        }

        await supabaseAdmin
          .from('contacts')
          .update({ review_requested: true })
          .eq('id', contact.id);
      } catch (err) {
        console.error('Error processing SMS for contact:', contact.id, err);
        failedCount += 1;
      }
    }

    if (sentCount > 0) {
      await supabaseAdmin
        .from('review_campaigns')
        .update({
          total_sent: (campaign.total_sent || 0) + sentCount,
        })
        .eq('id', campaignId);
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: sentCount + failedCount,
    });
  } catch (err) {
    console.error('Unexpected error in send-reviews endpoint:', err);
    return NextResponse.json(
      { success: false, error: 'Unexpected server error.' },
      { status: 500 }
    );
  }
}