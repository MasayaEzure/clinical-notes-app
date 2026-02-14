"use client";

interface ChipProps {
  label: string;
  onClick?: () => void;
  selected?: boolean;
  variant?: "default" | "success" | "warning";
}

export default function Chip({
  label,
  onClick,
  selected = false,
  variant = "default",
}: ChipProps) {
  const variants = {
    default: selected
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${variants[variant]} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {label}
    </button>
  );
}
