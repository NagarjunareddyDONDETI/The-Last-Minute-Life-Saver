import 'dotenv/config'
import fs from 'fs'

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set.");
  process.exit(1);
}

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const model = 'gemini-2.0-flash';

const endpoint = `${BASE}/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;

const VIBE_SCHEMA = {
  type: 'object',
  properties: {
    spokenResponse: {
      type: 'string',
    },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
          },
          payload: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
              },
              estMinutes: {
                type: 'integer',
              },
              deadlineOffsetHours: {
                type: 'integer',
              },
              taskId: {
                type: 'string',
              },
            },
          },
        },
        required: ['type'],
      },
    },
  },
  required: ['spokenResponse', 'actions'],
};

async function test() {
  console.log("🔄 Testing Gemini API Key...");

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: VIBE_SCHEMA,
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`❌ Error ${res.status}:`);
      console.error(txt);
      return;
    }

    const data = await res.json();

    console.log("✅ Success!");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Request failed:");
    console.error(err);
  }
}

test();