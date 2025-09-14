import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCar } from '../context/CarContext';
import { useTransaction } from '../context/TransactionContext';

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const {
    cars,
    loading: carsLoading,
    error: carsError,
    fetchCars,
    createCar,
    updateCar,
    deleteCar,
    clearError: clearCarError
  } = useCar();

  const {
    getAllTransactions,
    transactionStats,
    loading: transactionsLoading,
    error: transactionsError
  } = useTransaction();

  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    soldCars: 0,
    pendingCars: 0,
    inactiveCars: 0,
    totalUsers: 0,
    totalSales: 0,
    totalRevenue: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    price: '',
    imageUrl: '',
    description: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    color: '',
    features: [],
    location: {
      city: '',
      district: ''
    },
    contactInfo: {
      phone: '',
      email: ''
    }
  });

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      loadDashboardData();
    }
  }, [isAuthenticated, isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCars({ limit: 100 }), // Load more cars for admin view
        loadTransactionStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionStats = async () => {
    try {
      // Calculate stats from loaded cars
      const availableCars = cars.filter(car => car.isAvailable && car.status === 'active').length;
      const soldCars = cars.filter(car => !car.isAvailable || car.status === 'sold').length;
      const pendingCars = cars.filter(car => car.status === 'pending').length;
      const inactiveCars = cars.filter(car => car.status === 'inactive').length;
      
      setStats(prev => ({
        ...prev,
        totalCars: cars.length,
        availableCars,
        soldCars,
        pendingCars,
        inactiveCars
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Update stats when cars data changes
  useEffect(() => {
    if (cars.length > 0) {
      loadTransactionStats();
    }
  }, [cars]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
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

  // Handle features input
  const handleFeaturesChange = (e) => {
    const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
    setFormData(prev => ({
      ...prev,
      features
    }));
  };

  // Handle add car
  const handleAddCar = async (e) => {
    e.preventDefault();
    const result = await createCar(formData);
    if (result.success) {
      setShowAddModal(false);
      resetForm();
      loadDashboardData();
    }
  };

  // Handle edit car
  const handleEditCar = async (e) => {
    e.preventDefault();
    const result = await updateCar(selectedCar._id, formData);
    if (result.success) {
      setShowEditModal(false);
      resetForm();
      loadDashboardData();
    }
  };

  // Handle delete car
  const handleDeleteCar = async () => {
    const result = await deleteCar(selectedCar._id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedCar(null);
      loadDashboardData();
    }
  };

  // Handle toggle car availability
  const handleToggleAvailability = async (car) => {
    const updatedData = {
      ...car,
      isAvailable: !car.isAvailable
    };
    const result = await updateCar(car._id, updatedData);
    if (result.success) {
      loadDashboardData();
    }
  };

  // Handle car status change
  const handleStatusChange = async (car, newStatus) => {
    const updatedData = {
      ...car,
      status: newStatus
    };
    const result = await updateCar(car._id, updatedData);
    if (result.success) {
      loadDashboardData();
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (status) => {
    setLoading(true);
    try {
      // This would typically be a bulk update API call
      // For now, we'll update each car individually
      const promises = cars.map(car => 
        updateCar(car._id, { ...car, isAvailable: status === 'available' })
      );
      await Promise.all(promises);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating car statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      make: '',
      model: '',
      year: '',
      price: '',
      imageUrl: '',
      description: '',
      mileage: '',
      fuelType: '',
      transmission: '',
      color: '',
      features: [],
      location: {
        city: '',
        district: ''
      },
      contactInfo: {
        phone: '',
        email: ''
      }
    });
  };

  // Open edit modal
  const openEditModal = (car) => {
    setSelectedCar(car);
    setFormData({
      title: car.title,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      imageUrl: car.imageUrl,
      description: car.description,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      color: car.color,
      features: car.features || [],
      location: {
        city: car.location?.city || '',
        district: car.location?.district || ''
      },
      contactInfo: {
        phone: car.contactInfo?.phone || '',
        email: car.contactInfo?.email || ''
      }
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (car) => {
    setSelectedCar(car);
    setShowDeleteModal(true);
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

  // Get car status badge variant
  const getCarStatusBadge = (car) => {
    if (!car.isAvailable) {
      return 'danger'; // Sold
    }
    
    switch (car.status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'secondary';
      case 'sold':
        return 'danger';
      default:
        return 'info';
    }
  };

  // Get car status text
  const getCarStatusText = (car) => {
    if (!car.isAvailable) {
      return 'Sold';
    }
    
    switch (car.status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'inactive':
        return 'Inactive';
      case 'sold':
        return 'Sold';
      default:
        return 'Unknown';
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h3>Please log in to view admin dashboard</h3>
            <Button as={Link} to="/login" variant="primary">
              Login
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!isAdmin()) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h3>Access Denied</h3>
            <p>You don't have permission to access the admin dashboard.</p>
            <Button as={Link} to="/dashboard" variant="primary">
              Go to Dashboard
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
          <h1 className="mb-4">Admin Dashboard</h1>
          <p className="text-muted mb-5">
            Welcome, {user?.email}! Manage your car sales platform.
          </p>
        </Col>
      </Row>
      
      {/* Statistics Cards */}
      {/* <Row className="stats-grid">
        <Col md={10}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="py-4">
              <h2 className="text-primary mb-2">{stats.totalCars}</h2>
              <p className="text-muted mb-0">Total Cars</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={10}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="py-4">
              <h2 className="text-success mb-2">{stats.availableCars}</h2>
              <p className="text-muted mb-0">Active</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={10}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="py-4">
              <h2 className="text-danger mb-2">{stats.soldCars}</h2>
              <p className="text-muted mb-0">Sold</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="stats-grid">
        <Col md={10}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="py-4">
              <h2 className="text-warning mb-2">{stats.pendingCars}</h2>
              <p className="text-muted mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={10}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="py-4">
              <h2 className="text-secondary mb-2">{stats.inactiveCars}</h2>
              <p className="text-muted mb-0">Inactive</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={10}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="py-4">
              <h2 className="text-info mb-2">{stats.totalUsers}</h2>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
      <Row>
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Car Listings ({cars.length})</h5>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleBulkStatusChange('available')}
                  disabled={loading}
                >
                  Mark All Available
                </Button>
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => handleBulkStatusChange('sold')}
                  disabled={loading}
                >
                  Mark All Sold
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                >
                  Add New Car
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Error Display */}
              {carsError && (
                <Alert variant="danger" dismissible onClose={clearCarError}>
                  {carsError}
                </Alert>
              )}

              {/* Loading State */}
              {(carsLoading || loading) && (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading cars...</span>
                </div>
              )}

              {/* Cars Table */}
              {!carsLoading && !loading && cars.length > 0 && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Car Details</th>
                      <th>Make/Model</th>
                      <th>Year</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map(car => (
                      <tr key={car._id} className={!car.isAvailable ? 'table-secondary' : ''}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={car.imageUrl || 'https://images.unsplash.com/photo.jpg'} 
                              alt={car.title}
                              className="me-2 rounded"
                              style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo.jpg';
                              }}
                            />
                            <div>
                              <div className="fw-bold small">{car.title}</div>
                              <div className="text-muted small">
                                {car.location?.city && car.location?.district 
                                  ? `${car.location.city}, ${car.location.district}`
                                  : 'Location not specified'
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">{car.make}</div>
                          <div className="text-muted small">{car.model}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{car.year}</span>
                        </td>
                        <td>
                          <div className="fw-bold text-success">{formatPrice(car.price)}</div>
                          {car.mileage && (
                            <div className="text-muted small">{car.mileage.toLocaleString()} km</div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <Badge bg={getCarStatusBadge(car)} className="w-100">
                              {getCarStatusText(car)}
                            </Badge>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleToggleAvailability(car)}
                                disabled={loading}
                                title={car.isAvailable ? 'Mark as Sold' : 'Mark as Available'}
                              >
                                {car.isAvailable ? 'Mark Sold' : 'Mark Available'}
                              </Button>
                              {car.status !== 'active' && car.isAvailable && (
                                <Button 
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleStatusChange(car, 'active')}
                                  disabled={loading}
                                  title="Mark as Active"
                                >
                                  Activate
                                </Button>
                              )}
                              {car.status === 'active' && car.isAvailable && (
                                <Button 
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleStatusChange(car, 'inactive')}
                                  disabled={loading}
                                  title="Mark as Inactive"
                                >
                                  Deactivate
                                </Button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">{car.views || 0}</span>
                        </td>
                        <td className="small">
                          <div>{formatDate(car.createdAt)}</div>
                          {car.updatedAt !== car.createdAt && (
                            <div className="text-muted">Updated: {formatDate(car.updatedAt)}</div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => openEditModal(car)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              as={Link}
                              to={`/cars/${car._id}`}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => openDeleteModal(car)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* No Cars */}
              {!carsLoading && cars.length === 0 && !carsError && (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No cars listed yet. Add your first car!</p>
                  <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add New Car
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Car Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus-circle me-2"></i>
            Add New Car Listing
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCar}>
          <Modal.Body>
            <Alert variant="info" className="mb-4">
              <i className="fas fa-info-circle me-2"></i>
              Fill in the car details below. Fields marked with * are required.
            </Alert>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-car me-1"></i>
                    Title *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2020 Toyota Camry Hybrid"
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">
                    A descriptive title for the car listing
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-industry me-1"></i>
                    Make *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Toyota"
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-tag me-1"></i>
                    Model *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Camry"
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-calendar me-1"></i>
                    Year *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="1900"
                    max="2024"
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-dollar-sign me-1"></i>
                    Price (LKR) *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1000"
                    className="form-control-lg"
                    placeholder="e.g., 5000000"
                  />
                  <Form.Text className="text-muted">
                    Enter price in Sri Lankan Rupees
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-image me-1"></i>
                    Image URL
                  </Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">
                    Optional: URL to car image
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the car condition, features, etc."
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mileage (km)</Form.Label>
                  <Form.Control
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fuel Type</Form.Label>
                  <Form.Select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Transmission</Form.Label>
                  <Form.Select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="cvt">CVT</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Silver"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Features (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.features.join(', ')}
                    onChange={handleFeaturesChange}
                    placeholder="e.g., GPS, Bluetooth, Backup Camera"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Colombo"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Control
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    placeholder="e.g., Colombo"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="+94771234567"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    placeholder="seller@example.com"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              <i className="fas fa-times me-1"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-1"></i>
                  Add Car
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Car Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2"></i>
            Edit Car Listing
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditCar}>
          <Modal.Body>
            {/* Same form fields as Add Modal */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Make *</Form.Label>
                  <Form.Control
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Model *</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Year *</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (LKR) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              <i className="fas fa-times me-1"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-1"></i>
                  Update Car
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-3">
            <i className="fas fa-warning me-2"></i>
            This action cannot be undone!
          </Alert>
          <p>Are you sure you want to delete this car listing?</p>
          {selectedCar && (
            <div className="border p-3 rounded bg-light">
              <div className="d-flex align-items-center">
                <img 
                  src={selectedCar.imageUrl || 'https://images.unsplash.com/photo.jpg'} 
                  alt={selectedCar.title}
                  className="me-3 rounded"
                  style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo.jpg';
                  }}
                />
                <div>
                  <h6 className="mb-1">{selectedCar.title}</h6>
                  <p className="text-muted mb-0">
                    {selectedCar.year} • {selectedCar.make} {selectedCar.model} • {formatPrice(selectedCar.price)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <i className="fas fa-times me-1"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCar} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-1"></i>
                Delete Car
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
