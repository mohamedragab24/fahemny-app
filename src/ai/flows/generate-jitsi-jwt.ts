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
  roomName: z.string().describe("The name of the room the user is joining."),
});

export type GenerateJitsiJwtInput = z.infer<typeof GenerateJitsiJwtInputSchema>;

// IMPORTANT: Replace with your actual Jitsi/8x8 App ID and Private Key.
// You can get these from your 8x8 JaaS account dashboard.
const JITSI_APP_ID = "vpaas-magic-cookie-1fbd16d85bf84be0aaba7317c17f25dd/474ff9-SAMPLE_APP";
const JITSI_PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
PLACE YOUR 8x8 JAAS PRIVATE KEY HERE
-----END PRIVATE KEY-----
`;

export const generateJitsiJwtFlow = ai.defineFlow(
  {
    name: 'generateJitsiJwtFlow',
    inputSchema: GenerateJitsiJwtInputSchema,
    outputSchema: z.string().describe("The generated JSON Web Token."),
  },
  async (input) => {
    if (!JITSI_PRIVATE_KEY.includes('PRIVATE KEY')) {
         throw new Error('Jitsi private key is not set. Please update it in src/ai/flows/generate-jitsi-jwt.ts');
    }
    
    const payload = {
      aud: 'jitsi',
      iss: 'chat',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours expiration
      nbf: Math.floor(Date.now() / 1000) - 10, // 10 seconds tolerance
      sub: JITSI_APP_ID.split('/')[0],
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
    
    const token = jwt.sign(payload, JITSI_PRIVATE_KEY, {
        algorithm: 'RS256',
        header: {
            alg: 'RS256',
            kid: JITSI_APP_ID,
            typ: 'JWT'
        }
    });

    return token;
  }
);

// Wrapper function to be called from the client
export async function generateJitsiJwt(input: GenerateJitsiJwtInput) {
    return generateJitsiJwtFlow(input);
}
