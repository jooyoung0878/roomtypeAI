// app/api/analyze/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { visionSystem, visionUser } from "../../../lib/visionPrompt";
import { buildResult, VisionFeatures } from "../../../lib/scoring";
import { PremiumReportSchema } from "../../../lib/premiumSchema";
import { premiumSystem, makePremiumUser } from "../../../lib/premiumPrompt";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Request schema는 함수 밖으로 빼는 게 깔끔/안정적
const ReqSchema = z.object({
  imageBase64: z.string().min(10),
  mode: z.enum(["free", "premium"]).optional().default("free"),
});

const FeaturesSchema = z.object({
  floor_clutter_ratio: z.number().min(0).max(1),
  bed_messiness: z.number().min(0).max(1),
  desk_clutter_ratio: z.number().min(0).max(1),

  monitor_count: z.number().int().min(0).max(6),
  books_count: z.number().int().min(0).max(200),
  sticky_notes_count: z.number().int().min(0).max(200),
  collectibles_count: z.number().int().min(0).max(200),
  plants_count: z.number().int().min(0).max(200),
  cables_messy_level: z.number().int().min(0).max(5),

  laundry_detected: z.boolean(),
  trash_detected: z.boolean(),
  posters_present: z.boolean(),
  warm_lighting_present: z.boolean(),
  blackout_curtain_present: z.boolean(),
  bed_side_phone_charger_present: z.boolean(),
  ergonomic_chair_present: z.boolean(),
  whiteboard_present: z.boolean(),
  art_supplies_present: z.boolean(),
  instrument_present: z.boolean(),
  vitamins_present: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const { imageBase64, mode } = ReqSchema.parse(await req.json());

    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // 1) Vision: image -> features JSON
    const resp = await client.responses.create({
      model: "gpt-4o-mini", // ✅ 이미지 입력 지원 모델로
      instructions: visionSystem,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: visionUser },
            { type: "input_image", image_url: dataUrl, detail: "auto" },
          ],
        },
      ],
    });

    const outText = getOutputText(resp);
    if (!outText) {
      return NextResponse.json({ error: "Empty vision model output" }, { status: 500 });
    }

    const featuresJsonText = extractJson(outText);
    const parsed = FeaturesSchema.parse(JSON.parse(featuresJsonText)) as VisionFeatures;

    // 2) Rule engine: scores + archetype
    const result = buildResult(parsed);

    // FREE
    if (mode === "free") {
      return NextResponse.json({
        mode: "free",
        features: parsed,
        scores: result.scores,
        archetype: result.archetype,
      });
    }

    // PREMIUM: 2nd call for premium_report.json
    const analysisId = `anl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAtIso = new Date().toISOString();

    const premiumUser = makePremiumUser(
      analysisId,
      createdAtIso,
      parsed,
      result.scores,
      result.archetype
    );

    // ✅ 핵심: response_format(json_schema) 제거
    // 대신 프롬프트로 JSON만 강하게 강제 + extractJson으로 파싱 안정화
    const premiumResp = await client.responses.create({
      model: "gpt-4o-mini", // 텍스트용이라면 더 싼 모델로 바꿔도 됨
      instructions:
        premiumSystem +
        "\n\n출력 규칙(중요): 반드시 유효한 JSON 객체만 출력. 코드블록/설명/여분 텍스트 금지. 누락 금지.",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: premiumUser }],
        },
      ],
    });

    const premiumOutText = getOutputText(premiumResp);
    if (!premiumOutText) {
      return NextResponse.json({ error: "Empty premium model output" }, { status: 500 });
    }

    const premiumJsonText = extractJson(premiumOutText);
    const premiumReport = PremiumReportSchema.parse(JSON.parse(premiumJsonText));

    return NextResponse.json({
      mode: "premium",
      features: parsed,
      scores: result.scores,
      archetype: result.archetype,
      premium_report: premiumReport,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

// ---------- helpers ----------

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