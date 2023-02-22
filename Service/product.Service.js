const Products = require("../DataContext/DataBaseModel/Productmodel");
const User = require("../DataContext/DataBaseModel/Usermodel");
const mongoose = require("mongoose");
const Users = require("../DataContext/DataBaseModel/Usermodel");

async function AddProduct(data) {
  console.log(data);
  var product = new Products({
    ProductName: data.ProductName,
    ProductPrice: data.ProductPrice,
    ImageUrl: data.url,
    ProductDescription: data.ProductDescription,
  });
  var data = await product.save();
  return data;
}

async function GetAllProduct() {
  var products = await Products.find();
  return products;
}

async function AddtoCart(productId, user_id) {
  var user = await User.findById(user_id);
  var product = await Products.findById(productId);
  let obj = {
    ProductId: productId,
    ProductQuantity: 1,
    ProductPrice: product.ProductPrice,
  };
  user.Carts.push(obj);
  var updatateUser = await User.findByIdAndUpdate(user_id, {
    Carts: user.Carts,
  });
  return updatateUser;
}

async function GetAllCart(user_id) {
  let Product = await Products.find();
  let UserCart = await User.findById(user_id);
  let CarrtArray = [];
  let Cart = JSON.parse(JSON.stringify(UserCart.Carts));

  Cart.forEach((element) => {
    var productDetail = Product.find((product) => {
      return product._id == element.ProductId;
    });
    if (productDetail != null) {
      element["Name"] = productDetail?.ProductName;
      element.ImageUrl = productDetail?.ImageUrl;
      element.ProductId = productDetail?._id;
      CarrtArray.push(element);
    }
  });

  return CarrtArray;
}

async function GetProductById(productId) {
  var product = await Products.find({ _id: productId });
  if (product != null) {
    return product;
  }
  return null;
}

async function GetProductByIds(productId) {
  let arrayOfProduct = [];
  let isValid = mongoose.isValidObjectId(productId);
  if (isValid) {
    let Product = await Products.findById(productId);
    if (Product != null) {
      arrayOfProduct.push(Product);
      return arrayOfProduct;
    }
    return arrayOfProduct;
  } else {
    return arrayOfProduct;
  }
}

async function UpdateProduct(data) {
  let updateProduct = await Products.findByIdAndUpdate(data._id, {
    ProductName: data.ProductName,
    ProductDescription: data.ProductDescription,
    ProductPrice: data.ProductPrice,
  });
  return updateProduct;
}

async function DeleteProduct(id) {
  var deleteProduct = Products.findByIdAndDelete(id);
  return deleteProduct;
}

async function RemoveCart(cartId, userId) {
  var user = await User.findById(userId);
  var CartArray = user.Carts;
  var UpdateCartArray = [];
  CartArray.forEach((element) => {
    if (element.ProductId != cartId) {
      UpdateCartArray.push(element);
    }
  });
  if (UpdateCartArray.length > 0) {
    var updatateUser = await User.findByIdAndUpdate(userId, {
      Carts: user.UpdateCartArray,
    });
    return updatateUser;
  }
  return null;
}

async function PlacedOrder(userId) {
  const UpdateData = await Users.findByIdAndUpdate(userId, { Carts: [] });
  return UpdateData;
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
};
