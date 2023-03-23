const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();
const CheckUserLogin = require("../Middleware/UserLogin");
const SqlproductService = require("../Service/SqlProductServices");
const AdminRole = require("../Middleware/AdminRole");

//Aws Configuration
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const { error } = require("console");
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.BACKET_NAME;

//S3 BUCKET
const s3 = new aws.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  Bucket: BUCKET_NAME,
});


//using Local folders uploads
// const upload = multer({ dest: "uploads/" });
//upload middleware

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "flipshop",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
});


router.get("/", CheckUserLogin, productView);
router.get("/Product/:page", CheckUserLogin, PageView);
router.get("/CheckCart", CheckUserLogin, OpenCart);
router.get("/addCart/:id", CheckUserLogin, AddCart);
router.get("/GetById/:id", CheckUserLogin, GetById);
router.get("/placedOrder", CheckUserLogin, PlacedOrder);
router.get("/ConfirmPage", CheckUserLogin, ConfirmPage);
router.post("/ConfirmPage", CheckUserLogin, ConfirmPagePost);
router.get("/checkOrder/:page", CheckUserLogin, Order);
router.get("/RemoveCart/:id", CheckUserLogin, RemoveCart);
router.get('/CancelOrder/:id',CheckUserLogin,CancelOrder);

//Admin Routes
router.post(
  "/AddProduct",
  AdminRole,
  upload.single("product-image"),
  AddProduct
);

router.get("/Admin", AdminRole, AdminView);
router.get("/AdminGetById/:id", AdminRole, AdminGetById);
router.post("/AdminUpdateProduct", AdminRole, UpdateProduct);
router.get("/AdmindeleteProduct/:id", AdminRole, DeleteAdmin);
router.get("/bucket/:page", AdminRole, OpenBucket);
router.get("/updateOrder/:orderId", AdminRole, GetOrderbyId);
router.post("/updateOrder/:orderId", AdminRole, UpdateOrderStatus);
router.get("/transactionhistory/:page", AdminRole, TransactionHistory);


