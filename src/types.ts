export type AppStage = "landing" | "ingesting" | "analyzing" | "resolved";

export interface AttachedFiles {
  bank: File | null;
  emails: File[] | null;
  receipts: File[] | null;
}

export interface AttachedFileNames {
  bank: string | null;
  emails: string | null;
  receipts: string | null;
}

export interface ForensicCase {
  id: string;
  title: string;
  algorithm: string;
  reasoning: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  verdict: string;
  transcript: string;
}

export interface VendorReport {
  vendor_name: string;
  risk_score: number;
  confidence: number;
  verdict: string;
  case_interpretation: string;
  evidence_summary: string;
  people_involved: string[];
  next_steps: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: "ingesting" | "ingestion_complete" | "analyzing" | "completed" | "failed";
  logs: string[];
}

export interface ResultsResponse {
  jobId: string;
  status: string;
  cases: ForensicCase[];
  vendor_reports?: VendorReport[];
}
