import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { 
  getCurrencySymbol, 
  getIconForDescription 
} from '../lib/constants';
import { calculateSplitDetails } from '../utils/calculateShare';
import { isEdgeAIReady, scanReceiptEdge } from '../utils/edgeAI';
import {
  ArrowLeft,
  CalendarBlank,
  Camera,
  Check,
  ImageSquare,
  Note,
  PencilSimple,
  Receipt,
  UsersThree,
  X,
} from '@/slate/icons';
import { Header, AppButton, AppInput, AppSelect, AppShell, AppSurface, PageContent, Callout } from '@/slate';
import { ItemSplitView } from './ItemSplitView';


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

function SplitBetweenModal({ open, onClose, members, splitBetween, splitMode, onSplitChange, onSplitModeChange, totalAmount, currencySymbol, items, onItemsChange }) {
  const [localSplit, setLocalSplit] = useState(splitBetween);
  const [localMode, setLocalMode] = useState(splitMode);
  const [localItems, setLocalItems] = useState(items || []);

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
    if (onItemsChange && localItems) onItemsChange(localItems);
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

  const tabs = ['Equally', 'Unequally', 'By shares', 'By line item'];

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

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              const swipeThreshold = 50;
              const currentIdx = tabs.findIndex(tab => tab.toLowerCase().replace(' ', '') === localMode);
              if (info.offset.x < -swipeThreshold && currentIdx < tabs.length - 1) {
                setLocalMode(tabs[currentIdx + 1].toLowerCase().replace(' ', ''));
              } else if (info.offset.x > swipeThreshold && currentIdx > 0) {
                setLocalMode(tabs[currentIdx - 1].toLowerCase().replace(' ', ''));
              }
            }}
          >
            {localMode === 'bylineitem' ? (
              <ItemSplitView 
                items={localItems}
                onItemsChange={setLocalItems}
                members={members}
                currencySymbol={currencySymbol}
                totalAmount={totalAmount}
              />
            ) : (
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
            )}

            {(localMode === 'unequally' || localMode === 'byshares') && (
              <div className={`amount-remaining ${localMode === 'unequally' && remaining < -0.01 ? 'over' : ''}`}>
                <span className="label">
                  {localMode === 'unequally' ? 'Remaining' : 'Total shares'}
                </span>
                <span className="value">
                  {localMode === 'unequally' 
                    ? `${currencySymbol}${Math.abs(remaining).toFixed(2)}${remaining < -0.01 ? ' over' : ''}`
                    : totalShares
                  }
                </span>
              </div>
            )}
          </motion.div>
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

