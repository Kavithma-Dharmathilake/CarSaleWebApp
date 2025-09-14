import React, { useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCar } from '../context/CarContext';

const Home = () => {
  const {
    featuredCars,
    featuredLoading,
    featuredError,
    fetchFeaturedCars,
    clearError
  } = useCar();

  // Load featured cars on component mount
  useEffect(() => {
    fetchFeaturedCars(6);
  }, []);

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="hero-title">Find Your Perfect Car</h1>
              <p className="hero-subtitle">
                Browse through our extensive collection of quality cars. 
                From luxury sedans to reliable family vehicles, we have something for everyone.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button as={Link} to="/cars" variant="light" size="lg">
                  Browse Cars
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg">
                  Get Started
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Cars Section */}
      <Container className="py-5">
        <Row>
          <Col>
            <h2 className="text-center mb-5">Featured Cars</h2>
          </Col>
        </Row>

        {/* Error Display */}
        {featuredError && (
          <Row>
            <Col>
              <Alert variant="danger" dismissible onClose={clearError}>
                {featuredError}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Loading State */}
        {featuredLoading && (
          <Row>
            <Col className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading featured cars...</span>
              </Spinner>
              <p className="mt-3">Loading featured cars...</p>
            </Col>
          </Row>
        )}

        {/* Featured Cars Grid */}
        {!featuredLoading && featuredCars.length > 0 && (
          <Row className="car-grid">
            {featuredCars.map(car => (
              <Col key={car._id} md={6} lg={4} className="mb-4">
                <Card className="car-card h-100">
                  <Card.Img 
                    variant="top" 
                    src={car.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={car.title}
                    className="car-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{car.title}</Card.Title>
                    <Card.Text>
                      <strong>Make:</strong> {car.make}<br/>
                      <strong>Model:</strong> {car.model}<br/>
                      <strong>Year:</strong> {car.year}
                      {car.mileage && <><br/><strong>Mileage:</strong> {car.mileage.toLocaleString()} km</>}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="car-price mb-3">
                        {formatPrice(car.price)}
                      </div>
                      <Button 
                        variant="primary" 
                        className="w-100"
                        as={Link}
                        to={`/cars/${car._id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* No Featured Cars */}
        {!featuredLoading && featuredCars.length === 0 && !featuredError && (
          <Row>
            <Col className="text-center py-5">
              <h3>No featured cars available</h3>
              <p>Check back later for featured car listings.</p>
              <Button as={Link} to="/cars" variant="primary">
                Browse All Cars
              </Button>
            </Col>
          </Row>
        )}

        {/* Call to Action */}
        <Row className="mt-5">
          <Col className="text-center">
            <h3>Ready to Find Your Next Car?</h3>
            <p className="text-muted mb-4">
              Explore our full inventory and find the perfect car for your needs.
            </p>
            <Button as={Link} to="/cars" variant="primary" size="lg">
              Browse All Cars
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
