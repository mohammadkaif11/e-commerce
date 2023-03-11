const ConenctedToSql = require("../SqlDataContext/Db");
const sql = require("mssql/msnodesqlv8");
const querys = require("../SqlDataContext/Querys/productquery");

//Aws Configuration
const aws = require("aws-sdk");
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.BACKET_NAME;

//S3 BUCKET
const s3 = new aws.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  Bucket: BUCKET_NAME,
});

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
    .input("imageKey", sql.VarChar, data.key)
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
  const productById = await GetProductById(id);
  const params = {
    Bucket: BUCKET_NAME,
    Key: productById[0].ImageKey,
  };
  await s3.deleteObject(params).promise();
  console.log("file deleted Successfully");
  const response = await pool
    .request()
    .input("id", sql.Int, id)
    .input("userId", sql.Int, UserId)
    .query(querys.DELETEPRODUCTS);
  return response.rowsAffected[0];
}

//SQL GET OpenBucket for Admin
async function OpenBucketAdmin(AdminId, page_number) {
  let OrderArray = [];
  let OrderProductArray = [];
  let ProductArray = [];
  const page_size = 3;

  const pool = await ConenctedToSql();

  const Orders = await pool.request().query(querys.GETALLORDER);
  const Products = await pool.request().query(querys.GETPRODUCTS);
  const OrdersProdcuts = await pool
    .request()
    .input("adminId", sql.Int, AdminId)
    .query(querys.GETORDERPRODUCTSADMIN);

  OrderArray = Orders.recordset;
  OrderProductArray = OrdersProdcuts.recordset;
  ProductArray = Products.recordset;

  var responsObj = [];
  OrderArray.forEach((order) => {
    const OrderProduct = OrderProductArray.filter((Element) => {
      if (Element.OrderId == order.Id) {
        return Element;
      }
    });
    if (OrderProduct.length > 0) {
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
      order.Date = new Date(order.Date).toDateString();
      responsObj.push(order);
    }
  
    
    order.Status = OrderProduct[0]?.Status;

    if (OrderProduct[0]?.DeliveryDate != null) {
      order.DeliveryDate = new Date(
        OrderProduct[0]?.DeliveryDate
      ).toDateString();
    }

  });

  responsObj.sort(function (a, b) {
    return b.Id - a.Id;
  });

  var lengthOfOrder = responsObj.length;
  const BucketObject = {
    data: responsObj.slice(
      (page_number - 1) * page_size,
      page_number * page_size
    ),
    current: parseInt(page_number),
    pages: Math.ceil(lengthOfOrder / page_size),
  };
  return BucketObject;
}

