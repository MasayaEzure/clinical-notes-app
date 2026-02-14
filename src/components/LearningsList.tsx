interface LearningsListProps {
  learnings: string[];
}

export default function LearningsList({ learnings }: LearningsListProps) {
  if (learnings.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">学んだことはありません</p>
    );
  }

  return (
    <ul className="space-y-2">
      {learnings.map((learning, index) => (
        <li
          key={index}
          className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
        >
          <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-medium">
            {index + 1}
          </span>
          <span className="text-sm text-gray-800">{learning}</span>
        </li>
      ))}
    </ul>
  );
}
