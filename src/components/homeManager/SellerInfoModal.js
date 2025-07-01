import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

function SellerInfoModal({ show, onHide, seller }) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Seller Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Seller ID:</strong> {seller.SellerID}</p>
                <p><strong>Seller Name:</strong> {seller.SellerName}</p>
                <p><strong>Seller Address:</strong> {seller.SellerAddress}</p>
                <p><strong>User ID:</strong> {seller.UserID}</p>
                
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

SellerInfoModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    seller: PropTypes.object.isRequired
};

export default SellerInfoModal;