//SQL GET bucket order by Id
async function GetBucketOrderById(orderId, AdminId) {
  let OrderArray = [];
  let OrderProductArray = [];
  let ProductArray = [];
  const pool = await ConenctedToSql();

  //get orders
  const Orders = await pool.request().query(querys.GETALLORDER);

  //get product
  const Products = await pool.request().query(querys.GETPRODUCTS);

  //Get Orderproducts
  const OrdersProdcuts = await pool
    .request()
    .input("adminId", sql.Int, AdminId)
    .query(querys.GETORDERPRODUCTSADMIN);


  OrderArray = Orders.recordset;
  OrderProductArray = OrdersProdcuts.recordset;
  ProductArray = Products.recordset;

  var responsObj = [];

  OrderArray.forEach((order) => {
    const OrderProduct = OrderProductArray.filter((Element) => {
      if (Element.OrderId == order.Id && Element.OrderId == orderId) {
        return Element;
      }
    });

    if (OrderProduct.length > 0) {
      let TotalAmount = 0;
      //All OrderProducts with admin
      OrderProduct.forEach((orp) => {

        //get products
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
      order.Date=new Date(order.Date).toDateString();
      responsObj.push(order);
    }
  });

  return responsObj;
}

//Update Order and Create transaction
async function UpdateOrders(orderId, adminId, data) {
  var datetime = new Date(data.date);

  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("status", sql.Bit, 1)
    .input("deliveryDate", sql.Date, datetime)
    .input("orderId", sql.Int, orderId)
    .input("adminId", sql.Int, adminId)
    .query(querys.UPDATEORDERS);

  //Get Check Transaction Already Exists
  const Trans = await pool
    .request()
    .input("orderId", sql.Int, orderId)
    .input("adminId", sql.Int, adminId)
    .query(querys.GETRANSBYCHECK);
  if (Trans.recordset.length > 0) {
    return response.rowsAffected[0];
  } else {
    //Get Order with OrderId
    const order = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(querys.GETORDERBYID);

    //Get OrderProducts with adminId and OrderId
    const OrderProducts = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("adminId", sql.Int, adminId)
      .query(querys.GETORDERPRODUCTSBYID);

    //Get all Products
    const Products = await pool.request().query(querys.GETPRODUCTS);

    var TotalAmount = 0;
    OrderProducts.recordset.forEach(function (orderProduct) {
      var product = Products.recordset.find(function (product) {
        if (orderProduct.ProductId == product.Id) {
          return product;
        }
      });
      //product is not undefined
      if (product) {
        TotalAmount += product.ProductPrice * orderProduct.Quantity;
      }
    });
    //Get paymentMode
    var ModeOfpayment = order.recordset[0].ModePayment;

    //Create trans
    const CreateTrans = await pool
      .request()
      .input("adminId", sql.Int, adminId)
      .input("orderId", sql.Int, orderId)
      .input("totalAmount", sql.Decimal, TotalAmount)
      .input("paymentMode", sql.VarChar, ModeOfpayment)
      .query(querys.CREATETRANS);

    return response.rowsAffected[0];
  }
}

//Get Transaction
async function GetAllTrans(adminId) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("adminId", sql.Int, adminId)
    .query(querys.GETTRANS);

  const transaction = response.recordset;
  transaction.sort(function (a, b) {
    return b.OrderId - a.OrderId;
  });

  return transaction;
}

//.......////////./////////////////////...........
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
async function GetProductByPagination(page, productName, priceRange, callback) {
  let ProuductName = "";
  let PriceRange = 0;
  if (priceRange == "" && productName == "") {
    ProuductName = null;
    PriceRange = null;
  } else if (priceRange != "" && productName == "") {
    ProuductName = null;
    PriceRange = parseInt(priceRange);
  } else if (priceRange == "" && productName != "") {
    ProuductName = productName;
    PriceRange = null;
  } else {
    ProuductName = productName;
    PriceRange = parseInt(priceRange);
  }
  if (priceRange == 0) {
    PriceRange = null;
  }
  var numPerPage = 4;
  const pool = await ConenctedToSql();
  const products = await pool
    .request()
    .query(
      `exec sp_product_Paginated ${page},${numPerPage},${ProuductName},${PriceRange}`
    );
  const newTotalProducts = await pool
    .request()
    .query(`exec TotalProducts ${ProuductName},${PriceRange}`);
  console.log(newTotalProducts);
  const newCount = newTotalProducts.recordset[0].TotalProducts;
  const obj = {
    products: products.recordset,
    current: parseInt(page),
    pages: Math.ceil(newCount / numPerPage),
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
      .input("modePayment", sql.VarChar, obj.modeOfPayment)
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
    PlacedOrder(userId).then((Data) => {
      return true;
    });
    return false;
  } catch (error) {
    console.log(error);
  }
}

//SQL GET ORDER FOR USER with pagination
async function GetOrder(userId, page_number) {
  let OrderArray = [];
  let OrderProductArray = [];
  let ProductArray = [];
  const page_size = 3;
  const pool = await ConenctedToSql();

  //Getall Admin Order
  const Orders = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.GETORDER);

  //Get All OrderProducts
  const OrdersProdcuts = await pool.request().query(querys.GETORDERPRODUCTS);

  //Get All Products
  const Products = await pool.request().query(querys.GETPRODUCTS);

  OrderArray = Orders.recordset;
  OrderProductArray = OrdersProdcuts.recordset;
  ProductArray = Products.recordset;

  OrderArray.forEach((order) => {
    //Get OrderProduct by Id
    const OrderProduct = OrderProductArray.filter((Element) => {
      if (Element.OrderId == order.Id) {
        return Element;
      }
    });

    let TotalAmount = 0;
    let OrderStatus = false;
    let flag_CheckOrderStatus = true;
    let DeliveryDate = null;

    OrderProduct.forEach((orp) => {
      //get Product with product Id
      var product = ProductArray.find(function (element) {
        if (element.Id == orp.ProductId) {
          return element;
        }
      });

      //Changing Status
      if (orp.Status != null || orp.Status == true) {
        OrderStatus = true;
      } else {
        OrderStatus = false;
        flag_CheckOrderStatus = false;
      }

      //changing Delivery Date
      if (orp.DeliveryDate != null) {
        if (DeliveryDate == null) {
          DeliveryDate = orp.DeliveryDate;
        }
        if (
          new Date(DeliveryDate).getTime() <
          new Date(orp.DeliveryDate).getTime()
        ) {
          DeliveryDate = orp.DeliveryDate;
        }
      } else {
        DeliveryDate = null;
      }

      //adding product details
      orp.ProductName = product.ProductName;
      orp.ProductPrice = product.ProductPrice;
      orp.ProductDescription = product.ProductDescription;
      orp.ImageUrl = product.ImageUrl;
      orp.ProductTotal = orp.Quantity * product.ProductPrice;
      TotalAmount = TotalAmount + orp.Quantity * product.ProductPrice;
    });

    order.OrderProducts = OrderProduct;
    order.TotalAmount = TotalAmount;
    order.Date = new Date(order.Date).toDateString();

    //if all Order status is completed
    if (flag_CheckOrderStatus == true) {
      order.Status = OrderStatus;
      order.DeliveryDate = new Date(DeliveryDate).toDateString();
    }else{
      order.Status = false;
      order.DeliveryDate =null;
    }
  });

  //Sort the Order
  OrderArray.sort(function (a, b) {
    return b.Id - a.Id;
  });

  //length Or Order
  var lengthOfOrder = OrderArray.length;

  //obj
  const OrderObj = {
    Order: OrderArray.slice(
      (page_number - 1) * page_size,
      page_number * page_size
    ),
    current: parseInt(page_number),
    pages: Math.ceil(lengthOfOrder / page_size),
  };
  return OrderObj;
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
  GetBucketOrderById,
  UpdateOrders,
  GetAllTrans,
};
