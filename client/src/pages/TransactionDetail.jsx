import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransaction } from '../context/TransactionContext';
import { useCar } from '../context/CarContext';

const TransactionDetail = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const {
    selectedTransaction,
    transactionLoading,
    transactionError,
    fetchTransactionById,
    clearError: clearTransactionError
  } = useTransaction();

  const {
    selectedCar,
    carLoading,
    carError,
    fetchCarById,
    clearError: clearCarError
  } = useCar();

  const [loading, setLoading] = useState(true);

  // Load transaction and car details on component mount
  useEffect(() => {
    if (transactionId) {
      loadTransactionDetails();
    }
  }, [transactionId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadTransactionDetails = async () => {
    setLoading(true);
    try {
      const transactionResult = await fetchTransactionById(transactionId);
      if (transactionResult.success && transactionResult.data.data.carId) {
        await fetchCarById(transactionResult.data.data.carId);
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download transaction as PDF (simplified - in real app, this would generate actual PDF)
  const downloadTransaction = () => {
    if (!selectedTransaction) return;

    const receiptData = {
      receipt: {
        title: "CAR SALES RECEIPT",
        transactionId: selectedTransaction._id,
        date: formatDate(selectedTransaction.createdAt),
        customer: user?.email,
        amount: formatPrice(selectedTransaction.amount),
        status: selectedTransaction.status.toUpperCase(),
        paymentMethod: selectedTransaction.paymentMethod.toUpperCase(),
        carDetails: selectedCar ? {
          title: selectedCar.title,
          make: selectedCar.make,
          model: selectedCar.model,
          year: selectedCar.year,
          price: formatPrice(selectedCar.price)
        } : null,
        billingAddress: selectedTransaction.billingAddress ? {
          street: selectedTransaction.billingAddress.street,
          city: selectedTransaction.billingAddress.city,
          district: selectedTransaction.billingAddress.district,
          postalCode: selectedTransaction.billingAddress.postalCode,
          country: selectedTransaction.billingAddress.country
        } : null,
        paymentDetails: selectedTransaction.paymentDetails ? {
          transactionId: selectedTransaction.paymentDetails.transactionId,
          paymentGateway: selectedTransaction.paymentDetails.paymentGateway,
          gatewayTransactionId: selectedTransaction.paymentDetails.gatewayTransactionId
        } : null,
        notes: selectedTransaction.notes || "No additional notes",
        footer: "Thank you for your purchase!"
      }
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${selectedTransaction._id.slice(-8)}.json`;
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
            <h3>Please log in to view transaction details</h3>
            <Button as={Link} to="/login" variant="primary">
              Login
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  if (loading || transactionLoading) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading transaction details...</span>
            </Spinner>
            <p className="mt-3">Loading transaction details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (transactionError) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={clearTransactionError}>
              {transactionError}
            </Alert>
            <div className="text-center">
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!selectedTransaction) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h3>Transaction not found</h3>
            <p>The transaction you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Transaction Details</h1>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={downloadTransaction}>
                Download Receipt
              </Button>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Transaction Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Transaction Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Transaction ID:</strong>
                    <p className="text-muted">{selectedTransaction._id}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong>
                    <div>
                      <Badge bg={getStatusBadge(selectedTransaction.status)} className="fs-6">
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Amount:</strong>
                    <p className="text-muted fs-5">{formatPrice(selectedTransaction.amount)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Payment Method:</strong>
                    <p className="text-muted">{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Created Date:</strong>
                    <p className="text-muted">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Last Updated:</strong>
                    <p className="text-muted">{formatDate(selectedTransaction.updatedAt)}</p>
                  </div>
                </Col>
              </Row>

              {selectedTransaction.notes && (
                <div className="mb-3">
                  <strong>Notes:</strong>
                  <p className="text-muted">{selectedTransaction.notes}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Car Information */}
          {selectedCar ? (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Car Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <img 
                      src={selectedCar.imageUrl || 'https://images.unsplash.com/photo.jpg'} 
                      alt={selectedCar.title}
                      className="img-fluid rounded"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo.jpg';
                      }}
                    />
                  </Col>
                  <Col md={8}>
                    <h6>{selectedCar.title}</h6>
                    <p className="text-muted mb-2">{selectedCar.year} • {selectedCar.make} • {selectedCar.model}</p>
                    <p className="text-muted mb-2">Price: {formatPrice(selectedCar.price)}</p>
                    {selectedCar.description && (
                      <p className="text-muted mb-2">{selectedCar.description}</p>
                    )}
                    <Button as={Link} to={`/cars/${selectedCar._id}`} variant="outline-primary" size="sm">
                      View Car Details
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ) : carLoading ? (
            <Card className="mb-4">
              <Card.Body className="text-center">
                <Spinner size="sm" className="me-2" />
                Loading car details...
              </Card.Body>
            </Card>
          ) : carError ? (
            <Card className="mb-4">
              <Card.Body>
                <Alert variant="warning" dismissible onClose={clearCarError}>
                  {carError}
                </Alert>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-4">
              <Card.Body>
                <p className="text-muted">Car information not available</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Billing Address */}
          {selectedTransaction.billingAddress && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Billing Address</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-1">{selectedTransaction.billingAddress.street}</p>
                <p className="mb-1">{selectedTransaction.billingAddress.city}, {selectedTransaction.billingAddress.district}</p>
                <p className="mb-1">{selectedTransaction.billingAddress.postalCode}</p>
                <p className="mb-0">{selectedTransaction.billingAddress.country}</p>
              </Card.Body>
            </Card>
          )}

          {/* Payment Details */}
          {selectedTransaction.paymentDetails && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Payment Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Transaction ID:</strong>
                  <p className="text-muted small">{selectedTransaction.paymentDetails.transactionId}</p>
                </div>
                <div className="mb-2">
                  <strong>Payment Gateway:</strong>
                  <p className="text-muted small">{selectedTransaction.paymentDetails.paymentGateway}</p>
                </div>
                {selectedTransaction.paymentDetails.gatewayTransactionId && (
                  <div className="mb-2">
                    <strong>Gateway Transaction ID:</strong>
                    <p className="text-muted small">{selectedTransaction.paymentDetails.gatewayTransactionId}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={downloadTransaction}>
                  Download Receipt
                </Button>
                {selectedCar && (
                  <Button as={Link} to={`/cars/${selectedCar._id}`} variant="outline-primary">
                    View Car Details
                  </Button>
                )}
                <Button as={Link} to="/dashboard" variant="outline-secondary">
                  Back to Dashboard
                </Button>
                <Button as={Link} to="/cars" variant="outline-info">
                  Browse More Cars
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TransactionDetail;
