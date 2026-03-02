// app/api/premium/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { PremiumReportSchema } from "../../../lib/premiumSchema";
import { premiumSystem, makePremiumUser } from "../../../lib/premiumPrompt";

// ✅ Prisma 추가
import { prisma } from "../../../app/lib/prisma";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ReqSchema = z.object({
  // ✅ free에서 받은 analysisId를 그대로 받아야 함
  analysisId: z.string().min(10),

  features: z.any(), // VisionFeatures 형태
  scores: z.any(), // Scores 형태
  archetype: z.any(), // Archetype 형태

  language: z.enum(["ko", "en"]).optional().default("ko"),
});

export async function POST(req: Request) {
  const t0 = Date.now();

  try {
    const { analysisId, features, scores, archetype, language } =
      ReqSchema.parse(await req.json());

    // ✅ (선택) premium 시작 로그 업데이트
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        mode: "premium",
        status: "ok",
        modelPremium: "gpt-5",
      },
    });

    const createdAtIso = new Date().toISOString();

    // ✅ makePremiumUser에 analysisId를 그대로 전달
    const premiumUser = makePremiumUser(
      analysisId,
      createdAtIso,
      features,
      scores,
      archetype
    );

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
      // ✅ DB에 에러 저장
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: "error",
          errorMessage: "Empty premium model output",
          msPremium: Date.now() - t0,
        },
      });

      return NextResponse.json(
        { error: "Empty premium model output" },
        { status: 500 }
      );
    }

    const premiumJsonText = extractJson(premiumOutText);
    const premiumReport = PremiumReportSchema.parse(
      JSON.parse(premiumJsonText)
    );

    // ✅ 성공 시 DB에 premium_report 저장 + msPremium 저장
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        premiumReport: premiumReport as any,
        msPremium: Date.now() - t0,
        status: "ok",
      },
    });

    return NextResponse.json({
      analysisId,
      premium_report: premiumReport,
    });
  } catch (e: any) {
    // ✅ 가능하면 analysisId가 있었을 때 DB에 에러 기록
    try {
      const body = await req.json().catch(() => null);
      const analysisId = body?.analysisId;
      if (typeof analysisId === "string") {
        await prisma.analysis.update({
          where: { id: analysisId },
          data: {
            status: "error",
            errorMessage: e?.message ?? "Unknown error",
            msPremium: Date.now() - t0,
          },
        });
      }
    } catch {
      // ignore (에러 저장 실패는 무시)
    }

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