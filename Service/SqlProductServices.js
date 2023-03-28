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
  const response = await pool
    .request()
    .input("id", sql.Int, id)
    .input("userId", sql.Int, UserId)
    .query(querys.DELETEPRODUCTS);
  return response.rowsAffected[0];
}

//SQL GET OpenBucket for Admin
async function Old_OpenBucketAdmin(AdminId, page_number) {
  const page_size = 5;
  let OrderArray = [];
  let OrderProductArray = [];
  let ProductArray = [];

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
    data: responsObj.slice(
      (page_number - 1) * page_size,
      page_number * page_size
    ),
    current: parseInt(page_number),
    pages: Math.ceil(lengthOfOrder / page_size),
  };
  return BucketObject;
}

//SQL GET OpenBucket for Admin------------------------
async function OpenBucketAdmin(AdminId, pageNumber) {
  let pagesize = 10;
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("AdminId", sql.Int, AdminId)
    .input("Page", sql.Int, pageNumber)
    .input("Size", sql.Int, pagesize)
    .execute("sp_getAdminBucket");
  response.recordset.forEach(function (elements) {
    elements.Date = new Date(elements.Date).toDateString();
    if (elements.DeliveryDate != null) {
      elements.DeliveryDate = new Date(elements.DeliveryDate).toDateString();
    }
    if (elements.Status == null) {
      elements.StatusMsg = "Pending";
    } else {
      if (elements.Status == false) {
        elements.StatusMsg = "Seller Cancel";
      } else {
        elements.StatusMsg = "Seller Update Status";
      }
    }
  });
  const totalOrderProducts = await pool
    .request()
    .input("adminId", sql.Int, AdminId)
    .query(querys.GETTOTALORDERSPRODUCTSBYADMIN);
  let TotalOrderProducts = parseInt(totalOrderProducts.recordset[0].TOTAL);

  const BucketObject = {
    data: response.recordset,
    current: parseInt(pageNumber),
    pages: Math.ceil(TotalOrderProducts / pagesize),
  };
  return BucketObject;
}

//SQL GET bucket order by Id
async function GetBucketOrderById(orderId, AdminId) {
  const pool = await ConenctedToSql();
  const products = await pool.request().query(querys.GETPRODUCTS);

  const response = await pool
    .request()
    .input("AdminId", sql.Int, AdminId)
    .input("OrderId", sql.Int, orderId)
    .execute("sp_getAdminOrder");

  response.recordset.forEach(function (elements) {
    elements.Date = new Date(elements.Date).toDateString();
    let OrderProducts = JSON.parse(elements.OrderProducts);

    for (let j = 0; j < OrderProducts.length; j++) {
      var product = products.recordset.find((productObj) => {
        if (OrderProducts[j].ProductId == productObj.Id) {
          return productObj;
        }
      });

      if (product) {
        OrderProducts[j].ProductName = product.ProductName;
        OrderProducts[j].ImageUrl = product.ImageUrl;
        OrderProducts[j].Price = product.ProductPrice;
        OrderProducts[j].TotalPrice =
          OrderProducts[j].Quantity * product.ProductPrice;
      }
    }
    elements.OrderProducts = OrderProducts;
  });

  return response.recordset;
}

//Update Order
async function UpdateOrders(orderId, adminId, data) {
  try {
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
        let orderProducts = JSON.parse(
          OrderProducts.recordset[0].OrderProducts
        );

        orderProducts.forEach(function (orderProduct) {
          let product = Products.recordset.find(function (product) {
            if (orderProduct.ProductId == product.Id) {
              return product;
            }
          });
          if (product) {
            const ProductQuantity = parseInt(product.Quantity) + parseInt(orderProduct.Quantity);
            UpdateProductQuantity(product.Id, ProductQuantity, adminId).then(
              (data) => {
                //
              }
            );
          }
        });
        return 1;
      } else if (IsCancel == false && Trans.recordset[0].IsCancel == true) {
        let orderProducts = JSON.parse(
          OrderProducts.recordset[0].OrderProducts
        );

        //update The prouduct Quantity to minus
        orderProducts.forEach(function (orderProduct) {
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
                // console.log(data);
              }
            );
          }
        });
        return 1;
      }
    } else {
      const currentDate = new Date().toDateString();
      let ModeOfpayment = order.recordset[0].ModePayment;
      let orderProducts = JSON.parse(OrderProducts.recordset[0].OrderProducts);

      orderProducts.forEach(function (orderProduct) {
        var product = Products.recordset.find(function (product) {
          if (orderProduct.ProductId == product.Id) {
            return product;
          }
        });

        if (product) {
          if (IsCancel == false) {
            const ProductQuantity = product.Quantity - orderProduct.Quantity;
            UpdateProductQuantity(product.Id, ProductQuantity, adminId).then(
              (data) => {
                // console.log(data);
              }
            );
          }
        }
      });
      const CreateTrans = await pool
        .request()
        .input("adminId", sql.Int, adminId)
        .input("orderId", sql.Int, orderId)
        .input(
          "totalAmount",
          sql.Decimal,
          OrderProducts.recordset[0].TotalAmount
        )
        .input("paymentMode", sql.VarChar, ModeOfpayment)
        .input("isCancel", sql.Bit, IsCancel)
        .input("Message", sql.VarChar, data.Message)
        .input("date", sql.Date, currentDate)
        .query(querys.CREATETRANS);

      return 1;
    }
  } catch (error) {
    console.log("Error : ", error);
    return 0;
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
    console.log("Error: " + error.message);
    const obj = {
      ResponseData: [],
      current: 1,
      pages: 0,
    };
    return obj;
  }
}

