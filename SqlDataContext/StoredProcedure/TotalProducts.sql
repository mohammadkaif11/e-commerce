create PROCEDURE [dbo].[TotalProducts] 
        @Productname varchar =null,
		@Productprice decimal=null
AS
BEGIN
		     if(@Productname is not null and @Productprice is not null)
			   BEGIN
				   SELECT COUNT(*) as TotalProducts FROM Products 
					WHERE  ProductName LIKE '%' + @Productname + '%' AND ProductPrice <= @Productprice
			 END
              if(@Productname is null and @Productprice is not null)
			   BEGIN
				   SELECT COUNT(*) as TotalProducts FROM Products 
					WHERE  ProductPrice <= @Productprice
			 END
	         if(@Productname is not null and @Productprice is null)
			   BEGIN
				   SELECT COUNT(*) as TotalProducts FROM Products 
					WHERE  ProductName LIKE '%' + @Productname + '%'
			 END
			if(@Productname is  null and @Productprice is  null)
			   BEGIN
				   SELECT COUNT(*) as TotalProducts FROM Products 
			 END

END
