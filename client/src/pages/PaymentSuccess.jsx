import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeTransaction, completingTransaction, completeError } = useTransaction();
  
  const [transaction, setTransaction] = useState(null);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get transaction and car data from navigation state
    if (location.state?.transaction && location.state?.car) {
      setTransaction(location.state.transaction);
      setCar(location.state.car);
      setLoading(false);
      
      // Complete the transaction
      completeTransactionWithPayment();
    } else {
      // If no state data, redirect to cars page
      navigate('/cars');
    }
  }, [location.state]);

  const completeTransactionWithPayment = async () => {
    if (location.state?.transaction) {
      const paymentDetails = {
        transactionId: `PAY_${Date.now()}`,
        paymentGateway: 'demo',
        gatewayTransactionId: `pi_${Date.now()}`
      };
      
      await completeTransaction(location.state.transaction._id, paymentDetails);
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

  if (loading) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Processing payment...</span>
            </Spinner>
            <p className="mt-3">Processing your payment...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!transaction || !car) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h3>Transaction not found</h3>
            <p>Unable to find transaction details.</p>
            <Button as={Link} to="/cars" variant="primary">
              Browse Cars
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="text-center">
            <Card.Body className="p-5">
              <div className="mb-4">
                <div className="text-success" style={{ fontSize: '4rem' }}>
                  ✓
                </div>
              </div>
              
              <h2 className="text-success mb-3">Payment Successful!</h2>
              <p className="text-muted mb-4">
                Your payment has been processed successfully. You will receive a confirmation email shortly.
              </p>

              {/* Error Display */}
              {completeError && (
                <Alert variant="warning" className="mb-4">
                  <strong>Note:</strong> Payment was successful, but there was an issue updating the transaction status. 
                  Please contact support if you have any concerns.
                </Alert>
              )}

              {/* Loading State for Transaction Completion */}
              {completingTransaction && (
                <Alert variant="info" className="mb-4">
                  <Spinner size="sm" className="me-2" />
                  Finalizing your transaction...
                </Alert>
              )}
              
              <Alert variant="success" className="text-start">
                <h6>Transaction Details:</h6>
                <p className="mb-1"><strong>Transaction ID:</strong> {transaction._id}</p>
                <p className="mb-1"><strong>Car:</strong> {car.title}</p>
                <p className="mb-1"><strong>Make/Model:</strong> {car.make} {car.model} ({car.year})</p>
                <p className="mb-1"><strong>Amount:</strong> {formatPrice(transaction.amount)}</p>
                <p className="mb-1"><strong>Payment Method:</strong> {transaction.paymentMethod}</p>
                <p className="mb-1"><strong>Status:</strong> {transaction.status}</p>
                <p className="mb-0"><strong>Date:</strong> {formatDate(transaction.createdAt)}</p>
              </Alert>

              {/* Billing Address */}
              {transaction.billingAddress && (
                <Alert variant="light" className="text-start mt-3">
                  <h6>Billing Address:</h6>
                  <p className="mb-1">{transaction.billingAddress.street}</p>
                  <p className="mb-1">{transaction.billingAddress.city}, {transaction.billingAddress.district}</p>
                  <p className="mb-1">{transaction.billingAddress.postalCode}</p>
                  <p className="mb-0">{transaction.billingAddress.country}</p>
                </Alert>
              )}

              {/* Notes */}
              {transaction.notes && (
                <Alert variant="light" className="text-start mt-3">
                  <h6>Notes:</h6>
                  <p className="mb-0">{transaction.notes}</p>
                </Alert>
              )}
              
              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" as={Link} to="/dashboard">
                  Go to Dashboard
                </Button>
                <Button variant="outline-primary" as={Link} to="/cars">
                  Browse More Cars
                </Button>
                <Button variant="outline-secondary" onClick={() => window.print()}>
                  Print Receipt
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;
