import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function EditBannerModal({ show, onHide, Banner, onUpdate }) {
  const [adminID, setAdminID] = useState(Banner.AdminID)
  const [categoryID, setCategoryID] = useState(Banner.CategoryID)
  const [bannerPic, setBannerPic] = useState(Banner.BannerPic)
  const [bannerID, setBannerID] = useState(Banner.BannerID)
  const { user} = useUser();
  const [admins, setAdmins] = useState([{}]);

  useEffect(() => {
    setAdminID(Banner.AdminID)
    setCategoryID(Banner.CategoryID)
    setBannerPic(Banner.BannerPic)
    setBannerID(Banner.BannerID)
  }, [Banner.AdminID, Banner.CategoryID, Banner.BannerPic, Banner.BannerID])

  const [categories, setCategory] = useState([{}])
  useEffect(() => {
    fetch("http://localhost:5000/category/getCategories").then(
      response => response.json()
    ).then(
      data => {
        setCategory(data)
      }
    )
  }, [])

  function getCategory(id) {
    let intID = +id;
    let cate = categories.find(cate => cate.CategoryID === intID)
    return cate ? cate.CategoryName : 'Category not found'
  }

  useEffect(() => {
    fetch("http://localhost:5000/admin/get").then(
      response => response.json()
    ).then(
      data => {
        setAdmins(data)
      }
    )
  }, [])

  function getAdminID(id) {
    let intID = +id;
    let admin = admins.find(admin => admin.UserID === intID)
    return admin ? admin.AdminID : 'Admin not found'
  }

  let banneru = {
    AdminID: adminID,
    CategoryID: categoryID,
    BannerID: bannerID,
    BannerPic: bannerPic,
    UserAccountName: user.UserAccountName,
    UserFirstName: user.UserFirstName,
    UserLastName: user.UserLastName,
    CategoryName: (getCategory(categoryID))
  }

  const handleClick = () => {
    try{
      onHide();
      setAdminID(getAdminID(user.UserID));
    }catch(error){
      console.error('Error:', error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/banner/edit/' + Banner.BannerID, {
        adminID,
        bannerPic,
        categoryID,
      });
      //console.dir(banneru)
      onUpdate(banneru)
      if (response.status === 200) {
        console.log('Banner edited successfully');
      } else {
        console.error('Failed to edit Banner');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (

    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Banner</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Label>Danh mục Banner</Form.Label>
          <Form.Select aria-label="Default select example" onChange={(e) => setCategoryID(e.target.value)} defaultValue={Banner.CategoryID}>
            <option hidden>{Banner.CategoryName}</option>
            {categories.map((category) => (
              <option value={category.CategoryID}>{category.CategoryName}</option>
            ))}
          </Form.Select>
          <Form.Label>Baner Image Url</Form.Label>
          <Form.Control type="text" onChange={(e) => setBannerPic(e.target.value)} defaultValue={Banner.BannerPic} />
          <Form.Label>Admin</Form.Label>
          <Form.Control type="text" value={user.UserAccountName+" ("+user.UserFirstName+" "+user.UserLastName+")"} disabled readOnly />
          <Button variant="primary" type="submit" style={{ marginTop: '30px' }} onClick={handleClick}>
            Save change
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditBannerModal;