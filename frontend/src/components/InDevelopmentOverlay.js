import React from 'react';

const InDevelopmentOverlay = ({ title = "( In Development )", 
  marketingText = "Experience the future of seamless settlements. Our UPI integration is coming soon to simplify your life.",
  pmText = "Feature in Development: We are currently perfecting the settlement logic and UPI integration to ensure 100% accuracy and security for your transactions." }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
      {/* Blurring backdrop */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md transition-all duration-500 ease-in-out" />
      
      {/* Content Card - Neo-Brutalist Style */}
      <div className="relative bg-white border-2 border-[#0F0F0F] p-8 sm:p-10 rounded-2xl shadow-[8px_8px_0px_0px_#0F0F0F] max-w-lg w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="inline-block px-4 py-1 rounded-full bg-[#C4F1F9] border-2 border-[#0F0F0F] text-xs font-black uppercase tracking-widest mb-6">
          Feature Status
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-none" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          {title}
        </h2>
        
        <div className="space-y-6 text-left">
          <div className="p-4 bg-[#e4f1db] border-2 border-[#0F0F0F] rounded-xl shadow-[4px_4px_0px_0px_#0F0F0F]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#5a7a4a] mb-1">Marketing Message</p>
            <p className="text-sm sm:text-base font-bold text-[#2d3e23] leading-relaxed">
              &quot;{marketingText}&quot;
            </p>
          </div>
          
          <div className="p-4 bg-[#f8dfe8] border-2 border-[#0F0F0F] rounded-xl shadow-[4px_4px_0px_0px_#0F0F0F]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8a3b53] mb-1">Product Status (PM)</p>
            <p className="text-sm sm:text-base font-bold text-[#4a1e2a] leading-relaxed italic">
              {pmText}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t-2 border-dashed border-[#0F0F0F]">
          <p className="text-xs font-bold text-[#0F0F0F]/60">
            Thank you for your patience as we build the best expense sharing experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InDevelopmentOverlay;