function NewExpenseRedesign() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();

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
  const [items, setItems] = useState([]);

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

  const loadGroups = useCallback(async () => {
    try {
      const groupsData = await api.get('/groups');
      setGroups(groupsData);

      // Pre-select group if passed via location state or query
      const preselectedGroupId = location.state?.groupId;
      if (preselectedGroupId && groupsData.some((g) => g.id === preselectedGroupId)) {
        setSelectedGroup(preselectedGroupId);
        initSplitForGroup(groupsData.find((g) => g.id === preselectedGroupId));
      } else if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0].id);
        initSplitForGroup(groupsData[0]);
      }
    } catch {
      toast.error('Failed to load groups');
    }
  }, [location.state?.groupId, initSplitForGroup]);

  // ─── Load groups ───
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

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
      setItems([{ name: 'Default Item', price: 0, quantity: 1, category: 'General', assigned_to: [], split_type: 'equal' }]);
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
    if (splitMode === 'bylineitem') return 'by line item';
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
        data = await api.post('/ai/ocr/scan', { image_base64: base64, mime_type: file.type || 'image/jpeg' });
      }

      setDescription(data.merchant || '');
      if (data.date) setDate(data.date);
      setTotalAmount(String(data.total_amount || ''));
      if (data.items) {
        setItems(data.items.map(i => ({ ...i, assigned_to: [], split_type: 'equal' })));
      } else {
        setItems([{ name: data.merchant || 'Expense', price: data.total_amount || 0, quantity: 1, category: 'General', assigned_to: [], split_type: 'equal' }]);
      }
      toast.success('Receipt scanned successfully!');
    } catch (error) {
      const errorMsg = error.message || 'Scan failed';
      if (error.status === 402) {
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
      const splitDetails = calculateSplitDetails({
        totalAmount,
        splitMode,
        members: currentGroup?.members || [],
        splitBetween,
        items,
      });
      const splitTypeMap = { equally: 'equal', unequally: 'custom', byshares: 'custom' };

      const expenseData = {
        group_id: selectedGroup,
        merchant: description.trim(),
        date,
        total_amount: parseFloat(totalAmount),
        items: splitMode === 'bylineitem' ? items : [{ name: description.trim(), price: parseFloat(totalAmount), quantity: 1, category: autoCategory, assigned_to: [] }],
        split_type: splitTypeMap[splitMode] || 'equal',
        split_details: splitDetails,
        receipt_image: receiptImage,
        category: autoCategory,
        notes,
      };

      await api.post('/expenses', expenseData);
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
      <Header />

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:gap-4">
            {/* ─── Step 1: Group Selection ─── */}
            <AppSelect
              label="Group"
              value={selectedGroup}
              onValueChange={handleGroupChange}
              options={groups.map((group) => ({
                label: group.name,
                value: group.id,
              }))}
              icon={UsersThree}
              placeholder="Select a group"
              className="mb-2 md:mb-4"
              data-testid="group-select"
            />

            <AnimatePresence>
              {groupSelected && (
                <motion.div
                  key="form-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {/* ─── Step 2: Receipt Actions ─── */}
                  <AppSurface className="mb-1.5 p-4 md:mb-3 md:p-5 relative overflow-hidden" hoverEffect={false}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <Receipt size={18} weight="bold" className="text-[var(--app-muted)]" />
                        <label className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--app-muted)]">Receipt</label>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-[var(--app-soft-strong)] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--app-primary-strong)] shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--app-primary)] opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--app-primary-strong)]"></span>
                        </span>
                        AI Smart Split
                      </div>
                    </div>

                    {receiptImage ? (
                      <div className="group relative mb-3 overflow-hidden rounded-2xl border border-[var(--app-border-soft)] bg-[var(--app-soft)]">
                        <img
                          src={receiptImage}
                          alt="Receipt"
                          className="mx-auto max-h-24 md:max-h-40 w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          data-testid="receipt-preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <button
                          type="button"
                          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--app-danger)] shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                          onClick={() => setReceiptImage('')}
                        >
                          <X size={16} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 rounded-xl bg-[linear-gradient(135deg,rgba(209,232,221,0.2)_0%,rgba(231,244,239,0.3)_100%)] p-3 border border-[var(--app-border-soft)]">
                        <p className="text-[11px] leading-relaxed text-[var(--app-muted)] font-medium">
                          <span className="text-[var(--app-primary-strong)] font-bold">Pro-tip:</span> Snap a photo to use <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,var(--app-primary)_0%,#6b8e23_100%)] font-extrabold uppercase tracking-tighter">AI Split</span>. Our engine itemizes everything for you automatically.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <AppButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1 gap-2 font-bold shadow-sm"
                        onClick={() => setShowCamera(true)}
                        data-testid="camera-btn"
                      >
                        <Camera size={18} weight="bold" />
                        Snap Bill
                      </AppButton>
                      <AppButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-2 font-bold border border-[var(--app-border-soft)]"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="upload-btn"
                      >
                        <ImageSquare size={18} weight="bold" />
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

                  {/* ─── Step 3: Description + Amount ─── */}
                  <AppSurface className="mb-1.5 p-4 md:mb-3 md:p-5">
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
                  {/* ─── Split Text ─── */}
                  <AppSurface className="mb-2 p-3 md:mb-4 md:p-5">
                    <div className="expense-split-text text-[13px] md:text-sm" data-testid="split-text">
                      <span>Paid by</span>
                      <button
                        type="button"
                        className="expense-split-btn px-2 py-1 bg-white/50 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setShowPaidByModal(true)}
                        data-testid="paidby-btn"
                      >
                        {getPaidByLabel()}
                      </button>
                      <span>and split</span>
                      <button
                        type="button"
                        className="expense-split-btn px-2 py-1 bg-white/50 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setShowSplitModal(true)}
                        data-testid="split-btn"
                      >
                        {getSplitLabel()}
                      </button>
                    </div>
                  </AppSurface>


                  {/* ─── Date & Notes (inline, minimal) ─── */}
                  <div className="mb-4 flex w-full items-center justify-center px-1">
                    <div className="flex flex-1 justify-end">
                      {/* Date: inline with pencil edit */}
                      <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
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
                            className="flex items-center gap-1.5 font-bold text-[var(--app-foreground)] hover:text-[var(--app-primary)] transition-colors whitespace-nowrap"
                            data-testid="date-edit-btn"
                          >
                            <CalendarBlank size={16} weight="bold" className="text-[var(--app-muted)]" />
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            <PencilSimple size={13} weight="bold" className="text-[var(--app-muted)] opacity-50" />
                          </button>
                        )}
                      </div>
                    </div>

                    <span className="mx-4 h-1 w-1 rounded-full bg-[var(--app-border)] opacity-60 flex-shrink-0" />

                    <div className="flex flex-1 justify-start">
                      {/* Notes: expandable */}
                      <div className="flex items-center text-sm text-[var(--app-muted)]">
                        {showNotes ? (
                          <input
                            data-testid="notes-input"
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={() => { if (!notes.trim()) setShowNotes(false); }}
                            autoFocus
                            placeholder="Add a note..."
                            className="min-w-[100px] bg-transparent text-sm font-semibold text-[var(--app-foreground)] focus:outline-none border-b border-[var(--app-primary)] pb-0.5 placeholder:text-[var(--app-muted)]"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowNotes(true)}
                            className="flex items-center gap-1.5 font-bold text-[var(--app-muted)] hover:text-[var(--app-primary)] transition-colors whitespace-nowrap"
                            data-testid="notes-add-btn"
                          >
                            <Note size={16} weight="bold" />
                            Add note
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── Submit ─── */}
                  <AppButton
                    data-testid="create-expense-btn"
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 mb-2 md:mb-6"
                  >
                    {loading ? (
                      <>
                        <span className="spinner h-4 w-4" />
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
        items={items}
        onItemsChange={setItems}
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
