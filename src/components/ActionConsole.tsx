import React from "react";
import { Play, Database, Loader2 } from "lucide-react";
import { AttachedFiles } from "../types";

interface ActionConsoleProps {
  attachedFiles: AttachedFiles;
  onUploadAndAnalyze: () => void;
  onRunDemo: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function ActionConsole({
  attachedFiles,
  onUploadAndAnalyze,
  onRunDemo,
  isLoading,
  disabled,
}: ActionConsoleProps) {
  // Check if at least one file is attached
  const hasFilesAttached = !!(
    attachedFiles.bank ||
    (attachedFiles.emails && attachedFiles.emails.length > 0) ||
    (attachedFiles.receipts && attachedFiles.receipts.length > 0)
  );

  return (
    <div id="action-console" className="border-t border-border-custom pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">Ready to evaluate ledger metrics?</h3>
          <p className="text-[11px] text-muted font-mono uppercase tracking-tight mt-0.5">
            Initialize database loading pipelines or execute a demo simulation immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Use Demo Data Button (Always Active) */}
          <button
            id="btn-demo-data"
            type="button"
            onClick={onRunDemo}
            disabled={disabled || isLoading}
            className="w-full sm:w-auto px-6 py-2.5 bg-surface hover:bg-border-custom border border-border-custom rounded-none text-xs font-mono font-semibold tracking-wider uppercase text-ink transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-3.5 w-3.5 text-muted" />
            <span>Use Demo Data</span>
          </button>

          {/* Upload and Analyse Button (Enabled only if files are attached) */}
          <button
            id="btn-upload-analyse"
            type="button"
            onClick={onUploadAndAnalyze}
            disabled={!hasFilesAttached || disabled || isLoading}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-none text-xs font-mono font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              hasFilesAttached && !disabled && !isLoading
                ? "bg-accent-custom hover:bg-accent-hover text-ink"
                : "bg-surface text-muted border border-border-custom cursor-not-allowed opacity-50"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
            ) : (
              <Play className="h-3.5 w-3.5 text-ink" />
            )}
            <span>Upload and Analyse</span>
          </button>
        </div>
      </div>
    </div>
  );
}
