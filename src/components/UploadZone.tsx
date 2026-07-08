import React, { useRef, useState } from "react";
import { Upload, Mail, Receipt, Landmark, X } from "lucide-react";
import { AttachedFiles } from "../types";

interface UploadZoneProps {
  attachedFiles: AttachedFiles;
  onFileChange: (key: keyof AttachedFiles, files: File[] | File | null) => void;
  disabled: boolean;
}

export default function UploadZone({
  attachedFiles,
  onFileChange,
  disabled,
}: UploadZoneProps) {
  return (
    <div id="ingestion-zone" className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
          01 / Data Ingestion Matrix
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bank Statement Drop Zone */}
        <DropCard
          id="bank-drop-zone"
          title="BANK STATEMENTS"
          description="Supports CSV or tabular ledger sheets"
          acceptedTypes=".csv,text/csv,application/vnd.ms-excel"
          files={attachedFiles.bank}
          icon={<Landmark className="h-5 w-5 text-accent-custom" />}
          onSelect={(file) => onFileChange("bank", file)}
          disabled={disabled}
        />

        {/* Emails Drop Zone */}
        <DropCard
          id="emails-drop-zone"
          title="EMAIL LOGS"
          description="Supports multiple TXT, JSON correspondence files"
          acceptedTypes=".txt,.json,text/plain,application/json"
          files={attachedFiles.emails}
          icon={<Mail className="h-5 w-5 text-accent-custom" />}
          onSelect={(files) => onFileChange("emails", files)}
          disabled={disabled}
          allowMultiple={true}
        />

        {/* Receipts Drop Zone */}
        <DropCard
          id="receipts-drop-zone"
          title="RECEIPTS / SCANS"
          description="Supports multiple PDF or scan images"
          acceptedTypes=".pdf,image/*,application/pdf"
          files={attachedFiles.receipts}
          icon={<Receipt className="h-5 w-5 text-accent-custom" />}
          onSelect={(files) => onFileChange("receipts", files)}
          disabled={disabled}
          allowMultiple={true}
        />
      </div>
    </div>
  );
}

interface DropCardProps {
  id: string;
  title: string;
  description: string;
  acceptedTypes: string;
  files: File[] | File | null;
  icon: React.ReactNode;
  onSelect: (files: File[] | File | null) => void;
  disabled: boolean;
  allowMultiple?: boolean;
}

function DropCard({
  id,
  title,
  description,
  acceptedTypes,
  files,
  icon,
  onSelect,
  disabled,
  allowMultiple = false,
}: DropCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileArray = Array.isArray(files) ? files : files ? [files] : [];
  const hasFiles = fileArray.length > 0;

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (allowMultiple) {
      const selectedFiles = e.target.files ? Array.from(e.target.files) as File[] : null;
      onSelect(selectedFiles && selectedFiles.length > 0 ? selectedFiles : null);
    } else {
      const selectedFile = e.target.files?.[0] || null;
      onSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (allowMultiple) {
      const droppedFiles = e.dataTransfer.files ? Array.from(e.dataTransfer.files) as File[] : null;
      onSelect(droppedFiles && droppedFiles.length > 0 ? droppedFiles : null);
    } else {
      const droppedFile = e.dataTransfer.files?.[0] || null;
      onSelect(droppedFile);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      id={id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center p-6 border transition-all duration-150 cursor-pointer rounded-none min-h-[112px] ${
        hasFiles
          ? "border-accent-custom bg-accent-custom/5"
          : isDragOver
          ? "border-accent-custom bg-surface"
          : "border-dashed border-border-custom bg-surface hover:border-border-custom/80"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        multiple={allowMultiple}
        className="hidden"
        disabled={disabled}
      />

      {hasFiles ? (
        <div className="flex flex-col items-center text-center space-y-2 w-full">
          <span className="text-[10px] font-mono text-muted tracking-wider uppercase font-semibold">
            {title}
          </span>
          <div className="max-w-[240px] px-2">
            {fileArray.length === 1 ? (
              <span className="text-xs font-mono text-accent-custom truncate block">
                {fileArray[0].name} ({(fileArray[0].size / (1024 * 1024)).toFixed(2)}MB)
              </span>
            ) : (
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-accent-custom font-semibold block">
                  {fileArray.length} Files Selected
                </span>
                <span className="text-[10px] font-mono text-muted truncate block" title={fileArray.map((f) => f.name).join(", ")}>
                  {fileArray.map((f) => f.name).join(", ")}
                </span>
              </div>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 hover:bg-border-custom text-muted hover:text-ink transition-colors cursor-pointer"
              title="Clear files"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="text-muted flex items-center gap-2">
            {icon}
            <span className="text-xs font-mono text-muted uppercase font-bold">{title}</span>
          </div>
          <p className="text-[10px] font-mono text-muted/80 tracking-tight leading-relaxed max-w-[220px]">
            {description}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-accent-custom font-mono">
            <Upload className="h-3 w-3" />
            <span>Click or drag to drop</span>
          </div>
        </div>
      )}
    </div>
  );
}
