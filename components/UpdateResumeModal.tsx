"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateResumeAction } from "@/actions/updateResume";
import { Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function UpdateResumeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, formAction, isPending] = useActionState(updateResumeAction, null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open/close the native dialog
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Auto-close on success after a short delay
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setSelectedFile(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  const handleOpen = () => {
    setSelectedFile(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    const input = document.getElementById("update-resume-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        <Upload className="w-4 h-4" />
        Update Resume
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="fixed z-50 m-auto w-full max-w-md rounded-2xl bg-[#0f1320] border border-white/10 shadow-2xl p-0 backdrop:bg-transparent open:flex open:flex-col"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="flex flex-col gap-5 p-7">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Update Resume</h2>
              <p className="text-sm text-white/50 mt-1">Upload a new PDF to replace your saved resume.</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isPending}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status messages */}
          {state?.error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
              <CheckCircle2 size={16} className="shrink-0" />
              Resume updated successfully!
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            {/* Drop zone */}
            {!selectedFile && (
              <div className="relative group cursor-pointer">
                <input
                  id="update-resume-input"
                  type="file"
                  name="resume"
                  accept="application/pdf"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-xl py-8 px-4 flex flex-col items-center gap-3 group-hover:border-blue-500 group-hover:bg-blue-500/5 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors text-white/50">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/80">Click or drag your PDF here</p>
                    <p className="text-xs text-white/40 mt-1">Maximum file size: 5MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected file — idle */}
            {selectedFile && !isPending && !state?.success && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(0)} KB · PDF
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Selected file — uploading */}
            {selectedFile && isPending && (
              <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Loader2 size={18} className="text-blue-400 animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-blue-400 mt-0.5">Uploading and processing…</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !selectedFile || !!state?.success}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 px-5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Resume"
              )}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
