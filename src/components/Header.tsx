import React from "react";
import { Server, ShieldCheck } from "lucide-react";

interface HeaderProps {
  apiBaseUrl: string;
}

export default function Header({ apiBaseUrl }: HeaderProps) {
  return (
    <header
      id="veritas-header"
      className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-border-custom bg-canvas"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-accent-custom flex items-center justify-center font-bold text-sm tracking-tighter text-ink select-none rounded-none">
          V.AI
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-semibold tracking-tight uppercase text-ink font-display">
            Veritas AI Forensic Engine
          </h1>
          <p className="text-[10px] text-muted font-mono leading-none mt-0.5 sm:block hidden">
            Corporate Fraud Audit Engine
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-success-custom animate-pulse"></span>
          <span className="text-muted hidden sm:inline">Status:</span>
          <span className="text-ink">System Online</span>
        </div>
        <div className="text-[10px] font-mono text-muted px-3 py-1 border border-border-custom uppercase tracking-wide bg-surface/50 sm:block hidden">
          ENV: {apiBaseUrl ? "REMOTE" : "PROD_FS_ALPHA_04"}
        </div>
      </div>
    </header>
  );
}
