import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCar } from '../context/CarContext';

const Cars = () => {
  const {
    cars,
    loading,
    error,
    pagination,
    filters,
    fetchCars,
    applyFilters,
    clearFilters,
    clearError
  } = useCar();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);

  // Load cars on component mount
  useEffect(() => {
    loadCars();
  }, []);

  // Load cars with current filters
  const loadCars = async (page = 1) => {
    setCurrentPage(page);
    await fetchCars(filters, page, 12);
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    await applyFilters(newFilters, 1);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = async (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    await applyFilters(newFilters, 1);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    setCurrentPage(1);
    loadCars(1);
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
      <Row>
        <Col>
          <h1 className="text-center mb-5">Available Cars</h1>
        </Col>
      </Row>
      
      {/* Search and Filter Section */}
      <Row>
        <Col md={12} className="mb-4">
          <div className="search-section">
            <Form onSubmit={handleSearch}>
              <Row className="g-3">
                <Col md={4}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by make, model, or title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary" type="submit">
                      Search
                    </Button>
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                  >
                    <option value="">All Makes</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Ford">Ford</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes">Mercedes</option>
                    <option value="Audi">Audi</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                  >
                    <option value="">All Models</option>
                    <option value="Camry">Camry</option>
                    <option value="Civic">Civic</option>
                    <option value="Mustang">Mustang</option>
                    <option value="Corolla">Corolla</option>
                    <option value="Accord">Accord</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button variant="outline-danger" className="w-100" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={clearError}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Loading State */}
      {loading && (
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading cars...</span>
            </Spinner>
            <p className="mt-3">Loading cars...</p>
          </Col>
        </Row>
      )}

      {/* Cars Grid */}
      {!loading && cars.length > 0 && (
        <>
          <Row className="car-grid">
            {cars.map(car => (
              <Col key={car._id} md={6} lg={4} className="mb-4">
                <Card className="car-card h-100">
                  <Card.Img 
                    variant="top" 
                    src={car.imageUrl} 
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Row>
              <Col className="text-center">
                <div className="pagination-controls">
                  <Button
                    variant="outline-primary"
                    disabled={!pagination.hasPrev}
                    onClick={() => loadCars(currentPage - 1)}
                    className="me-2"
                  >
                    Previous
                  </Button>
                  
                  <span className="mx-3">
                    Page {pagination.currentPage} of {pagination.totalPages}
                    ({pagination.totalCount} cars total)
                  </span>
                  
                  <Button
                    variant="outline-primary"
                    disabled={!pagination.hasNext}
                    onClick={() => loadCars(currentPage + 1)}
                    className="ms-2"
                  >
                    Next
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* No Cars Found */}
      {!loading && cars.length === 0 && !error && (
        <Row>
          <Col className="text-center py-5">
            <h3>No cars found</h3>
            <p>Try adjusting your search criteria or check back later for new listings.</p>
            <Button variant="primary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cars;
