import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.REACT_APP_BASE_API

const initialReferralState = {
    referralCode: '',
    totalReferrals: 0,
    totalRewards: 0,
    referredUsers: [],
    loading: false,
    error: null
  };
  
  export const fetchReferralData = createAsyncThunk(
    'referral/fetchReferralData',
    async (_, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.token || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token');
        }
  
        const response = await fetch(`${BASE_URL}/api/referrals`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch referral data');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  const referralSlice = createSlice({
    name: 'referral',
    initialState: initialReferralState,
    reducers: {
      clearReferralData: (state) => {
        state.referralCode = '';
        state.totalReferrals = 0;
        state.totalRewards = 0;
        state.referredUsers = [];
        state.error = null;
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchReferralData.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchReferralData.fulfilled, (state, action) => {
          state.loading = false;
          state.referralCode = action.payload.referralCode;
          state.totalReferrals = action.payload.totalReferrals;
          state.totalRewards = action.payload.totalRewards;
          state.referredUsers = action.payload.referredUsers;
          state.error = null;
        })
        .addCase(fetchReferralData.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    }
  });
  
  export const { clearReferralData } = referralSlice.actions;
  export default referralSlice.reducer;
