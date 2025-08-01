import React, { useState, useEffect, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Modal } from 'react-bootstrap';

export default function DeliveryConfirm() {
  const [billDetails, setBillDetails] = useState([]);
  const [productNames, setProductNames] = useState({});
  const [productPics, setProductPics] = useState({}); 
  const [shipperNames, setShipperNames] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedBillDetailID, setSelectedBillDetailID] = useState(null);
  const { user } = useUser();

  const fetchBillDetails = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/bill/getBillDetailsByUserID', {
        params: { userID: user.UserID }
      });
      console.log("Fetched bill details data:", response.data);
      setBillDetails(response.data);
      
      const products = {};
      const pics = {};
      for (const detail of response.data) {
        const productResponse = await axios.get('http://localhost:5000/bill/getProductToBill', {
          params: { billDetailID: detail.BillDetailID }
        });
        products[detail.BillDetailID] = productResponse.data[0]?.ProductName || 'Unknown';
        pics[detail.BillDetailID] = productResponse.data[0]?.ProductPic || '';
      }
      setProductNames(products);
      setProductPics(pics);

      const shippers = {};
      for (const detail of response.data) {
        if (detail.ShipperID) {
          const shipperResponse = await axios.get('http://localhost:5000/user/getShipperName', {
            params: { shipperID: detail.ShipperID }
          });
          shippers[detail.ShipperID] = shipperResponse.data.ShipperName || 'Unknown';
        }
      }
      setShipperNames(shippers);

    } catch (error) {
      console.error("There was an error fetching bill details data!", error);
    }
  }, [user.UserID]);

  useEffect(() => {
    fetchBillDetails();
    const intervalId = setInterval(() => {
      fetchBillDetails();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [fetchBillDetails]);

  const handleConfirmReceive = async () => {
    try {
      await axios.put('http://localhost:5000/bill/updateBillDetailU', {
        BillDetailID: selectedBillDetailID,
        BillDetailStatus: "Đã nhận hàng"
      });
      fetchBillDetails();
      setShowModal(false);
    } catch (error) {
      console.error("There was an error updating the bill detail status!", error);
    }
  };

  const filteredBillDetails = billDetails.filter(
    detail => detail.BillDetailStatus === "Đã giao hàng"
  );

  return (
    <div style={{ overflowY: "scroll", height: "70vh" }}>
      <div>
        <h3>Xin chào {user.UserFirstName} {user.UserLastName}</h3>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Sản phẩm</th>
            <th>Ảnh sản phẩm</th> 
            <th>Ngày vận chuyển</th>
            <th>Số lượng</th>
            <th>Trạng thái đơn hàng</th>
            <th>Shipper</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredBillDetails.length > 0 ? (
            filteredBillDetails.map((detail, index) => (
              <tr key={index}>
                <td>{detail.BillDetailID}</td>
                <td>{productNames[detail.BillDetailID]}</td>
                <td>
                  {productPics[detail.BillDetailID] ? (
                    <img
                      src={productPics[detail.BillDetailID]}
                      alt="Product"
                      style={{ width: '100px', height: 'auto' }}
                    />
                  ) : (
                    <p>Không có ảnh</p>
                  )}
                </td>
                <td>{detail.BillDetailDate}</td>
                <td>{detail.BillQuantity}</td>
                <td>{detail.BillDetailStatus}</td>
                <td>{shipperNames[detail.ShipperID]}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedBillDetailID(detail.BillDetailID);
                      setShowModal(true);
                    }}
                  >
                    Đã nhận hàng
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Không có dữ liệu để hiển thị</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn rằng bạn đã nhận hàng?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirmReceive}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
