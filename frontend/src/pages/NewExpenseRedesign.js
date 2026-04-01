import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { isEdgeAIReady, smartSplitEdge, scanReceiptEdge } from '../utils/edgeAI';
import {
  Airplane,
  ArrowLeft,
  CalendarBlank,
  Camera,
  Car,
  CaretDown,
  Check,
  CurrencyInr,
  DotsThreeCircle,
  ForkKnife,
  ImageSquare,
  Lightbulb,
  Note,
  PencilSimple,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Ticket,
  UsersThree,
  X,
} from '@/slate/icons';
import { Header, AppButton, AppInput, AppSelect, AppShell, AppSurface, PageContent, Callout } from '@/slate';

/* ─── Constants ─── */

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Entertainment', 'Shopping',
  'Groceries', 'Utilities', 'Healthcare', 'Travel', 'Other',
];

const CATEGORY_ICONS = {
  'Food & Dining': ForkKnife,
  'Transportation': Car,
  'Entertainment': Ticket,
  'Shopping': ShoppingBag,
  'Groceries': ShoppingCart,
  'Utilities': Lightbulb,
  'Healthcare': Stethoscope,
  'Travel': Airplane,
  'Other': DotsThreeCircle,
};

const DESCRIPTION_ICON_MAP = [
  { keywords: ['food', 'pizza', 'burger', 'dinner', 'lunch', 'breakfast', 'restaurant', 'cafe', 'coffee', 'tea', 'biryani', 'chicken', 'noodles'], icon: ForkKnife, category: 'Food & Dining' },
  { keywords: ['uber', 'cab', 'taxi', 'ola', 'gas', 'fuel', 'parking', 'car', 'petrol', 'diesel', 'metro', 'bus'], icon: Car, category: 'Transportation' },
  { keywords: ['movie', 'netflix', 'concert', 'show', 'game', 'spotify', 'hotstar', 'prime'], icon: Ticket, category: 'Entertainment' },
  { keywords: ['grocery', 'supermarket', 'vegetables', 'fruits', 'bigbasket', 'blinkit', 'zepto', 'dmart'], icon: ShoppingCart, category: 'Groceries' },
  { keywords: ['shop', 'amazon', 'flipkart', 'clothes', 'shoes', 'myntra', 'mall'], icon: ShoppingBag, category: 'Shopping' },
  { keywords: ['electricity', 'water', 'internet', 'phone', 'wifi', 'bill', 'broadband', 'bescom'], icon: Lightbulb, category: 'Utilities' },
  { keywords: ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'clinic'], icon: Stethoscope, category: 'Healthcare' },
  { keywords: ['flight', 'hotel', 'trip', 'travel', 'vacation', 'airbnb', 'booking', 'train', 'indigo'], icon: Airplane, category: 'Travel' },
];

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code;
}

function getIconForDescription(description) {
  const lower = (description || '').toLowerCase();
  for (const entry of DESCRIPTION_ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { icon: entry.icon, category: entry.category };
    }
  }
  return { icon: Receipt, category: 'Other' };
}

/* ─── Sub-components ─── */

