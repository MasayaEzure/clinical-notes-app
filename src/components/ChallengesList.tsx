import Link from "next/link";

interface ChallengesListProps {
  challenges: { id?: number; content: string }[];
  sessionId?: number;
  linkable?: boolean;
}

export default function ChallengesList({
  challenges,
  sessionId,
  linkable = false,
}: ChallengesListProps) {
  if (challenges.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">課題はありません</p>
    );
  }

  return (
    <ul className="space-y-2">
      {challenges.map((challenge, index) => (
        <li key={challenge.id ?? index}>
          {linkable && sessionId && challenge.id ? (
            <Link
              href={`/sessions/${sessionId}/challenges/${challenge.id}`}
              className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-sm text-gray-800 group-hover:text-blue-600 flex-1">
                {challenge.content}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-sm text-gray-800">{challenge.content}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
