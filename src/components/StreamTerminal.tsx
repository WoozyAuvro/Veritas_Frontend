import React, { useEffect, useRef } from "react";
import {
  Circle,
  Clock,
  Play,
  CheckCircle2,
  Terminal,
  Activity,
} from "lucide-react";

interface StreamTerminalProps {
  logs: string[];
  status: "ingesting" | "ingestion_complete" | "analyzing" | "completed" | "failed";
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStartAgentAnalysis: () => void;
  isStartingAgent: boolean;
}

export default function StreamTerminal({
  logs,
  status,
  isExpanded,
  onToggleExpand,
  onStartAgentAnalysis,
  isStartingAgent,
}: StreamTerminalProps) {
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs on new log arrival
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Parse ingestion milestones from logs
  const getStepStatus = (stepIndex: number) => {
    const logStr = logs.join("\n");
    if (stepIndex === 0) {
      // Creating Database Structures
      if (logStr.includes("Uploading Source Documents")) return "complete";
      if (logStr.includes("Creating Database Structures")) return "running";
      return "pending";
    } else if (stepIndex === 1) {
      // Uploading Source Documents
      if (logStr.includes("Generating Structural Vector Embeddings")) return "complete";
      if (logStr.includes("Uploading Source Documents")) return "running";
      return "pending";
    } else if (stepIndex === 2) {
      // Generating Structural Vector Embeddings
      if (logStr.includes("Source ingestion complete") || logStr.includes("ingestion_complete") || status === "ingestion_complete" || status === "analyzing" || status === "completed") return "complete";
      if (logStr.includes("Generating Structural Vector Embeddings")) return "running";
      return "pending";
    }
    return "pending";
  };

  const stepIcon = (stepStatus: "pending" | "running" | "complete") => {
    switch (stepStatus) {
      case "complete":
        return <CheckCircle2 className="h-3.5 w-3.5 text-success-custom shrink-0" />;
      case "running":
        return <Activity className="h-3.5 w-3.5 text-warning-custom animate-pulse shrink-0" />;
      default:
        return <Circle className="h-3.5 w-3.5 text-muted shrink-0" />;
    }
  };

  const stepClass = (stepStatus: "pending" | "running" | "complete") => {
    switch (stepStatus) {
      case "complete":
        return "text-success-custom font-medium";
      case "running":
        return "text-warning-custom font-medium";
      default:
        return "text-muted";
    }
  };

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : "Initializing secure pipelines...";

  return (
    <div id="telemetry-terminal-container" className="space-y-4 animate-fade-in">
      {/* Upper Title Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
          02 / Analysis Pipeline
        </h2>
        <button
          onClick={onToggleExpand}
          className="text-[10px] uppercase font-mono px-3 py-1 border border-border-custom hover:bg-surface/80 transition-colors rounded-none cursor-pointer"
        >
          {isExpanded ? "[-] Hide Logs" : "[+] See Technical Logs"}
        </button>
      </div>

      {/* Collapsed Log Strip Bar when log container is closed */}
      {!isExpanded && (
        <div className="bg-[#09090b] border border-border-custom p-3 flex items-center justify-between select-none">
          <div className="flex items-center space-x-3 font-mono text-[10px] min-w-0">
            <span className={status === "completed" ? "text-success-custom shrink-0 font-bold" : "text-accent-custom shrink-0 font-bold animate-pulse"}>
              [{status.toUpperCase()}]
            </span>
            <span className="text-muted truncate">
              {latestLog.replace(/^\[.*?\]\s*/, "")}
            </span>
          </div>
          <div className="text-muted text-[10px] font-mono hidden sm:block">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Main Terminal Container */}
      <div
        className={`border border-border-custom bg-surface rounded-none overflow-hidden flex flex-col transition-all duration-300 ${
          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-5 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-canvas/40">
          {/* Sequential Trackers / Pipeline Checklist */}
          <div className="lg:col-span-1 space-y-4 lg:border-r border-border-custom/50 pr-4">
            <h4 className="text-[10px] font-mono uppercase font-bold text-ink tracking-wider">
              Ingestion Sequence
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                {stepIcon(getStepStatus(0))}
                <span className={stepClass(getStepStatus(0))}>
                  Database Structuring
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {stepIcon(getStepStatus(1))}
                <span className={stepClass(getStepStatus(1))}>
                  Document Upload
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {stepIcon(getStepStatus(2))}
                <span className={stepClass(getStepStatus(2))}>
                  Vector Embedding Map
                </span>
              </div>
            </div>
          </div>

          {/* Raw Stream Logger */}
          <div className="lg:col-span-3 flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3 animate-pulse text-accent-custom" />
                Live Log Payload Stream
              </span>
              <span className="text-[10px] font-mono text-muted">
                {logs.length} entries synced
              </span>
            </div>
            <div className="flex-1 bg-[#050507] border border-border-custom rounded-none p-4 overflow-y-auto font-mono text-xs text-emerald-500/90 space-y-1.5 select-text selection:bg-accent-custom/30 selection:text-ink">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed break-all whitespace-pre-wrap">
                  {log}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Inline Start Forensic Analysis Button */}
      {status === "ingestion_complete" && (
        <div className="bg-accent-custom/5 border border-border-custom px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in rounded-none">
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-success-custom">
              Document Ingestion Concluded
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Source file indexing completed. Vector matrices are aligned for multi-turn AI audits.
            </p>
          </div>
          <button
            id="btn-start-analysis"
            type="button"
            onClick={onStartAgentAnalysis}
            disabled={isStartingAgent}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0f766e] hover:bg-[#115e59] text-ink rounded-none text-xs font-mono font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartingAgent ? (
              <Activity className="h-3.5 w-3.5 animate-spin text-ink" />
            ) : (
              <Play className="h-3.5 w-3.5 text-ink" />
            )}
            <span>Start Forensic Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
}
