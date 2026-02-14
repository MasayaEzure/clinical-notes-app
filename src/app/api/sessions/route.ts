import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { learnings: true, challenges: true },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json(
      { error: "セッション一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, audioPath, transcription, learnings, challenges, medicalTerms } = body;

    if (!title || !transcription) {
      return NextResponse.json(
        { error: "タイトルと文字起こしテキストは必須です" },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        title,
        audioPath: audioPath || "",
        transcription,
        learnings: {
          create: (learnings || []).map((content: string) => ({ content })),
        },
        challenges: {
          create: (challenges || []).map((content: string) => ({ content })),
        },
        medicalTerms: {
          create: (medicalTerms || []).map(
            (term: { original: string; candidates: string[]; resolved?: boolean; resolvedTerm?: string }) => ({
              original: term.original,
              resolved: term.resolved || false,
              resolvedTerm: term.resolvedTerm || null,
              candidates: {
                create: term.candidates.map((candidate: string) => ({
                  term: candidate,
                })),
              },
            })
          ),
        },
      },
      include: {
        learnings: true,
        challenges: true,
        medicalTerms: { include: { candidates: true } },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json(
      { error: "セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
