
import { NextRequest, NextResponse } from "next/server";

const PIPER_URL =
  process.env.PIPER_URL || "http://127.0.0.1:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required." },
        { status: 400 }
      );
    }

    // Avoid unnecessarily large synthesis requests.
    if (text.length > 1000) {
      return NextResponse.json(
        { error: "Text is too long." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${PIPER_URL}/synthesize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error("Piper error:", details);

      return NextResponse.json(
        { error: "Unable to generate speech." },
        { status: 502 }
      );
    }

    const audio = await response.arrayBuffer();

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Littlewood TTS error:", error);

    return NextResponse.json(
      { error: "Unable to connect to Piper." },
      { status: 500 }
    );
  }
}
