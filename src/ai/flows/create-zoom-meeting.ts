'use server';
/**
 * @fileOverview A Genkit flow for creating a Zoom meeting.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreateZoomMeetingInputSchema = z.object({
  topic: z.string().describe("The topic of the Zoom meeting."),
  startTime: z.string().describe("The start time of the meeting in ISO 8601 format."),
});

export const createZoomMeetingFlow = ai.defineFlow(
  {
    name: 'createZoomMeetingFlow',
    inputSchema: CreateZoomMeetingInputSchema,
    outputSchema: z.string().describe("The join URL for the created Zoom meeting."),
  },
  async (input) => {
    const { topic, startTime } = input;
    
    const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
    const zoomClientId = process.env.ZOOM_CLIENT_ID;
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
      throw new Error('Zoom environment variables are not set. Please check your .env.local file.');
    }

    // 1. Get Access Token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${zoomClientId}:${zoomClientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'account_credentials',
            'account_id': zoomAccountId,
        }),
        cache: 'no-store',
    });

    if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error("Zoom Auth Error:", errorBody);
        throw new Error(`Failed to get Zoom access token. Status: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Create Meeting
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            topic: topic,
            type: 2, // Scheduled meeting
            start_time: startTime,
            duration: 60, // Default to 60 minutes
            timezone: 'UTC',
            settings: {
                join_before_host: true,
                mute_upon_entry: true,
                participant_video: true,
                host_video: true,
                auto_recording: 'cloud',
            },
        }),
    });

    if (!meetingResponse.ok) {
        const errorBody = await meetingResponse.text();
        console.error("Zoom Meeting Creation Error:", errorBody);
        throw new Error(`Failed to create Zoom meeting. Status: ${meetingResponse.status}`);
    }
    
    const meetingData = await meetingResponse.json();
    return meetingData.join_url;
  }
);

// Wrapper function to be called from the client
export async function createZoomMeeting(input: z.infer<typeof CreateZoomMeetingInputSchema>) {
    return createZoomMeetingFlow(input);
}
