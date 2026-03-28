import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader, getCurrentUser } from '../App';
import { Camera, Upload, Lightning } from '@phosphor-icons/react';
import Header from '../components/Header';

function NewExpense({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }]);
  const [splitType, setSplitType] = useState('equal');
  const [receiptImage, setReceiptImage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadGroups();
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      setReceiptImage(reader.result);
      setScanning(true);

      try {
        const res = await axios.post(
          `${API}/ocr/scan`,
          { image_base64: base64 },
          { headers: getAuthHeader() }
        );

        setMerchant(res.data.merchant);
        setDate(res.data.date);
        setTotalAmount(res.data.total_amount.toString());
        setItems(
          res.data.items.map((item) => ({
            name: item.name,
            price: item.price.toString(),
          }))
        );
        toast.success('Receipt scanned successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to scan receipt';
        
        if (error.response?.status === 402) {
          toast.error(errorMessage, { duration: 6000 });
        } else {
          toast.error(errorMessage);
        }
        
        console.error('OCR Error:', error);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    setItems([...items, { name: '', price: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateSplit = () => {
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return [];

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
          assigned_to: [],
        })),
        split_type: splitType,
        split_details: calculateSplit(),
        receipt_image: receiptImage,
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

  return (
    <div className="min-h-screen mobile-safe-padding" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold mb-4 md:mb-8" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          New Expense
        </h1>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          <div className="neo-card p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Scan Receipt
            </h2>

            <label
              data-testid="receipt-upload-area"
              className="block cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="receipt-upload-input"
              />
              <div className="neo-card-interactive p-8 text-center relative overflow-hidden">
                {receiptImage ? (
                  <div className="relative">
                    <img
                      src={receiptImage}
                      alt="Receipt"
                      className="max-h-64 mx-auto border-2 border-[#0F0F0F] rounded-lg"
                    />
                    {scanning && <div className="scanning-line" />}
                  </div>
                ) : (
                  <div>
                    <Camera size={64} weight="bold" className="mx-auto mb-4" />
                    <p className="font-bold mb-2">Upload Receipt</p>
                    <p className="text-sm text-gray-600">Click to select image</p>
                  </div>
                )}
              </div>
            </label>

            {scanning && (
              <div className="mt-4 p-4 bg-[#C4F1F9] border-2 border-[#0F0F0F] rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <span className="spinner"></span>
                  <p className="font-bold" data-testid="scanning-text">Scanning with AI...</p>
                </div>
              </div>
            )}
          </div>

          <div className="neo-card p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Expense Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Group
                </label>
                <select
                  data-testid="group-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="neo-input w-full"
                  required
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Merchant
                </label>
                <input
                  data-testid="merchant-input"
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="neo-input w-full"
                  placeholder="Store or restaurant name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Date
                  </label>
                  <input
                    data-testid="date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="neo-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Total
                  </label>
                  <input
                    data-testid="total-input"
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="neo-input w-full"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2" data-testid={`item-${index}`}>
                      <input
                        data-testid={`item-name-${index}`}
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="neo-input flex-1"
                        placeholder="Item name"
                      />
                      <input
                        data-testid={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="neo-input w-24"
                        placeholder="Price"
                      />
                      {items.length > 1 && (
                        <button
                          data-testid={`remove-item-${index}`}
                          type="button"
                          onClick={() => removeItem(index)}
                          className="neo-btn-secondary px-4"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  data-testid="add-item-btn"
                  type="button"
                  onClick={addItem}
                  className="neo-btn-secondary mt-2 text-sm"
                >
                  + Add Item
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Split Type
                </label>
                <select
                  data-testid="split-type-select"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="neo-input w-full"
                >
                  <option value="equal">Equal Split</option>
                  <option value="custom">Custom Split</option>
                  <option value="percentage">Percentage Split</option>
                </select>
              </div>

              <button
                data-testid="create-expense-btn"
                type="submit"
                disabled={loading}
                className="neo-btn-primary w-full flex items-center justify-center gap-2"
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
    </div>
  );
}

export default NewExpense;