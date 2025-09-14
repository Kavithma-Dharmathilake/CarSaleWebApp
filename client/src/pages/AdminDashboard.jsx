import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Alert,
  Badge,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCar } from '../context/CarContext';
import { useTransaction } from '../context/TransactionContext';

const STATUS_COLORS = {
  active: { bg: 'success', text: 'Active', color: '#22c55e' },
  sold: { bg: 'danger', text: 'Sold', color: '#ef4444' },
  pending: { bg: 'warning', text: 'Pending', color: '#f59e42' },
  inactive: { bg: 'secondary', text: 'Inactive', color: '#64748b' },
};

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
    clearError: clearCarError,
  } = useCar();

  const {
    getAllTransactions,
    transactionStats,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransaction();

  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    soldCars: 0,
    pendingCars: 0,
    inactiveCars: 0,
    totalUsers: 0,
    totalSales: 0,
    totalRevenue: 0,
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
      district: '',
    },
    contactInfo: {
      phone: '',
      email: '',
    },
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
        loadTransactionStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionStats = async () => {
    try {
      // Calculate stats from loaded cars
      const availableCars = cars.filter(
        (car) => car.isAvailable && car.status === 'active'
      ).length;
      const soldCars = cars.filter(
        (car) => !car.isAvailable || car.status === 'sold'
      ).length;
      const pendingCars = cars.filter((car) => car.status === 'pending').length;
      const inactiveCars = cars.filter((car) => car.status === 'inactive').length;

      setStats((prev) => ({
        ...prev,
        totalCars: cars.length,
        availableCars,
        soldCars,
        pendingCars,
        inactiveCars,
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
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle features input
  const handleFeaturesChange = (e) => {
    const features = e.target.value
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f);
    setFormData((prev) => ({
      ...prev,
      features,
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
      isAvailable: !car.isAvailable,
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
      status: newStatus,
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
      const promises = cars.map((car) =>
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
        district: '',
      },
      contactInfo: {
        phone: '',
        email: '',
      },
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
        district: car.location?.district || '',
      },
      contactInfo: {
        phone: car.contactInfo?.phone || '',
        email: car.contactInfo?.email || '',
      },
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
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get car status badge color and text
  const getCarStatusBadge = (car) => {
    if (!car.isAvailable) {
      return STATUS_COLORS.sold;
    }
    switch (car.status) {
      case 'active':
        return STATUS_COLORS.active;
      case 'pending':
        return STATUS_COLORS.pending;
      case 'inactive':
        return STATUS_COLORS.inactive;
      case 'sold':
        return STATUS_COLORS.sold;
      default:
        return { bg: 'info', text: 'Unknown', color: '#38bdf8' };
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

  // --- Custom styles for the modern table ---
  const tableStyles = {
    boxShadow: '0 4px 24px 0 rgba(30,41,59,0.08)',
    borderRadius: '1rem',
    overflow: 'hidden',
    background: '#fff',
    marginBottom: '2rem',
  };
  const thStyles = {
    position: 'sticky',
    top: 0,
    background: '#f8fafc',
    zIndex: 2,
    fontWeight: 600,
    color: '#334155',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '1rem',
    letterSpacing: '0.01em',
  };
  const tdStyles = {
    verticalAlign: 'middle',
    fontSize: '0.98rem',
    border: 'none',
    background: 'transparent',
  };
  const zebraRow = (idx) =>
    idx % 2 === 0
      ? { background: '#f9fafb', transition: 'background 0.2s' }
      : { background: '#fff', transition: 'background 0.2s' };

  // --- End custom styles ---

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

      {/* Car Listings Table Only (No Stats Cards, No Quick Actions) */}
      <Row>
        <Col md={8}>
          <Card className="dashboard-card" style={{ boxShadow: '0 4px 24px 0 rgba(30,41,59,0.08)', borderRadius: '1rem' }}>
            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0" style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', boxShadow: '0 1px 0 0 #e2e8f0' }}>
              <h5 className="mb-0">Car Listings ({cars.length})</h5>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              {/* Error Display */}
              {carsError && (
                <Alert variant="danger" dismissible onClose={clearCarError} className="m-3">
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
                <div style={tableStyles} className="table-responsive">
                  <Table
                    hover
                    className="mb-0"
                    style={{
                      minWidth: 900,
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={thStyles}>Car Details</th>
                        <th style={thStyles}>Make/Model</th>
                        <th style={thStyles}>Year</th>
                        <th style={thStyles}>Price</th>
                        <th style={thStyles}>Status</th>
                        <th style={thStyles}>Views</th>
                        <th style={thStyles}>Created</th>
                        <th style={thStyles}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car, idx) => {
                        const status = getCarStatusBadge(car);
                        return (
                          <tr
                            key={car._id}
                            style={{
                              ...zebraRow(idx),
                              transition: 'background 0.2s',
                              cursor: 'pointer',
                            }}
                            className="car-row"
                          >
                            <td style={tdStyles}>
                              <div className="d-flex align-items-center">
                                <img
                                  src={car.imageUrl || 'https://images.unsplash.com/photo.jpg'}
                                  alt={car.title}
                                  className="me-3"
                                  style={{
                                    width: 64,
                                    height: 44,
                                    objectFit: 'cover',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 2px 8px 0 rgba(30,41,59,0.10)',
                                    border: '1px solid #e2e8f0',
                                    background: '#f1f5f9',
                                  }}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo.jpg';
                                  }}
                                />
                                <div>
                                  <div className="fw-semibold" style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                                    {car.title}
                                  </div>
                                  <div className="text-muted small">
                                    {car.location?.city && car.location?.district
                                      ? `${car.location.city}, ${car.location.district}`
                                      : 'Location not specified'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={tdStyles}>
                              <div className="fw-bold" style={{ color: '#334155' }}>{car.make}</div>
                              <div className="text-muted small">{car.model}</div>
                            </td>
                            <td style={tdStyles}>
                              <span className="badge bg-light text-dark" style={{ fontWeight: 500, fontSize: '1rem', borderRadius: '0.5rem' }}>
                                {car.year}
                              </span>
                            </td>
                            <td style={tdStyles}>
                              <div className="fw-bold" style={{ color: '#22c55e', fontSize: '1.1rem', background: '#f0fdf4', borderRadius: '0.5rem', padding: '0.25em 0.75em', display: 'inline-block' }}>
                                {formatPrice(car.price)}
                              </div>
                              {car.mileage && (
                                <div className="text-muted small mt-1">{car.mileage.toLocaleString()} km</div>
                              )}
                            </td>
                            <td style={tdStyles}>
                              <div className="d-flex flex-column gap-1 align-items-center">
                                <Badge
                                  bg={status.bg}
                                  style={{
                                    width: 90,
                                    fontSize: '0.98rem',
                                    fontWeight: 600,
                                    borderRadius: '0.5rem',
                                    background: status.bg === 'success'
                                      ? 'linear-gradient(90deg,#4ade80 0%,#22d3ee 100%)'
                                      : status.bg === 'danger'
                                      ? 'linear-gradient(90deg,#f87171 0%,#fbbf24 100%)'
                                      : status.bg === 'warning'
                                      ? 'linear-gradient(90deg,#fbbf24 0%,#f59e42 100%)'
                                      : status.bg === 'secondary'
                                      ? 'linear-gradient(90deg,#cbd5e1 0%,#64748b 100%)'
                                      : undefined,
                                    color: status.bg === 'warning' ? '#fff' : '#fff',
                                    boxShadow: '0 1px 4px 0 rgba(30,41,59,0.10)',
                                  }}
                                >
                                  {status.text}
                                </Badge>
                                <div className="d-flex gap-1 mt-1 flex-wrap justify-content-center">
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        {car.isAvailable ? 'Mark as Sold' : 'Mark as Available'}
                                      </Tooltip>
                                    }
                                  >
                                    <Button
                                      variant={car.isAvailable ? "info" : "success"}
                                      size="sm"
                                      onClick={() => handleToggleAvailability(car)}
                                      disabled={loading}
                                      className={`action-btn-solid ${car.isAvailable ? "action-btn-mark-sold" : "action-btn-mark-available"}`}
                                      style={{
                                        borderRadius: '0.5rem',
                                        fontWeight: 700,
                                        minWidth: 120,
                                        boxShadow: '0 1px 2px 0 #e2e8f0',
                                        color: '#fff',
                                        border: 'none',
                                      }}
                                    >
                                      {car.isAvailable ? 'Mark Sold' : 'Mark Available'}
                                    </Button>
                                  </OverlayTrigger>
                                  {car.status !== 'active' && car.isAvailable && (
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Mark as Active</Tooltip>}
                                    >
                                      <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleStatusChange(car, 'active')}
                                        disabled={loading}
                                        className="action-btn-solid action-btn-activate"
                                        style={{
                                          borderRadius: '0.5rem',
                                          fontWeight: 700,
                                          minWidth: 120,
                                          boxShadow: '0 1px 2px 0 #e2e8f0',
                                          color: '#fff',
                                          border: 'none',
                                        }}
                                      >
                                        Activate
                                      </Button>
                                    </OverlayTrigger>
                                  )}
                                  {car.status === 'active' && car.isAvailable && (
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Mark as Inactive</Tooltip>}
                                    >
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleStatusChange(car, 'inactive')}
                                        disabled={loading}
                                        className="action-btn-solid action-btn-deactivate"
                                        style={{
                                          borderRadius: '0.5rem',
                                          fontWeight: 700,
                                          minWidth: 120,
                                          boxShadow: '0 1px 2px 0 #e2e8f0',
                                          color: '#fff',
                                          border: 'none',
                                        }}
                                      >
                                        Deactivate
                                      </Button>
                                    </OverlayTrigger>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={tdStyles}>
                              <span
                                className="badge"
                                style={{
                                  background: 'linear-gradient(90deg,#38bdf8 0%,#818cf8 100%)',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  borderRadius: '0.5rem',
                                  minWidth: 40,
                                }}
                              >
                                {car.views || 0}
                              </span>
                            </td>
                            <td style={tdStyles} className="small">
                              <div>{formatDate(car.createdAt)}</div>
                              {car.updatedAt !== car.createdAt && (
                                <div className="text-muted" style={{ fontSize: '0.85em' }}>
                                  Updated: {formatDate(car.updatedAt)}
                                </div>
                              )}
                            </td>
                            <td style={tdStyles}>
                              <div className="d-flex flex-column gap-1 align-items-center">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Edit Car</Tooltip>}
                                >
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => openEditModal(car)}
                                    style={{
                                      borderRadius: '0.5rem',
                                      fontWeight: 500,
                                      minWidth: 80,
                                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                                      boxShadow: '0 1px 2px 0 #e2e8f0',
                                    }}
                                    className="action-btn"
                                  >
                                    Edit
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>View Car</Tooltip>}
                                >
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    as={Link}
                                    to={`/cars/${car._id}`}
                                    style={{
                                      borderRadius: '0.5rem',
                                      fontWeight: 500,
                                      minWidth: 80,
                                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                                      boxShadow: '0 1px 2px 0 #e2e8f0',
                                    }}
                                    className="action-btn"
                                  >
                                    View
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Delete Car</Tooltip>}
                                >
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(car)}
                                    style={{
                                      borderRadius: '0.5rem',
                                      fontWeight: 500,
                                      minWidth: 80,
                                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                                      boxShadow: '0 1px 2px 0 #e2e8f0',
                                    }}
                                    className="action-btn"
                                  >
                                    Delete
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
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

        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Car Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Active Cars:</span>
                  <span className="fw-bold text-success">{stats.availableCars}</span>
                </div>
                <div className="progress mt-1" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        stats.totalCars > 0
                          ? (stats.availableCars / stats.totalCars) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Sold Cars:</span>
                  <span className="fw-bold text-danger">{stats.soldCars}</span>
                </div>
                <div className="progress mt-1" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${
                        stats.totalCars > 0
                          ? (stats.soldCars / stats.totalCars) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pending Cars:</span>
                  <span className="fw-bold text-warning">{stats.pendingCars}</span>
                </div>
                <div className="progress mt-1" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${
                        stats.totalCars > 0
                          ? (stats.pendingCars / stats.totalCars) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Inactive Cars:</span>
                  <span className="fw-bold text-secondary">{stats.inactiveCars}</span>
                </div>
                <div className="progress mt-1" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-secondary"
                    style={{
                      width: `${
                        stats.totalCars > 0
                          ? (stats.inactiveCars / stats.totalCars) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <small className="text-muted">Total: {stats.totalCars} cars</small>
              </div>
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
                  style={{
                    width: '60px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 8px 0 rgba(30,41,59,0.10)',
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                  }}
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
      {/* Responsive table tweaks and custom action button styles */}
      <style>{`
        @media (max-width: 991.98px) {
          .table-responsive {
            min-width: 100vw;
            overflow-x: auto;
          }
          .car-row td {
            font-size: 0.95rem;
            padding: 0.75rem 0.5rem;
          }
        }
        .action-btn:hover, .action-btn:focus {
          filter: brightness(1.08);
          box-shadow: 0 2px 8px 0 rgba(30,41,59,0.12);
          transform: translateY(-2px) scale(1.03);
        }
        .car-row:hover {
          background: #e0f2fe !important;
        }
        .dashboard-card {
          border-radius: 1rem !important;
          box-shadow: 0 4px 24px 0 rgba(30,41,59,0.08) !important;
        }
        /* --- Custom solid action button styles for professional palette --- */
        .action-btn-solid {
          color: #fff !important;
          font-weight: 700 !important;
          border: none !important;
          box-shadow: 0 1px 2px 0 #e2e8f0 !important;
          border-radius: 0.5rem !important;
          transition: background 0.18s, box-shadow 0.18s, filter 0.18s;
        }
        .action-btn-solid.action-btn-activate,
        .action-btn-solid.action-btn-mark-available,
        .action-btn-solid.btn-success,
        .action-btn-solid[variant="success"] {
          background-color: #16a34a !important;
        }
        .action-btn-solid.action-btn-activate:hover,
        .action-btn-solid.action-btn-mark-available:hover,
        .action-btn-solid.btn-success:hover,
        .action-btn-solid[variant="success"]:hover {
          background-color: #15803d !important;
        }
        .action-btn-solid.action-btn-mark-sold,
        .action-btn-solid.btn-info,
        .action-btn-solid[variant="info"] {
          background-color: #2563eb !important;
        }
        .action-btn-solid.action-btn-mark-sold:hover,
        .action-btn-solid.btn-info:hover,
        .action-btn-solid[variant="info"]:hover {
          background-color: #1d4ed8 !important;
        }
        .action-btn-solid.action-btn-deactivate,
        .action-btn-solid.btn-danger,
        .action-btn-solid[variant="danger"] {
          background-color: #dc2626 !important;
        }
        .action-btn-solid.action-btn-deactivate:hover,
        .action-btn-solid.btn-danger:hover,
        .action-btn-solid[variant="danger"]:hover {
          background-color: #b91c1c !important;
        }
        .action-btn-solid.btn-primary,
        .action-btn-solid[variant="primary"] {
          background-color: #0d6efd !important;
        }
        .action-btn-solid.btn-primary:hover,
        .action-btn-solid[variant="primary"]:hover {
          background-color: #0a58ca !important;
        }
        .action-btn-solid:active, .action-btn-solid:focus {
          filter: brightness(0.97);
        }
      `}</style>
    </Container>
  );
};

export default AdminDashboard;
