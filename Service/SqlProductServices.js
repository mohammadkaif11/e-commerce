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
    .input("quantity", sql.Int, data.Quantity)
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
    .input("quantity", sql.Int, data.Quantity)
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
  const page_size = 5;

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
    order.IsCancel = OrderProduct[0]?.IsCancel;
  });

  responsObj.sort(function (a, b) {
    return b.Id - a.Id;
  });

  var lengthOfOrder = responsObj.length;
  const BucketObject = {
    data: responsObj.slice((page_number - 1) * page_size,page_number * page_size),
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
      order.Date = new Date(order.Date).toDateString();
      responsObj.push(order);
    }
  });

  return responsObj;
}

//Update Order
async function UpdateOrders(orderId, adminId, data) {
  var datetime = data.date.length > 0 ? new Date(data.date) : null;
  var IsCancel = data.CancelOrder != undefined ? true : false;
  const pool = await ConenctedToSql();

  //UpdateOrders
  const response = await pool
    .request()
    .input("status", sql.Bit, 1)
    .input("deliveryDate", sql.Date, datetime)
    .input("orderId", sql.Int, orderId)
    .input("adminId", sql.Int, adminId)
    .input("message", sql.VarChar, data.Message)
    .input("isCancel", sql.Bit, IsCancel)
    .query(querys.UPDATEORDERS);

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

  //Get Check Transaction Already Exists
  const Trans = await pool
    .request()
    .input("orderId", sql.Int, orderId)
    .input("adminId", sql.Int, adminId)
    .query(querys.GETRANSBYCHECK);

  if (Trans.recordset.length > 0) {
    //Update trans with new Date
    const currentDate = new Date().toDateString();
    const updateTrans = await pool
      .request()
      .input("orderId", sql.Int, Trans.recordset[0].OrderId)
      .input("adminId", sql.Int, Trans.recordset[0].AdminId)
      .input("id", sql.Int, Trans.recordset[0].Id)
      .input("message", sql.VarChar, data.Message)
      .input("isCancel", sql.Bit, IsCancel)
      .input("date", sql.Date, currentDate)
      .query(querys.UPDATETRANS);

    if (IsCancel == true && Trans.recordset[0].IsCancel == false) {
      //update the product Quanity to  plus
      OrderProducts.recordset.forEach(function (orderProduct) {
        var product = Products.recordset.find(function (product) {
          if (orderProduct.ProductId == product.Id) {
            return product;
          }
        });

        //product is not undefined
        if (product) {
          const ProductQuantity = product.Quantity + orderProduct.Quantity;
          UpdateProductQuantity(product.Id, ProductQuantity, adminId).then(
            (data) => {
              console.log(data);
            }
          );
        }
      });
    } else if (IsCancel == false && Trans.recordset[0].IsCancel == true) {
      //update The prouduct Quantity to minus
      OrderProducts.recordset.forEach(function (orderProduct) {
        var product = Products.recordset.find(function (product) {
          if (orderProduct.ProductId == product.Id) {
            return product;
          }
        });
        //product is not undefined
        if (product) {
          const ProductQuantity = product.Quantity - orderProduct.Quantity;
          UpdateProductQuantity(product.Id, ProductQuantity, adminId).then(
            (data) => {
              console.log(data);
            }
          );
        }
      });
    }
  } else {
    const currentDate = new Date().toDateString();

    var TotalAmount = 0;

    //Get TotalAmount and update Prouducts if order is not cancel
    OrderProducts.recordset.forEach(function (orderProduct) {
      var product = Products.recordset.find(function (product) {
        if (orderProduct.ProductId == product.Id) {
          return product;
        }
      });

      if (product) {
        TotalAmount += product.ProductPrice * orderProduct.Quantity;
        if (IsCancel == false) {
          const ProductQuantity = product.Quantity - orderProduct.Quantity;
          UpdateProductQuantity(product.Id, ProductQuantity, adminId).then(
            (data) => {
              console.log(data);
            }
          );
        }
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
      .input("isCancel", sql.Bit, IsCancel)
      .input("Message", sql.VarChar, data.Message)
      .input("date", sql.Date, currentDate)
      .query(querys.CREATETRANS);

    return response.rowsAffected[0];
  }
}

//Get Transaction
async function GetAllTrans(
  adminId,
  orderDate,
  customerCancel,
  sellerCancel,
  PageNo
) {
  try {
    let pageno = PageNo;
    let pagesize = 10;
    let OrderDate = null;
    let CustomerCancel = null;
    let SellerCancel = null;

    if (orderDate != undefined && orderDate.length > 0) {
      OrderDate = orderDate;
      console.log("Order Date: " + OrderDate);
    }
    if (customerCancel.length > 0) {
      CustomerCancel = 1;
    }
    if (sellerCancel.length > 0) {
      SellerCancel = 1;
    }

    const pool = await ConenctedToSql();
    const response = await pool
      .request()
      .input("AdminId", sql.Int, adminId)
      .input("CustomerCancel", sql.Bit, CustomerCancel)
      .input("SellerCancel", sql.Bit, SellerCancel)
      .input("DeliveryDate", sql.Date, OrderDate)
      .input("Page", sql.Int, pageno)
      .input("Size", sql.Int, pagesize)
      .execute("sp_GetTransaction");

    const TotalTransaction = await pool
      .request()
      .query(`select Count(*) as Total from trans where AdminId=${adminId}`);
    const TotalTransactionNo = TotalTransaction.recordset[0].Total;
    const transaction = response.recordset;

    //convert date to time
    transaction.forEach(function (element) {
      element.Date = new Date(element.Date).toDateString();
      element.OrderDate = new Date(element.OrderDate).toDateString();
    });

    //Sending obj
    const obj = {
      ResponseData: transaction,
      current: parseInt(PageNo),
      pages: Math.ceil(TotalTransactionNo / pagesize),
    };

    return obj;
  } catch (error) {
    console.log(error);
    const obj = {
      ResponseData: [],
      current: 1,
      pages: 0,
    };
    return obj;
  }
}

//////////////////////////////////////////...........
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
      cartObj.Quantity = product.Quantity;
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
  let numPerPage = 4;
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

  const page_size = 5;
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
    //Get OrderProducts by Id
    const OrderProduct = OrderProductArray.filter((Element) => {
      if (Element.OrderId == order.Id) {
        return Element;
      }
    });

    let TotalAmount = 0;
    let DeliveryDate = null;
    let OrderStatus = false;
    let flag_CheckOrderStatus = true;
    let CancelOrder = 0;

    OrderProduct.forEach((orp) => {
      //get Product with product Id
      var product = ProductArray.find(function (element) {
        if (element.Id == orp.ProductId) {
          return element;
        }
      });

      if (orp.IsCancel == true) {
        CancelOrder = CancelOrder + 1;
      }

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

    if (flag_CheckOrderStatus == true) {
      if (CancelOrder == OrderProduct.length) {
        order.Status = OrderStatus;
        order.DeliveryDate = null;
        order.AllCancel = true;
        order.AllPass = false;
      } else {
        if (CancelOrder == 0) {
          order.AllPass = true;
          order.AllCancel = false;
          order.Status = OrderStatus;
          order.DeliveryDate = new Date(DeliveryDate).toDateString();
        } else {
          order.AllPass = false;
          order.AllCancel = false;
          order.Status = OrderStatus;
          order.DeliveryDate = new Date(DeliveryDate).toDateString();
        }
      }
    } else {
      order.Status = false;
      order.DeliveryDate = null;
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

//Cancel Order
async function CancelOrder(id, userId) {
  const pool = await ConenctedToSql();

  const Order = await pool
    .request()
    .input("orderId", sql.Int, id)
    .query(querys.GETORDERBYID);

  //Getall Admin Order
  const CancelOrder = await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("id", sql.Int, id)
    .query(querys.CANCELORDERS);

  const OrderProducts = await pool
    .request()
    .input("orderId", sql.Int, id)
    .query(querys.GETORDERPRODUCTSBYORDERID);

  OrderProducts.recordset.forEach((element) => {
    if (
      element.Status != null &&
      element.Status == true &&
      element.IsCancel != true
    ) {
      UpdateProductQuantityAfterCancel(
        element.ProductId,
        element.Quantity,
        element.AdminId
      ).then((data) => {
        console.log(`update Product Quantity`);
      });
      updateTrans(element.OrderId, element.AdminId).then((data) => {
        console.log("Trans Update");
      });
    }
  });

  return CancelOrder.rowsAffected[0];
}

//Update Product Quantity
async function UpdateProductQuantity(id, quantity, userId) {
  try {
    const pool = await ConenctedToSql();
    const UpdateProduct = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .input("quantity", sql.Int, quantity)
      .query(querys.UPDATEPRODUCTQUANTITY);

    return UpdateProduct.rowsAffected[0];
  } catch (error) {
    console.log(error);
  }
}

//UPdate Product Quantity after Cancel
async function UpdateProductQuantityAfterCancel(id, quantity, userId) {
  try {
    const pool = await ConenctedToSql();
    const UpdateProduct = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .input("quantity", sql.Int, quantity)
      .query(querys.UPDATEPRODUCTQUANTITYAFTERCANCEL);

    return UpdateProduct.rowsAffected[0];
  } catch (error) {
    console.log(error);
  }
}

//Update Trans after user cancle
async function updateTrans(orderId, AdminId) {
  try {
    const pool = await ConenctedToSql();
    const UpdateProduct = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("adminId", sql.Int, AdminId)
      .query(querys.UPDATETRANSAFTERCANCEL);

    return UpdateProduct.rowsAffected[0];
  } catch (error) {
    console.log(error);
  }
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
  CancelOrder,
};
