import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';


function AddProductForm() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [productName, setPName] = useState('');
    const [productCategory, setSelectedOption] = useState(1);
    const [productPrice, setPPrice] = useState('')
    const [productPic, setPPic] = useState('')
    const [productQuantity, setPQuantity] = useState('')
    const [productDesc, setPDesc] = useState('')

    const [categoryList, setCategories] = useState([{}])

    const [sellerList, setSellerList] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/category/getCategories").then(
          response => response.json()
        ).then(
          data => {
            setCategories(data)
          }
        )
      }, [])

    React.useEffect(() => {
        fetch("http://localhost:5000/seller/get")
            .then(response => response.json())
            .then(data => {
                setSellerList(data)
            })
    }, [])

    const getSellerID = () => {
        const seller = sellerList.find(seller => seller.UserID === user.UserID);
        if (seller) return seller.SellerID;
        else return null;
    }

    const sellerID = getSellerID();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/product/addProduct', {
                sellerID,
                productName,
                productCategory,
                productPrice,
                productPic,
                productQuantity,
                productDesc
            });
            if (response.status === 201) {
                alert("Thêm sản phẩm thành công!");
                // console.log('Product added successfully');
            } else {
                console.error('Failed to add product');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        sellerID ? (
        <Container fluid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', marginTop: '50px', backgroundColor: '#0d6efd', width: '100%', backgroundSize: 'cover'}}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0 ,0, 0.1)' }}>
                <Form onSubmit={handleSubmit}>
                    <h2 style={{ textAlign: 'center' }}>Đăng ký sản phẩm mới cho cửa hàng</h2>
                    <hr />
                    <Form.Group>
                        <Form.Label><b>Tên sản phẩm:</b></Form.Label>
                        <Form.Control type="text" placeholder="Nhập tên sản phẩm" onChange={(e) => setPName(e.target.value)} required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><b>Phân loại sản phẩm:</b></Form.Label><br />
                        
                        <Form.Control as="select" defaultValue={1} onChange={(e) => setSelectedOption(e.target.value)}>
                            {categoryList.map((category, index) => (
                                <option key={index} value={category.CategoryID}>{category.CategoryName}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><b>Giá sản phẩm:</b></Form.Label>
                        <Form.Control type="number" min={0} placeholder="Nhập giá sản phẩm (VND)" onChange={(e) => {setPPrice(e.target.value)
                            if(e.target.value < 0) {
                                window.alert('Giá đang là số âm!')
                                setPPrice(0)
                            }
                        }} required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><b>Hình ảnh sản phẩm:</b></Form.Label><br />
                        <Form.Control type="text" placeholder="Nhập link hình ảnh sản phẩm" onChange={(e) => setPPic(e.target.value)} required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><b>Số lượng trong kho:</b></Form.Label>
                        <Form.Control type="number" min={0} placeholder="Nhập số lượng sản phẩm còn lại trong kho" onChange={(e) => {setPQuantity(e.target.value)
                            if(e.target.value < 0) {
                                window.alert('Số lượng đang là số âm!')
                                setPQuantity(0)
                            }
                        }} required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><b>Mô tả sản phẩm:</b></Form.Label>
                        <Form.Control as="textarea" rows={5} placeholder="Nhập mô tả sản phẩm" onChange={(e) => setPDesc(e.target.value)} required />
                    </Form.Group>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                        <Button variant="danger" onClick={() => navigate('/sellerShopManage')}>
                            Huỷ
                        </Button>
                        <Button variant="primary" type="submit">
                            Đăng bán
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
        ) : navigate('/home')
    );
}

export default AddProductForm;