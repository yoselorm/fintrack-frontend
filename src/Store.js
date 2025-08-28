import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/AuthSlice';
import financialReducer from './redux/FinancialDataSlice';
import referralReducer from './redux/ReferralDataSlice'



const store = configureStore({
    reducer:{
        auth:authReducer,
        financial:financialReducer,
        referral: referralReducer
    }
})

export default store;