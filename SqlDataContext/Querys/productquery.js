const querys = {
    GETPRODUCTS: "SELECT * FROM [ECM].[dbo].[Products]",
    ADDPRODUCTS:"INSERT INTO [ECM].[dbo].[Products] (ProductName,ProductPrice,ProductDescription,ImageUrl) VALUES (@productName,@productPrice,@productDescription,@imageUrl);",
    GETPRODUCTBYID: "SELECT * FROM [ECM].[dbo].[Products] WHERE Id= @id",
    UPDATEPRODUCT:"UPDATE [ECM].[dbo].[Products] SET  ProductName=@productName , ProductPrice=@productPrice , ProductDescription=@productDescription  WHERE Id = @id;",
    DELETEPRODUCTS:"DELETE FROM [ECM].[dbo].[Products] WHERE Id=@id;",
    ADDCART:"INSERT INTO [ECM].[dbo].[Cart] (ProductId,UserId) VALUES (@productId,@userId);",
    GETCART:"SELECT * FROM [ECM].[dbo].[Cart] WHERE UserId = @userId",
    DELETECART:"DELETE FROM [ECM].[dbo].[Cart] WHERE ProductId=@productId and UserId=@userId;",
    PLACEORDER:"DELETE FROM [ECM].[dbo].[Cart] WHERE  UserId=@userId;",
    COUNT:"SELECT count(*) as Totalproducts FROM products",
  };


  module.exports=querys