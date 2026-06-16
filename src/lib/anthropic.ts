import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function getMarketResearch(params: {
  serviceType: string;
  location: string;
  description: string;
  techLevel: string;
  needLevel: string;
  estimatedHours?: number;
  multiTask?: boolean;
  isRepeatClient?: boolean;
  previousPrice?: number;
  previousService?: string;
}): Promise<{
  low: number;
  high: number;
  recommended: number;
  reasoning: string;
  marketContext: string;
}> {
  const serviceLabels: Record<string, string> = {
    "it-support": "IT Support / Tech Help (in-home or remote)",
    "social-media": "Social Media Management",
    consulting: "Tech Consulting / Advisory",
    "web-dev": "Website / Web Development",
    "system-migration": "System Migration (SMB)",
    "lead-generation": "Lead Generation",
    workshop: "Workshop / Training Session",
  };

  const repeatClientLine = params.isRepeatClient && params.previousPrice
    ? `- Client History: REPEAT CLIENT — previously charged $${params.previousPrice} for ${serviceLabels[params.previousService || ""] || params.previousService || "a previous visit"} (use this as a pricing anchor for consistency)`
    : "- Client History: New client";

  const multiTaskLine = params.multiTask
    ? "- Visit Complexity: MULTI-TASK VISIT — this visit covered several unrelated problems (e.g. 3-4 different tasks). Context-switching between unrelated issues takes more mental effort and time coordination; apply a complexity premium above a simple hourly calculation."
    : "";

  const prompt = `You are a pricing consultant helping a solo IT and tech services freelancer determine what to charge a client. The freelancer provides personalized, often in-home IT support for residential clients, and IT/tech services for small-medium businesses.

Service Request:
- Service: ${serviceLabels[params.serviceType] || params.serviceType}
- Client Location: ${params.location}
- Work Description: ${params.description}
- Client Tech Level: ${params.techLevel} (beginner = needs more hand-holding, advanced = more technical)
- Urgency/Need Level: ${params.needLevel}${
    params.estimatedHours ? `\n- Time Spent: ${params.estimatedHours} hours` : ""
  }
${repeatClientLine}
${multiTaskLine}

Research current market rates for this type of freelance/independent work in ${params.location}. Consider:
- Local cost of living and market rates
- What independent IT pros and consultants charge in that area
- Client tech level (beginners often need more time and patience, which justifies higher rates)
- Urgency (urgent work commands a premium)
- The solo/personalized nature of the service
- Repeat client pricing: stay consistent with past charges unless scope changed significantly
- Multi-task visits: covering several unrelated problems in one visit warrants a premium over the raw hourly math

Provide a realistic price range and recommendation. For hourly services with estimated hours, give total visit price. For monthly services, give monthly rate.

Respond ONLY with valid JSON — no markdown, no explanation outside the JSON:
{
  "low": 75,
  "high": 250,
  "recommended": 150,
  "reasoning": "2-3 sentence explanation of why this price makes sense for this specific situation",
  "marketContext": "1-2 sentences about what similar providers typically charge in this area"
}`;

  const message = await getClient().messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse market research response");
  return JSON.parse(jsonMatch[0]);
}
