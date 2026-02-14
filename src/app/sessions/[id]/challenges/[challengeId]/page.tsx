"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import PubMedResults from "@/components/PubMedResults";
import Spinner from "@/components/ui/Spinner";
import { PubMedPaper } from "@/lib/types";

interface ChallengeData {
  id: number;
  content: string;
}

export default function ChallengeEvidencePage() {
  const params = useParams();
  const sessionId = params.id as string;
  const challengeId = params.challengeId as string;

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [papers, setPapers] = useState<PubMedPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // セッション詳細APIから課題内容を取得
        const sessionRes = await fetch(`/api/sessions/${sessionId}`);
        if (!sessionRes.ok)
          throw new Error("セッション情報の取得に失敗しました");
        const session = await sessionRes.json();

        const foundChallenge = session.challenges.find(
          (c: ChallengeData) => c.id === parseInt(challengeId)
        );

        if (!foundChallenge) {
          throw new Error("課題が見つかりません");
        }

        setChallenge(foundChallenge);

        // 課題内容でPubMed検索
        const pubmedRes = await fetch(
          `/api/pubmed/search?query=${encodeURIComponent(foundChallenge.content)}`
        );
        if (pubmedRes.ok) {
          const data = await pubmedRes.json();
          setPapers(data.papers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, challengeId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Spinner size="lg" />
        <p className="text-center text-gray-500 mt-4">
          関連論文を検索中...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/sessions/${sessionId}`}
        className="text-sm text-blue-600 hover:text-blue-800 inline-block"
      >
        &larr; セッション詳細に戻る
      </Link>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">
            課題に関するエビデンス
          </h1>
          {challenge && (
            <p className="text-sm text-gray-600 mt-2 bg-orange-50 px-3 py-2 rounded-lg">
              {challenge.content}
            </p>
          )}
        </CardHeader>
        <CardBody>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                PubMedから {papers.length} 件の関連論文が見つかりました
              </p>
              <PubMedResults papers={papers} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
