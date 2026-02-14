import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "無効なセッションIDです" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        learnings: true,
        challenges: true,
        medicalTerms: { include: { candidates: true } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "セッションの取得に失敗しました" },
      { status: 500 }
    );
  }
}
