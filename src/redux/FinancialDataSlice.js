import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.REACT_APP_BASE_API


const initialFinancialState = {
  balance: 0,
  monthlySpending: 0,
  transactions: [],
  insights: null,
  stats: null,
  loading: false,
  error: null,
  transactionLoading: false,
  transactionError: null
};

// Fetch dashboard data (mock data from your server)
export const fetchFinancialData = createAsyncThunk(
  'financial/fetchFinancialData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${BASE_URL}/api/financial/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch real user transactions
export const fetchUserTransactions = createAsyncThunk(
  'financial/fetchUserTransactions',
  async ({ page = 1, limit = 20, type, category, startDate, endDate } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${BASE_URL}/api/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add transaction
export const addTransaction = createAsyncThunk(
  'financial/addTransaction',
  async (transactionData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add transaction');
      }

      const data = await response.json();
      return data.transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update transaction
export const updateTransaction = createAsyncThunk(
  'financial/updateTransaction',
  async ({ id, ...updateData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${BASE_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update transaction');
      }

      const data = await response.json();
      return data.transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  'financial/deleteTransaction',
  async (transactionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transaction');
      }

      return transactionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch transaction statistics
export const fetchTransactionStats = createAsyncThunk(
  'financial/fetchTransactionStats',
  async (period = 'month', { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${BASE_URL}/api/transactions/stats?period=${period}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const financialSlice = createSlice({
  name: 'financial',
  initialState: initialFinancialState,
  reducers: {
    clearFinancialData: (state) => {
      state.balance = 0;
      state.monthlySpending = 0;
      state.transactions = [];
      state.insights = null;
      state.stats = null;
      state.error = null;
      state.transactionError = null;
    },
    clearTransactionError: (state) => {
      state.transactionError = null;
    },
    addTransactionOptimistic: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    removeTransactionOptimistic: (state, action) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Financial Data (Mock Dashboard Data)....created this to simulate bank data or external FI fetching 
      .addCase(fetchFinancialData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialData.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.monthlySpending = action.payload.monthlySpending;
        if (!state.transactions.length) {
          state.transactions = action.payload.transactions;
        }
        state.insights = action.payload.insights;
        state.error = null;
      })
      .addCase(fetchFinancialData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Transactions (Real Data)
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.error = null;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Transaction
      .addCase(addTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        state.transactions.unshift(action.payload);
        state.transactionError = null;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError = action.payload;
      })

      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        state.transactionError = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError = action.payload;
      })

      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        state.transactionError = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError = action.payload;
      })

      // Fetch Transaction Stats
      .addCase(fetchTransactionStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTransactionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearFinancialData, 
  clearTransactionError, 
  addTransactionOptimistic, 
  removeTransactionOptimistic 
} = financialSlice.actions;

export default financialSlice.reducer;