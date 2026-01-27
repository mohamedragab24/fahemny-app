'use server';
/**
 * @fileOverview A Genkit flow for creating a unique meeting link for a session.
 * NOTE: The filename is a legacy name. This flow now uses Jitsi Meet.
 * This uses Jitsi Meet to dynamically generate a unique, private URL for each session
 * without needing API keys or complex authentication.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreateMeetingLinkInputSchema = z.object({
  topic: z.string().describe("The topic of the meeting."),
  startTime: z.string().describe("The start time of the meeting in ISO 8601 format."),
  sessionId: z.string().describe("The unique ID of the session request, used to generate the unique meeting URL."),
});

export type CreateMeetingLinkInput = z.infer<typeof CreateMeetingLinkInputSchema>;

export const createMeetingLinkFlow = ai.defineFlow(
  {
    name: 'createMeetingLinkFlow', // Renamed flow for clarity
    inputSchema: CreateMeetingLinkInputSchema,
    outputSchema: z.string().describe("The join URL for the created meeting."),
  },
  async (input) => {
    // We use the session ID to create a unique and private room name.
    // The prefix "Fahemny" makes it identifiable.
    const meetingId = `Fahemny-Session-${input.sessionId}`;
    
    // Using Jitsi Meet allows for creating dynamic rooms just by crafting a URL.
    // This is robust and avoids external API failures or key management.
    return `https://meet.jit.si/${meetingId}`;
  }
);

// Wrapper function to be called from the client
export async function createMeetingLink(input: CreateMeetingLinkInput) {
    return createMeetingLinkFlow(input);
}
