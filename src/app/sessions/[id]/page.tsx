import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import LearningsList from "@/components/LearningsList";
import ChallengesList from "@/components/ChallengesList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sessionId = parseInt(id, 10);

  if (isNaN(sessionId)) {
    notFound();
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
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            &larr; 一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(session.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* 文字起こし */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">文字起こし</h2>
        </CardHeader>
        <CardBody>
          <div className="max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {session.transcription}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* 学んだこと */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            学んだこと ({session.learnings.length}件)
          </h2>
        </CardHeader>
        <CardBody>
          <LearningsList
            learnings={session.learnings.map((l) => l.content)}
          />
        </CardBody>
      </Card>

      {/* 課題 */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            エンドユーザーの課題 ({session.challenges.length}件)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            クリックすると関連する学術論文を検索できます
          </p>
        </CardHeader>
        <CardBody>
          <ChallengesList
            challenges={session.challenges}
            sessionId={session.id}
            linkable
          />
        </CardBody>
      </Card>

      {/* 医学用語修正 */}
      {session.medicalTerms.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">医学用語の修正履歴</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {session.medicalTerms.map((term) => (
                <div
                  key={term.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    term.resolved ? "bg-green-50" : "bg-yellow-50"
                  }`}
                >
                  <span className="text-sm font-mono bg-white px-2 py-0.5 rounded border">
                    {term.original}
                  </span>
                  {term.resolved && term.resolvedTerm && (
                    <>
                      <span className="text-gray-400">&rarr;</span>
                      <span className="text-sm font-medium text-green-700">
                        {term.resolvedTerm}
                      </span>
                    </>
                  )}
                  {!term.resolved && (
                    <span className="text-xs text-yellow-600">未確認</span>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
