import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { AnalysisResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription || typeof transcription !== "string") {
      return NextResponse.json(
        { error: "文字起こしテキストが必要です" },
        { status: 400 }
      );
    }

    const prompt = buildAnalysisPrompt(transcription);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "あなたは医療分野の専門家です。指示に従ってJSONのみを出力してください。",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "分析結果が取得できませんでした" },
        { status: 500 }
      );
    }

    const result: AnalysisResult = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
