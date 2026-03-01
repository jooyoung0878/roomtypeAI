// app/api/premium/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { PremiumReportSchema } from "../../../lib/premiumSchema";
import { premiumSystem, makePremiumUser } from "../../../lib/premiumPrompt";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ReqSchema = z.object({
  features: z.any(), // VisionFeatures 형태
  scores: z.any(),   // Scores 형태
  archetype: z.any(), // Archetype 형태
  language: z.enum(["ko", "en"]).optional().default("ko"), // ✅ 추가
});

export async function POST(req: Request) {
  try {
    const { features, scores, archetype, language } = ReqSchema.parse(await req.json()); // ✅ 추가

    const analysisId = `anl_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const createdAtIso = new Date().toISOString();

    const premiumUser = makePremiumUser(
      analysisId,
      createdAtIso,
      features,
      scores,
      archetype
    );

    // ✅ 언어 강제 라인 추가
    const langLine =
      language === "en"
        ? "Write EVERYTHING in natural English."
        : "Write EVERYTHING in natural Korean.";

    const premiumResp = await client.responses.create({
      model: "gpt-5",
      instructions:
        premiumSystem +
        "\n\n" +
        langLine +
        "\n\n출력 규칙(중요): 반드시 유효한 JSON 객체 1개만 출력. 코드블록/설명/여분 텍스트 금지. 필수 필드 누락 금지.",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: premiumUser }],
        },
      ],
    });

    const premiumOutText = getOutputText(premiumResp);
    if (!premiumOutText) {
      return NextResponse.json(
        { error: "Empty premium model output" },
        { status: 500 }
      );
    }

    const premiumJsonText = extractJson(premiumOutText);
    const premiumReport = PremiumReportSchema.parse(
      JSON.parse(premiumJsonText)
    );

    return NextResponse.json({
      premium_report: premiumReport,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

function extractJson(s: string) {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return s;
  return s.slice(start, end + 1);
}

function getOutputText(resp: any): string {
  const t = (resp?.output_text ?? "").trim();
  if (t) return t;

  const chunks: string[] = [];
  const out = resp?.output;
  if (Array.isArray(out)) {
    for (const o of out) {
      const content = o?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c?.text === "string") chunks.push(c.text);
        }
      }
    }
  }
  return chunks.join("\n").trim();
}