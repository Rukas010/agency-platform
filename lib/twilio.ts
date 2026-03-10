// Mock mode - set to false when Twilio is ready (UK number approved or account upgraded)
const MOCK_MODE = true;

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string) {
  if (MOCK_MODE) {
    console.log('');
    console.log('=== MOCK SMS ===');
    console.log('To:', to);
    console.log('From:', fromNumber);
    console.log('Body:', body);
    console.log('Status: SUCCESS (mock)');
    console.log('================');
    console.log('');

    return {
      success: true,
      messageSid: 'MOCK_' + Date.now(),
    };
  }

  try {
    const message = await client.messages.create({
      to,
      from: fromNumber,
      body,
    });

    console.log('SMS sent successfully:', message.sid);

    return {
      success: true,
      messageSid: message.sid,
    };
  } catch (error: any) {
    console.error('Error sending Twilio SMS:', error);

    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}