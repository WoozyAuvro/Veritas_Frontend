import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, FileText, ShieldAlert, Users, ClipboardList } from "lucide-react";
import { VendorReport } from "../types";

interface CaseCardProps {
  report: VendorReport;
  key?: React.Key;
}

export default function CaseCard({ report }: CaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-danger-custom/10",
        border: "border-danger-custom",
        text: "text-danger-custom",
        badge: "border-danger-custom text-danger-custom bg-danger-custom/10",
      };
    } else if (score >= 50) {
      return {
        bg: "bg-warning-custom/10",
        border: "border-warning-custom",
        text: "text-warning-custom",
        badge: "border-warning-custom text-warning-custom bg-warning-custom/10",
      };
    } else {
      return {
        bg: "bg-success-custom/10",
        border: "border-success-custom",
        text: "text-success-custom",
        badge: "border-success-custom text-success-custom bg-success-custom/10",
      };
    }
  };

  const styles = getRiskColor(report.risk_score);

  return (
    <div
      id={`vendor-card-${report.vendor_name.replace(/\s+/g, "-").toLowerCase()}`}
      className="bg-[#18181b] border border-border-custom p-6 space-y-5 transition-all duration-150 hover:border-accent-custom rounded-none animate-fade-in flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-base font-bold tracking-tight mb-1 uppercase text-ink font-display">
              {report.vendor_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-muted uppercase">Verdict:</span>
              <span className={`text-[9px] font-bold font-mono border px-1.5 py-0.5 uppercase tracking-wide ${styles.badge}`}>
                {report.verdict.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[9px] uppercase tracking-wider text-muted font-mono">Risk Index</p>
            <p className={`text-2xl font-mono font-bold ${styles.text}`}>
              {report.risk_score}/100
            </p>
          </div>
        </div>

        {/* Interpretation / Logic */}
        <div className="space-y-3">
          <div className="text-xs leading-relaxed text-ink border-l-2 border-accent-custom pl-4 italic">
            {report.case_interpretation}
          </div>

          {/* Evidence Summary block */}
          <div className="text-[11px] text-muted bg-[#09090b]/40 border border-border-custom/50 p-3 space-y-1.5">
            <div className="flex items-center gap-1 font-bold text-ink uppercase font-mono">
              <ShieldAlert className="h-3.5 w-3.5 text-accent-custom" />
              <span>Key Forensic Findings</span>
            </div>
            <p className="leading-relaxed font-sans">{report.evidence_summary}</p>
          </div>
        </div>

        {/* Collapsible Section for People & Next Steps */}
        <div
          className={`transition-all duration-300 overflow-hidden space-y-4 ${
            isExpanded ? "max-h-[600px] border-t border-border-custom/30 pt-4" : "max-h-0"
          }`}
        >
          {/* People Involved */}
          {report.people_involved && report.people_involved.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink font-bold">
                <Users className="h-3.5 w-3.5 text-accent-custom" />
                <span>Entities and Associated Profiles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {report.people_involved.map((person, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-mono text-muted bg-[#27272a] px-2 py-0.5 rounded-none border border-border-custom"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Actionable Audit Steps */}
          {report.next_steps && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink font-bold">
                <ClipboardList className="h-3.5 w-3.5 text-accent-custom" />
                <span>Remediation Directives</span>
              </div>
              <div className="bg-[#09090b]/80 border border-border-custom p-3 text-[11px] font-mono text-muted leading-relaxed whitespace-pre-wrap">
                {report.next_steps.split(" Then ").map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 mb-1.5 last:mb-0">
                    <span className="text-accent-custom shrink-0">[{idx + 1}]</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="flex justify-between items-center pt-3 border-t border-border-custom mt-4">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-muted font-mono">
            Audit Confidence
          </p>
          <p className="text-sm font-mono font-bold text-ink">
            {report.confidence}%
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold text-accent-custom hover:text-accent-hover uppercase tracking-tighter transition-colors flex items-center gap-1 cursor-pointer font-mono"
        >
          <span>{isExpanded ? "Hide Details" : "Inspect Forensic Trail"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
