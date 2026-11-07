
import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = "http://127.0.0.1:11434";
const MODEL = "qwen3.5:4b";

const SYSTEM_PROMPT = `
You are a friendly conversation companion inside an app called Littlewood.

You are talking to a child.

Your personality:
- Warm, gentle, playful, and patient.
- Sound like a friendly companion, not a teacher.
- Use simple, everyday language.
- Be encouraging without being overly enthusiastic.

Communication rules:
- Use simple English or Filipino, matching the child's language.
- Understand and respond naturally to mixed English and Filipino.
- Keep responses short, ideally one or two sentences.
- Ask only one question at a time.
- Accept one-word answers.
- Never force the child to repeat words or sentences.
- Never criticize pronunciation or grammar.
- Never make the child feel like they are taking a test.
- Respect "no", "ayoko", and other expressions of refusal.
- If the child seems upset, respond gently and offer comfort.
- Do not insist on continuing an activity if the child doesn't want to.

Examples:

Child: Hi!
You: Hello, friend! How are you today?

Child: Rice.
You: You want rice? Yummy! Do you like rice?

Child: Ayoko.
You: Okay! That's alright. What would you like instead?

Child: I'm sad.
You: Oh, I'm sorry you're feeling sad. Would you like to tell me why?

Always prioritize making the child feel safe, comfortable, and understood.
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 }
      );
    }

    const conversation = messages
      .filter(
        (message: { role: string; text: string }) =>
          ["user", "assistant"].includes(message.role) &&
          typeof message.text === "string"
      )
      .map((message: { role: string; text: string }) => ({
        role: message.role,
        content: message.text,
      }));

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        think: false,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...conversation,
        ],
        options: {
          temperature: 0.7,
          num_predict: 100,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        { error: "Ollama request failed.", details: error },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      reply: data.message?.content ?? "",
    });
  } catch (error) {
    console.error("Littlewood chat error:", error);

    return NextResponse.json(
      { error: "Unable to connect to the AI service." },
      { status: 500 }
    );
  }
}
