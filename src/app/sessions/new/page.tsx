"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AudioUploader from "@/components/AudioUploader";
import LearningsList from "@/components/LearningsList";
import ChallengesList from "@/components/ChallengesList";
import MedicalTermCorrection from "@/components/MedicalTermCorrection";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { AnalysisResult, MedicalTermSuggestion } from "@/lib/types";

type Step = "upload" | "transcribed" | "analyzed" | "saving";

export default function NewSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [transcription, setTranscription] = useState("");
  const [audioPath, setAudioPath] = useState("");
  const [title, setTitle] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [additionalChallenges, setAdditionalChallenges] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionComplete = (text: string, path: string) => {
    setTranscription(text);
    setAudioPath(path);
    setTitle(
      `セッション ${new Date().toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      })}`
    );
    setStep("transcribed");
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "分析に失敗しました");
      }

      const result: AnalysisResult = await res.json();
      setAnalysisResult(result);
      setStep("analyzed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTermResolved = (original: string, resolvedTerm: string) => {
    setAdditionalChallenges((prev) => [...prev, resolvedTerm]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const allChallenges = [
        ...(analysisResult?.challenges || []),
        ...additionalChallenges,
      ];

      const medicalTerms = (analysisResult?.medicalTerms || []).map(
        (term: MedicalTermSuggestion) => ({
          original: term.original,
          candidates: term.candidates,
          resolved: additionalChallenges.some((c) =>
            term.candidates.includes(c)
          ),
          resolvedTerm:
            additionalChallenges.find((c) => term.candidates.includes(c)) ||
            null,
        })
      );

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          audioPath,
          transcription,
          learnings: analysisResult?.learnings || [],
          challenges: allChallenges,
          medicalTerms,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">新規セッション</h1>

      {/* Step 1: アップロード */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Step 1: 音声ファイルをアップロード
          </h2>
        </CardHeader>
        <CardBody>
          {step === "upload" ? (
            <AudioUploader onTranscriptionComplete={handleTranscriptionComplete} />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                文字起こし完了
              </p>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {transcription}
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Step 2: 分析 */}
      {(step === "transcribed" || step === "analyzed") && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              Step 2: テキストを分析
            </h2>
          </CardHeader>
          <CardBody>
            {step === "transcribed" && !analyzing && (
              <Button onClick={handleAnalyze} size="lg" className="w-full">
                分析する
              </Button>
            )}
            {analyzing && (
              <div className="py-8">
                <Spinner />
                <p className="text-sm text-gray-500 text-center mt-4">
                  テキストを分析中...
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Step 3: 結果確認 */}
      {step === "analyzed" && analysisResult && (
        <>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">
                学んだこと
              </h2>
            </CardHeader>
            <CardBody>
              <LearningsList learnings={analysisResult.learnings} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">
                エンドユーザーの課題
              </h2>
            </CardHeader>
            <CardBody>
              <ChallengesList
                challenges={[
                  ...analysisResult.challenges.map((c) => ({ content: c })),
                  ...additionalChallenges.map((c) => ({ content: c })),
                ]}
              />
            </CardBody>
          </Card>

          {analysisResult.medicalTerms.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">
                  医学用語の修正候補
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  候補をクリックすると課題リストに追加されます。該当する候補がない場合は「その他...」から手動入力してください。
                </p>
              </CardHeader>
              <CardBody>
                <MedicalTermCorrection
                  terms={analysisResult.medicalTerms}
                  onTermResolved={handleTermResolved}
                />
              </CardBody>
            </Card>
          )}

          {/* セッションタイトル & 保存 */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">保存</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  セッションタイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleSave}
                loading={saving}
                size="lg"
                className="w-full"
                disabled={!title.trim()}
              >
                {saving ? "保存中..." : "セッションを保存"}
              </Button>
            </CardBody>
          </Card>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}
    </div>
  );
}
