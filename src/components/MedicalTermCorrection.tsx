"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { MedicalTermSuggestion } from "@/lib/types";

interface MedicalTermCorrectionProps {
  terms: MedicalTermSuggestion[];
  onTermResolved: (original: string, resolvedTerm: string) => void;
}

export default function MedicalTermCorrection({
  terms,
  onTermResolved,
}: MedicalTermCorrectionProps) {
  const [resolvedTerms, setResolvedTerms] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTermOriginal, setActiveTermOriginal] = useState<string>("");
  const [customTerm, setCustomTerm] = useState("");

  const handleSelectCandidate = (original: string, candidate: string) => {
    setResolvedTerms((prev) => ({ ...prev, [original]: candidate }));
    onTermResolved(original, candidate);
  };

  const handleOpenModal = (original: string) => {
    setActiveTermOriginal(original);
    setCustomTerm("");
    setModalOpen(true);
  };

  const handleSubmitCustom = () => {
    if (!customTerm.trim()) return;
    setResolvedTerms((prev) => ({ ...prev, [activeTermOriginal]: customTerm.trim() }));
    onTermResolved(activeTermOriginal, customTerm.trim());
    setModalOpen(false);
    setCustomTerm("");
  };

  if (terms.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        修正が必要な医学用語は見つかりませんでした
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {terms.map((term) => {
        const isResolved = term.original in resolvedTerms;

        return (
          <div
            key={term.original}
            className={`p-4 rounded-lg border ${
              isResolved
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">
                認識結果:
              </span>
              <span className="text-sm font-mono bg-white px-2 py-0.5 rounded border">
                {term.original}
              </span>
              {isResolved && (
                <>
                  <span className="text-gray-400">&rarr;</span>
                  <Chip
                    label={resolvedTerms[term.original]}
                    variant="success"
                  />
                </>
              )}
            </div>

            {!isResolved && (
              <div className="flex flex-wrap gap-2 mt-2">
                {term.candidates.map((candidate) => (
                  <Chip
                    key={candidate}
                    label={candidate}
                    onClick={() =>
                      handleSelectCandidate(term.original, candidate)
                    }
                  />
                ))}
                <Chip
                  label="その他..."
                  variant="warning"
                  onClick={() => handleOpenModal(term.original)}
                />
              </div>
            )}
          </div>
        );
      })}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="正しい医学用語を入力"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            「<span className="font-mono font-medium">{activeTermOriginal}</span>
            」の正しい医学用語を入力してください
          </p>
          <input
            type="text"
            value={customTerm}
            onChange={(e) => setCustomTerm(e.target.value)}
            placeholder="例: 糖尿病"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitCustom();
            }}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmitCustom} disabled={!customTerm.trim()}>
              追加
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
