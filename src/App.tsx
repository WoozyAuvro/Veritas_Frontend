import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Info, FileWarning, ArrowDown, Activity, CheckCircle, Database } from "lucide-react";
import { AppStage, AttachedFiles, VendorReport } from "./types";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import ActionConsole from "./components/ActionConsole";
import StreamTerminal from "./components/StreamTerminal";
import CaseDashboard from "./components/CaseDashboard";

// Base URL configuration (satisfies the dynamic target requirements)
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "https://veritas-zbhe.onrender.com";

export default function App() {
  const [currentAppStage, setCurrentAppStage] = useState<AppStage>("landing");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFiles>({
    bank: null,
    emails: null,
    receipts: null,
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<
    "ingesting" | "ingestion_complete" | "analyzing" | "completed" | "failed"
  >("ingesting");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isLogPanelExpanded, setIsLogPanelExpanded] = useState<boolean>(true);
  const [forensicResults, setForensicResults] = useState<VendorReport[]>([]);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isStartingAgent, setIsStartingAgent] = useState<boolean>(false);

  // Viewport scroll references (satisfies section 4 requirements)
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const terminalSectionRef = useRef<HTMLDivElement>(null);
  const dashboardSectionRef = useRef<HTMLDivElement>(null);

  const executeScrollToView = (targetRef: React.RefObject<HTMLDivElement | null>) => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Sync state stage transitions and scroll viewports accordingly
  useEffect(() => {
    if (currentAppStage === "ingesting") {
      setTimeout(() => executeScrollToView(terminalSectionRef), 100);
    } else if (currentAppStage === "resolved") {
      setTimeout(() => executeScrollToView(dashboardSectionRef), 200);
    }
  }, [currentAppStage]);

  // Handle file changes in UploadZone supporting single and multiple files
  const handleFileChange = (key: keyof AttachedFiles, files: File[] | File | null) => {
    setAttachedFiles((prev) => ({
      ...prev,
      [key]: files,
    }));
  };

  // Helper to stream logs from `/jobs/{job_id}/logs` and poll `/jobs/{job_id}` for completion
  const runAndStreamJob = async (jobId: string): Promise<boolean> => {
    setActiveJobId(jobId);
    const abortController = new AbortController();
    let jobCompleted = false;
    let finalStatus = "running";

    // Concurrently stream logs in real-time
    const streamPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/logs`, {
          signal: abortController.signal,
        });
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done && !jobCompleted) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            if (chunk) {
              setTerminalLogs((prev) => {
                const newLines = chunk.split("\n").filter(line => line.trim() !== "");
                return [...prev, ...newLines];
              });
            }
          }
        }
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.error("Logs streaming error:", err);
        }
      }
    })();

    // Poll the status every second
    const pollPromise = new Promise<string>((resolve) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
          if (response.ok) {
            const data = await response.json();
            setJobStatus(data.status);
            
            // Fallback: If backend sends logs in the poll response, update them here to bypass stream buffering
            const polledLogs = data.logs || data.terminalLogs || data.terminal_logs;
            if (polledLogs && Array.isArray(polledLogs)) {
              setTerminalLogs(polledLogs);
            }

            if (data.status === "completed" || data.status === "failed") {
              clearInterval(interval);
              resolve(data.status);
            }
          }
        } catch (e) {
          console.error("Error polling job:", e);
        }
      }, 1000);
    });

    finalStatus = await pollPromise;
    jobCompleted = true;
    abortController.abort(); // stop the log stream safely

    return finalStatus === "completed";
  };

  // Action 1: Upload and Ingest Custom Files
  const handleUploadAndAnalyze = async () => {
    setIsUploading(true);
    setTerminalLogs([`[${new Date().toISOString()}] SYSTEM: Starting document ingestion sequence...`]);
    setCurrentAppStage("ingesting");
    setIsLogPanelExpanded(true);
    setJobStatus("ingesting");

    try {
      let bankCompleted = true;
      let emailsCompleted = true;
      let receiptsCompleted = true;

      // 1. Bank Statement Ingestion
      if (attachedFiles.bank) {
        setTerminalLogs((prev) => [...prev, `[SYSTEM] Transferring bank statement ledger...`]);
        const formData = new FormData();
        formData.append("files", attachedFiles.bank);
        const response = await fetch(`${API_BASE_URL}/ingest/bank-statements`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to post bank statements to ingestion socket");
        }
        const data = await response.json();
        if (data.job_id) {
          bankCompleted = await runAndStreamJob(data.job_id);
        }
      }

      // 2. Email Logs Ingestion
      if (attachedFiles.emails && attachedFiles.emails.length > 0) {
        setTerminalLogs((prev) => [...prev, `[SYSTEM] Transferring ${attachedFiles.emails?.length} email logs...`]);
        const formData = new FormData();
        attachedFiles.emails.forEach((file) => {
          formData.append("files", file);
        });
        const response = await fetch(`${API_BASE_URL}/ingest/emails`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to post email logs to ingestion socket");
        }
        const data = await response.json();
        if (data.job_id) {
          emailsCompleted = await runAndStreamJob(data.job_id);
        }
      }

      // 3. Receipts / Scans Ingestion
      if (attachedFiles.receipts && attachedFiles.receipts.length > 0) {
        setTerminalLogs((prev) => [...prev, `[SYSTEM] Transferring ${attachedFiles.receipts?.length} transaction receipts...`]);
        const formData = new FormData();
        attachedFiles.receipts.forEach((file) => {
          formData.append("files", file);
        });
        const response = await fetch(`${API_BASE_URL}/ingest/receipts`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to post receipts to ingestion socket");
        }
        const data = await response.json();
        if (data.job_id) {
          receiptsCompleted = await runAndStreamJob(data.job_id);
        }
      }

      if (bankCompleted && emailsCompleted && receiptsCompleted) {
        setJobStatus("ingestion_complete");
        setTerminalLogs((prev) => [
          ...prev,
          `[SYSTEM] ALL FILES SUCCESSFULLY INGESTED AND INDEXED.`,
          `[SYSTEM] READY TO START DEEP FORENSIC AUDITING.`,
        ]);
      } else {
        setJobStatus("failed");
        setTerminalLogs((prev) => [
          ...prev,
          `[ERROR] One or more document ingestion pipelines failed. Please review terminal output.`,
        ]);
      }
    } catch (e: any) {
      console.error("Ingestion failed:", e);
      setJobStatus("failed");
      setTerminalLogs((prev) => [
        ...prev,
        `[ERROR] Ingestion process failed: ${e.message || e}`,
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  // Action 2: Use Demo Data
  const handleRunDemo = async () => {
    setIsUploading(true);
    setTerminalLogs([`[${new Date().toISOString()}] SYSTEM: Running integrated demonstration suite...`]);
    setCurrentAppStage("analyzing");
    setIsLogPanelExpanded(true);
    setJobStatus("analyzing");

    try {
      const response = await fetch(`${API_BASE_URL}/start-analysis?demo=true`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Server rejected demo analysis request");
      }
      const data = await response.json();
      if (data.job_id) {
        const success = await runAndStreamJob(data.job_id);
        if (success) {
          setJobStatus("completed");
          setIsLogPanelExpanded(false); // Seamlessly collapse logs
          
          // Fetch final structured cases
          const resultsResponse = await fetch(`${API_BASE_URL}/results`);
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            const casesList = resultsData.vendor_reports || (Array.isArray(resultsData) ? resultsData : []);
            setForensicResults(casesList);
            setCurrentAppStage("resolved");
          }
        } else {
          setJobStatus("failed");
          setTerminalLogs((prev) => [...prev, `[ERROR] Demo analysis execution failed.`]);
        }
      }
    } catch (e: any) {
      console.error("Failed to trigger demo analysis:", e);
      setJobStatus("failed");
      setTerminalLogs((prev) => [...prev, `[ERROR] Demo analysis execution failed: ${e.message || e}`]);
    } finally {
      setIsUploading(false);
    }
  };

  // Action 3: Start Agent Forensic Analysis (triggers the core analysis workflow on custom files)
  const handleStartAgentAnalysis = async () => {
    setIsStartingAgent(true);
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toISOString()}] SYSTEM: Initializing Veritas Multi-Engine Fraud Suite...`,
    ]);
    setJobStatus("analyzing");
    setCurrentAppStage("analyzing");

    try {
      const response = await fetch(`${API_BASE_URL}/start-analysis?demo=false`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Server rejected core analysis request");
      }
      const data = await response.json();
      if (data.job_id) {
        const success = await runAndStreamJob(data.job_id);
        if (success) {
          setJobStatus("completed");
          setIsLogPanelExpanded(false); // Seamlessly collapse logs
          
          // Fetch final structured cases
          const resultsResponse = await fetch(`${API_BASE_URL}/results`);
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            const casesList = resultsData.vendor_reports || (Array.isArray(resultsData) ? resultsData : []);
            setForensicResults(casesList);
            setCurrentAppStage("resolved");
          }
        } else {
          setJobStatus("failed");
          setTerminalLogs((prev) => [...prev, `[ERROR] Veritas Multi-Engine Fraud Suite failed.`]);
        }
      }
    } catch (e: any) {
      console.error("Failed to start agent loops:", e);
      setJobStatus("failed");
      setTerminalLogs((prev) => [...prev, `[ERROR] Failed to start agent: ${e.message || e}`]);
    } finally {
      setIsStartingAgent(false);
    }
  };

  return (
    <div id="veritas-workspace" className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent-custom/20 selection:text-ink">
      <Header apiBaseUrl={API_BASE_URL || "Local Loopback"} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-12">
        {/* Banner Alert (Plain English copy) */}
        <div className="bg-surface border border-border-custom px-4 py-3 rounded flex items-start gap-3">
          <Info className="h-5 w-5 text-accent-custom shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-ink">Active Fraud Audit Protocol: </span>
            <span className="text-muted">
              Use this workspace to process transaction ledgers, email exchanges, and billing scans. The system evaluates document integrity, timing consistency, and patterns of structural manipulation.
            </span>
          </div>
        </div>

        {/* Section 0: Landing and Upload Zone */}
        <div ref={uploadSectionRef} className="space-y-6">
          <UploadZone
            attachedFiles={attachedFiles}
            onFileChange={handleFileChange}
            disabled={currentAppStage !== "landing"}
          />

          <ActionConsole
            attachedFiles={attachedFiles}
            onUploadAndAnalyze={handleUploadAndAnalyze}
            onRunDemo={handleRunDemo}
            isLoading={isUploading}
            disabled={currentAppStage !== "landing"}
          />
        </div>

        {/* Section 1 & 2: Ingestion Telemetry & Cognitive Agent Terminal */}
        {(currentAppStage === "ingesting" ||
          currentAppStage === "analyzing" ||
          currentAppStage === "resolved") && (
          <div
            ref={terminalSectionRef}
            className="pt-6 border-t border-border-custom space-y-4 scroll-mt-6"
          >
            <div>
              <h2 className="font-display text-xl font-medium tracking-tight text-ink">
                Telemetry & Logic Stream
              </h2>
              <p className="text-sm text-muted mt-1">
                Monitor database ingestion threads and multi-turn agent logic execution in real-time.
              </p>
            </div>

            <StreamTerminal
              logs={terminalLogs}
              status={jobStatus}
              isExpanded={isLogPanelExpanded}
              onToggleExpand={() => setIsLogPanelExpanded(!isLogPanelExpanded)}
              onStartAgentAnalysis={handleStartAgentAnalysis}
              isStartingAgent={isStartingAgent}
            />
          </div>
        )}

        {/* Section 3: Case Resolution & Analytical Dashboards */}
        {currentAppStage === "resolved" && forensicResults.length > 0 && (
          <div
            ref={dashboardSectionRef}
            className="pt-8 border-t border-border-custom scroll-mt-6"
          >
            <CaseDashboard reports={forensicResults} />
          </div>
        )}
      </main>

      {/* Workspace Footer */}
      <footer className="border-t border-border-custom bg-surface/20 py-6 px-6 md:px-8 mt-12 text-center text-xs text-muted font-mono">
        <div>
          <span>VERITAS ENGINE CLIENT NODE</span>
          <span className="mx-2">•</span>
          <span>© 2026 VERITAS FORENSICS</span>
          <span className="mx-2">•</span>
          <span className="text-accent-custom select-all">PORT 3000</span>
        </div>
      </footer>
    </div>
  );
}
