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
            <Card.Body className="p-4" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", borderRadius: "1.25rem" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title className="h2 mb-0 fw-bold" style={{ color: "#1e293b" }}>
                  {car.title}
                </Card.Title>
                <Badge
                  style={{
                    fontSize: "1rem",
                    padding: "0.6em 1.2em",
                    borderRadius: "1.5em",
                    background: car.isAvailable
                      ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                      : "linear-gradient(90deg, #f87171 0%, #b91c1c 100%)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(30,41,59,0.08)"
                  }}
                >
                  {car.isAvailable ? 'Available' : 'Sold'}
                </Badge>
              </div>

              <Card.Text className="text-secondary mb-3 fs-5">
                {car.year} &bull; {car.make} &bull; {car.model}
              </Card.Text>

              {car.description && (
                <Card.Text className="mb-4" style={{ color: "#334155", fontSize: "1.1rem" }}>
                  {car.description}
                </Card.Text>
              )}

              {/* Car Specifications */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3" style={{ color: "#0f172a" }}>Specifications</h5>
                <Row>
                  <Col md={6}>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Make:</span> <span style={{ color: "#1e293b" }}>{car.make}</span></li>
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Model:</span> <span style={{ color: "#1e293b" }}>{car.model}</span></li>
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Year:</span> <span style={{ color: "#1e293b" }}>{car.year}</span></li>
                      <li><span className="fw-semibold" style={{ color: "#64748b" }}>Mileage:</span> <span style={{ color: "#1e293b" }}>{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</span></li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Fuel Type:</span> <span style={{ color: "#1e293b" }}>{car.fuelType || 'N/A'}</span></li>
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Transmission:</span> <span style={{ color: "#1e293b" }}>{car.transmission || 'N/A'}</span></li>
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Color:</span> <span style={{ color: "#1e293b" }}>{car.color || 'N/A'}</span></li>
                      <li><span className="fw-semibold" style={{ color: "#64748b" }}>Location:</span> <span style={{ color: "#1e293b" }}>{car.location?.city || 'N/A'}</span></li>
                    </ul>
                  </Col>
                </Row>
              </div>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#0f172a" }}>Features</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <Badge
                        key={index}
                        style={{
                          background: "linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)",
                          color: "#fff",
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          padding: "0.5em 1em",
                          borderRadius: "1.25em",
                          marginRight: "0.5em",
                          marginBottom: "0.5em",
                          boxShadow: "0 1px 4px rgba(59,130,246,0.08)"
                        }}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {car.contactInfo && (
                <div className="mb-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#0f172a" }}>Contact Information</h5>
                  <ul className="list-unstyled mb-0">
                    {car.contactInfo.phone && (
                      <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Phone:</span> <span style={{ color: "#1e293b" }}>{car.contactInfo.phone}</span></li>
                    )}
                    {car.contactInfo.email && (
                      <li><span className="fw-semibold" style={{ color: "#64748b" }}>Email:</span> <span style={{ color: "#1e293b" }}>{car.contactInfo.email}</span></li>
                    )}
                  </ul>
                </div>
              )}

              {/* Listing Information */}
              <div className="text-muted small" style={{ color: "#64748b" }}>
                <p className="mb-1">Listed on: {formatDate(car.createdAt)}</p>
                {car.updatedAt !== car.createdAt && (
                  <p className="mb-0">Last updated: {formatDate(car.updatedAt)}</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card
            className="sticky-top shadow-lg border-0"
            style={{
              top: '100px',
              background: "linear-gradient(135deg, #f1f5f9 0%, #e0e7ef 100%)",
              borderRadius: "1.5rem"
            }}
          >
            <Card.Body className="p-4">
              <h3
                className="car-price mb-4 fw-bold"
                style={{
                  color: "#16a34a",
                  fontSize: "2.2rem",
                  letterSpacing: "0.02em"
                }}
              >
                {formatPrice(car.price)}
              </h3>

              <div className="mb-4">
                <h5 className="fw-semibold mb-3" style={{ color: "#0f172a" }}>Quick Details</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Make:</span> <span style={{ color: "#1e293b" }}>{car.make}</span></li>
                  <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Model:</span> <span style={{ color: "#1e293b" }}>{car.model}</span></li>
                  <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Year:</span> <span style={{ color: "#1e293b" }}>{car.year}</span></li>
                  <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Mileage:</span> <span style={{ color: "#1e293b" }}>{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</span></li>
                  <li className="mb-2"><span className="fw-semibold" style={{ color: "#64748b" }}>Fuel Type:</span> <span style={{ color: "#1e293b" }}>{car.fuelType || 'N/A'}</span></li>
                  <li><span className="fw-semibold" style={{ color: "#64748b" }}>Transmission:</span> <span style={{ color: "#1e293b" }}>{car.transmission || 'N/A'}</span></li>
                </ul>
              </div>

              <Button
                style={{
                  background: car.isAvailable
                    ? "linear-gradient(90deg, #22d3ee 0%, #38bdf8 100%)"
                    : "linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%)",
                  color: car.isAvailable ? "#fff" : "#64748b",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "1.15rem",
                  borderRadius: "2em",
                  boxShadow: car.isAvailable ? "0 4px 16px rgba(56,189,248,0.12)" : "none",
                  transition: "background 0.2s, color 0.2s"
                }}
                size="lg"
                className="w-100 mb-3 py-3"
                onClick={handlePurchase}
                disabled={!car.isAvailable}
              >
                {car.isAvailable ? 'Purchase Now' : 'Not Available'}
              </Button>

              <Button
                variant="outline-info"
                size="lg"
                className="w-100 mb-3 py-3"
                style={{
                  borderRadius: "2em",
                  borderWidth: "2px",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  color: "#0ea5e9",
                  borderColor: "#0ea5e9",
                  background: "#fff",
                  transition: "background 0.2s, color 0.2s, border 0.2s"
                }}
              >
                Contact Seller
              </Button>

              <Button
                variant="outline-secondary"
                size="lg"
                className="w-100 py-3"
                style={{
                  borderRadius: "2em",
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  color: "#64748b",
                  borderColor: "#cbd5e1",
                  background: "#f8fafc",
                  transition: "background 0.2s, color 0.2s, border 0.2s"
                }}
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
