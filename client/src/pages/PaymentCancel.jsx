import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cancelTransaction, cancellingTransaction, cancelError } = useTransaction();
  
  const [transaction, setTransaction] = useState(null);
  const [car, setCar] = useState(null);

  useEffect(() => {
    // Get transaction and car data from navigation state
    if (location.state?.transaction && location.state?.car) {
      setTransaction(location.state.transaction);
      setCar(location.state.car);
      
      // Cancel the transaction
      cancelTransactionWithReason();
    }
  }, [location.state]);

  const cancelTransactionWithReason = async () => {
    if (location.state?.transaction) {
      const reason = 'Payment cancelled by user';
      await cancelTransaction(location.state.transaction._id, reason);
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

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="text-center">
            <Card.Body className="p-5">
              <div className="mb-4">
                <div className="text-warning" style={{ fontSize: '4rem' }}>
                  ⚠
                </div>
              </div>
              
              <h2 className="text-warning mb-3">Payment Cancelled</h2>
              <p className="text-muted mb-4">
                Your payment has been cancelled. No charges have been made to your account.
              </p>

              {/* Error Display */}
              {cancelError && (
                <Alert variant="warning" className="mb-4">
                  <strong>Note:</strong> Payment was cancelled, but there was an issue updating the transaction status. 
                  Please contact support if you have any concerns.
                </Alert>
              )}

              {/* Loading State for Transaction Cancellation */}
              {cancellingTransaction && (
                <Alert variant="info" className="mb-4">
                  Updating transaction status...
                </Alert>
              )}

              {/* Transaction Details */}
              {transaction && car && (
                <Alert variant="light" className="text-start mb-4">
                  <h6>Cancelled Transaction:</h6>
                  <p className="mb-1"><strong>Transaction ID:</strong> {transaction._id}</p>
                  <p className="mb-1"><strong>Car:</strong> {car.title}</p>
                  <p className="mb-1"><strong>Amount:</strong> {formatPrice(transaction.amount)}</p>
                  <p className="mb-0"><strong>Status:</strong> Cancelled</p>
                </Alert>
              )}
              
              <Alert variant="warning" className="text-start">
                <h6>What happened?</h6>
                <p className="mb-0">
                  The payment process was cancelled. This could be due to:
                </p>
                <ul className="mb-0 mt-2">
                  <li>You clicked the cancel button</li>
                  <li>Payment was declined by your bank</li>
                  <li>Session timeout</li>
                  <li>Technical issues</li>
                </ul>
              </Alert>

              <Alert variant="info" className="text-start mt-3">
                <h6>What's next?</h6>
                <p className="mb-0">
                  You can try purchasing the car again, or browse other available cars. 
                  Your transaction has been cancelled and no charges were made.
                </p>
              </Alert>
              
              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" as={Link} to="/cars">
                  Browse Cars
                </Button>
                {car && (
                  <Button variant="outline-primary" as={Link} to={`/cars/${car._id}`}>
                    Try Again - {car.title}
                  </Button>
                )}
                <Button variant="outline-primary" as={Link} to="/dashboard">
                  Go to Dashboard
                </Button>
                <Button variant="outline-secondary" as={Link} to="/">
                  Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentCancel;
