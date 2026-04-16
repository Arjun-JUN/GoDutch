/**
 * Shared shapes for Zustand stores.
 * Kept intentionally loose (most fields optional) to match the backend's
 * response envelope, which varies slightly between list and detail endpoints.
 */

export interface Member {
  id: string;
  email: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  members: Member[];
  created_by: string;
  created_at: string;
}

export interface ExpenseSplit {
  user_id: string;
  amount: number;
}

export interface ExpenseItem {
  id?: string;
  name: string;
  amount: number;
  quantity?: number;
  split_among?: string[];
}

export interface Expense {
  id: string;
  group_id: string;
  created_by: string;
  merchant?: string;
  description?: string;
  date?: string;
  total_amount: number;
  items?: ExpenseItem[];
  split_type?: string;
  split_details?: ExpenseSplit[];
  receipt_image?: string;
  category?: string;
  notes?: string;
  created_at?: string;
}

export interface SettlementItem {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
  currency?: string;
}
