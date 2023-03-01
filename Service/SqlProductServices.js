const ConenctedToSql = require("../SqlDataContext/Db");
const sql = require("mssql/msnodesqlv8");
const querys = require("../SqlDataContext/Querys/productquery");

//addProducts
async function AddProduct(data) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productName", sql.VarChar, data.ProductName)
    .input("productPrice", sql.VarChar, data.ProductPrice)
    .input("productDescription", sql.VarChar, data.ProductDescription)
    .input("imageUrl", sql.VarChar, data.url)
    .query(querys.ADDPRODUCTS);
  return response.rowsAffected[0];
}

//getallProducts
async function GetAllProduct() {
  const pool = await ConenctedToSql();
  const products = await pool.request().query(querys.GETPRODUCTS);
  console.log(products);
  return products.recordset;
}

//add to cart
async function AddtoCart(productId, user_id) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productId", sql.Int, productId)
    .input("userId", sql.Int, user_id)
    .query(querys.ADDCART);
  return response.rowsAffected[0];
}

//GetAllCart
async function GetAllCart(user_id) {
  const pool = await ConenctedToSql();

  const responsObj = [];
  const products = await pool.request().query(querys.GETPRODUCTS);

  const cart = await pool
    .request()
    .input("userId", user_id)
    .query(querys.GETCART);

  cart.recordset.forEach((cartObj) => {
    const productFilter = products.recordset.filter((product) => {
      if ((product.Id = cartObj.ProductId)) {
        return product;
      }
    });
    if (cartObj.ProductId == productFilter[0].Id) {
      cartObj.ProductId = productFilter[0].Id;
      cartObj.ProductName = productFilter[0].ProductName;
      cartObj.ProductDescription = productFilter[0].ProductDescription;
      cartObj.ProductPrice = productFilter[0].ProductPrice;
      cartObj.ImageUrl = productFilter[0].ImageUrl;
      responsObj.push(cartObj);
    }
  });

  return responsObj;
}

//GET PRODUCTS BY ID
async function GetProductById(productId) {
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .input("id", sql.Int, productId)
    .query(querys.GETPRODUCTBYID);
  return products.recordset;
}

//Get Products By Id admin
async function GetProductByIds(productId) {
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .input("id", sql.Int, productId)
    .query(querys.GETPRODUCTBYID);
  return products.recordset;
}

//update products
async function UpdateProduct(data) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productName", sql.VarChar, data.ProductName)
    .input("productPrice", sql.VarChar, data.ProductPrice)
    .input("productDescription", sql.VarChar, data.ProductDescription)
    .input("imageUrl", sql.VarChar, data.url)
    .input("id", sql.Int, data._id)
    .query(querys.UPDATEPRODUCT);
  return response.rowsAffected[0];
}

//delete products
async function DeleteProduct(id) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("id", sql.Int, id)
    .query(querys.DELETEPRODUCTS);
  return response.rowsAffected[0];
}

//Remove cart
async function RemoveCart(productId, userId) {
  console.log(productId, userId);
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productId", sql.Int, productId)
    .input("userId", sql.Int, userId)
    .query(querys.DELETECART);
  return response.rowsAffected[0];
}

//PLACE ORDER
async function PlacedOrder(userId) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.PLACEORDER);
  return response.rowsAffected[0];
}

//Get Paginated
async function GetProductByPagination(page, callback) {
  var numPerPage = 5;
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .query(`exec sp_product_Paginated ${page},${numPerPage}`);
  const TotolProducts = await pool.request().query(querys.COUNT);
  const count = TotolProducts.recordset[0].Totalproducts;
  const obj = {
    products: products.recordset,
    current: parseInt(page),
    pages: Math.ceil(count / numPerPage),
  };
  callback(obj);
}


module.exports = {
  AddProduct,
  GetAllProduct,
  AddtoCart,
  GetAllCart,
  GetProductById,
  GetProductByIds,
  UpdateProduct,
  DeleteProduct,
  RemoveCart,
  PlacedOrder,
  GetProductByPagination,
};
