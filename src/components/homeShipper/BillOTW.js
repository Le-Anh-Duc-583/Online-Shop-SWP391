import React, { useState, useEffect, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useUser } from '../context/UserContext';

export default function BillOTW() {
  const [billDetails, setBillDetails] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userToBillMap, setUserToBillMap] = useState({});
  const [sellerAddresses, setSellerAddresses] = useState({});
  const [productNames, setProductNames] = useState({});
  const { user } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [selectedBillDetailId, setSelectedBillDetailId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [billDetailResponse, shipperResponse] = await Promise.all([
        axios.get("http://localhost:5000/bill/getBillDetail"),
        axios.get('http://localhost:5000/user/getShipper'),
      ]);

      setBillDetails(billDetailResponse.data);

      if (shipperResponse.data) {
        const currentUser = shipperResponse.data.find(shipper => shipper.UserID === user.UserID);
        if (currentUser) {
          setCurrentUserId(currentUser.ShipperID);
        } else {
          console.error('No ShipperID found for the current user!');
        }
      }

      const userToBillMapTemp = {};
      const sellerAddressesTemp = {};
      const productNamesTemp = {};

      await Promise.all(billDetailResponse.data.map(async (billDetail) => {
        const billID = billDetail.BillID;
        const billDetailID = billDetail.BillDetailID;

        const [userResponse, sellerAddressResponse, productResponse] = await Promise.all([
          axios.get(`http://localhost:5000/bill/getUserToBill?billID=${billID}`),
          axios.get(`http://localhost:5000/bill/getSellerAddress?billDetailID=${billDetailID}`),
          axios.get(`http://localhost:5000/bill/getProductToBill?billDetailID=${billDetailID}`),
        ]);

        userToBillMapTemp[billID] = userResponse.data;
        sellerAddressesTemp[billDetailID] = sellerAddressResponse.data[0]?.SellerAddress || 'Địa chỉ không có';

        if (productResponse.data.length > 0) {
          productNamesTemp[billDetailID] = productResponse.data[0].ProductName;
        }
      }));

      setUserToBillMap(userToBillMapTemp);
      setSellerAddresses(sellerAddressesTemp);
      setProductNames(productNamesTemp);
    } catch (error) {
      console.error("There was an error fetching data!", error);
    }
  }, [user.UserID]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleAcceptOrder = async () => {
    try {
      await axios.put("http://localhost:5000/bill/updateBillDetail", {
        BillDetailID: selectedBillDetailId,
        BillDetailStatus: "Đã giao hàng",
        ShipperID: currentUserId,
      });
      fetchData(); 
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleShowModal = (billDetailId) => {
    setSelectedBillDetailId(billDetailId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const filteredBillDetails = billDetails.filter(billDetail => 
    (billDetail.BillDetailStatus === "Đang vận chuyển" ) &&
    (billDetail.ShipperID === null || billDetail.ShipperID === currentUserId)
  );

  const uniqueBillDetailIds = [...new Set(filteredBillDetails.map(billDetail => billDetail.BillDetailID))];

  return (
    <div style={{ overflowY: "scroll", height: "70vh" }}>
      <div>
        <h3>ShipperID của bạn: {currentUserId ? currentUserId : 'Đang tải...'}</h3>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Tên người nhận</th>
            <th>Số lượng sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Ngày tạo đơn hàng</th>
            <th>Địa chỉ giao hàng</th>
            <th>Địa chỉ lấy hàng</th>
            <th>Trạng thái đơn hàng</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {uniqueBillDetailIds.map((billDetailId, index) => {
            const filteredBillDetailsForBillDetailId = filteredBillDetails.filter(billDetail => billDetail.BillDetailID === billDetailId);
            const billQuantity = filteredBillDetailsForBillDetailId.reduce((sum, billDetail) => sum + (billDetail.BillQuantity || 0), 0);
            const billDetailStatus = filteredBillDetailsForBillDetailId[0]?.BillDetailStatus;
            const billID = filteredBillDetailsForBillDetailId[0]?.BillID;
            const productName = productNames[billDetailId] || 'Tên sản phẩm không có';
            const userAddress = userToBillMap[billID]?.[0]?.UserAddress || 'Địa chỉ không có';
            const userFirstName = userToBillMap[billID]?.[0]?.UserFirstName || 'Tên không có';
            const userLastName = userToBillMap[billID]?.[0]?.UserLastName || '';
            const userFullName = `${userFirstName} ${userLastName}`;
            const sellerAddress = sellerAddresses[billDetailId] || 'Địa chỉ không có';
            const billDate = filteredBillDetailsForBillDetailId[0]?.BillDetailDate || 'Ngày không có';
            return (
              <tr key={index}>
                <td>{billDetailId}</td>
                <td>{userFullName}</td>
                <td>{billQuantity}</td>
                <td>{productName}</td>
                <td>{billDate}</td>
                <td>{userAddress}</td>
                <td>{sellerAddress}</td>
                <td>{billDetailStatus}</td>
                <td>
                  {billDetailStatus === "Đang vận chuyển" && (
                    <Button onClick={() => handleShowModal(billDetailId)}>Đã giao hàng</Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>Xác nhận đơn hàng đã giao thành công?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAcceptOrder}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
