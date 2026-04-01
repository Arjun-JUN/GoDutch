import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { isEdgeAIReady, smartSplitEdge, scanReceiptEdge } from '../utils/edgeAI';
import { Camera, Lightning, Microphone, Sparkle, Trash } from '@phosphor-icons/react';
import Header from '../components/Header';
import { AppButton, AppInput, AppSelect, AppShell, AppSurface, AppTextarea, Callout, Field, MemberBadge, PageContent, PageHero } from '../components/app';

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Groceries',
  'Utilities',
  'Healthcare',
  'Travel',
  'Other'
];

const createExpenseItem = (overrides = {}, createKey) => ({
  ui_key: createKey(),
  name: '',
  price: '',
  quantity: 1,
  category: 'Other',
  assigned_to: [],
  ...overrides,
});

const normalizeExpenseItems = (rawItems, createKey) => {
  if (!Array.isArray(rawItems)) {
    return [createExpenseItem({}, createKey)];
  }

  const normalized = rawItems
    .map((item) => {
      let name = String(
        item?.name ??
        item?.item ??
        item?.description ??
        item?.title ??
        ''
      ).trim();

      let quantity = parseInt(item?.quantity ?? 1);
      
      // Heuristic: Extract quantity from name if present (e.g., "2x Burger" or "3 Beers")
      const qtyMatch = name.match(/^(\d+)\s*[xX]?\s+(.+)$/);
      if (qtyMatch && isNaN(parseInt(item?.quantity))) {
        quantity = parseInt(qtyMatch[1]);
        name = qtyMatch[2].trim();
      }

      const rawPrice = item?.price ?? item?.amount ?? item?.total ?? item?.value ?? '';
      const price = rawPrice === '' || rawPrice == null ? '' : String(rawPrice).trim();

      return createExpenseItem({
        name,
        price,
        quantity: isNaN(quantity) ? 1 : quantity,
        category: item?.category || 'Other',
        assigned_to: Array.isArray(item?.assigned_to) ? item.assigned_to : []
      }, createKey);
    })
    .filter((item) => item.name || item.price);

  return normalized.length > 0 ? normalized : [createExpenseItem({}, createKey)];
};

