import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DollarSign, TrendingUp, Gift, Plus, RefreshCw, Trash2, Brain } from 'lucide-react';
import {
  fetchUserTransactions,
  addTransaction,
  deleteTransaction,
  fetchTransactionStats,
  clearTransactionError
} from '../redux/FinancialDataSlice';
import AddTransactionForm from '../components/AddTransactionForm';
import AiAssistantModal from '../components/AiAssistantModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState('');
  const [showAI, setShowAI] = useState(false);

  const { user } = useSelector((state) => state.auth)

  const {
    transactions,
    stats,
    loading,
    error,
    transactionLoading,
    transactionError
  } = useSelector(state => state.financial);

  useEffect(() => {
    dispatch(fetchUserTransactions({ limit: 10 }));
    dispatch(fetchTransactionStats('month'));
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearTransactionError());
  }, [dispatch]);

  // Function to add a new transaction
  const handleAddTransaction = async (transactionData) => {
    try {
      const result = await dispatch(addTransaction(transactionData)).unwrap();

      setTransactionSuccess(
        `${transactionData.type === 'expense' ? 'Expense' : 'Income'} of $${Math.abs(transactionData.amount)} added successfully!`
      );

      dispatch(fetchUserTransactions({ limit: 10 }));
      dispatch(fetchTransactionStats('month'));

      setTimeout(() => setTransactionSuccess(''), 3000);
      setShowAddTransaction(false);

    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  // Function to delete a transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await dispatch(deleteTransaction(transactionId)).unwrap();
        setTransactionSuccess('Transaction deleted successfully!');

        dispatch(fetchUserTransactions({ limit: 10 }));
        dispatch(fetchTransactionStats('month'));

        setTimeout(() => setTransactionSuccess(''), 3000);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const refreshData = async () => {
    await dispatch(fetchUserTransactions({ limit: 10 }));
    dispatch(fetchTransactionStats('month'));
  };

  // Calculate balance from stats if available
  const displayBalance = stats ?
    (stats.summary.totalIncome - stats.summary.totalExpenses).toFixed(2) :
    '0.00';

  const displayMonthlySpending = stats ?
    stats.summary.totalExpenses.toFixed(2) :
    '0.00';

  return (
    <div className="p-4 sm:p-10">
      {transactionSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center mb-6">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
          <p className="text-green-700 font-medium">{transactionSuccess}</p>
        </div>
      )}

      {(error || transactionError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center mb-6">
          <div className="h-2 w-2 bg-red-500 rounded-full mr-3"></div>
          <p className="text-red-700 font-medium">{error || transactionError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowAddTransaction(true)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ${parseFloat(displayBalance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Spending</p>
              <p className="text-2xl font-bold text-gray-900">
                ${parseFloat(displayMonthlySpending).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <p className="text-xs text-red-600">This Month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Referral Rewards</p>
              <p className="text-2xl font-bold text-gray-900">
                ${user?.referralRewards || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Monthly Income</h3>
            <p className="text-2xl font-bold">${stats.summary.totalIncome.toFixed(2)}</p>
            <p className="text-green-100 text-sm">{stats.summary.transactionCount} total transactions</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Top Category</h3>
            <p className="text-2xl font-bold">{stats.topExpenseCategory || 'None'}</p>
            <p className="text-blue-100 text-sm">Highest spending category</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions?.length > 0 ? (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-4 ${transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className={`font-semibold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          disabled={transactionLoading}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction.</p>
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add Your First Transaction
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 group">
        <button
          onClick={() => setShowAI(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 animate-pulse relative"
        >
          <Brain size={24} />
        </button>

        <span className="absolute bottom-16 right-1/2 translate-x-1/2 
                       bg-gray-800 text-white text-sm px-3 py-1 rounded-md 
                       opacity-0 group-hover:opacity-100 transition duration-300 whitespace-nowrap">
          AI assistant
        </span>
      </div>

      <AddTransactionForm
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSubmit={handleAddTransaction}
        loading={transactionLoading}
        error={transactionError}
      />

      <AiAssistantModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        userTransactions={transactions}
        userProfile={user}
      />
    </div>
  );
};

export default Dashboard;