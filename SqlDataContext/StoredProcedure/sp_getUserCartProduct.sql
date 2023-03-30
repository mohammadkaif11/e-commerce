create PROCEDURE sp_getUserCartProduct 
	@Userid int
AS
BEGIN

	SET NOCOUNT ON;
	DECLARE @json NVARCHAR(MAX);
SELECT @json = [CartProducts]
FROM Cart where UserId=@Userid;
SELECT *
FROM OPENJSON(@json) 
  WITH (
    ProductId INT 'strict $.ProductId',
    AdminId NVARCHAR(50) '$.AdminId',
    UserQuantity NVARCHAR(50) '$.Quantity'
  ) join Products on ProductId=Products.Id;

END


exec sp_getUserCartProduct 2