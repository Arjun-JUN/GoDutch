import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Microphone, 
  PaperPlaneRight, 
  Check, 
  CaretDown, 
  CaretUp,
  Tag,
  Hash,
  CurrencyInr,
  Lightning
} from '@/slate/icons';
import { AppInput } from '@/slate';
import { smartSplitEdge } from '../utils/edgeAI';
import { toast } from 'sonner';

export function ItemSplitView({ 
  items, 
  onItemsChange, 
  members, 
  currencySymbol,
  totalAmount 
}) {
  const [smartInput, setSmartInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSmartInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast.error('Voice recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error('Voice recognition not supported in this browser');
        return;
      }
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSmartSplit = async () => {
    if (!smartInput.trim()) return;
    
    const loadingToast = toast.loading('AI is calculating split...');
    try {
      const membersInfo = members.map(m => `${m.name} (id: ${m.id})`).join(', ');
      const result = await smartSplitEdge({
        instruction: smartInput,
        membersInfo,
        expenseContext: { total_amount: totalAmount, current_items: items }
      });

      if (result.clarification_needed) {
        toast.dismiss(loadingToast);
        toast.info(result.clarification_question);
        return;
      }

      if (result.split_plan && result.split_plan.items) {
        // Merge or replace items based on logic? 
        // For now, let's replace or update if names match
        const newItems = [...items];
        result.split_plan.items.forEach(newItem => {
          const idx = newItems.findIndex(i => i.name.toLowerCase() === newItem.name.toLowerCase());
          if (idx > -1) {
            newItems[idx] = { ...newItems[idx], ...newItem };
          } else {
            newItems.push({
              ...newItem,
              assigned_to: newItem.assigned_to || [],
              split_type: 'equal' // default
            });
          }
        });
        onItemsChange(newItems);
        setSmartInput('');
        toast.success('Split updated by AI', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Smart split failed', { id: loadingToast });
    }
  };

  const toggleMemberForItem = (itemIdx, memberId) => {
    const newItems = [...items];
    const item = { ...newItems[itemIdx] };
    const assigned = item.assigned_to || [];
    
    if (assigned.includes(memberId)) {
      item.assigned_to = assigned.filter(id => id !== memberId);
    } else {
      item.assigned_to = [...assigned, memberId];
    }
    
    newItems[itemIdx] = item;
    onItemsChange(newItems);
  };

  const updateItemSplitMode = (itemIdx, mode) => {
    const newItems = [...items];
    newItems[itemIdx] = { ...newItems[itemIdx], split_type: mode };
    onItemsChange(newItems);
  };

  return (
    <div className="item-split-container">
      {/* Smart Split AI Input */}
      <div className="smart-split-bubble">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-primary)] text-white shadow-sm">
          <Lightning size={16} weight="fill" />
        </div>
        <input 
          className="smart-split-input"
          placeholder="e.g. 'Split pizza between Arjun and Priya'"
          value={smartInput}
          onChange={(e) => setSmartInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSmartSplit()}
        />
        <button 
          className={`voice-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          type="button"
        >
          <Microphone size={18} weight={isRecording ? "fill" : "bold"} />
        </button>
        {smartInput && (
          <button 
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-white transition-transform active:scale-90"
            onClick={handleSmartSplit}
          >
            <PaperPlaneRight size={18} weight="bold" />
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="item-split-list">
        {items.map((item, idx) => (
          <div key={`${item.name}-${idx}`} className={`item-card ${expandedItemId === idx ? 'active' : ''}`}>
            <div 
              className="item-header"
              onClick={() => setExpandedItemId(expandedItemId === idx ? null : idx)}
            >
              <div className="item-info-main">
                <span className="item-name">{item.name}</span>
                <span className="item-amount">{currencySymbol}{(parseFloat(item.price) * (parseInt(item.quantity) || 1)).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                  {item.assigned_to?.length || 0} split
                </span>
                {expandedItemId === idx ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
              </div>
            </div>

            <AnimatePresence>
              {expandedItemId === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Item Details (The "Tap" reveal) */}
                  <div className="item-details-overlay">
                    <div className="detail-item">
                      <span className="detail-label"><Hash size={10} className="inline mr-1"/>Qty</span>
                      <span className="detail-value">{item.quantity || 1}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><CurrencyInr size={10} className="inline mr-1"/>Rate</span>
                      <span className="detail-value">{currencySymbol}{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><Tag size={10} className="inline mr-1"/>Type</span>
                      <span className="detail-value capitalize">{item.category || 'Food'}</span>
                    </div>
                  </div>

                  {/* Split Selection */}
                  <div className="p-4 border-t border-[var(--app-border-soft)]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-3">Split with:</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map((member) => {
                        const isSelected = item.assigned_to?.includes(member.id);
                        return (
                          <div
                            key={member.id}
                            className={`member-chip ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleMemberForItem(idx, member.id)}
                          >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/50 text-[10px]">
                              {member.name.charAt(0)}
                            </div>
                            {member.name}
                            {isSelected && <Check size={12} weight="bold" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Equal/Unequal Toggle for Item */}
                    {item.assigned_to?.length > 1 && (
                      <div className="item-split-mode-toggle">
                        <button 
                          className={`mode-toggle-btn ${item.split_type !== 'unequal' ? 'active' : ''}`}
                          onClick={() => updateItemSplitMode(idx, 'equal')}
                        >
                          EQUALLY
                        </button>
                        <button 
                          className={`mode-toggle-btn ${item.split_type === 'unequal' ? 'active' : ''}`}
                          onClick={() => updateItemSplitMode(idx, 'unequal')}
                        >
                          UNEQUALLY
                        </button>
                      </div>
                    )}
                    
                    {item.split_type === 'unequal' && (
                       <div className="mt-3 space-y-2">
                         {item.assigned_to.map(mid => {
                           const member = members.find(m => m.id === mid);
                           return (
                             <div key={mid} className="flex items-center justify-between gap-3 px-1">
                               <span className="text-xs font-bold text-[var(--app-muted)]">{member?.name}</span>
                               <AppInput 
                                 type="number"
                                 placeholder="0.00"
                                 className="!py-1 !px-2 !rounded-lg !text-xs !w-20 text-right"
                                 value={item.custom_amounts?.[mid] || ''}
                                 onChange={(e) => {
                                   const newItems = [...items];
                                   const newItem = {...newItems[idx]};
                                   newItem.custom_amounts = {...(newItem.custom_amounts || {}), [mid]: e.target.value};
                                   newItems[idx] = newItem;
                                   onItemsChange(newItems);
                                 }}
                               />
                             </div>
                           )
                         })}
                       </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
