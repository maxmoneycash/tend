"use client";

import { useState, useRef, useCallback } from "react";
import {
  Video,
  Music,
  ExternalLink,
  X,
  Play,
  Pause,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { CampaignFormState, UploadedAsset } from "./CampaignCreateWizard";
import {
  uploadToShelbyDirect,
  generateAssetBlobName,
  type UploadProgress,
} from "@/lib/shelby-browser-upload";

const ACCEPTED_TYPES: Record<string, string> = {
  "video/mp4": "Video",
  "video/quicktime": "Video",
  "video/webm": "Video",
  "audio/mpeg": "Audio",
  "audio/wav": "Audio",
};

const ACCEPT_STRING =
  "video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,.mp4,.mov,.webm,.mp3,.wav";

const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + " KB";
  return bytes + " B";
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES[file.type]) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "webm", "mp3", "wav"].includes(ext || "");
}

function phaseLabel(phase: UploadProgress["phase"]): string {
  switch (phase) {
    case "hashing":      return "Preparing…";
    case "registering":  return "Registering…";
    case "uploading":    return "Uploading…";
    case "finalizing":   return "Finalizing…";
    case "recording":    return "Saving…";
    case "done":         return "Done";
    default:             return "Uploading…";
  }
}

// ── Asset pill component ───────────────────────────────────────────────────