//////////////////////////////////////////...........

//SQL GET ORDER FOR USER with pagination new functionality----------------------------------------------------------------
async function GetOrder(userId, page_number) {
  let pagesize = 5;
  const pool = await ConenctedToSql();
  const products = await pool.request().query(querys.GETPRODUCTS);
  const TotalOrder = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.GETTOTALORDERSBYUSER);
  let TotalOrderTotal = TotalOrder.recordset[0].TOTAL;

  const response = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("Page", sql.Int, page_number)
    .input("Size", sql.Int, pagesize)
    .execute("sp_getuserorder");
  const data = response.recordset;

  let OrderId = -1;
  let ResponseObj = [];
  let Obj = {};

  //Create Order Object
  for (let i = 0; i < data.length; i++) {
    if (data[i].OrderId === OrderId) {
      if (OrderId === -1) {
        Obj = {
          Address: data[i].Address,
          ModeOfpayment: data[i].ModePayment,
          Pincode: data[i].Pincode,
          OrderDate: new Date(data[i].Date).toDateString(),
          OrderId: data[i].OrderId,
          CustomerCancel: data[i].CustomerCancel,
          Products: [],
          TotalAmount: data[i].TotalAmount,
        };
        let ProductDetails = {
          Products: JSON.parse(data[i].OrderProducts),
          Status: data[i].Status,
          DeliveryDate: data[i].DeliveryDate,
          IsCancel: data[i].IsCancel,
        };

        Obj.Products.push(ProductDetails);
        ResponseObj.push(Obj);
        OrderId = data[i].OrderId;
      } else {
        Obj.TotalAmount += data[i].TotalAmount;
        let ProductDetails = {
          Products: JSON.parse(data[i].OrderProducts),
          Status: data[i].Status,
          DeliveryDate: data[i].DeliveryDate,
          IsCancel: data[i].IsCancel,
        };
        Obj.Products.push(ProductDetails);
        OrderId = data[i].OrderId;
      }
    } else {
      Obj = {
        Address: data[i].Address,
        ModeOfpayment: data[i].ModePayment,
        Pincode: data[i].Pincode,
        OrderDate: new Date(data[i].Date).toDateString(),
        OrderId: data[i].OrderId,
        CustomerCancel: data[i].CustomerCancel,
        Products: [],
        TotalAmount: data[i].TotalAmount,
      };
      let ProductDetails = {
        Products: JSON.parse(data[i].OrderProducts),
        Status: data[i].Status,
        DeliveryDate: data[i].DeliveryDate,
        IsCancel: data[i].IsCancel,
      };
      Obj.Products.push(ProductDetails);
      ResponseObj.push(Obj);
      OrderId = data[i].OrderId;
    }
  }

  let Status = true;
  let DeliveryDate = null;

  //Delivery Date and Status Update
  for (let i = 0; i < ResponseObj.length; i++) {
    let TempProducts = ResponseObj[i].Products;
    for (let i = 0; i < TempProducts.length; i++) {
      if (TempProducts[i].Status == null) {
        Status = false;
      }
      if (
        TempProducts[i].DeliveryDate !== null ||
        new Date(TempProducts[i].DeliveryDate) > new Date(DeliveryDate)
      ) {
        DeliveryDate = new Date(TempProducts[i].DeliveryDate).toDateString();
      }
    }

    if (ResponseObj[i].CustomerCancel == true) {
      ResponseObj[i].IsAllStatusUpdate = true;
      ResponseObj[i].Message = "Order Cancelled";
      ResponseObj[i].OrderStatus = "Updated";
      ResponseObj[i].DeliveryDate = null;
    } else if (Status == true && DeliveryDate != null) {
      ResponseObj[i].DeliveryDate = DeliveryDate;
      ResponseObj[i].IsAllStatusUpdate = true;
      ResponseObj[i].Message = "Approved By seller";
      ResponseObj[i].OrderStatus = "Updated";
    } else if (Status == true && DeliveryDate == null) {
      ResponseObj[i].DeliveryDate = null;
      ResponseObj[i].IsAllStatusUpdate = false;
      ResponseObj[i].Message = "seller  Cancel Your Order";
      ResponseObj[i].OrderStatus = "Updated";
    } else {
      ResponseObj[i].DeliveryDate = null;
      ResponseObj[i].IsAllStatusUpdate = false;
      ResponseObj[i].Message = "Your Order is not Updated";
      ResponseObj[i].OrderStatus = "Not Updated yet";
    }
  }

  //Product image maps
  for (let i = 0; i < ResponseObj.length; i++) {
    let TempProducts = ResponseObj[i].Products;
    for (let i = 0; i < TempProducts.length; i++) {
      let Productarray = TempProducts[i].Products;
      for (let j = 0; j < Productarray.length; j++) {
        var product = products.recordset.find((productObj) => {
          if (Productarray[j].ProductId == productObj.Id) {
            return productObj;
          }
        });

        if (product) {
          Productarray[j].ProductName = product.ProductName;
          Productarray[j].ImageUrl = product.ImageUrl;
          Productarray[j].Price = product.ProductPrice;
          Productarray[j].ProductTotal =
            Productarray[j].Quantity * product.ProductPrice;
        }
      }
    }
  }

  const OrderObj = {
    Order: ResponseObj,
    current: parseInt(page_number),
    pages: Math.ceil(TotalOrderTotal / pagesize),
  };

  return OrderObj;
}

