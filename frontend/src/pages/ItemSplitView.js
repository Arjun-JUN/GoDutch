import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Microphone, 
  PaperPlaneRight, 
  Check, 
  CaretDown, 
  CaretUp,
  Plus,
  Trash,
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
        const newItems = [...items];
        result.split_plan.items.forEach(newItem => {
          const idx = newItems.findIndex(i => i.name.toLowerCase() === newItem.name.toLowerCase());
          if (idx > -1) {
            newItems[idx] = { ...newItems[idx], ...newItem };
          } else {
            newItems.push({
              ...newItem,
              assigned_to: newItem.assigned_to || [],
              split_type: 'equal'
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

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    onItemsChange(newItems);
  };

  const addItem = () => {
    const newItems = [...items, { name: '', price: '', quantity: 1, category: 'General', assigned_to: [], split_type: 'equal' }];
    onItemsChange(newItems);
    // Auto-expand the newly added item for immediate editing
    setExpandedItemId(newItems.length - 1);
  };

  const removeItem = (idx) => {
    if (items.length <= 1) {
      toast.error('At least one item is required');
      return;
    }
    const newItems = items.filter((_, i) => i !== idx);
    onItemsChange(newItems);
    if (expandedItemId === idx) setExpandedItemId(null);
    else if (expandedItemId > idx) setExpandedItemId(expandedItemId - 1);
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

  const itemsTotal = items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0);
  const expenseTotal = parseFloat(totalAmount) || 0;
  const difference = expenseTotal - itemsTotal;

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

      {/* Items List — Editable */}
      <div className="item-split-list" data-testid="item-split-list">
        {items.map((item, idx) => {
          const isExpanded = expandedItemId === idx;
          const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);

          return (
            <motion.div 
              key={idx} 
              className={`item-card ${isExpanded ? 'active' : ''}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Compact row: Name + Price inline */}
              <div className="item-edit-row" data-testid={`item-row-${idx}`}>
                <div className="item-edit-fields">
                  <input
                    className="item-name-input"
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    data-testid={`item-name-${idx}`}
                  />
                  <div className="item-price-wrapper">
                    <span className="item-currency-symbol">{currencySymbol}</span>
                    <input
                      className="item-price-input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
                      data-testid={`item-price-${idx}`}
                    />
                  </div>
                </div>

                <div className="item-row-actions">
                  <button
                    className="item-delete-btn"
                    type="button"
                    onClick={() => removeItem(idx)}
                    data-testid={`item-delete-${idx}`}
                    title="Remove item"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                  <button
                    className="item-expand-btn"
                    type="button"
                    onClick={() => setExpandedItemId(isExpanded ? null : idx)}
                    data-testid={`item-expand-${idx}`}
                    title="Assign members"
                  >
                    {isExpanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                  </button>
                </div>
              </div>

              {/* Expanded: quantity + member assignment */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="item-expanded-section"
                  >
                    {/* Quantity row */}
                    <div className="item-qty-row">
                      <label className="item-detail-label">Qty</label>
                      <input
                        className="item-qty-input"
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        data-testid={`item-qty-${idx}`}
                      />
                      {(parseInt(item.quantity) || 1) > 1 && (
                        <span className="item-line-total">
                          = {currencySymbol}{lineTotal.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Member assignment */}
                    <div className="item-member-section">
                      <p className="item-section-label">Split with:</p>
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

                      {/* Equal/Unequal Toggle */}
                      {item.assigned_to?.length > 1 && (
                        <div className="item-split-mode-toggle">
                          <button 
                            className={`mode-toggle-btn ${item.split_type !== 'unequal' ? 'active' : ''}`}
                            onClick={() => {
                              const newItems = [...items];
                              newItems[idx] = { ...newItems[idx], split_type: 'equal' };
                              onItemsChange(newItems);
                            }}
                          >
                            EQUALLY
                          </button>
                          <button 
                            className={`mode-toggle-btn ${item.split_type === 'unequal' ? 'active' : ''}`}
                            onClick={() => {
                              const newItems = [...items];
                              newItems[idx] = { ...newItems[idx], split_type: 'unequal' };
                              onItemsChange(newItems);
                            }}
                          >
                            UNEQUALLY
                          </button>
                        </div>
                      )}
                      
                      {item.split_type === 'unequal' && (
                         <div className="mt-3 space-y-2">
                           {(item.assigned_to || []).map(mid => {
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
            </motion.div>
          );
        })}
      </div>

      {/* Add Item Button */}
      <button 
        className="item-add-btn" 
        type="button" 
        onClick={addItem}
        data-testid="add-item-btn"
      >
        <Plus size={16} weight="bold" />
        <span>Add item</span>
      </button>

      {/* Running Total */}
      <div className={`item-total-bar ${Math.abs(difference) > 0.01 ? (difference < 0 ? 'over' : 'under') : 'match'}`} data-testid="item-total-bar">
        <div className="item-total-row">
          <span className="item-total-label">Items total</span>
          <span className="item-total-value">{currencySymbol}{itemsTotal.toFixed(2)}</span>
        </div>
        {Math.abs(difference) > 0.01 && (
          <div className="item-total-row">
            <span className="item-total-label">{difference > 0 ? 'Remaining' : 'Over by'}</span>
            <span className={`item-total-value ${difference < 0 ? 'text-danger' : ''}`}>
              {currencySymbol}{Math.abs(difference).toFixed(2)}
            </span>
          </div>
        )}
        {Math.abs(difference) <= 0.01 && (
          <div className="item-total-match">
            <Check size={14} weight="bold" /> Matches expense total
          </div>
        )}
      </div>
    </div>
  );
}
