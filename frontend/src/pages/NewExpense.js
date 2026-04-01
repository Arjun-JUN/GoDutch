import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { isEdgeAIReady, smartSplitEdge, scanReceiptEdge } from '../utils/edgeAI';
import { Camera, Microphone, Lightning, Sparkle, User as UserIcon } from '@phosphor-icons/react';
import Header from '../components/Header';

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

const EMPTY_ITEM = { name: '', price: '', category: 'Other', assigned_to: [] };

const normalizeExpenseItems = (rawItems) => {
  if (!Array.isArray(rawItems)) {
    return [EMPTY_ITEM];
  }

  const normalized = rawItems
    .map((item) => {
      const name = String(
        item?.name ??
        item?.item ??
        item?.description ??
        item?.title ??
        ''
      ).trim();

      const rawPrice = item?.price ?? item?.amount ?? item?.total ?? item?.value ?? '';
      const price = rawPrice === '' || rawPrice == null ? '' : String(rawPrice).trim();

      return {
        name,
        price,
        category: item?.category || 'Other',
        assigned_to: Array.isArray(item?.assigned_to) ? item.assigned_to : []
      };
    })
    .filter((item) => item.name || item.price);

  return normalized.length > 0 ? normalized : [EMPTY_ITEM];
};

function NewExpense({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([EMPTY_ITEM]);
  const [splitType, setSplitType] = useState('equal');
  const [receiptImage, setReceiptImage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [smartInstruction, setSmartInstruction] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSmartSplit, setShowSmartSplit] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  
  const navigate = useNavigate();
  const user = getCurrentUser();
  const recognitionRef = useRef(null);

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
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
      toast.info('Listening...');
    }
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
          setItems(normalizeExpenseItems(plan.items));
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
        setItems(normalizeExpenseItems(data.items ?? data.line_items ?? data.bill_items));
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
    setItems([...items, { ...EMPTY_ITEM }]);
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
      updated[itemIndex].assigned_to = assignedTo.filter(id => id !== memberId);
    } else {
      updated[itemIndex].assigned_to = [...assignedTo, memberId];
    }
    
    setItems(updated);
  };

  const calculateSplit = () => {
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return [];

    if (splitType === 'item-based') {
      const memberTotals = {};
      group.members.forEach(m => { memberTotals[m.id] = 0; });
      
      items.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const assignedTo = item.assigned_to || [];
        
        if (assignedTo.length > 0) {
          const perPerson = price / assignedTo.length;
          assignedTo.forEach(memberId => {
            memberTotals[memberId] += perPerson;
          });
        } else {
          const perPerson = price / group.members.length;
          group.members.forEach(m => {
            memberTotals[m.id] += perPerson;
          });
        }
      });
      
      return group.members.map(member => ({
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
        items: items.map((item) => ({
          name: item.name,
          price: parseFloat(item.price),
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

  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
    <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            New Expense
          </h1>
          <button
            data-testid="smart-split-toggle"
            onClick={() => setShowSmartSplit(!showSmartSplit)}
            className="neo-btn-primary text-xs md:text-sm flex items-center gap-2"
          >
            <Sparkle size={18} weight="fill" />
            AI Split
          </button>
        </div>

        {showSmartSplit && (
          <div className="neo-card p-4 md:p-6 mb-4 md:mb-6" data-testid="smart-split-panel">
            <h3 className="font-bold text-lg mb-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Smart Splitting
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Say or type: "Put beverages to be split among Arjun and Gokul" or "Split pizza equally"
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                data-testid="smart-instruction-input"
                type="text"
                value={smartInstruction}
                onChange={(e) => setSmartInstruction(e.target.value)}
                className="neo-input flex-1 text-sm"
                placeholder="How should we split this?"
              />
              {recognitionRef.current && (
                <button
                  data-testid="voice-input-btn"
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-3 border-2 border-[#0F0F0F] rounded-lg ${
                    isRecording ? 'bg-[#FFC4D9] animate-pulse' : 'bg-white'
                  }`}
                >
                  <Microphone size={20} weight="bold" />
                </button>
              )}
            </div>
            
            <button
              data-testid="process-smart-split-btn"
              onClick={handleSmartSplit}
              disabled={processingAI}
              className="neo-btn-primary w-full text-sm flex items-center justify-center gap-2"
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
            </button>
          </div>
        )}

        <div className="space-y-4 md:space-y-6">
          <div className="neo-card p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Scan Receipt
            </h2>

            <label data-testid="receipt-upload-area" className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="receipt-upload-input"
              />
              <div className="neo-card-interactive p-6 md:p-8 text-center relative overflow-hidden">
                {receiptImage ? (
                  <div className="relative">
                    <img
                      src={receiptImage}
                      alt="Receipt"
                      className="max-h-48 md:max-h-64 mx-auto border-2 border-[#0F0F0F] rounded-lg"
                    />
                    {scanning && <div className="scanning-line" />}
                  </div>
                ) : (
                  <div>
                    <Camera size={48} weight="bold" className="mx-auto mb-3" />
                    <p className="font-bold mb-2 text-sm md:text-base">Upload Receipt</p>
                    <p className="text-xs md:text-sm text-gray-600">Click to select image</p>
                  </div>
                )}
              </div>
            </label>

            {scanning && (
              <div className="mt-4 p-3 md:p-4 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <span className="spinner"></span>
                  <p className="font-bold text-sm" data-testid="scanning-text">Scanning with AI...</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="neo-card p-4 md:p-6 space-y-4">
            <h2 className="text-lg md:text-xl font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Expense Details
            </h2>

            <div>
              <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                Group
              </label>
              <select
                data-testid="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="neo-input w-full text-sm md:text-base"
                required
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Merchant
                </label>
                <input
                  data-testid="merchant-input"
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="neo-input w-full text-sm md:text-base"
                  placeholder="Store or restaurant"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  data-testid="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="neo-input w-full text-sm md:text-base"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  data-testid="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="neo-input w-full text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Total (₹)
                </label>
                <input
                  data-testid="total-input"
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="neo-input w-full text-sm md:text-base"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                Items
              </label>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="border-2 border-[#0F0F0F] rounded-lg p-3" data-testid={`item-${index}`}>
                    <div className="flex gap-2 mb-2">
                      <input
                        data-testid={`item-name-${index}`}
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="neo-input flex-1 text-sm"
                        placeholder="Item name"
                      />
                      <input
                        data-testid={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="neo-input w-20 text-sm"
                        placeholder="₹"
                      />
                      {items.length > 1 && (
                        <button
                          data-testid={`remove-item-${index}`}
                          type="button"
                          onClick={() => removeItem(index)}
                          className="neo-btn-secondary px-3 text-sm"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {splitType === 'item-based' && currentGroup && (
                      <div className="mt-2">
                        <p className="text-xs font-bold mb-1">Assign to:</p>
                        <div className="flex flex-wrap gap-1">
                          {currentGroup.members.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => toggleMemberAssignment(index, member.id)}
                              data-testid={`assign-${index}-${member.id}`}
                              className={`text-xs px-2 py-1 border-2 border-[#0F0F0F] rounded transition-all ${
                                (item.assigned_to || []).includes(member.id)
                                  ? 'bg-[#BDE6A3]'
                                  : 'bg-white'
                              }`}
                            >
                              {member.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                data-testid="add-item-btn"
                type="button"
                onClick={addItem}
                className="neo-btn-secondary mt-3 text-sm"
              >
                + Add Item
              </button>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                Split Type
              </label>
              <select
                data-testid="split-type-select"
                value={splitType}
                onChange={(e) => setSplitType(e.target.value)}
                className="neo-input w-full text-sm md:text-base"
              >
                <option value="equal">Equal Split</option>
                <option value="item-based">Item-Based (Assign items to people)</option>
                <option value="custom">Custom Split</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                Notes (Optional)
              </label>
              <textarea
                data-testid="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="neo-input w-full text-sm md:text-base"
                rows="2"
                placeholder="Add any notes..."
              />
            </div>

            <button
              data-testid="create-expense-btn"
              type="submit"
              disabled={loading}
              className="neo-btn-primary w-full text-sm md:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Creating...</span>
                </>
              ) : (
                'Create Expense'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewExpense;
