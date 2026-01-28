import {configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This file is the Genkit configuration entry point.
// It is automatically loaded by the Genkit CLI.
configureGenkit({
  plugins: [
    googleAI(),
  ],
  // Log level for Genkit development.
  logLevel: 'debug',
  // By default, Genkit enables tracing and metrics for local development.
  enableTracingAndMetrics: true,
});
