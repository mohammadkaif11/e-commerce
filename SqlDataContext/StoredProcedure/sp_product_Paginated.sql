        create PROC [dbo].[sp_product_Paginated]
        @Page INT,
        @Size INT,
		@Productname varchar =null,
		@Productprice decimal=null
        AS
        BEGIN
		     if(@Productname is not null and @Productprice is not null)
			   BEGIN
				   SELECT * FROM Products
					WHERE  ProductName LIKE '%' + @Productname + '%' AND ProductPrice <= @Productprice
        	ORDER BY Id
        	OFFSET (@Page -1) * @Size ROWS
        	FETCH NEXT @Size ROWS ONLY  
			   END
	     if(@Productname is  null and @Productprice is not null)
			   BEGIN
				   SELECT * FROM Products
					WHERE ProductPrice <= @Productprice
        	ORDER BY Id
        	OFFSET (@Page -1) * @Size ROWS
        	FETCH NEXT @Size ROWS ONLY  
			   END
	      if(@Productname is not null and @Productprice is null)
			   BEGIN
				   SELECT * FROM Products
					WHERE  ProductName LIKE '%' + @Productname + '%'
        	ORDER BY Id
        	OFFSET (@Page -1) * @Size ROWS
        	FETCH NEXT @Size ROWS ONLY  
			   END
           if(@Productname is  null and @Productprice is  null)
			   BEGIN
				   SELECT * FROM Products
        	ORDER BY Id
        	OFFSET (@Page -1) * @Size ROWS
        	FETCH NEXT @Size ROWS ONLY  
			   END
       END
