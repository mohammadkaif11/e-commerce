const querys = {
    GETPRODUCTS: "SELECT * FROM [ECM].[dbo].[Products]",
    GETADMINPRODUCTS:"SELECT * FROM [ECM].[dbo].[Products] where UserId=@userid",
    ADDPRODUCTS:"INSERT INTO [ECM].[dbo].[Products] (UserId,ProductName,ProductPrice,ProductDescription,ImageUrl,ImageKey) VALUES (@userId,@productName,@productPrice,@productDescription,@imageUrl,@imageKey);",
    GETPRODUCTBYID: "SELECT * FROM [ECM].[dbo].[Products] WHERE Id= @id",
    UPDATEPRODUCT:"UPDATE [ECM].[dbo].[Products] SET  ProductName=@productName , ProductPrice=@productPrice , ProductDescription=@productDescription  WHERE Id = @id and UserId = userId;",
    DELETEPRODUCTS:"DELETE FROM [ECM].[dbo].[Products] WHERE Id=@id and UserId = userId;",
    ADDCART:"INSERT INTO [ECM].[dbo].[Cart] (ProductId,UserId,AdminId) VALUES (@productId,@userId,@adminId);",
    GETCART:"SELECT * FROM [ECM].[dbo].[Cart] WHERE UserId = @userId",
    DELETECART:"DELETE FROM [ECM].[dbo].[Cart] WHERE ProductId=@productId and UserId=@userId;",
    PLACEORDER:"DELETE FROM [ECM].[dbo].[Cart] WHERE  UserId=@userId;",
    COUNT:"SELECT count(*) as Totalproducts FROM products",
    ADDORDER:"INSERT INTO [ECM].[dbo].[Orders] (UserId,Date,Address,Pincode) VALUES (@userId,@date,@address,@pincode)",
    GETLASTORDER:"SELECT * FROM [ECM].[dbo].[Orders] WHERE UserId=@userId",
    ADDORDERPRODUCTS:"INSERT INTO [ECM].[dbo].[OrderProducts] (OrderId,ProductId,AdminId,Quantity) VALUES (@orderId,@productId,@adminId,@quantity)",
    GETORDER:"SELECT * FROM [ECM].[dbo].[Orders] WHERE UserId=@userId",
    GETORDERPRODUCTS:"SELECT * FROM [ECM].[dbo].[OrderProducts]",
    GETALLORDER:"SELECT * FROM [ECM].[dbo].[Orders]",
    GETORDERPRODUCTSADMIN:"SELECT * FROM [ECM].[dbo].[OrderProducts]  WHERE AdminId=@adminId",
  };


  module.exports=querys