'use server';
/**
 * @fileOverview A Genkit flow for generating a Jitsi JWT for secure meetings.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as jwt from 'jsonwebtoken';

const GenerateJitsiJwtInputSchema = z.object({
  userId: z.string().describe("The user's unique ID."),
  userName: z.string().describe("The user's display name."),
  userEmail: z.string().email().describe("The user's email address."),
  userAvatar: z.string().url().optional().describe("URL to the user's avatar image."),
  isModerator: z.boolean().describe("Whether the user should join as a moderator."),
  roomName: z.string().describe("The unique name of the room the user is joining."),
});

const GenerateJitsiJwtOutputSchema = z.object({
  jwt: z.string().describe("The generated JSON Web Token."),
});

export type GenerateJitsiJwtInput = z.infer<typeof GenerateJitsiJwtInputSchema>;
export type GenerateJitsiJwtOutput = z.infer<typeof GenerateJitsiJwtOutputSchema>;


// Securely load credentials from environment variables
const JITSI_APP_ID = process.env.JITSI_APP_ID;
const JITSI_PRIVATE_KEY = process.env.JITSI_PRIVATE_KEY;

export const generateJitsiJwtFlow = ai.defineFlow(
  {
    name: 'generateJitsiJwtFlow',
    inputSchema: GenerateJitsiJwtInputSchema,
    outputSchema: GenerateJitsiJwtOutputSchema,
  },
  async (input) => {
    if (!JITSI_APP_ID || !JITSI_PRIVATE_KEY) {
         throw new Error('Jitsi App ID or Private Key is not set in environment variables. Please check your .env.local file.');
    }

    const privateKey = JITSI_PRIVATE_KEY.replace(/\\n/g, '\n');

    const payload = {
      aud: 'jitsi',
      iss: 'chat',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours expiration
      nbf: Math.floor(Date.now() / 1000) - 10, // 10 seconds tolerance
      sub: JITSI_APP_ID,
      context: {
        features: {
          "recording": true,
          "livestreaming": false,
          "file-upload": true,
        },
        user: {
          id: input.userId,
          name: input.userName,
          email: input.userEmail,
          avatar: input.userAvatar,
          moderator: input.isModerator,
        },
      },
      room: input.roomName,
    };
    
    const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        header: {
            alg: 'RS256',
            kid: JITSI_APP_ID,
            typ: 'JWT'
        }
    });

    return {
      jwt: token,
    };
  }
);

// Wrapper function to be called from the client
export async function generateJitsiJwt(input: GenerateJitsiJwtInput): Promise<GenerateJitsiJwtOutput> {
    return generateJitsiJwtFlow(input);
}