function NewExpenseRedesign({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [notes, setNotes] = useState('');
  const itemKeyRef = useRef(0);
  const nextItemKey = () => {
    itemKeyRef.current += 1;
    return `expense-item-${itemKeyRef.current}`;
  };
  const [items, setItems] = useState(() => [createExpenseItem({}, nextItemKey)]);
  const [splitType, setSplitType] = useState('equal');
  const [receiptImage, setReceiptImage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smartInstruction, setSmartInstruction] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSmartSplit, setShowSmartSplit] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);

  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    loadGroups();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSmartInstruction(transcript);
        toast.success('Voice captured!');
      };

      recognitionRef.current.onerror = () => {
        toast.error('Voice recognition failed');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      setGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load groups');
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    recognitionRef.current?.start();
    setIsRecording(true);
    toast.info('Listening...');
  };

  const handleSmartSplit = async () => {
    if (!smartInstruction.trim() || !selectedGroup) {
      toast.error('Please enter instruction and select a group');
      return;
    }

    setProcessingAI(true);
    try {
      const group = groups.find(g => g.id === selectedGroup);
      const membersInfo = (group?.members || []).map(m => `${m.name} (id: ${m.id})`).join(', ');
      const expenseContext = { merchant, total_amount: totalAmount, existing_items: items };

      let data;
      if (await isEdgeAIReady()) {
        data = await smartSplitEdge({ instruction: smartInstruction, membersInfo, expenseContext });
      } else {
        const res = await axios.post(
          `${API}/ai/smart-split`,
          { group_id: selectedGroup, instruction: smartInstruction, expense_context: expenseContext },
          { headers: getAuthHeader() }
        );
        data = res.data;
      }

      if (data.clarification_needed) {
        toast.info(data.clarification_question, { duration: 6000 });
      } else {
        const plan = data.split_plan;
        if (plan.items) {
          setItems(normalizeExpenseItems(plan.items, nextItemKey));
        }
        setSplitType(plan.split_type || 'custom');
        toast.success('Split plan created!');
        setShowSmartSplit(false);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Smart split failed';
      if (error.response?.status === 402) {
        toast.error(errorMsg, { duration: 6000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setProcessingAI(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      setReceiptImage(reader.result);
      setScanning(true);

      try {
        let data;
        if (await isEdgeAIReady()) {
          data = await scanReceiptEdge(file);
        } else {
          const res = await axios.post(
            `${API}/ocr/scan`,
            { image_base64: base64, mime_type: file.type || 'image/jpeg' },
            { headers: getAuthHeader() }
          );
          data = res.data;
        }

        setMerchant(data.merchant);
        setDate(data.date);
        setTotalAmount(data.total_amount.toString());
        setItems(normalizeExpenseItems(data.items ?? data.line_items ?? data.bill_items, nextItemKey));
        toast.success('Receipt scanned successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to scan receipt';
        if (error.response?.status === 402) {
          toast.error(errorMessage, { duration: 6000 });
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    setItems([...items, createExpenseItem({}, nextItemKey)]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const toggleMemberAssignment = (itemIndex, memberId) => {
    const updated = [...items];
    const assignedTo = updated[itemIndex].assigned_to || [];

    if (assignedTo.includes(memberId)) {
      updated[itemIndex].assigned_to = assignedTo.filter((id) => id !== memberId);
    } else {
      updated[itemIndex].assigned_to = [...assignedTo, memberId];
    }

    setItems(updated);
  };

  const calculateSplit = () => {
    const group = groups.find((entry) => entry.id === selectedGroup);
    if (!group) return [];

    if (splitType === 'item-based') {
      const memberTotals = {};
      group.members.forEach((member) => {
        memberTotals[member.id] = 0;
      });

      items.forEach((item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const subtotal = price * qty;
        const assignedTo = item.assigned_to || [];

        if (assignedTo.length > 0) {
          const perPerson = subtotal / assignedTo.length;
          assignedTo.forEach((memberId) => {
            memberTotals[memberId] += perPerson;
          });
        } else {
          const perPerson = subtotal / group.members.length;
          group.members.forEach((member) => {
            memberTotals[member.id] += perPerson;
          });
        }
      });

      return group.members.map((member) => ({
        user_id: member.id,
        user_name: member.name,
        amount: parseFloat(memberTotals[member.id].toFixed(2))
      }));
    }

    const amount = parseFloat(totalAmount) || 0;
    const perPerson = amount / group.members.length;

    return group.members.map((member) => ({
      user_id: member.id,
      user_name: member.name,
      amount: parseFloat(perPerson.toFixed(2)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        group_id: selectedGroup,
        merchant,
        date,
        total_amount: parseFloat(totalAmount),
        items: items
          .filter((item) => item.name.trim() !== '' || (item.price !== '' && !isNaN(parseFloat(item.price))))
          .map((item) => ({
            name: item.name.trim(),
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            category: item.category || 'Other',
            assigned_to: item.assigned_to || [],
          })),
        split_type: splitType,
        split_details: calculateSplit(),
        receipt_image: receiptImage,
        category,
        notes
      };

      await axios.post(`${API}/expenses`, expenseData, {
        headers: getAuthHeader(),
      });

      toast.success('Expense created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const currentGroup = groups.find((group) => group.id === selectedGroup);

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent>
        <PageHero
          eyebrow="Smart Capture"
          title="New Expense"
          description="Capture the receipt, refine the details, and split the moment with the right people using the calmer alpine design system."
          actions={(
            <div className="flex gap-2">
              {process.env.NODE_ENV === 'development' && (
                <AppButton
                  onClick={() => {
                    setMerchant('Pizza Hut');
                    setTotalAmount('1500');
                    setCategory('Food & Dining');
                    setItems([
                      createExpenseItem({ name: 'Pepperoni Pizza', price: '800', category: 'Food & Dining' }, nextItemKey),
                      createExpenseItem({ name: 'Garlic Bread', price: '300', category: 'Food & Dining' }, nextItemKey),
                      createExpenseItem({ name: 'Drinks', price: '400', category: 'Food & Dining' }, nextItemKey),
                    ]);
                  }}
                  variant="ghost"
                  size="sm"
                  className="bg-white/50"
                >
                  Demo Data
                </AppButton>
              )}
              <AppButton
                data-testid="smart-split-toggle"
                onClick={() => setShowSmartSplit(!showSmartSplit)}
                variant="secondary"
                size="sm"
              >
                <Sparkle size={18} weight="fill" />
                {showSmartSplit ? 'Hide AI Split' : 'AI Split'}
              </AppButton>
            </div>
          )}

        />

        {showSmartSplit && (
          <AppSurface className="mb-5 p-5 md:p-6" data-testid="smart-split-panel">
            <h3 className="mb-3 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">Smart Splitting</h3>
            <p className="mb-4 text-sm text-[var(--app-muted)]">
              Say or type: &quot;Put beverages to be split among Arjun and Gokul&quot; or &quot;Split pizza equally&quot;
            </p>
            <div className="mb-3 flex gap-2">
              <AppInput
                data-testid="smart-instruction-input"
                type="text"
                value={smartInstruction}
                onChange={(e) => setSmartInstruction(e.target.value)}
                className="flex-1 text-sm"
                placeholder="How should we split this?"
              />
              {recognitionRef.current && (
                <AppButton
                  data-testid="voice-input-btn"
                  onClick={handleVoiceInput}
                  variant="ghost"
                  size="icon"
                  className={isRecording ? 'animate-pulse bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]' : 'bg-white text-[var(--app-muted)]'}
                >
                  <Microphone size={20} weight="bold" />
                </AppButton>
              )}
            </div>
            <AppButton
              data-testid="process-smart-split-btn"
              onClick={handleSmartSplit}
              disabled={processingAI}
              className="flex w-full items-center justify-center gap-2 text-sm"
            >
              {processingAI ? (
                <>
                  <span className="spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lightning size={18} weight="fill" />
                  Apply Smart Split
                </>
              )}
            </AppButton>
          </AppSurface>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr,1.25fr]">
          <div className="space-y-5">
            <AppSurface className="p-5 md:p-6">
              <p className="app-eyebrow mb-3">Receipt</p>
              <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Scan or upload</h2>
              <label data-testid="receipt-upload-area" className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="receipt-upload-input"
                />
                <div className="relative overflow-hidden rounded-[2rem] bg-[var(--app-soft)] p-6 text-center transition-all hover:bg-[#e9efee] md:p-8">
                  {receiptImage ? (
                    <div className="relative">
                      <img
                        src={receiptImage}
                        alt="Receipt"
                        className="mx-auto max-h-64 rounded-[1.5rem] object-contain"
                      />
                      {scanning && <div className="scanning-line" />}
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-[var(--app-primary)]">
                        <Camera size={34} weight="bold" />
                      </div>
                      <p className="mb-2 text-base font-bold text-[var(--app-foreground)]">Upload Receipt</p>
                      <p className="text-sm text-[var(--app-muted)]">Tap to select an image and let OCR fill the draft.</p>
                    </div>
                  )}
                </div>
              </label>

              {scanning && (
                <Callout className="mt-4 bg-[var(--app-primary)] text-[var(--app-primary-foreground)]">
                  <div className="flex items-center justify-center gap-3">
                    <span className="spinner"></span>
                    <p className="font-bold text-sm" data-testid="scanning-text">Scanning with AI...</p>
                  </div>
                </Callout>
              )}
            </AppSurface>

            <AppSurface variant="soft" className="p-5 md:p-6">
              <p className="app-eyebrow mb-3">Split Preview</p>
              <h3 className="mb-4 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-foreground)]">Who is involved</h3>
              {currentGroup ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {currentGroup.members.map((member) => (
                      <MemberBadge key={member.id}>{member.name}</MemberBadge>
                    ))}
                  </div>
                  <div className="rounded-[1.5rem] bg-white p-4">
                    <p className="app-eyebrow mb-2">Current Split Mode</p>
                    <p className="text-base font-bold text-[var(--app-primary-strong)]">
                      {splitType === 'equal' ? 'Equal split' : splitType === 'item-based' ? 'Item-based split' : 'Custom split'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--app-muted)]">Select a group to preview the people involved.</p>
              )}
            </AppSurface>
          </div>

          <form onSubmit={handleSubmit} className="app-surface space-y-5 p-5 md:p-6">
            <div>
              <p className="app-eyebrow mb-2">Manual Input</p>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)]">Expense Details</h2>
            </div>

            <Field label="Group">
              <AppSelect
                data-testid="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="text-sm md:text-base"
                required
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </AppSelect>
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Merchant">
                <AppInput
                  data-testid="merchant-input"
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="text-sm md:text-base"
                  placeholder="Store or restaurant"
                  required
                />
              </Field>

              <Field label="Category">
                <AppSelect
                  data-testid="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-sm md:text-base"
                >
                  {CATEGORIES.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </AppSelect>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <AppInput
                  data-testid="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm md:text-base"
                  required
                />
              </Field>

              <Field label="Total (Rs)">
                <AppInput
                  data-testid="total-input"
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="text-sm md:text-base"
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>

            <Field label="Items">
              <motion.div layout className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.ui_key}
                      layout
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="border-b border-[var(--app-border-soft)] py-2 last:border-0"
                      data-testid={`item-${index}`}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Primary Row: Qty, Name, Price, Delete */}
                        <div className="flex items-center gap-1.5 md:gap-3">
                          {/* Quantity */}
                          <div className="flex bg-[var(--app-soft)] rounded-xl w-14 shrink-0 overflow-hidden items-center group focus-within:ring-2 focus-within:ring-[var(--app-primary-strong)]">
                             <input
                               type="number"
                               value={item.quantity}
                               onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                               className="w-full bg-transparent text-center text-sm font-black text-[var(--app-primary)] focus:outline-none py-2.5 px-1"
                               min="1"
                             />
                          </div>

                          {/* Detail Group: Name and Price */}
                          <div className="flex-1 flex flex-row items-center gap-1.5 md:gap-3">
                             <input
                                data-testid={`item-name-${index}`}
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                className="flex-1 min-w-0 text-sm md:text-base font-extrabold tracking-tight bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--app-border)] rounded-lg px-2 py-2 md:py-2.5 transition-colors truncate"
                                placeholder="Item name"
                             />
                             <div className="relative w-24 md:w-28 shrink-0">
                                <input
                                  data-testid={`item-price-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                                  className="w-full text-sm md:text-base font-black text-right pr-7 pl-1 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--app-border)] rounded-lg py-2 md:py-2.5 transition-colors"
                                  placeholder="0.00"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--app-muted)] pointer-events-none">Rs</span>
                             </div>
                          </div>

                          {/* Delete Button */}
                          <div className="flex items-center justify-center shrink-0 w-8 md:w-10">
                            {items.length > 1 && (
                              <button
                                data-testid={`remove-item-${index}`}
                                onClick={() => removeItem(index)}
                                type="button"
                                className="h-8 w-8 !rounded-full text-[var(--app-muted-subtle)] hover:bg-rose-50 hover:text-[var(--app-danger)] flex items-center justify-center transition-all bg-transparent border-none cursor-pointer"
                              >
                                <Trash size={18} weight="fill" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Split Detail Row */}
                        {splitType === 'item-based' && currentGroup && (
                          <div className="pl-14 md:pl-16 pr-8 mt-1 mb-2">
                             <div className="flex items-center justify-between border-t border-[var(--app-border-soft)] pt-2 md:pt-3">
                               <div className="flex flex-wrap gap-1.5 flex-1">
                                 {currentGroup.members.map((member) => (
                                   <button
                                     key={member.id}
                                     type="button"
                                     onClick={() => toggleMemberAssignment(index, member.id)}
                                     data-testid={`assign-${index}-${member.id}`}
                                     className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all shadow-sm ${
                                       (item.assigned_to || []).includes(member.id)
                                          ? 'bg-[var(--app-primary)] text-white'
                                          : 'bg-[var(--app-soft)] text-[var(--app-muted)] hover:bg-[var(--app-border-soft)]'
                                     }`}
                                   >
                                     {member.name}
                                   </button>
                                 ))}
                               </div>
                               
                               <div className="text-right pl-3">
                                 <p className="text-[10px] uppercase font-black tracking-widest text-[var(--app-muted)] opacity-60 mb-0.5">Sub</p>
                                 <p className="text-sm font-black text-[var(--app-primary)] leading-none">
                                   {((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toFixed(2)}
                                 </p>
                               </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <AppButton
                data-testid="add-item-btn"
                onClick={addItem}
                variant="secondary"
                size="sm"
                className="mt-3"
              >
                Add Item
              </AppButton>
            </Field>

            <Field label="Split Type">
              <AppSelect
                data-testid="split-type-select"
                value={splitType}
                onChange={(e) => setSplitType(e.target.value)}
                className="text-sm md:text-base"
              >
                <option value="equal">Equal Split</option>
                <option value="item-based">Item-Based (Assign items to people)</option>
                <option value="custom">Custom Split</option>
              </AppSelect>
            </Field>

            <Field label="Notes (Optional)">
              <AppTextarea
                data-testid="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm md:text-base"
                rows="2"
                placeholder="Add any notes..."
              />
            </Field>

            <AppButton
              data-testid="create-expense-btn"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 text-sm md:text-base"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Creating...</span>
                </>
              ) : (
                'Create Expense'
              )}
            </AppButton>
          </form>
        </div>
      </PageContent>
    </AppShell>
  );
}

export default NewExpenseRedesign;
