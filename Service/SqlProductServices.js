const ConenctedToSql = require("../SqlDataContext/Db");
const sql = require("mssql/msnodesqlv8");
const querys = require("../SqlDataContext/Querys/productquery");


//addProducts by admin
async function AddProduct(data) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productName", sql.VarChar, data.ProductName)
    .input("productPrice", sql.VarChar, data.ProductPrice)
    .input("productDescription", sql.VarChar, data.ProductDescription)
    .input("imageUrl", sql.VarChar, data.url)
    .input("userId", sql.Int, data.UserId)
    .input("imageKey",sql.VarChar,data.key)
    .query(querys.ADDPRODUCTS);
  return response.rowsAffected[0];
}

//get all admin products
async function GetAllAdminProduct(UserId) {
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .input("userId", sql.Int, UserId)
    .query(querys.GETADMINPRODUCTS);
  console.log(products);
  return products.recordset;
}

//Get Products By Id  by admin
async function GetProductByIds(productId) {
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .input("id", sql.Int, productId)
    .query(querys.GETPRODUCTBYID);
  return products.recordset;
}

//update products by admin
async function UpdateProduct(data, UserId) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productName", sql.VarChar, data.ProductName)
    .input("productPrice", sql.VarChar, data.ProductPrice)
    .input("productDescription", sql.VarChar, data.ProductDescription)
    .input("imageUrl", sql.VarChar, data.url)
    .input("id", sql.Int, data._id)
    .input("userId", sql.Int, UserId)
    .query(querys.UPDATEPRODUCT);
  return response.rowsAffected[0];
}

//delete products by admin
async function DeleteProduct(id, UserId) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("id", sql.Int, id)
    .input("userId", sql.Int, UserId)
    .query(querys.DELETEPRODUCTS);
  return response.rowsAffected[0];
}

//.......////////./////////////////////.......
//getallProducts for users

async function GetAllProduct() {
  const pool = await ConenctedToSql();
  const products = await pool.request().query(querys.GETPRODUCTS);
  console.log(products);
  return products.recordset;
}

//GET PRODUCTS BY ID Done
async function GetProductById(productId) {
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .input("id", sql.Int, productId)
    .query(querys.GETPRODUCTBYID);
  return products.recordset;
}

//add to cart By User Done
async function AddtoCart(productId, user_id, adminId) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("productId", sql.Int, productId)
    .input("userId", sql.Int, user_id)
    .input("adminId", sql.Int, adminId)
    .query(querys.ADDCART);
  return response.rowsAffected[0];
}

//GetAllCart by User Done
async function GetAllCart(user_id) {
  const pool = await ConenctedToSql();
  const responsObj = [];
  const products = await pool.request().query(querys.GETPRODUCTS);

  const cart = await pool
    .request()
    .input("userId", sql.Int, user_id)
    .query(querys.GETCART);

  console.log(products);
  console.log(cart);

  cart.recordset.forEach((cartObj) => {
    var product = products.recordset.find((productObj) => {
      if (cartObj.ProductId == productObj.Id) {
        return productObj;
      }
    });
    if (product != undefined) {
      cartObj.ProductId = product.Id;
      cartObj.ProductName = product.ProductName;
      cartObj.ProductDescription = product.ProductDescription;
      cartObj.ProductPrice = product.ProductPrice;
      cartObj.ImageUrl = product.ImageUrl;
      responsObj.push(cartObj);
    }
  });
  console.log(responsObj);
  return responsObj;
}

//Remove cart by User Done
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

//confirm Order
async function ConfirmOrder(userId, obj) {
  try {
    var datetime = new Date();
    const pool = await ConenctedToSql();
    const response = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("address", sql.VarChar, obj.Address)
      .input("pincode", sql.VarChar, obj.Pincode)
      .input("date", sql.Date, datetime)
      .query(querys.ADDORDER);
    const LastOrder = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(querys.GETLASTORDER);
    const LastOrderId = LastOrder.recordset[LastOrder.recordset.length - 1].Id;
    for (var i = 0; i < obj.ProductId.length; i++) {
      const saveProducts = await pool
        .request()
        .input("orderId", sql.Int, LastOrderId)
        .input("productId", sql.Int, obj.ProductId[i])
        .input("adminId", sql.Int, obj.AdminId[i])
        .input("quantity", sql.Int, obj.ProductQuantity[i])
        .query(querys.ADDORDERPRODUCTS);
    }
    PlacedOrder(userId).then((Data)=>{
      return true;
    })
    return false;
  } catch (error) {
    console.log(error);
  }
}

//SQL GET ORDER FOR USER
async function GetOrder(userId) {
  let OrderArray = [];
  let OrderProductArray = [];
  let ProductArray = [];
  const pool = await ConenctedToSql();

  const Orders = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.GETORDER);

  const OrdersProdcuts = await pool.request().query(querys.GETORDERPRODUCTS);

  const Products = await pool.request().query(querys.GETPRODUCTS);

  OrderArray = Orders.recordset;
  OrderProductArray = OrdersProdcuts.recordset;
  ProductArray = Products.recordset;

  OrderArray.forEach((order) => {
    const OrderProduct = OrderProductArray.filter((Element) => {
      if (Element.OrderId == order.Id) {
        return Element;
      }
    });
    let TotalAmount = 0;
    OrderProduct.forEach((orp) => {
      var product = ProductArray.find(function (element) {
        if (element.Id == orp.ProductId) {
          return element;
        }
      });
      orp.ProductName = product.ProductName;
      orp.ProductPrice = product.ProductPrice;
      orp.ProductDescription = product.ProductDescription;
      orp.ImageUrl = product.ImageUrl;
      orp.ProductTotal = orp.Quantity * product.ProductPrice;
      TotalAmount = TotalAmount + orp.Quantity * product.ProductPrice;
    });
    order.OrderProducts = OrderProduct;
    order.TotalAmount = TotalAmount;
  });

  return OrderArray;
}


//SQL GET OpenBucket for Admin
async function OpenBucketAdmin(AdminId) {
  let OrderArray = [];
  let OrderProductArray = [];
  let ProductArray = [];
  const pool = await ConenctedToSql();

  const Orders = await pool
    .request()
    .query(querys.GETALLORDER);

  const Products = await pool.request().query(querys.GETPRODUCTS);

  const OrdersProdcuts = await pool.request()
  .input("adminId",sql.Int,AdminId).query(querys.GETORDERPRODUCTSADMIN);

  OrderArray = Orders.recordset;
  OrderProductArray = OrdersProdcuts.recordset;
  ProductArray = Products.recordset;

   var responsObj=[];
  OrderArray.forEach((order) => {
    const OrderProduct = OrderProductArray.filter((Element) => {
      if (Element.OrderId == order.Id) {
        return Element;
      }
    });
    if(OrderProduct.length>0){
      let TotalAmount = 0;
      OrderProduct.forEach((orp) => {
        var product = ProductArray.find(function (element) {
          if (element.Id == orp.ProductId) {
            return element;
          }
        });
        orp.ProductName = product.ProductName;
        orp.ProductPrice = product.ProductPrice;
        orp.ProductDescription = product.ProductDescription;
        orp.ImageUrl = product.ImageUrl;
        orp.ProductTotal = orp.Quantity * product.ProductPrice;
        TotalAmount = TotalAmount + orp.Quantity * product.ProductPrice;
      });
      order.OrderProducts = OrderProduct;
      order.TotalAmount = TotalAmount;
      responsObj.push(order);
    }
  });
  return responsObj;
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
  GetAllAdminProduct,
  ConfirmOrder,
  GetOrder,
  OpenBucketAdmin,
};