//Admin User Get all Product
async function PageView(req, res) {
  try {
    var page = req.params.page || 1;
    var productName = req.query.productName || "";
    var priceRange = req.query.priceRange || "";
    if (req.session.role == "Admin") {
      res.redirect("/Admin");
      return;
    }
    SqlproductService.GetProductByPagination(
      page,
      productName,
      priceRange,
      function (data) {
        if (data) {
          res.render("Product/paginationHomepage.ejs", {
            products: data.products,
            pages: data.pages,
            current: data.current,
            message: "",
            username: req.session.userName,
            role: req.session.role,
            productName: productName,
            priceRange: priceRange || 0,
          });
        } else {
          res.render("Product/paginationHomepage.ejs", {
            products: [],
            pages: 1,
            current: 1,
            message: "In valid pageNumber",
            username: req.session.userName,
            role: req.session.role,
            roductName: "",
            priceRange: 0,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Admin User Get all Product..
function AdminView(req, res) {
  try {
    const UserId = req.session.userId;
    SqlproductService.GetAllAdminProduct(UserId)
      .then((products) => {
        res.render("Admin/homePage.ejs", {
          products: products,
          message: "",
          username: req.session.userName,
          role: req.session.role,
        });
      })
      .catch((error) => {
        res.render("Admin/homePage.ejs", {
          products: products,
          username: req.session.userName,
          message: "Refresh page and try again",
          role: req.session.role,
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Admin User Get by Id
function AdminGetById(req, res) {
  try {
    const id = req.params.id;
    if (id == "" || id == null) {
    } else {
      SqlproductService.GetProductByIds(id)
        .then((response) => {
          console.log(response);
          res.render("Admin/ProductDetails.ejs", {
            products: response,
            message: "",
            role: req.session.role,
          });
        })
        .catch((error) => {
          res.render("Admin/ProductDetails.ejs", {
            products: response,
            message: "Refresh the page and try again",
            role: req.session.role,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Admin User update product
function UpdateProduct(req, res) {
  try {
    const UserId = req.session.userId;
    SqlproductService.UpdateProduct(req.body, UserId)
      .then((response) => {
        res.redirect("/Admin");
      })
      .catch((error) => {
        console.log(error);
        res.redirect("/Admin");
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Admin User delete product
function DeleteAdmin(req, res) {
  try {
    const UserId = req.session.userId;
    SqlproductService.DeleteProduct(req.params.id, UserId)
      .then((response) => {
        res.redirect("/Admin");
      })
      .catch((error) => {
        res.redirect("/Admin");
      });
  } catch (error) {
    res.render("Error/error.ejs");
  }
}

//Admin Add Products
function AddProduct(req, res) {
  try {
    let url = req.file.location;
    const key = req.file.key;
    if (
      url == "" ||
      req.body.ProductName == "" ||
      req.body.ProductPrice == "" ||
      req.body.ProductDescription == "" ||
      req.body.Quantity==0
    ) {
      res.render("Admin/homePage.ejs", {
        products: [],
        username: req.session.userName,
        message:
          "File,Name or ProductName ,ProductDescription or Quantity is required filed",
      });
    } else {
      req.body.url = url;
      req.body.key = key;
      req.body.UserId = req.session.userId;
      SqlproductService.AddProduct(req.body)
        .then((data) => {
          res.redirect("/Admin");
        })
        .catch((error) => {
          console.log(error)
          res.render("Admin/homePage.ejs", {
            products: [],
            username: req.session.userName,
            message: "Refresh page and try again",
            role: req.session.role,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Open Bucket with pagination
function OpenBucket(req, res) {
  try {
    let page = req.params.page;
    const UserId = req.session.userId;
    SqlproductService.OpenBucketAdmin(UserId, page)
      .then((data) => {
        console.log(data)
        res.render("Admin/Bucket.ejs", {
          Orders: data.data,
          message: "",
          username: req.session.userName,
          role: req.session.role,
          pages: data.pages,
          current: data.current,
        });
      })
      .catch((error) => {
        console.log(error);
        res.render("Admin/Bucket.ejs", {
          Orders: [],
          message: "Some Error!",
          username: req.session.userName,
          role: req.session.role,
          pages: 1,
          current: 1,
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Get order By id for update
function GetOrderbyId(req, res) {
  try {
    let orderId = req.params.orderId;
    const UserId = req.session.userId;
    SqlproductService.GetBucketOrderById(orderId, UserId)
      .then((data) => {
        res.render("Admin/UpdateOrder.ejs", {
          Orders: data,
          message: "",
          username: req.session.userName,
          role: req.session.role,
        });
      })
      .catch((error) => {
        res.render("Admin/UpdateOrder.ejs", {
          Orders: [],
          message: "",
          username: req.session.userName,
          role: req.session.role,
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Transaction history
function TransactionHistory(req, res) {
  try {
    const page=req.params.page;
    const UserId = req.session.userId;
    const CustomerCancel = req.query.CustomerCancel||"";
    const OrderDate=req.query.OrderDate || "";
    const YourCancel=req.query.YourCancel || "";
    SqlproductService.GetAllTrans(UserId,OrderDate, CustomerCancel, YourCancel,page)
      .then((data) => {
        res.render("Admin/Trans.ejs", {
          Transaction: data.ResponseData,
          message: "",
          username: req.session.userName,
          role: req.session.role,
          current:data.current,
          pages:data.pages,
          OrderDate:OrderDate,
          CustomerCancel:CustomerCancel,
          YourCancel:YourCancel
        });
      })
      .catch((error) => {
        res.render("Admin/Trans.ejs", {
          Transaction: [],
          message: "Some Error occurred",
          username: req.session.userName,
          role: req.session.role,
          current:data.current,
          pages:data.pages,
          OrderDate:OrderDate,
          CustomerCancel:CustomerCancel,
          YourCancel:YourCancel
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Update the order status with date and transaction
function UpdateOrderStatus(req, res) {
  try {
    let orderId = req.params.orderId;
    const UserId = req.session.userId;
    SqlproductService.UpdateOrders(orderId, UserId, req.body)
      .then((data) => {
        SqlproductService.GetBucketOrderById(orderId, UserId).then((data) => {
          res.redirect("/bucket/1");
        });
      })
      .catch((error) => {
        console.log(error);
        res.redirect("/bucket/1");
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//-----------------------------------------------//
/*
function GetById(req,res){
    try {
        const id=req.params.id;
        productService.GetProductById(id).then(response=>{
            res.render('Product/Product.ejs',{products:response})
        }).catch(error=>{
            console.log(error);
        })
      
    } catch (error) {
        console.log(error);
    }
}
*/

//user view getbyId
function GetById(req, res) {
  try {
    const id = req.params.id;
    if (id == "" || id == null) {
      res.render("Product/ProductDetails.ejs", {
        products: [],
        message: "Id is not null",
      });
    } else {
      SqlproductService.GetProductByIds(id)
        .then((response) => {
          res.render("Product/ProductDetails.ejs", {
            products: response,
            message: "",
            role: req.session.role,
          });
        })
        .catch((error) => {
          res.render("Product/ProductDetails.ejs", {
            products: [],
            message: "Refresh the page and try again",
            role: req.session.role,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Product view
function productView(req, res) {
  try {
    SqlproductService.GetAllProduct()
      .then((products) => {
        res.render("Product/Product.ejs", {
          products: products,
          username: req.session.userName,
          message: "",
          role: req.session.role,
        });
      })
      .catch((error) => {
        res.render("Product/Product.ejs", {
          products: [],
          username: req.session.userName,
          message: "Refresh page and try",
          role: req.session.role,
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Open Cart
function OpenCart(req, res) {
  try {
    let userId = req.session.userId;
    if (userId == "" || userId == null) {
      res.render("Cart/Cart.ejs", {
        Cart: [],
        message: "please try after sometimes",
        username: req.session.userName,
        role: req.session.role,
      });
    } else {
      SqlproductService.GetAllCart(userId)
        .then((response) => {
          res.render("Cart/Cart.ejs", {
            Cart: response,
            message: response.length > 0 ? "" : "Cart is empty",
            username: req.session.userName,
            role: req.session.role,
          });
        })
        .catch((error) => {
          console.log(error);
          res.render("Cart/Cart.ejs", {
            Cart: [],
            message: "Refresh message and try again",
            username: req.session.userName,
            role: req.session.role,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Add Cart
function AddCart(req, res) {
  try {
    let productId = req.params.id;
    let userId = req.session.userId;
    const AdminId = req.query.adminId;
    SqlproductService.AddtoCart(productId, userId, AdminId)
      .then((response) => {
        console.log("Check success");
        res.redirect("/CheckCart");
      })
      .catch((error) => {
        console.log(error)
        res.render("Cart/Cart.ejs", {
          Cart: [],
          message: "some error try again",
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//REMOVE FROM Cart
function RemoveCart(req, res) {
  try {
    let productId = req.params.id;
    let userId = req.session.userId;
    SqlproductService.RemoveCart(productId, userId)
      .then((data) => {
        res.redirect("/Product/1");
      })
      .catch((error) => {
        res.render("Cart/Cart.ejs", {
          Cart: [],
          message: "some error try again",
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//PLACE ORDER
function PlacedOrder(req, res) {
  try {
    const userId = req.session.userId;
    SqlproductService.PlacedOrder(userId)
      .then((data) => {
        res.render("Cart/Cart.ejs", {
          Cart: [],
          message: "Thanks for shopping with me!",
          username: req.session.userName,
          role: req.session.role,
        });
      })
      .catch((error) => {
        console.log(error);
        res.render("Cart/Cart.ejs", {
          Cart: [],
          message: "please try after sometimes",
          username: req.session.userName,
          role: req.session.role,
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Confirm Page
function ConfirmPage(req, res) {
  try {
    let userId = req.session.userId;
    if (userId == "" || userId == null) {
      res.render("Cart/ConfirmPage.ejs", {
        Cart: [],
        message: "please try after sometimes",
        username: req.session.userName,
      });
    } else {
      SqlproductService.GetAllCart(userId)
        .then((response) => {
          console.log('cart response',response);
          res.render("Cart/ConfirmPage.ejs", {
            Cart: response,
            message: "",
            username: req.session.userName,
          });
        })
        .catch((error) => {
          res.render("Cart/ConfirmPage.ejs", {
            Cart: response,
            message: "Refresh message and try again",
            username: req.session.userName,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Confirm page Post Request
function ConfirmPagePost(req, res) {
  try {
    let userId = req.session.userId;
    if (userId == "" || userId == null) {
      res.render("Cart/ConfirmPage.ejs", {
        Cart: [],
        message: "please try after sometimes",
        username: req.session.userName,
      });
    } else {
      SqlproductService.ConfirmOrder(userId, req.body).then((data) => {
        res.redirect("/checkOrder/1");
      });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Show all Orders
function Order(req, res) {
  try {
    let page = req.params.page;
    const UserId = req.session.userId;
    SqlproductService.GetOrder(UserId, page)
      .then((data) => {
        console.log("Order received :",data.Order);
        res.render("Cart/Order.ejs", {
          Orders: data.Order,
          message: "",
          username: req.session.userName,
          role: req.session.role,
          pages: data.pages,
          current: data.current,
        });
      })
      .catch((error) => {
        console.log(error);
        res.render("Cart/Order.ejs", {
          Orders: [],
          message: "Some Error!",
          username: req.session.userName,
          role: req.session.role,
          pages: 1,
          current: 1,
        });
      });
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//Cancel the Order
function CancelOrder(req,res){
  try {
    let OrderId = req.params.id;
    const UserId = req.session.userId;
    SqlproductService.CancelOrder(OrderId,UserId)
     .then((data)=>{
      console.log(data);
      res.redirect('/checkOrder/1');
     })

  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}



module.exports = router;
