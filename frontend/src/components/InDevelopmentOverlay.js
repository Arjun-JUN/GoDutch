import React from 'react';
import { Cube, Info } from '@phosphor-icons/react';

const InDevelopmentOverlay = ({ 
  title = "In Development", 
  marketingText = "Experience the future of seamless settlements. Our UPI integration is coming soon to simplify your life.",
  pmText = "Our engineering team is currently perfecting the settlement logic and UPI synchronization to ensure 100% accuracy and institutional-grade security."
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-hidden pointer-events-auto">
      {/* Ultra-soft glass backdrop */}
      <div className="absolute inset-0 bg-[var(--app-background-start)]/60 backdrop-blur-[16px] transition-all duration-1000 ease-in-out" />
      
      {/* Premium Content Card */}
      <div className="relative app-surface-solid max-w-xl w-full p-8 sm:p-12 text-center animate-in fade-in zoom-in duration-500 [box-shadow:var(--app-shadow-card)] ring-1 ring-[var(--app-border)]/10 backdrop-blur-3xl overflow-visible">
        
        {/* Floating Icon Context */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-xl ring-1 ring-[var(--app-border)]/20 animate-bounce transition-all duration-[2000ms]">
                <Cube size={38} weight="fill" className="text-[var(--app-primary)]" />
            </div>
        </div>

        <div className="app-eyebrow mb-4 pt-4 text-[var(--app-primary)] opacity-80">
          Advanced Roadmap
        </div>
        
        <h2 className="app-page-title mb-6 leading-[1.15] text-[var(--app-foreground)] font-[800]">
          {title}
        </h2>
        
        <div className="space-y-6 text-left">
          {/* Marketing Narrative */}
          <div className="p-6 rounded-[1.75rem] bg-[var(--app-soft-strong)]/30 border border-[var(--app-border-soft)]">
            <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary-strong)] animate-pulse" />
                <p className="app-eyebrow text-[var(--app-primary-strong)] text-[0.6rem]">Vision</p>
            </div>
            <p className="text-base sm:text-lg font-bold text-[var(--app-foreground)] leading-snug tracking-tight">
              &quot;{marketingText}&quot;
            </p>
          </div>
          
          {/* Engineering Update (PM) */}
          <div className="p-6 rounded-[1.75rem] app-surface-soft border-none bg-white/40 flex gap-4 items-start">
            <div className="mt-1 flex-shrink-0 text-[var(--app-muted)]">
                <Info size={20} weight="bold" />
            </div>
            <div>
              <p className="app-eyebrow text-[var(--app-muted)] text-[0.6rem] mb-1">Status Report</p>
              <p className="text-sm font-medium text-[var(--app-muted)] leading-relaxed">
                {pmText}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-[var(--app-border-soft)]">
          <p className="text-[0.65rem] font-extrabold text-[var(--app-muted-subtle)] uppercase tracking-[0.2em] opacity-50">
            GoDutch Labs • Beta Access 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default InDevelopmentOverlay;
