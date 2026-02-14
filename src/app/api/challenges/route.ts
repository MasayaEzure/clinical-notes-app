import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, content } = await request.json();

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "セッションIDと課題内容は必須です" },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.create({
      data: { sessionId, content },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Challenge create error:", error);
    return NextResponse.json(
      { error: "課題の追加に失敗しました" },
      { status: 500 }
    );
  }
}
