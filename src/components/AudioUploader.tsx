"use client";

import { useCallback, useState, useRef } from "react";
import Button from "@/components/ui/Button";

interface AudioUploaderProps {
  onTranscriptionComplete: (transcription: string, audioPath: string) => void;
}

const ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/webm",
  "video/mp4",
];

export default function AudioUploader({ onTranscriptionComplete }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (f.size > 25 * 1024 * 1024) {
      setError("ファイルサイズが25MBを超えています");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "文字起こしに失敗しました");
      }

      const data = await res.json();
      onTranscriptionComplete(data.transcription, data.audioPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">選択されたファイル:</p>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              ファイルを変更
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <p className="text-gray-600">
              音声ファイルをドラッグ&ドロップ
            </p>
            <p className="text-sm text-gray-500">
              または
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ファイルを選択
            </button>
            <p className="text-xs text-gray-400 mt-2">
              対応形式: MP3, MP4, M4A, WAV, WebM (最大25MB)
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      {file && (
        <Button onClick={handleUpload} loading={loading} size="lg" className="w-full">
          {loading ? "文字起こし中..." : "文字起こしを開始"}
        </Button>
      )}
    </div>
  );
}
