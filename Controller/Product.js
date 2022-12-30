const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const CheckUserLogin = require("../Middleware/UserLogin");
const productService = require("../Service/product.Service");
const AdminRole = require("../Middleware/AdminRole");

router.get("/", CheckUserLogin, productView);
router.post("/AddProduct", upload.single("product-image"), AddProduct);
router.get("/CheckCart", CheckUserLogin, OpenCart);
router.get("/addCart/:id", CheckUserLogin, AddCart);
router.get("/GetById/:id", CheckUserLogin, GetById);
router.get("/Admin", AdminRole, AdminView);
router.get("/AdminGetById/:id", AdminRole, AdminGetById);
router.post("/AdminUpdateProduct", AdminRole, UpdateProduct);
router.get("/AdmindeleteProduct/:id", AdminRole, DeleteAdmin);
router.get("/RemoveCart/:id", CheckUserLogin, RemoveCart);

//Admin User Get all Product
function AdminView(req, res) {
  try {
    productService
      .GetAllProduct()
      .then((products) => {
        res.render("Admin/homePage.ejs", {
          products: products,
          message: "",
          username: req.session.userName,
        });
      })
      .catch((error) => {
        res.render("Admin/homePage.ejs", {
          products: products,
          username: req.session.userName,
          message: "Refresh page and try again",
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
      productService
        .GetProductByIds(id)
        .then((response) => {
          res.render("Admin/ProductDetails.ejs", {
            products: response,
            message: "",
          });
        })
        .catch((error) => {
          res.render("Admin/ProductDetails.ejs", {
            products: response,
            message: "Refresh the page and try again",
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
    productService
      .UpdateProduct(req.body)
      .then((response) => {
        res.redirect("/Admin");
      })
      .catch((error) => {
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
    productService
      .DeleteProduct(req.params.id)
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
//Admin User Add Product
function AddProduct(req, res) {
  try {
    let url = req.file.filename;
    if (
      url == "" ||
      req.body.ProductName == "" ||
      req.body.ProductPrice == "" ||
      req.body.ProductDescription == ""
    ) {
      res.render("Admin/homePage.ejs", {
        products: [],
        username: req.session.userName,
        message:
          "File,Name or ProductName ,ProductDescription is required filed",
      });
    } else {
      req.body.url = url;
      productService
        .AddProduct(req.body)
        .then((data) => {
          res.redirect("/Admin");
        })
        .catch((error) => {
          res.render("Admin/homePage.ejs", {
            products: [],
            username: req.session.userName,
            message: "Refresh page and try again",
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

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
      productService
        .GetProductByIds(id)
        .then((response) => {
          res.render("Product/ProductDetails.ejs", {
            products: response,
            message: "",
          });
        })
        .catch((error) => {
          res.render("Product/ProductDetails.ejs", {
            products: [],
            message: "Refresh the page and try again",
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
    productService
      .GetAllProduct()
      .then((products) => {
        res.render("Product/Product.ejs", {
          products: products,
          username: req.session.userName,
          message: "",
        });
      })
      .catch((error) => {
        res.render("Product/Product.ejs", {
          products: [],
          username: req.session.userName,
          message: "Refresh page and try",
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
        message: "please logout after login",
        username: req.session.userName,
      });
    } else {
      productService
        .GetAllCart(userId)
        .then((response) => {
          res.render("Cart/Cart.ejs", {
            Cart: response,
            message: "",
            username: req.session.userName,
          });
        })
        .catch((error) => {
          res.render("Cart/Cart.ejs", {
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

//Add Cart
function AddCart(req, res) {
  try {
    let productId = req.params.id;
    let userId = req.session.userId;
    productService
      .AddtoCart(productId, userId)
      .then((response) => {
        res.redirect("/CheckCart");
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

//Delete Cart
function RemoveCart(req, res) {
  try {
    let productId = req.params.id;
    let userId = req.session.userId;
    productService
      .RemoveCart(productId, userId)
      .then((data) => {
        res.redirect("/");
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

module.exports = router;
