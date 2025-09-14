import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>Car Sales App</h5>
            <p className="mb-0">
              Your trusted platform for buying and selling cars online.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">
              © 2025 Car Sales App. All rights reserved.
            </p>
            <p className="mb-0">
              Built with React, Node.js, and MongoDB
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
