import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Card, { CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { learnings: true, challenges: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">セッション一覧</h1>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <p className="text-gray-500 mb-4">
              まだセッションがありません
            </p>
            <Link
              href="/sessions/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              最初のセッションを作成
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/sessions/${session.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {session.title}
                      </h2>
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
                    <div className="flex gap-3 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        学び {session._count.learnings}件
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        課題 {session._count.challenges}件
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {session.transcription}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