function PaidByModal({ open, onClose, members, paidBy, onPaidByChange, totalAmount, currencySymbol }) {
  const [localPaidBy, setLocalPaidBy] = useState(paidBy);
  const [showUnequal, setShowUnequal] = useState(paidBy.length > 1);

  useEffect(() => {
    if (open) {
      setLocalPaidBy(paidBy);
      setShowUnequal(paidBy.length > 1);
    }
  }, [open, paidBy]);

  const toggleMember = (memberId) => {
    const existing = localPaidBy.find((p) => p.user_id === memberId);
    if (existing) {
      setLocalPaidBy(localPaidBy.filter((p) => p.user_id !== memberId));
    } else {
      setLocalPaidBy([...localPaidBy, { user_id: memberId, amount: '' }]);
    }
  };

  const updateAmount = (memberId, amount) => {
    setLocalPaidBy(localPaidBy.map((p) => (p.user_id === memberId ? { ...p, amount } : p)));
  };

  const handleDone = () => {
    onPaidByChange(localPaidBy);
    onClose();
  };

  if (!open) return null;

  const selectedCount = localPaidBy.length;
  const totalEntered = localPaidBy.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const remaining = (parseFloat(totalAmount) || 0) - totalEntered;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-fullscreen"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="modal-fullscreen-header">
          <button 
            className="back-btn" 
            onClick={() => { if (localPaidBy.length > 0) handleDone(); }} 
            data-testid="paidby-modal-close"
            style={{ opacity: localPaidBy.length === 0 ? 0.5 : 1, cursor: localPaidBy.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--app-foreground)]">Who paid?</h2>
            <p className="text-xs text-[var(--app-muted)]">{selectedCount} selected</p>
          </div>
        </div>

        <div className="modal-fullscreen-body">
          {localPaidBy.length === 0 && (
            <Callout className="mb-4 border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">Please select at least one person who paid.</span>
              </div>
            </Callout>
          )}
          <div className="member-select-list">
            {members.map((member) => {
              const isSelected = localPaidBy.some((p) => p.user_id === member.id);
              const paidEntry = localPaidBy.find((p) => p.user_id === member.id);
              return (
                <div
                  key={member.id}
                  className={`member-select-row ${isSelected ? 'selected' : ''}`}
                  data-testid={`paidby-member-${member.id}`}
                >
                  <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                  <div className="member-info" onClick={() => toggleMember(member.id)}>
                    <span className="member-name">{member.name}</span>
                  </div>
                  {showUnequal && isSelected ? (
                    <input
                      type="number"
                      className="member-amount-input"
                      placeholder="0.00"
                      value={paidEntry?.amount || ''}
                      onChange={(e) => updateAmount(member.id, e.target.value)}
                      data-testid={`paidby-amount-${member.id}`}
                    />
                  ) : null}
                  <div
                    className={`member-check ${isSelected ? 'checked' : ''}`}
                    onClick={() => toggleMember(member.id)}
                  >
                    {isSelected ? <Check size={14} weight="bold" color="white" /> : null}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedCount > 1 && (
            <div className="mt-4">
              <button
                className="expense-split-btn w-full justify-center"
                onClick={() => setShowUnequal(!showUnequal)}
                type="button"
              >
                {showUnequal ? 'Hide amounts' : 'Set unequal amounts'}
              </button>
            </div>
          )}

          {showUnequal && selectedCount > 1 && (
            <div className={`amount-remaining ${remaining < 0 ? 'over' : ''}`}>
              <span className="label">Remaining</span>
              <span className="value">
                {currencySymbol}{Math.abs(remaining).toFixed(2)}{remaining < 0 ? ' over' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="modal-sticky-footer">
          <AppButton 
            onClick={handleDone} 
            className="w-full justify-center" 
            disabled={localPaidBy.length === 0}
            data-testid="paidby-done-btn"
          >
            Done
          </AppButton>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function SplitBetweenModal({ open, onClose, members, splitBetween, splitMode, onSplitChange, onSplitModeChange, totalAmount, currencySymbol }) {
  const [localSplit, setLocalSplit] = useState(splitBetween);
  const [localMode, setLocalMode] = useState(splitMode);

  useEffect(() => {
    if (open) {
      setLocalSplit(splitBetween);
      setLocalMode(splitMode);
    }
  }, [open, splitBetween, splitMode]);

  const toggleMember = (memberId) => {
    const existing = localSplit.find((s) => s.user_id === memberId);
    if (existing) {
      setLocalSplit(localSplit.filter((s) => s.user_id !== memberId));
    } else {
      setLocalSplit([...localSplit, { user_id: memberId, amount: '', shares: 1 }]);
    }
  };

  const updateField = (memberId, field, value) => {
    setLocalSplit(localSplit.map((s) => (s.user_id === memberId ? { ...s, [field]: value } : s)));
  };

  const handleDone = () => {
    onSplitChange(localSplit);
    onSplitModeChange(localMode);
    onClose();
  };

  if (!open) return null;

  const total = parseFloat(totalAmount) || 0;
  const selectedCount = localSplit.length;

  // Compute per-person for equally
  const perPerson = selectedCount > 0 ? total / selectedCount : 0;

  // For unequally
  const totalEntered = localSplit.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const remaining = total - totalEntered;

  // For shares
  const totalShares = localSplit.reduce((s, p) => s + (parseInt(p.shares) || 1), 0);

  const tabs = ['Equally', 'Unequally', 'By shares'];

  return (
    <AnimatePresence>
      <motion.div
        className="modal-fullscreen"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="modal-fullscreen-header">
          <button 
            className="back-btn" 
            onClick={() => { if (localSplit.length > 0) handleDone(); }} 
            data-testid="split-modal-close"
            style={{ opacity: localSplit.length === 0 ? 0.5 : 1, cursor: localSplit.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--app-foreground)]">Split options</h2>
            <p className="text-xs text-[var(--app-muted)]">{selectedCount} of {members.length} people</p>
          </div>
        </div>

        <div className="modal-fullscreen-body">
          {localSplit.length === 0 && (
            <Callout className="mb-4 border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">Please select at least one person to split with.</span>
              </div>
            </Callout>
          )}
          <div className="split-tab-nav mb-5" data-testid="split-tab-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`split-tab-item ${localMode === tab.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                onClick={() => setLocalMode(tab.toLowerCase().replace(' ', ''))}
                data-testid={`split-tab-${tab.toLowerCase().replace(' ', '')}`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="member-select-list">
            {members.map((member) => {
              const isSelected = localSplit.some((s) => s.user_id === member.id);
              const splitEntry = localSplit.find((s) => s.user_id === member.id);
              return (
                <div
                  key={member.id}
                  className={`member-select-row ${isSelected ? 'selected' : ''}`}
                  data-testid={`split-member-${member.id}`}
                >
                  <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                  <div className="member-info" onClick={() => toggleMember(member.id)}>
                    <span className="member-name">{member.name}</span>
                    {localMode === 'equally' && isSelected && (
                      <p className="text-xs text-[var(--app-muted)] mt-0.5">
                        {currencySymbol}{perPerson.toFixed(2)}
                      </p>
                    )}
                    {localMode === 'byshares' && isSelected && (
                      <p className="text-xs text-[var(--app-muted)] mt-0.5">
                        {currencySymbol}{(totalShares > 0 ? ((parseInt(splitEntry?.shares) || 1) / totalShares * total) : 0).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {localMode === 'unequally' && isSelected && (
                    <input
                      type="number"
                      className="member-amount-input"
                      placeholder="0.00"
                      value={splitEntry?.amount || ''}
                      onChange={(e) => updateField(member.id, 'amount', e.target.value)}
                      data-testid={`split-amount-${member.id}`}
                    />
                  )}

                  {localMode === 'byshares' && isSelected && (
                    <input
                      type="number"
                      className="member-amount-input"
                      placeholder="1"
                      min="1"
                      value={splitEntry?.shares || 1}
                      onChange={(e) => updateField(member.id, 'shares', e.target.value)}
                      data-testid={`split-shares-${member.id}`}
                      style={{ width: '4rem' }}
                    />
                  )}

                  <div
                    className={`member-check ${isSelected ? 'checked' : ''}`}
                    onClick={() => toggleMember(member.id)}
                  >
                    {isSelected ? <Check size={14} weight="bold" color="white" /> : null}
                  </div>
                </div>
              );
            })}
          </div>

          {localMode === 'unequally' && (
            <div className={`amount-remaining ${remaining < -0.01 ? 'over' : ''}`}>
              <span className="label">Remaining</span>
              <span className="value">
                {currencySymbol}{Math.abs(remaining).toFixed(2)}{remaining < -0.01 ? ' over' : ''}
              </span>
            </div>
          )}

          {localMode === 'byshares' && (
            <div className="amount-remaining">
              <span className="label">Total shares</span>
              <span className="value">{totalShares}</span>
            </div>
          )}
        </div>

        <div className="modal-sticky-footer">
          <AppButton 
            onClick={handleDone} 
            className="w-full justify-center" 
            disabled={localSplit.length === 0}
            data-testid="split-done-btn"
          >
            Done
          </AppButton>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ScanningOverlay({ open, receiptImage }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="scanning-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div className="scan-content">
          {receiptImage && (
            <div className="receipt-preview">
              <img src={receiptImage} alt="Receipt" />
              <div className="scanning-line" />
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="spinner" style={{ borderTopColor: 'var(--app-primary)' }} />
            <p className="text-base font-extrabold text-[var(--app-foreground)]" data-testid="scanning-text">
              Scanning receipt...
            </p>
          </div>
          <p className="text-sm text-[var(--app-muted)]">
            AI is extracting merchant, items, and amounts from your receipt
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CameraCapture({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (open) {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Camera access denied');
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'camera-receipt.jpg', { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onloadend = () => {
          onCapture(reader.result, file);
          stopCamera();
          onClose();
        };
        reader.readAsDataURL(file);
      },
      'image/jpeg',
      0.9
    );
  };

  if (!open) return null;

  return (
    <motion.div
      className="camera-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <video ref={videoRef} autoPlay playsInline muted style={{ flex: 1 }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="camera-controls">
        <button className="camera-close-btn" onClick={() => { stopCamera(); onClose(); }} data-testid="camera-close">
          <X size={24} weight="bold" />
        </button>
        <button className="camera-capture-btn" onClick={capturePhoto} data-testid="camera-capture" />
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

function NewExpenseRedesign({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  // Core form state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingDate, setEditingDate] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Split configuration
  const [paidBy, setPaidBy] = useState([]);
  const [splitBetween, setSplitBetween] = useState([]);
  const [splitMode, setSplitMode] = useState('equally');

  // Modals
  const [showPaidByModal, setShowPaidByModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Receipt / scanning
  const [receiptImage, setReceiptImage] = useState('');
  const [scanning, setScanning] = useState(false);

  // Submission
  const [loading, setLoading] = useState(false);

  // File input ref
  const fileInputRef = useRef(null);

  // ─── Load groups ───
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`, { headers: getAuthHeader() });
      setGroups(res.data);

      // Pre-select group if passed via location state or query
      const preselectedGroupId = location.state?.groupId;
      if (preselectedGroupId && res.data.some((g) => g.id === preselectedGroupId)) {
        setSelectedGroup(preselectedGroupId);
        initSplitForGroup(res.data.find((g) => g.id === preselectedGroupId));
      } else if (res.data.length > 0) {
        setSelectedGroup(res.data[0].id);
        initSplitForGroup(res.data[0]);
      }
    } catch {
      toast.error('Failed to load groups');
    }
  };

  const initSplitForGroup = useCallback(
    (group) => {
      if (!group) return;
      const userId = currentUser?.id;

      // Default: current user pays full
      setPaidBy([{ user_id: userId, amount: '' }]);

      // Default: all members split equally
      setSplitBetween(
        group.members.map((m) => ({ user_id: m.id, amount: '', shares: 1 }))
      );
      setSplitMode('equally');
    },
    [currentUser?.id]
  );

  // When group changes, reinitialize splits
  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    const group = groups.find((g) => g.id === groupId);
    initSplitForGroup(group);
  };

  // ─── Derived state ───
  const currentGroup = groups.find((g) => g.id === selectedGroup);
  const currencyCode = currentGroup?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currencyCode);
  const { icon: DescriptionIcon, category: autoCategory } = getIconForDescription(description);

  // ─── Paid-by labels ───
  const getPaidByLabel = () => {
    if (paidBy.length === 0) return 'you';
    if (paidBy.length === 1) {
      if (paidBy[0].user_id === currentUser?.id) return 'you';
      const member = currentGroup?.members?.find((m) => m.id === paidBy[0].user_id);
      return member?.name || 'someone';
    }
    return 'multiple';
  };

  const getSplitLabel = () => {
    if (splitMode === 'equally') return 'equally';
    if (splitMode === 'unequally') return 'unequally';
    if (splitMode === 'byshares') return 'by shares';
    return 'equally';
  };

  // ─── Receipt scanning ───
  const processReceipt = async (dataUrl, file) => {
    setReceiptImage(dataUrl);
    setScanning(true);

    try {
      const base64 = dataUrl.split(',')[1];
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

      setDescription(data.merchant || '');
      if (data.date) setDate(data.date);
      setTotalAmount(String(data.total_amount || ''));
      toast.success('Receipt scanned successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Scan failed';
      if (error.response?.status === 402) {
        toast.error(errorMsg, { duration: 6000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setScanning(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      processReceipt(reader.result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl, file) => {
    processReceipt(dataUrl, file);
  };

  // ─── Calculate split details for submission ───
  const calculateSplitDetails = () => {
    if (!currentGroup) return [];
    const total = parseFloat(totalAmount) || 0;

    if (splitMode === 'equally') {
      const selectedMembers = splitBetween.map((s) => s.user_id);
      const perPerson = selectedMembers.length > 0 ? total / selectedMembers.length : 0;
      return currentGroup.members
        .filter((m) => selectedMembers.includes(m.id))
        .map((m) => ({
          user_id: m.id,
          user_name: m.name,
          amount: parseFloat(perPerson.toFixed(2)),
        }));
    }

    if (splitMode === 'unequally') {
      return splitBetween.map((s) => {
        const member = currentGroup.members.find((m) => m.id === s.user_id);
        return {
          user_id: s.user_id,
          user_name: member?.name || '',
          amount: parseFloat(s.amount) || 0,
        };
      });
    }

    if (splitMode === 'byshares') {
      const totalShares = splitBetween.reduce((sum, s) => sum + (parseInt(s.shares) || 1), 0);
      return splitBetween.map((s) => {
        const member = currentGroup.members.find((m) => m.id === s.user_id);
        const shareAmount = totalShares > 0 ? ((parseInt(s.shares) || 1) / totalShares) * total : 0;
        return {
          user_id: s.user_id,
          user_name: member?.name || '',
          amount: parseFloat(shareAmount.toFixed(2)),
        };
      });
    }

    return [];
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const splitDetails = calculateSplitDetails();
      const splitTypeMap = { equally: 'equal', unequally: 'custom', byshares: 'custom' };

      const expenseData = {
        group_id: selectedGroup,
        merchant: description.trim(),
        date,
        total_amount: parseFloat(totalAmount),
        items: [{ name: description.trim(), price: parseFloat(totalAmount), quantity: 1, category: autoCategory, assigned_to: [] }],
        split_type: splitTypeMap[splitMode] || 'equal',
        split_details: splitDetails,
        receipt_image: receiptImage,
        category: autoCategory,
        notes,
      };

      await axios.post(`${API}/expenses`, expenseData, { headers: getAuthHeader() });
      toast.success('Expense created!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const groupSelected = !!selectedGroup && !!currentGroup;

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent>
        <motion.div
          className="mx-auto max-w-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          {/* Page Title */}
          <div className="mb-6">
            <p className="app-eyebrow mb-2">New Expense</p>
            <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[var(--app-foreground)]">
              Add an expense
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ─── Step 1: Group Selection ─── */}
            <AppSurface className="mb-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]">
                  <UsersThree size={20} weight="bold" />
                </div>
                <div className="relative flex-1">
                  <select
                    data-testid="group-select"
                    value={selectedGroup}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    required
                    className="w-full appearance-none bg-transparent text-base font-extrabold tracking-tight text-[var(--app-foreground)] focus:outline-none cursor-pointer pr-7"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="" disabled>Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={16} weight="bold" className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--app-muted)]" />
                </div>
              </div>
            </AppSurface>

            {/* ─── Step 2: Description + Amount (revealed after group) ─── */}
            <AnimatePresence>
              {groupSelected && (
                <motion.div
                  key="form-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <AppSurface className="mb-4 p-5">
                    <div className="space-y-4">
                      {/* Description with auto-icon */}
                      <div>
                        <label className="app-field-label">Description</label>
                        <div className="expense-input-group">
                          <span className="input-icon">
                            <DescriptionIcon size={22} weight="bold" />
                          </span>
                          <AppInput
                            data-testid="description-input"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What was it for?"
                            required
                          />
                        </div>
                      </div>

                      {/* Amount with currency icon */}
                      <div>
                        <label className="app-field-label">Amount</label>
                        <div className="expense-input-group">
                          <span className="input-icon">
                            <span className="text-base font-extrabold">{currencySymbol}</span>
                          </span>
                          <AppInput
                            data-testid="total-input"
                            type="number"
                            step="0.01"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </AppSurface>

                  {/* ─── Split Text ─── */}
                  <AppSurface className="mb-4 p-5">
                    <div className="expense-split-text" data-testid="split-text">
                      <span>Paid by</span>
                      <button
                        type="button"
                        className="expense-split-btn"
                        onClick={() => setShowPaidByModal(true)}
                        data-testid="paidby-btn"
                      >
                        {getPaidByLabel()}
                      </button>
                      <span>and split</span>
                      <button
                        type="button"
                        className="expense-split-btn"
                        onClick={() => setShowSplitModal(true)}
                        data-testid="split-btn"
                      >
                        {getSplitLabel()}
                      </button>
                    </div>
                  </AppSurface>

                  {/* ─── Receipt Actions ─── */}
                  <AppSurface className="mb-4 p-5">
                    <label className="app-field-label">Receipt</label>

                    {receiptImage ? (
                      <div className="relative mb-3">
                        <img
                          src={receiptImage}
                          alt="Receipt"
                          className="mx-auto max-h-48 rounded-2xl object-contain"
                          data-testid="receipt-preview"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
                          onClick={() => setReceiptImage('')}
                        >
                          <X size={16} weight="bold" />
                        </button>
                      </div>
                    ) : null}

                    <div className="flex gap-3">
                      <AppButton
                        type="button"
                        variant="secondary"
                        className="flex-1 justify-center"
                        onClick={() => setShowCamera(true)}
                        data-testid="camera-btn"
                      >
                        <Camera size={20} weight="bold" />
                        Take photo
                      </AppButton>
                      <AppButton
                        type="button"
                        variant="secondary"
                        className="flex-1 justify-center"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="upload-btn"
                      >
                        <ImageSquare size={20} weight="bold" />
                        Upload
                      </AppButton>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="receipt-upload-input"
                      />
                    </div>
                  </AppSurface>

                  {/* ─── Date & Notes (inline, minimal) ─── */}
                  <div className="mb-5 flex items-center gap-3 px-1">
                    {/* Date: inline with pencil edit */}
                    <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
                      <CalendarBlank size={16} weight="bold" />
                      {editingDate ? (
                        <input
                          data-testid="date-input"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          onBlur={() => setEditingDate(false)}
                          autoFocus
                          className="bg-transparent text-sm font-bold text-[var(--app-foreground)] focus:outline-none border-b border-[var(--app-primary)] pb-0.5"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingDate(true)}
                          className="flex items-center gap-1.5 font-bold text-[var(--app-foreground)] hover:text-[var(--app-primary)] transition-colors"
                          data-testid="date-edit-btn"
                        >
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <PencilSimple size={13} weight="bold" className="text-[var(--app-muted)]" />
                        </button>
                      )}
                    </div>

                    <span className="h-1 w-1 rounded-full bg-[var(--app-border)]" />

                    {/* Notes: expandable */}
                    {showNotes ? (
                      <div className="flex-1">
                        <input
                          data-testid="notes-input"
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onBlur={() => { if (!notes.trim()) setShowNotes(false); }}
                          autoFocus
                          placeholder="Add a note..."
                          className="w-full bg-transparent text-sm font-semibold text-[var(--app-foreground)] focus:outline-none border-b border-[var(--app-primary)] pb-0.5 placeholder:text-[var(--app-muted)]"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNotes(true)}
                        className="flex items-center gap-1.5 text-sm font-bold text-[var(--app-muted)] hover:text-[var(--app-primary)] transition-colors"
                        data-testid="notes-add-btn"
                      >
                        <Note size={16} weight="bold" />
                        Add note
                      </button>
                    )}
                  </div>

                  {/* ─── Submit ─── */}
                  <AppButton
                    data-testid="create-expense-btn"
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 mb-6"
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      'Create Expense'
                    )}
                  </AppButton>

                  {/* Dev: demo data */}
                  {process.env.NODE_ENV === 'development' && (
                    <AppButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center mb-4 opacity-60"
                      onClick={() => {
                        setDescription('Pizza Hut');
                        setTotalAmount('1500');
                      }}
                    >
                      Fill Demo Data
                    </AppButton>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </PageContent>

      {/* ─── Modals ─── */}
      <PaidByModal
        open={showPaidByModal}
        onClose={() => setShowPaidByModal(false)}
        members={currentGroup?.members || []}
        paidBy={paidBy}
        onPaidByChange={setPaidBy}
        totalAmount={totalAmount}
        currencySymbol={currencySymbol}
      />

      <SplitBetweenModal
        open={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        members={currentGroup?.members || []}
        splitBetween={splitBetween}
        splitMode={splitMode}
        onSplitChange={setSplitBetween}
        onSplitModeChange={setSplitMode}
        totalAmount={totalAmount}
        currencySymbol={currencySymbol}
      />

      <ScanningOverlay open={scanning} receiptImage={receiptImage} />

      <CameraCapture
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </AppShell>
  );
}

export default NewExpenseRedesign;
