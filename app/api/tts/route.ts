import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, voiceId = 'kE4MZWZZYthY2DgduxLK' } = await request.json(); // elevel labs custom made voice female

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ElevenLabs API Key is not configured' }, { status: 500 });
    }

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_flash_v2_5',
      outputFormat: 'mp3_44100_128',
    });

    // The SDK returns a standard web stream or an async iterable depending on the version.
    // However, usually it's a readable stream we can pass to Response directly.
    return new Response(audioStream as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
