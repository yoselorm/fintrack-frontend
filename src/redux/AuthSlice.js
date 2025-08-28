import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
};

const getFromSessionStorage = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return null;
  }
};

const removeFromSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from sessionStorage:', error);
  }
};

// Initialize state with data from sessionStorage
const initialAuthState = {
  user: getFromSessionStorage('user'),
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!(getFromSessionStorage('user') && localStorage.getItem('authToken')),
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage for persistence
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Store user details in sessionStorage
      if (data.user) {
        saveToSessionStorage('user', data.user);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Frontend validation
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          referralCode: userData.referralCode || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage for persistence
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Store user details in sessionStorage
      if (data.user) {
        saveToSessionStorage('user', data.user);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        localStorage.removeItem('authToken');
        removeFromSessionStorage('user');
        throw new Error('Invalid token');
      }
      
      const data = await response.json();
      
      // Store user details in sessionStorage
      if (data.user) {
        saveToSessionStorage('user', data.user);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New action to initialize auth state from storage
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    const token = localStorage.getItem('authToken');
    const user = getFromSessionStorage('user');
    
    if (token && user) {
      return dispatch(verifyToken());
    }
    
    return { user: null, token: null };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('authToken');
      removeFromSessionStorage('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    // Action to update user data in both state and sessionStorage
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      saveToSessionStorage('user', state.user);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Token verification cases
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = localStorage.getItem('authToken');
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        removeFromSessionStorage('user');
      })
      // Initialize auth cases
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
          state.token = localStorage.getItem('authToken');
          state.isAuthenticated = true;
        }
      });
  }
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;