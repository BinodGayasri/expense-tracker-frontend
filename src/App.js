import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, TrendingDown, TrendingUp, Wallet, Calendar, DollarSign, Tag, LogOut } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const categories = [
    { value: 'food', label: '🍔 Food', color: '#FF6B6B' },
    { value: 'transport', label: '🚗 Transport', color: '#4ECDC4' },
    { value: 'shopping', label: '🛍️ Shopping', color: '#FFE66D' },
    { value: 'entertainment', label: '🎮 Entertainment', color: '#A8E6CF' },
    { value: 'bills', label: '📄 Bills', color: '#FF8B94' },
    { value: 'health', label: '⚕️ Health', color: '#95E1D3' },
    { value: 'other', label: '📦 Other', color: '#C7CEEA' }
  ];

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchStats();
    }
  }, [user, filter]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const queryParams = filter !== 'all' ? `?category=${filter}` : '';
      const response = await fetch(`${API_URL}/expenses/${user.id}${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setExpenses(data.expenses);
      } else {
        setError(data.error || 'Failed to fetch expenses');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running on port 3500');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses/stats/${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/users/login' : '/users/register';
      const body = authMode === 'login' 
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running on port 3500');
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setExpenses([]);
    setStats(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          title: '',
          amount: '',
          category: 'food',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        fetchExpenses();
        fetchStats();
      } else {
        setError(data.error || 'Failed to add expense');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchExpenses();
        fetchStats();
      } else {
        setError('Failed to delete expense');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <Wallet style={styles.authIcon} />
            <h1 style={styles.authTitle}>Expense Tracker</h1>
            <p style={styles.authSubtitle}>Manage your finances with ease</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <div style={styles.authToggle}>
            <button
              onClick={() => setAuthMode('login')}
              style={{...styles.authToggleBtn, ...(authMode === 'login' ? styles.authToggleBtnActive : {})}}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              style={{...styles.authToggleBtn, ...(authMode === 'register' ? styles.authToggleBtnActive : {})}}
            >
              Register
            </button>
          </div>

          <form style={styles.authForm}>
            {authMode === 'register' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  style={styles.input}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                style={styles.input}
                placeholder="john@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                style={styles.input}
                placeholder="••••••"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              style={{...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {})}}
            >
              {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          {/* <p style={styles.backendNote}>
            Backend should be running on http://localhost:3500
          </p> */}
        </div>
      </div>
    );
  }

  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.category === filter);

  const categoryData = categories.map(cat => ({
    name: cat.label,
    value: expenses.filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + exp.amount, 0),
    color: cat.color
  })).filter(item => item.value > 0);

  const monthlyData = stats?.monthlyBreakdown?.map(m => ({
    month: new Date(m.year, m.month - 1).toLocaleDateString('en-US', { month: 'short' }),
    amount: m.total
  })) || [];

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Wallet style={styles.headerIcon} />
            <div>
              <h1 style={styles.mainTitle}>Expense Tracker</h1>
              <p style={styles.welcomeText}>Welcome, {user.name}!</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut style={styles.logoutIcon} />
            Logout
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <div style={styles.summaryGrid}>
          <div style={{...styles.summaryCard, borderLeftColor: '#9333EA'}}>
            <div style={styles.summaryContent}>
              <div>
                <p style={styles.summaryLabel}>Total Expenses</p>
                <p style={styles.summaryValue}>${stats?.summary?.total?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign style={styles.summaryIcon} />
            </div>
          </div>

          <div style={{...styles.summaryCard, borderLeftColor: '#EC4899'}}>
            <div style={styles.summaryContent}>
              <div>
                <p style={styles.summaryLabel}>Transactions</p>
                <p style={styles.summaryValue}>{stats?.summary?.count || 0}</p>
              </div>
              <TrendingDown style={styles.summaryIcon} />
            </div>
          </div>

          <div style={{...styles.summaryCard, borderLeftColor: '#3B82F6'}}>
            <div style={styles.summaryContent}>
              <div>
                <p style={styles.summaryLabel}>Average</p>
                <p style={styles.summaryValue}>${stats?.summary?.average?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp style={styles.summaryIcon} />
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.formColumn}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>
                <PlusCircle style={styles.formTitleIcon} />
                Add Expense
              </h2>
              
              <form style={styles.expenseForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={styles.input}
                    placeholder="Coffee at Starbucks"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={styles.input}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{...styles.input, resize: 'vertical', fontFamily: 'inherit'}}
                    rows="3"
                    placeholder="Optional notes..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {})}}
                  type="button"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </form>
            </div>
          </div>

          <div style={styles.contentColumn}>
            <div style={styles.chartsGrid}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>By Category</h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(' ')[1]} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={styles.noData}>No data yet</p>
                )}
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Monthly Trend</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Bar dataKey="amount" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={styles.noData}>No data yet</p>
                )}
              </div>
            </div>

            <div style={styles.filterCard}>
              <div style={styles.filterHeader}>
                <Tag style={styles.filterIcon} />
                <h3 style={styles.filterTitle}>Filter by Category</h3>
              </div>
              <div style={styles.filterButtons}>
                <button
                  onClick={() => setFilter('all')}
                  style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setFilter(cat.value)}
                    style={filter === cat.value ? {...styles.filterBtnActive, backgroundColor: cat.color} : styles.filterBtn}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.listCard}>
              <h3 style={styles.listTitle}>
                <Calendar style={styles.listIcon} />
                Recent Transactions
              </h3>
              
              {loading && <p style={styles.loadingText}>Loading...</p>}
              
              <div style={styles.expensesList}>
                {!loading && filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => {
                    const category = categories.find(c => c.value === expense.category);
                    return (
                      <div
                        key={expense._id}
                        style={{...styles.expenseItem, borderLeftColor: category.color}}
                      >
                        <div style={styles.expenseDetails}>
                          <div style={styles.expenseHeader}>
                            <h4 style={styles.expenseTitle}>{expense.title}</h4>
                            <span style={{
                              ...styles.categoryBadge,
                              backgroundColor: category.color + '20',
                              color: category.color
                            }}>
                              {category.label}
                            </span>
                          </div>
                          <p style={styles.expenseDescription}>{expense.description}</p>
                          <p style={styles.expenseDate}>
                            {new Date(expense.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div style={styles.expenseActions}>
                          <p style={styles.expenseAmount}>${expense.amount.toFixed(2)}</p>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            style={styles.deleteBtn}
                          >
                            <Trash2 style={styles.deleteIcon} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : !loading && (
                  <p style={styles.noExpenses}>No expenses found. Start adding some!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  authContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #F3E8FF, #FCE7F3, #DBEAFE)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '32px',
    width: '100%',
    maxWidth: '448px'
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  authIcon: {
    width: '64px',
    height: '64px',
    color: '#9333EA',
    margin: '0 auto 16px'
  },
  authTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #9333EA, #EC4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px'
  },
  authSubtitle: {
    color: '#6B7280',
    marginTop: '8px'
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  authToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px'
  },
  authToggleBtn: {
    flex: 1,
    padding: '8px 0',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    cursor: 'pointer'
  },
  authToggleBtnActive: {
    backgroundColor: '#9333EA',
    color: 'white'
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box'
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(to right, #9333EA, #EC4899)',
    color: 'white',
    padding: '12px 0',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  backendNote: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#9CA3AF',
    marginTop: '24px'
  },
  mainContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #F3E8FF, #FCE7F3, #DBEAFE)'
  },
  contentWrapper: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    color: '#9333EA'
  },
  mainTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #9333EA, #EC4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  welcomeText: {
    color: '#6B7280'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#F3F4F6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  logoutIcon: {
    width: '16px',
    height: '16px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    borderLeft: '4px solid',
    transition: 'transform 0.2s'
  },
  summaryContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  summaryValue: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#1F2937'
  },
  summaryIcon: {
    width: '48px',
    height: '48px',
    opacity: 0.2
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px'
  },
  formColumn: {
    gridColumn: '1'
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    position: 'sticky',
    top: '16px'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#1F2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formTitleIcon: {
    width: '24px',
    height: '24px',
    color: '#9333EA'
  },
  expenseForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  },
  chartTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#1F2937'
  },
  noData: {
    color: '#9CA3AF',
    textAlign: 'center',
    padding: '80px 0'
  },
  filterCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  filterIcon: {
    width: '20px',
    height: '20px',
    color: '#9333EA'
  },
  filterTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1F2937'
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    cursor: 'pointer'
  },
  filterBtnActive: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: '#9333EA',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  listCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  },
  listTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#1F2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  listIcon: {
    width: '20px',
    height: '20px',
    color: '#9333EA'
  },
  loadingText: {
    textAlign: 'center',
    color: '#9CA3AF',
    padding: '32px 0'
  },
  expensesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  expenseItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderLeft: '4px solid',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    transition: 'background-color 0.2s'
  },
  expenseDetails: {
    flex: 1
  },
  expenseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
    flexWrap: 'wrap'
  },
  expenseTitle: {
    fontWeight: '600',
    color: '#1F2937',
    margin: 0
  },
  categoryBadge: {
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: '9999px'
  },
  expenseDescription: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0'
  },
  expenseDate: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '4px'
  },
  expenseActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  expenseAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1F2937'
  },
  deleteBtn: {
    color: '#EF4444',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  deleteIcon: {
    width: '20px',
    height: '20px'
  },
  noExpenses: {
    textAlign: 'center',
    color: '#9CA3AF',
    padding: '48px 0'
  }
};

// Add media query for responsive layout
if (window.innerWidth >= 1024) {
  styles.mainGrid.gridTemplateColumns = '1fr 2fr';
  styles.formColumn.gridColumn = '1';
  styles.contentColumn.gridColumn = '2';
}

export default ExpenseTracker;