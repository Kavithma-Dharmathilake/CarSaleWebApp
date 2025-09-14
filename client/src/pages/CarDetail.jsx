import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useCar } from '../context/CarContext';
import { useAuth } from '../context/AuthContext';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const {
    selectedCar,
    carLoading,
    carError,
    fetchCarById,
    clearError
  } = useCar();

  const [loading, setLoading] = useState(false);

  // Load car details on component mount
  useEffect(() => {
    if (id) {
      fetchCarById(id);
    }
  }, [id]);

  // Handle purchase button click
  const handlePurchase = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navigate to payment page (to be implemented)
    navigate(`/payment/${id}`);
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
      day: 'numeric'
    });
  };

  // Loading state
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

  // Error state
  if (carError) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={clearError}>
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
            <p>The car you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" onClick={() => navigate('/cars')}>
              Back to Cars
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  const car = selectedCar;

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Img 
              variant="top" 
              src={car.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'} 
              alt={car.title}
              style={{ height: '400px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <Card.Title className="h2 mb-0">{car.title}</Card.Title>
                <Badge bg={car.isAvailable ? 'success' : 'danger'}>
                  {car.isAvailable ? 'Available' : 'Sold'}
                </Badge>
              </div>
              
              <Card.Text className="text-muted mb-3">
                {car.year} • {car.make} • {car.model}
              </Card.Text>
              
              {car.description && (
                <Card.Text className="mb-4">
                  {car.description}
                </Card.Text>
              )}

              {/* Car Specifications */}
              <div className="mb-4">
                <h5>Specifications</h5>
                <Row>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li><strong>Make:</strong> {car.make}</li>
                      <li><strong>Model:</strong> {car.model}</li>
                      <li><strong>Year:</strong> {car.year}</li>
                      <li><strong>Mileage:</strong> {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li><strong>Fuel Type:</strong> {car.fuelType || 'N/A'}</li>
                      <li><strong>Transmission:</strong> {car.transmission || 'N/A'}</li>
                      <li><strong>Color:</strong> {car.color || 'N/A'}</li>
                      <li><strong>Location:</strong> {car.location?.city || 'N/A'}</li>
                    </ul>
                  </Col>
                </Row>
              </div>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div className="mb-4">
                  <h5>Features</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <Badge key={index} bg="secondary" className="me-2 mb-2">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {car.contactInfo && (
                <div className="mb-4">
                  <h5>Contact Information</h5>
                  <ul className="list-unstyled">
                    {car.contactInfo.phone && (
                      <li><strong>Phone:</strong> {car.contactInfo.phone}</li>
                    )}
                    {car.contactInfo.email && (
                      <li><strong>Email:</strong> {car.contactInfo.email}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Listing Information */}
              <div className="text-muted small">
                <p>Listed on: {formatDate(car.createdAt)}</p>
                {car.updatedAt !== car.createdAt && (
                  <p>Last updated: {formatDate(car.updatedAt)}</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Body>
              <h3 className="car-price text-success mb-4">
                {formatPrice(car.price)}
              </h3>
              
              <div className="mb-4">
                <h5>Quick Details</h5>
                <ul className="list-unstyled">
                  <li><strong>Make:</strong> {car.make}</li>
                  <li><strong>Model:</strong> {car.model}</li>
                  <li><strong>Year:</strong> {car.year}</li>
                  <li><strong>Mileage:</strong> {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</li>
                  <li><strong>Fuel Type:</strong> {car.fuelType || 'N/A'}</li>
                  <li><strong>Transmission:</strong> {car.transmission || 'N/A'}</li>
                </ul>
              </div>
              
              <Button 
                variant="success" 
                size="lg" 
                className="w-100 mb-3"
                onClick={handlePurchase}
                disabled={!car.isAvailable}
              >
                {car.isAvailable ? 'Purchase Now' : 'Not Available'}
              </Button>
              
              <Button variant="outline-primary" size="lg" className="w-100 mb-3">
                Contact Seller
              </Button>

              <Button 
                variant="outline-secondary" 
                size="lg" 
                className="w-100"
                onClick={() => navigate('/cars')}
              >
                Back to Cars
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CarDetail;
