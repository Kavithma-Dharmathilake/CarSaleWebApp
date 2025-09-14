import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Badge, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransaction } from '../context/TransactionContext';
import { useCar } from '../context/CarContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchUserTransactions, userTransactions, userTransactionsLoading, userTransactionsError, clearError } = useTransaction();
  const { fetchCarById } = useCar();
  
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    completedTransactions: 0,
    pendingTransactions: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Load user transactions on component mount
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      loadUserTransactions();
    }
  }, [isAuthenticated, user]);

  const loadUserTransactions = async (page = 1, limit = showAllTransactions ? 50 : 10) => {
    const result = await fetchUserTransactions(user._id, { page, limit });
    if (result.success) {
      calculateStats(result.data.data);
    }
  };

  const loadAllTransactions = async () => {
    setShowAllTransactions(true);
    await loadUserTransactions(1, 50);
  };

  const loadRecentTransactions = async () => {
    setShowAllTransactions(false);
    await loadUserTransactions(1, 10);
  };

  const calculateStats = (transactions) => {
    const completed = transactions.filter(t => t.status === 'completed');
    const pending = transactions.filter(t => t.status === 'pending');
    const totalSpent = completed.reduce((sum, t) => sum + t.amount, 0);
    
    setStats({
      totalPurchases: completed.length,
      totalSpent,
      completedTransactions: completed.length,
      pendingTransactions: pending.length
    });
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Download transaction as PDF (simplified - in real app, this would generate actual PDF)
  const downloadTransaction = (transaction) => {
    const receiptData = {
      receipt: {
        title: "CAR SALES RECEIPT",
        transactionId: transaction._id,
        date: formatDate(transaction.createdAt),
        customer: user?.email,
        amount: formatPrice(transaction.amount),
        status: transaction.status.toUpperCase(),
        paymentMethod: transaction.paymentMethod.toUpperCase(),
        billingAddress: transaction.billingAddress ? {
          street: transaction.billingAddress.street,
          city: transaction.billingAddress.city,
          district: transaction.billingAddress.district,
          postalCode: transaction.billingAddress.postalCode,
          country: transaction.billingAddress.country
        } : null,
        notes: transaction.notes || "No additional notes",
        footer: "Thank you for your purchase!"
      }
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${transaction._id.slice(-8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h3>Please log in to view your dashboard</h3>
            <Button as={Link} to="/login" variant="primary">
              Login
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="mb-4">Dashboard</h1>
          <p className="text-muted mb-5">
            Welcome back, {user?.email}!
          </p>
        </Col>
      </Row>
      
      {/* Statistics Cards */}
      {/* <Row className="stats-grid">
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-number">{stats.totalPurchases}</div>
            <div className="stat-label">Cars Purchased</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-number">{formatPrice(stats.totalSpent)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-number">{stats.completedTransactions}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingTransactions}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </Col>
      </Row> */}
      
      <Row>
        <Col md={8}>
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
              </h5>
              <div className="d-flex gap-2">
                {!showAllTransactions ? (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={loadAllTransactions}
                    disabled={userTransactionsLoading}
                  >
                    View All
                  </Button>
                ) : (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={loadRecentTransactions}
                    disabled={userTransactionsLoading}
                  >
                    Show Recent
                  </Button>
                )}
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => loadUserTransactions()}
                  disabled={userTransactionsLoading}
                >
                  {userTransactionsLoading ? (
                    <Spinner size="sm" className="me-1" />
                  ) : null}
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Error Display */}
              {userTransactionsError && (
                <Alert variant="danger" dismissible onClose={clearError}>
                  {userTransactionsError}
                </Alert>
              )}

              {/* Loading State */}
              {userTransactionsLoading && (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading transactions...</span>
                </div>
              )}

              {/* Transactions Table */}
              {!userTransactionsLoading && userTransactions.length > 0 && (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTransactions.map(transaction => (
                      <tr key={transaction._id}>
                        <td>
                          <code className="small">{transaction._id.slice(-8)}</code>
                        </td>
                        <td>{formatDate(transaction.createdAt)}</td>
                        <td>{formatPrice(transaction.amount)}</td>
                        <td>
                          <Badge bg={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item as={Link} to={`/transaction/${transaction._id}`}>
                                View Transaction
                              </Dropdown.Item>
                              <Dropdown.Item as={Link} to={`/cars/${transaction.carId}`}>
                                View Car
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => downloadTransaction(transaction)}>
                                Download Receipt
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* No Transactions */}
              {!userTransactionsLoading && userTransactions.length === 0 && !userTransactionsError && (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No transactions yet. Start browsing our cars!</p>
                  <Button as={Link} to="/cars" variant="primary">
                    Browse Cars
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/cars" variant="primary">
                  Browse Cars
                </Button>
                <Button as={Link} to="/cars" variant="outline-primary">
                  Search Cars
                </Button>
                <Button as={Link} to="/profile" variant="outline-secondary">
                  Edit Profile
                </Button>
                <Button variant="outline-info" disabled>
                  My Favorites (Coming Soon)
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activity */}
          <Card className="dashboard-card mt-3">
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {userTransactions.length > 0 ? (
                <div>
                  {userTransactions.slice(0, 3).map(transaction => (
                    <div key={transaction._id} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <small className="text-muted">{formatDate(transaction.createdAt)}</small>
                        <div className="small">Transaction {transaction._id.slice(-8)}</div>
                      </div>
                      <Badge bg={getStatusBadge(transaction.status)} className="small">
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small">No recent activity</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