function AssetPill({
  asset,
  phaseText,
  progress,
  onRemove,
}: {
  asset: UploadedAsset;
  phaseText: string;
  progress: number;
  onRemove: () => void;
}) {
  const isUploading = asset.status === "uploading";
  const isFailed    = asset.status === "failed";
  const isUploaded  = asset.status === "uploaded";
  const isAudio     = asset.mimeType.startsWith("audio/");
  const pct = isUploading ? progress : isUploaded ? 100 : 0;

  return (
    <div className="flex items-center bg-white/[0.05] rounded-[20px] border border-white/[0.06] h-[58px] p-[2px] w-full">
      {/* Inner dark content area */}
      <div className="relative flex-1 h-full rounded-[17px] bg-[#0d0d0d] flex items-center overflow-hidden">

        {/* Progress fill tint */}
        {isUploading && (
          <div
            className="absolute inset-0 bg-[#FA4616]/[0.07] transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        )}

        {/* Left: thumbnail or icon */}
        {asset.thumbnailDataUrl ? (
          <img
            src={asset.thumbnailDataUrl}
            alt=""
            className="h-full w-[48px] object-cover rounded-l-[17px] shrink-0"
          />
        ) : (
          <div className="w-10 flex items-center justify-center shrink-0 ml-3 z-10">
            {isAudio ? (
              <Music size={16} className="text-zinc-500" />
            ) : (
              <Video size={16} className="text-zinc-500" />
            )}
          </div>
        )}

        {/* File name + sub-label */}
        <div className="flex-1 min-w-0 mx-3 z-10">
          <div className="text-[13px] font-medium text-zinc-200 truncate leading-tight">
            {asset.fileName}
          </div>
          <div className="text-[10px] text-zinc-600 leading-tight mt-0.5">
            {isUploading
              ? phaseText || "Uploading…"
              : isFailed
              ? "Upload failed"
              : formatFileSize(asset.fileSize)}
          </div>
        </div>

        {/* Right: progress % or size or status icon */}
        <div className="flex items-center gap-2 mr-3 z-10 shrink-0">
          {isUploading && (
            <>
              <Loader2 size={12} className="text-[#FA4616] animate-spin" />
              <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                {pct}%
              </span>
            </>
          )}
          {isUploaded && !asset.explorerUrl && (
            <CheckCircle2 size={14} className="text-green-500" />
          )}
          {isUploaded && asset.explorerUrl && (
            <a
              href={asset.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={13} />
            </a>
          )}
          {isFailed && (
            <AlertCircle size={14} className="text-red-400" />
          )}
          {!isUploading && (
            <span className="text-[11px] text-zinc-600 font-mono">
              {formatFileSize(asset.fileSize)}
            </span>
          )}
        </div>

        {/* Progress bar at bottom */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
            <div
              className="h-full bg-[#FA4616] transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Remove button — lives in the outer ring gap */}
      <div className="w-10 h-full flex items-center justify-center shrink-0">
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full hover:bg-white/[0.08] transition-colors flex items-center justify-center"
        >
          <X size={14} className="text-zinc-500" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ── Audio pill with waveform ───────────────────────────────────────────────

const WAVEFORM_BARS = [3, 6, 2, 8, 4, 3, 5, 9, 3, 2, 7, 5, 3, 4, 8, 6, 4, 2, 5, 3, 2, 5, 4, 2, 3];

function AudioPill({
  asset,
  phaseText,
  progress,
  onRemove,
}: {
  asset: UploadedAsset;
  phaseText: string;
  progress: number;
  onRemove: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const isUploading = asset.status === "uploading";
  const isFailed    = asset.status === "failed";
  const pct = isUploading ? progress : asset.status === "uploaded" ? 100 : 0;

  return (
    <div className="flex items-center bg-white/[0.05] rounded-[20px] border border-white/[0.06] h-[58px] p-[2px] w-full">
      <div className="relative flex-1 h-full rounded-[17px] bg-[#0d0d0d] flex items-center overflow-hidden px-3 gap-3">
        {/* Progress tint */}
        {isUploading && (
          <div
            className="absolute inset-0 bg-[#FA4616]/[0.07] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        )}

        <Music size={15} className="text-zinc-500 shrink-0 z-10" />

        {/* Waveform */}
        <div className="flex flex-1 items-center gap-[2.5px] z-10 overflow-hidden">
          {WAVEFORM_BARS.map((h, i) => (
            <div
              key={i}
              className="rounded-full shrink-0 transition-colors"
              style={{
                width: "2.5px",
                height: `${h * 2.5}px`,
                minHeight: "4px",
                backgroundColor:
                  isUploading && (i / WAVEFORM_BARS.length) * 100 < pct
                    ? "#FA4616"
                    : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>

        {/* Status */}
        <div className="z-10 shrink-0 flex items-center gap-2">
          {isUploading ? (
            <>
              <Loader2 size={12} className="text-[#FA4616] animate-spin" />
              <span className="text-[10px] text-zinc-500 tabular-nums">{pct}%</span>
            </>
          ) : isFailed ? (
            <AlertCircle size={14} className="text-red-400" />
          ) : (
            <button
              onClick={() => setPlaying((p) => !p)}
              className="bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-full w-[26px] h-[26px] flex items-center justify-center"
            >
              {playing ? (
                <Pause size={11} className="text-white fill-white" />
              ) : (
                <Play size={11} className="text-white fill-white ml-px" />
              )}
            </button>
          )}
        </div>

        {/* Progress line */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
            <div
              className="h-full bg-[#FA4616] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      <div className="w-10 h-full flex items-center justify-center shrink-0">
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full hover:bg-white/[0.08] transition-colors flex items-center justify-center"
        >
          <X size={14} className="text-zinc-500" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  form: CampaignFormState;
  update: (patch: Partial<CampaignFormState>) => void;
}

export function StepContentBank({ form, update }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phaseLabels, setPhaseLabels]   = useState<Record<string, string>>({});
  const [progressPcts, setProgressPcts] = useState<Record<string, number>>({});

  // ── Direct upload (files ≥ 4 MB) ──────────────────────────────────────

  const uploadFileDirect = useCallback(
    async (file: File) => {
      const tempAsset: UploadedAsset = {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        blobName: "",
        contentHash: "",
        explorerUrl: "",
        status: "uploading",
        progress: 0,
      };

      // Generate thumbnail for video files
      if (file.type.startsWith("video/")) {
        try {
          const url = URL.createObjectURL(file);
          const video = document.createElement("video");
          video.preload = "metadata";
          video.muted = true;
          video.src = url;
          await new Promise<void>((resolve) => {
            video.onloadeddata = () => { video.currentTime = 1; };
            video.onseeked = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 120; canvas.height = 68;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, 120, 68);
                tempAsset.thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.6);
              }
              URL.revokeObjectURL(url);
              resolve();
            };
            setTimeout(() => { URL.revokeObjectURL(url); resolve(); }, 3000);
          });
        } catch { /* thumbnail failed, continue */ }
      }

      const assetsWithNew = [...form.uploadedAssets, tempAsset];
      update({ uploadedAssets: assetsWithNew });

      const blobName = generateAssetBlobName(file.name);

      try {
        const result = await uploadToShelbyDirect({
          file,
          blobName,
          onProgress: (progress: UploadProgress) => {
            const label = progress.detail
              ? `${phaseLabel(progress.phase)} ${progress.detail}`
              : phaseLabel(progress.phase);
            setPhaseLabels((prev) => ({ ...prev, [file.name]: label }));
            setProgressPcts((prev) => ({ ...prev, [file.name]: progress.percent }));
          },
        });

        update({
          uploadedAssets: assetsWithNew.map((a) =>
            a.fileName === tempAsset.fileName && a.status === "uploading"
              ? { ...a, blobName: result.blobName, contentHash: result.contentHash, explorerUrl: result.explorerUrl, status: "uploaded" as const, progress: 100 }
              : a
          ),
        });
        setPhaseLabels((prev) => { const n = { ...prev }; delete n[file.name]; return n; });
      } catch (err) {
        console.error("[StepContentBank] Direct upload failed:", err);
        update({
          uploadedAssets: assetsWithNew.map((a) =>
            a.fileName === tempAsset.fileName && a.status === "uploading"
              ? { ...a, blobName: "", status: "failed" as const, progress: 0 }
              : a
          ),
        });
        setPhaseLabels((prev) => { const n = { ...prev }; delete n[file.name]; return n; });
      }
    },
    [form.uploadedAssets, update]
  );

  // ── Legacy upload (files < 4 MB) ──────────────────────────────────────

  const uploadFileLegacy = useCallback(
    async (file: File) => {
      const tempAsset: UploadedAsset = {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        blobName: "",
        contentHash: "",
        explorerUrl: "",
        status: "uploading",
        progress: 0,
      };

      if (file.type.startsWith("video/")) {
        try {
          const url = URL.createObjectURL(file);
          const video = document.createElement("video");
          video.preload = "metadata"; video.muted = true; video.src = url;
          await new Promise<void>((resolve) => {
            video.onloadeddata = () => { video.currentTime = 1; };
            video.onseeked = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 120; canvas.height = 68;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, 120, 68);
                tempAsset.thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.6);
              }
              URL.revokeObjectURL(url);
              resolve();
            };
            setTimeout(() => { URL.revokeObjectURL(url); resolve(); }, 3000);
          });
        } catch { /* continue */ }
      }

      const assetsWithNew = [...form.uploadedAssets, tempAsset];
      update({ uploadedAssets: assetsWithNew });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      try {
        const res = await fetch("/api/rewards/upload-asset", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        update({
          uploadedAssets: assetsWithNew.map((a) =>
            a.fileName === tempAsset.fileName && a.status === "uploading"
              ? { ...a, blobName: data.blobName || "", contentHash: data.contentHash || "", explorerUrl: data.explorerUrl || "", status: "uploaded" as const, progress: 100 }
              : a
          ),
        });
      } catch {
        update({
          uploadedAssets: assetsWithNew.map((a) =>
            a.fileName === tempAsset.fileName && a.status === "uploading"
              ? { ...a, blobName: "", status: "failed" as const, progress: 0 }
              : a
          ),
        });
      }
    },
    [form.uploadedAssets, update]
  );

  const uploadFile = useCallback(
    (file: File) =>
      file.size >= DIRECT_UPLOAD_THRESHOLD ? uploadFileDirect(file) : uploadFileLegacy(file),
    [uploadFileDirect, uploadFileLegacy]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => Array.from(files).filter(isAcceptedFile).forEach(uploadFile),
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (index: number) =>
    update({ uploadedAssets: form.uploadedAssets.filter((_, i) => i !== index) });

  const totalSize   = form.uploadedAssets.reduce((s, a) => s + a.fileSize, 0);
  const hasUploading = form.uploadedAssets.some((a) => a.status === "uploading");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
          Source Content
        </label>
        <p className="text-[11px] text-zinc-600">
          Upload the videos and audio files clippers will create content from.
          MP4, MOV, WebM, MP3, WAV · up to 5 GB per file.
        </p>
      </div>

      {/* Drop zone — card-in-card design */}
      <div className="bg-white/[0.02] p-[3px] rounded-[28px] border border-white/[0.06]">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 py-10 px-8 rounded-[26px] border-2 border-dashed cursor-pointer transition-all select-none ${
            dragOver
              ? "border-[#FA4616]/50 bg-[#FA4616]/[0.04]"
              : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.02]"
          }`}
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
            dragOver ? "bg-[#FA4616]/10" : "bg-white/[0.04]"
          }`}>
            <Upload
              size={20}
              className={dragOver ? "text-[#FA4616]" : "text-zinc-500"}
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <div className="text-[13px] font-medium text-zinc-300">
              {dragOver ? "Drop files here" : "Drag & drop files here"}
            </div>
            <div className="text-[11px] text-zinc-600 mt-0.5">
              or click to browse
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_STRING}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* File list */}
      {form.uploadedAssets.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-zinc-500">
              {form.uploadedAssets.length} file{form.uploadedAssets.length !== 1 ? "s" : ""}
              {" · "}
              {formatFileSize(totalSize)}
            </span>
            {hasUploading && (
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Loader2 size={10} className="animate-spin" />
                Uploading…
              </span>
            )}
          </div>

          {form.uploadedAssets.map((asset, i) => {
            const pct = progressPcts[asset.fileName] ?? asset.progress ?? 0;
            const label = phaseLabels[asset.fileName] ?? "";
            const isAudio = asset.mimeType.startsWith("audio/");

            return isAudio ? (
              <AudioPill
                key={`${asset.fileName}-${i}`}
                asset={asset}
                phaseText={label}
                progress={pct}
                onRemove={() => removeFile(i)}
              />
            ) : (
              <AssetPill
                key={`${asset.fileName}-${i}`}
                asset={asset}
                phaseText={label}
                progress={pct}
                onRemove={() => removeFile(i)}
              />
            );
          })}
        </div>
      )}

      {form.uploadedAssets.length > 20 && (
        <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px]">
          {form.uploadedAssets.length} files — large uploads may take a while.
        </div>
      )}
    </div>
  );
}
