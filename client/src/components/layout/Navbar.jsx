import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          Car Sales App
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/cars">Cars</Nav.Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                {/* Role-based dashboard link */}
                {isAdmin() ? (
                  <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>
                ) : (
                  <Nav.Link as={Link} to="/dashboard">My Dashboard</Nav.Link>
                )}
                
                {/* Admin-specific links */}
                {isAdmin() && (
                  <Nav.Link as={Link} to="/cars">Manage Cars</Nav.Link>
                )}
                
                <NavDropdown title={user?.email} id="basic-nav-dropdown">
                  {/* Role-based dashboard link in dropdown */}
                  {isAdmin() ? (
                    <NavDropdown.Item as={Link} to="/admin">
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Admin Dashboard
                    </NavDropdown.Item>
                  ) : (
                    <NavDropdown.Item as={Link} to="/dashboard">
                      <i className="fas fa-user me-2"></i>
                      My Dashboard
                    </NavDropdown.Item>
                  )}
                  
                  {/* Admin-specific dropdown items */}
                  {isAdmin() && (
                    <>
                      <NavDropdown.Item as={Link} to="/cars">
                        <i className="fas fa-car me-2"></i>
                        Manage Cars
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  )}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
