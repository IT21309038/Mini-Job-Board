"use client";
import { useCallback, useRef, useState } from "react";

type Props = {
  value?: File;
  onChange: (file?: File) => void;
  accept?: string; // e.g. "application/pdf"
  maxSizeMB?: number; // e.g. 5
  label?: string;
};

export default function ResumeDropzone({
  value,
  onChange,
  accept = "application/pdf",
  maxSizeMB = 5,
  label = "Resume (PDF)",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openFileDialog = () => inputRef.current?.click();

  const prettySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validate = (file: File) => {
    // type check (allow either exact mime or .pdf fallback)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (accept.includes("pdf") && !isPdf) return "Please upload a PDF file.";
    // size check
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return `File is too large. Max ${maxSizeMB} MB.`;
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onChange(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm">{label}</label>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center",
          dragging
            ? "border-gray-900 bg-gray-50"
            : "border-gray-300 hover:bg-gray-50",
          value ? "py-6" : "py-8",
        ].join(" ")}
      >
        {!value ? (
          <>
            <div className="text-sm text-gray-700">
              <strong>Drag & drop</strong> your PDF here, or{" "}
              <span className="underline">click to browse</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Max {maxSizeMB} MB • PDF only
            </div>
          </>
        ) : (
          <div className="w-full max-w-md text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-sm">
                <span className="font-medium">{value.name}</span>{" "}
                <span className="text-gray-500">
                  ({prettySize(value.size)})
                </span>
              </div>
              <div className="shrink-0 space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  className="rounded-md border px-3 py-1.5 text-xs"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(undefined);
                  }}
                  className="rounded-md border px-3 py-1.5 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Click to replace or drag a new file here.
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
