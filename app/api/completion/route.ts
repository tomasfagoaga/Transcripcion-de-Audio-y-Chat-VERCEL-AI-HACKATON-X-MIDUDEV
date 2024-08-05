import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    max_tokens: 2000,
    stream: true,
    prompt,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
