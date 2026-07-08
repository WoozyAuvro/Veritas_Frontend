import React from "react";
import {
  Percent,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  FolderLock,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { VendorReport } from "../types";
import CaseCard from "./CaseCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

interface CaseDashboardProps {
  reports: VendorReport[];
}

export default function CaseDashboard({ reports }: CaseDashboardProps) {
  // If reports is empty, don't render dashboard elements
  if (!reports || reports.length === 0) return null;

  // Calculate metrics
  const highRiskCount = reports.filter((r) => r.risk_score >= 80).length;
  const mediumRiskCount = reports.filter((r) => r.risk_score >= 50 && r.risk_score < 80).length;
  const averageConfidence = (
    reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length
  ).toFixed(1);
  const averageRisk = (
    reports.reduce((sum, r) => sum + r.risk_score, 0) / reports.length
  ).toFixed(1);

  // Prepare recharts data using real reports!
  const chartData = reports.map((r) => ({
    name: r.vendor_name.length > 15 ? r.vendor_name.substring(0, 12) + "..." : r.vendor_name,
    "Risk Score": r.risk_score,
    "Confidence": r.confidence,
  }));

  return (
    <div id="case-dashboard" className="space-y-6 animate-fade-in">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
          03 / Forensic Resolution & Diagnostic Dashboard
        </h2>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface border border-border-custom p-5 rounded-none space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Audited Vendors</span>
            <FileSpreadsheet className="h-4 w-4 text-accent-custom" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-ink">{reports.length}</span>
            <span className="text-[10px] text-muted font-mono uppercase">Verified</span>
          </div>
          <p className="text-[9px] text-muted font-mono uppercase leading-none">
            Extracted from ledger nodes
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface border border-border-custom p-5 rounded-none space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Mean Risk Index</span>
            <AlertTriangle className="h-4 w-4 text-warning-custom animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-warning-custom">{averageRisk}</span>
            <span className="text-[10px] text-muted font-mono uppercase">/ 100</span>
          </div>
          <p className="text-[9px] text-warning-custom font-mono uppercase leading-none">
            {mediumRiskCount} Moderate Indicators
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface border border-border-custom p-5 rounded-none space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Severe Escalations</span>
            <FolderLock className="h-4 w-4 text-danger-custom" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-danger-custom">{highRiskCount}</span>
            <span className="text-[10px] text-muted font-mono uppercase font-bold">Threats</span>
          </div>
          <p className="text-[9px] text-danger-custom font-mono uppercase leading-none">
            Require compliance action
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface border border-border-custom p-5 rounded-none space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Mean Confidence</span>
            <Percent className="h-4 w-4 text-success-custom" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-ink">{averageConfidence}%</span>
            <span className="text-[10px] text-muted font-mono uppercase">Certainty</span>
          </div>
          <p className="text-[9px] text-success-custom font-mono uppercase leading-none">
            Highly corroborated findings
          </p>
        </div>
      </div>

      {/* Analytics Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Spectrum Bar Chart */}
        <div className="lg:col-span-2 bg-surface border border-border-custom p-5 rounded-none flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase text-ink">Statistical Risk Spectrum</h3>
              <p className="text-[10px] text-muted uppercase font-mono mt-0.5">
                Comparison of risk scores and confidence levels across vendors.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-mono text-muted uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-danger-custom/70" />
                <span>Risk Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-accent-custom/70" />
                <span>Confidence</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#252525",
                    borderRadius: "0px",
                    color: "#f9fafb",
                    fontFamily: "JetBrains Mono"
                  }}
                  itemStyle={{ color: "#f9fafb" }}
                />
                <Bar dataKey="Risk Score" fill="var(--color-danger-custom)" opacity={0.8} />
                <Bar dataKey="Confidence" fill="var(--color-accent-custom)" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Ranking List */}
        <div className="bg-surface border border-border-custom p-5 rounded-none flex flex-col justify-between h-[320px]">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-ink">Confidence Distribution</h3>
            <p className="text-[10px] text-muted uppercase font-mono mt-0.5">
              Confidence levels mapped against threat severities.
            </p>
          </div>

          <div className="space-y-3 my-auto overflow-y-auto max-h-[180px] pr-1">
            {reports.map((r, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-ink truncate max-w-[150px] uppercase font-bold">{r.vendor_name}</span>
                  <span className="text-muted">{r.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-canvas border border-border-custom rounded-none overflow-hidden">
                  <div
                    className={`h-full rounded-none transition-all duration-500 ${
                      r.risk_score >= 80
                        ? "bg-danger-custom"
                        : r.risk_score >= 50
                        ? "bg-warning-custom"
                        : "bg-success-custom"
                    }`}
                    style={{ width: `${r.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border-custom text-[9px] font-mono text-muted uppercase leading-tight">
            Confidence ratings represent the systemic alignment of cross-correlated invoice and communication nodes.
          </div>
        </div>
      </div>

      {/* Case Logs Grid */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider text-muted">
          Extracted Case Profiles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((r, idx) => (
            <CaseCard key={idx} report={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
