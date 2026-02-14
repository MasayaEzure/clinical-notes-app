import { NextRequest, NextResponse } from "next/server";
import { searchPubMed } from "@/lib/pubmed";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "検索クエリが必要です" },
        { status: 400 }
      );
    }

    const papers = await searchPubMed(query, 10);

    return NextResponse.json({ papers });
  } catch (error) {
    console.error("PubMed search error:", error);
    return NextResponse.json(
      { error: "PubMed検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
