import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const MAX_RETRIES = 5;

// Definir la interfaz manualmente
interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function fetchOpenAIResponse(messages: ChatCompletionMessageParam[], retries = 0): Promise<Response> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            stream: true,
            messages,
        });

        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response);

        // Wrap the stream in a Response object
        return new Response(stream);
    } catch (error: unknown) {
        if (error instanceof OpenAI.APIError && error.status === 429 && retries < MAX_RETRIES) {
            // Exponential backoff
            const waitTime = Math.pow(2, retries) * 1000; // in milliseconds
            console.log(`429 error encountered. Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return fetchOpenAIResponse(messages, retries + 1);
        } else {
            if (error instanceof Error) {
                console.error(`Error: ${error.message}`);
            } else {
                console.error(`Unknown error: ${error}`);
            }
            throw error;
        }
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        console.log('Received request:', req);
        const { messages }: { messages: ChatCompletionMessageParam[] } = await req.json();
        console.log('Messages:', messages);

        // Ask OpenAI for a streaming chat completion given the prompt
        const response = await fetchOpenAIResponse(messages);

        // Respond with the response object directly
        return response;
    } catch (error: unknown) {
        if (error instanceof OpenAI.APIError) {
            const { name, status, headers, message } = error;
            console.error(`API Error: ${message}`);
            return NextResponse.json({ name, status, headers, message }, { status });
        } else {
            if (error instanceof Error) {
                console.error(`Unhandled Error: ${error.message}`);
            } else {
                console.error(`Unknown error: ${error}`);
            }
            throw error;
        }
    }
}