//getallProducts for users
async function GetAllProduct() {
  const pool = await ConenctedToSql();
  const products = await pool.request().query(querys.GETPRODUCTS);
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
  let UserCartExist = await pool
    .request()
    .input("userId", sql.Int, user_id)
    .query(querys.CECKUSERINCART);
  if (UserCartExist.recordset.length > 0) {
    let ProductCarts = UserCartExist.recordset[0].CartProducts;
    let ObjArray = JSON.parse(ProductCarts);
    let ProductAlreadyExist = ObjArray.find(function (product) {
      if (product.ProductId == productId) {
        return product;
      }
    });
    if (ProductAlreadyExist) {
      return 1;
    }
    let obj = {
      ProductId: productId,
      AdminId: adminId,
      Quantity: 1,
    };
    ObjArray.push(obj);
    let data = JSON.stringify(ObjArray);
    const response = await pool
      .request()
      .input("cartProducts", sql.VarChar, data)
      .input("userId", sql.Int, user_id)
      .query(querys.UPDATECART);
    return response.rowsAffected[0];
  } else {
    let ObjArray = [];
    let obj = {
      ProductId: productId,
      AdminId: adminId,
      Quantity: 1,
    };
    ObjArray.push(obj);
    let data = JSON.stringify(ObjArray);
    const response = await pool
      .request()
      .input("cartProducts", sql.VarChar, data)
      .input("userId", sql.Int, user_id)
      .query(querys.ADDCART);
    return response.rowsAffected[0];
  }
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

  if (cart.recordset.length > 0) {
    let CartsProducts = JSON.parse(cart.recordset[0].CartProducts);
    cart.recordset[0].CartProducts = CartsProducts;

    cart.recordset[0].CartProducts.forEach((cartObj) => {
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

    return responsObj;
  } else {
    return [];
  }
}

//Remove cart by User Done
async function RemoveCart(productId, userId) {
  const pool = await ConenctedToSql();
  const cart = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.GETCART);
  let CartsObj = [];
  let CartsProducts = JSON.parse(cart.recordset[0].CartProducts);

  CartsProducts.forEach(function (product) {
    if (product.ProductId != productId) {
      CartsObj.push(product);
    }
  });

  let data = JSON.stringify(CartsObj);
  const response = await pool
    .request()
    .input("cartProducts", sql.VarChar, data)
    .input("userId", sql.Int, userId)
    .query(querys.UPDATECART);
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
    let UniqueAdminId = [...new Set(obj.AdminId)];
    var datetime = new Date();
    const pool = await ConenctedToSql();
    const products = await pool.request().query(querys.GETPRODUCTS);
    const response = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("address", sql.VarChar, obj.Address)
      .input("pincode", sql.VarChar, obj.Pincode)
      .input("date", sql.Date, datetime)
      .input("modePayment", sql.VarChar, obj.modeOfPayment)
      .query(querys.ADDORDER);

    const OrderId = response.recordset[0].SCOPE_IDENTITY;
    let orderProducts = [];
    let TotalItemQuantity = 0;
    let TotalPrice = 0;

    for (var j = 0; j < UniqueAdminId.length; j++) {
      //type of check whethe it is single order or not
      if (typeof obj.ProductId != "string") {
        for (var i = 0; i < obj.ProductId.length; i++) {
          var product = products.recordset.find((productObj) => {
            if (obj.ProductId[i] == productObj.Id) {
              return productObj;
            }
          });
          if (obj.AdminId[i] == UniqueAdminId[j]) {
            let Obj = {
              ProductId: obj.ProductId[i],
              Quantity: obj.ProductQuantity[i],
            };
            if (product) {
              TotalPrice +=
                product.ProductPrice * parseInt(obj.ProductQuantity[i]);
              TotalItemQuantity += parseInt(obj.ProductQuantity[i]);
              orderProducts.push(Obj);
              AdminId = obj.AdminId[i];
            }
          }
        }
      } else {
        var product = products.recordset.find((productObj) => {
          if (obj.ProductId == productObj.Id) {
            return productObj;
          }
        });
        if (obj.AdminId == UniqueAdminId[0]) {
          let Obj = {
            ProductId: obj.ProductId,
            Quantity: obj.ProductQuantity,
          };
          if (product) {
            TotalPrice += product.ProductPrice * parseInt(obj.ProductQuantity);
            TotalItemQuantity += parseInt(obj.ProductQuantity);
            orderProducts.push(Obj);
            AdminId = obj.AdminId;
          }
        }
      }

      let data = JSON.stringify(orderProducts);
      const saveProducts = await pool
        .request()
        .input("orderId", sql.Int, OrderId)
        .input("orderProducts", sql.VarChar, data)
        .input("adminId", sql.Int, UniqueAdminId[j])
        .input("totalAmount", sql.Int, TotalPrice)
        .input("totalItemQuantity", sql.Int, TotalItemQuantity)
        .query(querys.ADDORDERPRODUCTS);
      orderProducts = [];
      TotalItemQuantity = 0;
      TotalPrice = 0;
    }

    const placedOrder = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(querys.PLACEORDER);

    return placedOrder.rowsAffected[0];
  } catch (error) {
    console.log("Error : " + error.message);
  }
}

