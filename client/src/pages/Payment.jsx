import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useCar } from '../context/CarContext';
import { useTransaction } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const {
    selectedCar,
    carLoading,
    carError,
    fetchCarById,
    clearError: clearCarError
  } = useCar();

  const {
    loading,
    error,
    createTransaction,
    clearError: clearTransactionError
  } = useTransaction();

  const [formData, setFormData] = useState({
    paymentMethod: 'credit_card',
    billingAddress: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Sri Lanka'
    },
    notes: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Load car details on component mount
  useEffect(() => {
    if (carId) {
      fetchCarById(carId);
    }
  }, [carId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle payment details change
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCar) {
      alert('Car information not loaded');
      return;
    }

    // Validate required fields
    if (!formData.billingAddress.street || !formData.billingAddress.city) {
      alert('Please fill in all required billing address fields');
      return;
    }

    // Create transaction
    const transactionData = {
      carId: selectedCar._id,
      paymentMethod: formData.paymentMethod,
      billingAddress: formData.billingAddress,
      notes: formData.notes
    };

    const result = await createTransaction(transactionData);
    
    if (result.success) {
      // Simulate payment processing
      setTimeout(() => {
        navigate('/payment/success', { 
          state: { 
            transaction: result.data.data,
            car: selectedCar 
          } 
        });
      }, 2000);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/cars');
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Loading state for car
  if (carLoading) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading car details...</span>
            </Spinner>
            <p className="mt-3">Loading car details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state for car
  if (carError) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={clearCarError}>
              {carError}
            </Alert>
            <div className="text-center">
              <Button variant="primary" onClick={() => navigate('/cars')}>
                Back to Cars
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // No car found
  if (!selectedCar) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h3>Car not found</h3>
            <p>The car you're trying to purchase doesn't exist or has been removed.</p>
            <Button variant="primary" onClick={() => navigate('/cars')}>
              Back to Cars
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <h1 className="text-center mb-5">Complete Your Purchase</h1>
          
          {/* Error Display */}
          {error && (
            <Alert variant="danger" dismissible onClose={clearTransactionError}>
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Car Details</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex">
                      <img 
                        src={selectedCar.imageUrl || 'https://via.placeholder.com/200x150?text=No+Image'} 
                        alt={selectedCar.title}
                        className="img-fluid rounded me-3"
                        style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                        }}
                      />
                      <div>
                        <h6>{selectedCar.title}</h6>
                        <p className="text-muted mb-1">{selectedCar.year} • {selectedCar.make} • {selectedCar.model}</p>
                        <h5 className="text-success">{formatPrice(selectedCar.price)}</h5>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Payment Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="info">
                      <strong>Demo Payment:</strong> This is a demonstration. No real payment will be processed.
                    </Alert>
                    
                    {/* Payment Method */}
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select 
                        name="paymentMethod" 
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </Form.Select>
                    </Form.Group>

                    {/* Card Details */}
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentDetailsChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control
                            type="text"
                            name="expiryDate"
                            value={paymentDetails.expiryDate}
                            onChange={handlePaymentDetailsChange}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>CVV</Form.Label>
                          <Form.Control
                            type="text"
                            name="cvv"
                            value={paymentDetails.cvv}
                            onChange={handlePaymentDetailsChange}
                            placeholder="123"
                            maxLength={4}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Cardholder Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardholderName"
                        value={paymentDetails.cardholderName}
                        onChange={handlePaymentDetailsChange}
                        placeholder="John Doe"
                      />
                    </Form.Group>

                    {/* Billing Address */}
                    <hr />
                    <h6>Billing Address</h6>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address *</Form.Label>
                      <Form.Control
                        type="text"
                        name="billingAddress.street"
                        value={formData.billingAddress.street}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control
                            type="text"
                            name="billingAddress.city"
                            value={formData.billingAddress.city}
                            onChange={handleInputChange}
                            placeholder="Colombo"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>District</Form.Label>
                          <Form.Control
                            type="text"
                            name="billingAddress.district"
                            value={formData.billingAddress.district}
                            onChange={handleInputChange}
                            placeholder="Colombo"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Postal Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="billingAddress.postalCode"
                            value={formData.billingAddress.postalCode}
                            onChange={handleInputChange}
                            placeholder="10000"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Country</Form.Label>
                          <Form.Control
                            type="text"
                            name="billingAddress.country"
                            value={formData.billingAddress.country}
                            onChange={handleInputChange}
                            placeholder="Sri Lanka"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Notes (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special delivery instructions..."
                        rows={3}
                      />
                    </Form.Group>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        variant="success" 
                        size="lg" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Processing...
                          </>
                        ) : (
                          `Complete Purchase - ${formatPrice(selectedCar.price)}`
                        )}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment;
