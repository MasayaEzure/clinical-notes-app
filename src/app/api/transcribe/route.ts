import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "音声ファイルが選択されていません" },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (25MB = Whisper API上限)
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズが25MBを超えています" },
        { status: 413 }
      );
    }

    // ファイルを保存
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Whisper APIで文字起こし
    const fileStream = fs.createReadStream(filepath);
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      language: "ja",
      response_format: "text",
    });

    return NextResponse.json({
      transcription: transcription,
      audioPath: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "文字起こし中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