//SQL GET ORDER FOR USER with pagination
async function Old_GetOrder(userId, page_number) {
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
      const Products = JSON.parse(element.OrderProducts);
      Products.forEach((product) => {
        UpdateProductQuantityAfterCancel(
          product.ProductId,
          product.Quantity,
          element.AdminId
        ).then((data) => {
          // console.log(`update Product Quantity`);
        });
        updateTrans(element.OrderId, element.AdminId).then((data) => {
          // console.log("Trans Update");
        });
      });
    }
  });
  return true;
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
    console.log("Error : ", error.message);
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
    console.log("Error : " + error.message);
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
    console.log("Error : " + error.message);
  }
}

//+1 in cart Products
async function addProductsInCart(productId, userId) {
  const pool = await ConenctedToSql();
  let flag = 0;

  let UserCartExist = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.CECKUSERINCART);

  const products = await pool
    .request()
    .input("id", sql.Int, productId)
    .query(querys.GETPRODUCTBYID);
  let product = products.recordset;

  if (UserCartExist.recordset.length > 0) {
    let ProductCarts = UserCartExist.recordset[0].CartProducts;
    let ObjArray = JSON.parse(ProductCarts);
    ObjArray.map(function (element) {
      if (element.ProductId == productId) {
        if (product[0].Quantity < element.Quantity + 1) {
          Msg = "Product quantity is not enough";
          return false;
        } else {
          element.Quantity = element.Quantity + 1;
          flag = 1;
        }
      }
    });
    if (flag == 1) {
      let data = JSON.stringify(ObjArray);
      const response = await pool
        .request()
        .input("cartProducts", sql.VarChar, data)
        .input("userId", sql.Int, userId)
        .query(querys.UPDATECART);
      Msg = "Increment Product quantity with 1";
      return true;
    }
  }
  Msg = "User cart does not exist";
  return false;
}

//-1 in cart Products
async function UpdateRemoveCart(productId, userId) {
  const pool = await ConenctedToSql();

  let UserCartExist = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(querys.CECKUSERINCART);
  if (UserCartExist.recordset.length > 0) {
    let ProductCarts = UserCartExist.recordset[0].CartProducts;
    let ObjArray = JSON.parse(ProductCarts);
    ObjArray.map(function (element) {
      if (element.ProductId == productId) {
        if (element.Quantity > 1) {
          element.Quantity = element.Quantity - 1;
        }
      }
    });
    let data = JSON.stringify(ObjArray);
    const response = await pool
      .request()
      .input("cartProducts", sql.VarChar, data)
      .input("userId", sql.Int, userId)
      .query(querys.UPDATECART);
    return response.rowsAffected[0];
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
  GetProductByPagination,
  GetAllAdminProduct,
  ConfirmOrder,
  GetOrder,
  OpenBucketAdmin,
  GetBucketOrderById,
  UpdateOrders,
  GetAllTrans,
  CancelOrder,
  addProductsInCart,
  UpdateRemoveCart,
};
