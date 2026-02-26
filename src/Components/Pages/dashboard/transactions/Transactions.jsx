import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  CreditCard,
  Wallet,
  IndianRupee,
  GraduationCap,
  Calendar,
  Download
} from 'lucide-react';
import './Transactions.css';

const Transactions = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all-time'); // Changed to 'all-time' to show all by default

  // Single student data
  const studentInfo = {
    name: 'Arjun Sharma',
    course: 'Full Stack Development',
    batch: 'Batch 2024-A',
    enrollmentNo: 'FSD-2024-001',
    totalFees: 45000,
    paidFees: 27000,
    pendingFees: 18000
  };

  const transactions = [
    {
      id: 1,
      description: 'Registration Fee',
      amount: 5000.00,
      type: 'debit',
      category: 'One-time',
      date: '2024-01-05',
      time: '10:30 AM',
      status: 'completed',
      paymentMethod: 'UPI',
      reference: 'TXN-001',
      receiptNo: 'REC-2024-001'
    },
    {
      id: 2,
      description: 'Tuition Fee - January 2024',
      amount: 4000.00,
      type: 'debit',
      category: 'Monthly',
      date: '2024-01-10',
      time: '02:15 PM',
      status: 'completed',
      paymentMethod: 'Net Banking',
      reference: 'TXN-002',
      receiptNo: 'REC-2024-002'
    },
    {
      id: 3,
      description: 'Tuition Fee - February 2024',
      amount: 4000.00,
      type: 'debit',
      category: 'Monthly',
      date: '2024-02-08',
      time: '11:45 AM',
      status: 'completed',
      paymentMethod: 'UPI',
      reference: 'TXN-003',
      receiptNo: 'REC-2024-003'
    },
    {
      id: 4,
      description: 'Lab Fee - Semester 1',
      amount: 2500.00,
      type: 'debit',
      category: 'One-time',
      date: '2024-02-15',
      time: '09:00 AM',
      status: 'completed',
      paymentMethod: 'Debit Card',
      reference: 'TXN-004',
      receiptNo: 'REC-2024-004'
    },
    {
      id: 5,
      description: 'Tuition Fee - March 2024',
      amount: 4000.00,
      type: 'debit',
      category: 'Monthly',
      date: '2024-03-12',
      time: '03:30 PM',
      status: 'completed',
      paymentMethod: 'Credit Card',
      reference: 'TXN-005',
      receiptNo: 'REC-2024-005'
    },
    {
      id: 6,
      description: 'Library Fee - Annual',
      amount: 1500.00,
      type: 'debit',
      category: 'Annual',
      date: '2024-03-12',
      time: '03:30 PM',
      status: 'completed',
      paymentMethod: 'UPI',
      reference: 'TXN-006',
      receiptNo: 'REC-2024-006'
    },
    {
      id: 7,
      description: 'Exam Fee - Term 1',
      amount: 2000.00,
      type: 'debit',
      category: 'One-time',
      date: '2024-03-15',
      time: '11:20 AM',
      status: 'pending',
      paymentMethod: 'Net Banking',
      reference: 'TXN-007',
      receiptNo: 'REC-2024-007'
    },
    {
      id: 8,
      description: 'Sports Fee - Annual',
      amount: 2000.00,
      type: 'debit',
      category: 'Annual',
      date: '2024-03-18',
      time: '04:45 PM',
      status: 'pending',
      paymentMethod: 'UPI',
      reference: 'TXN-008',
      receiptNo: 'REC-2024-008'
    }
  ];

  const getFilteredTransactions = () => {
    let filtered = [...transactions]; // Create a copy of transactions array

    // Filter by type (fixed the logic)
    if (filter !== 'all') {
      if (filter === 'completed') {
        filtered = filtered.filter(t => t.status === 'completed');
      } else if (filter === 'pending') {
        filtered = filtered.filter(t => t.status === 'pending');
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'all-time') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      if (dateRange === 'today') {
        filtered = filtered.filter(t => t.date === todayStr);
      } else if (dateRange === 'this-week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        filtered = filtered.filter(t => t.date >= weekAgoStr);
      } else if (dateRange === 'this-month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAgoStr = monthAgo.toISOString().split('T')[0];
        filtered = filtered.filter(t => t.date >= monthAgoStr);
      }
    }

    return filtered;
  };

  const getStats = () => {
    const totalPaid = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyFees = transactions
      .filter(t => t.category === 'Monthly' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const oneTimeFees = transactions
      .filter(t => (t.category === 'One-time' || t.category === 'Annual') && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalPaid,
      pendingAmount,
      monthlyFees,
      oneTimeFees,
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length
    };
  };

  const stats = getStats();

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Debug: Log filtered transactions
  console.log('Filter:', filter);
  console.log('Search Term:', searchTerm);
  console.log('Date Range:', dateRange);
  console.log('Filtered Transactions:', getFilteredTransactions());

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h2 className="transactions-title">My Fee Payments</h2>
      </div>

      {/* Student Info Card */}
      <div className="student-profile-card">
        <div className="student-profile-header">
          <div className="student-avatar">
            <GraduationCap size={32} />
          </div>
          <div className="student-basic-info">
            <h3 className="student-fullname">{studentInfo.name}</h3>
            <p className="student-course">{studentInfo.course} • {studentInfo.batch}</p>
            <p className="student-enrollment">Enrollment No: {studentInfo.enrollmentNo}</p>
          </div>
        </div>
        <div className="student-fee-summary">
          <div className="fee-summary-item">
            <span className="fee-summary-label">Total Fees</span>
            <span className="fee-summary-value">{formatCurrency(studentInfo.totalFees)}</span>
          </div>
          <div className="fee-summary-item">
            <span className="fee-summary-label">Paid</span>
            <span className="fee-summary-value paid">{formatCurrency(studentInfo.paidFees)}</span>
          </div>
          <div className="fee-summary-item">
            <span className="fee-summary-label">Pending</span>
            <span className="fee-summary-value pending">{formatCurrency(studentInfo.pendingFees)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="student-stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Wallet size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Paid</span>
            <span className="stat-value">{formatCurrency(stats.totalPaid)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon monthly">
            <Calendar size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Fees</span>
            <span className="stat-value">{formatCurrency(stats.monthlyFees)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon one-time">
            <IndianRupee size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">One-time Fees</span>
            <span className="stat-value">{formatCurrency(stats.oneTimeFees)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-stat">
            <ArrowUpRight size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending-value">{formatCurrency(stats.pendingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Filters - Compact Layout */}
      <div className="compact-filters">
        <div className="compact-search-box">
          <Search size={16} className="compact-search-icon" />
          <input
            type="text"
            placeholder="Search by description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="compact-search-input"
          />
        </div>

        <div className="compact-filter-controls">
          <select 
            className="compact-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <select 
            className="compact-filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all-time">All Time</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>

          <button className="compact-filter-button">
            <Filter size={16} />
          </button>

          <button className="compact-download-button">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th>Receipt No.</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {getFilteredTransactions().length > 0 ? (
              getFilteredTransactions().map(transaction => (
                <tr key={transaction.id}>
                  <td>
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-reference">Ref: {transaction.reference}</div>
                  </td>
                  <td>
                    <span className="category-badge">{transaction.category}</span>
                  </td>
                  <td>
                    <div className="date-info">
                      <div>{new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</div>
                      <div className="transaction-time">{transaction.time}</div>
                    </div>
                  </td>
                  <td>
                    <span className="receipt-number">{transaction.receiptNo}</span>
                  </td>
                  <td>
                    <div className="payment-method">
                      <CreditCard size={14} />
                      {transaction.paymentMethod}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`amount ${transaction.status === 'completed' ? 'paid-amount' : 'pending-amount'}`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td>
                    <button className="action-button">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  <Search size={48} />
                  <p>No payment transactions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-button" disabled>Previous</button>
        <span className="pagination-info">Page 1 of 2</span>
        <button className="pagination-button">Next</button>
      </div>
    </div>
  );
};

export default Transactions;