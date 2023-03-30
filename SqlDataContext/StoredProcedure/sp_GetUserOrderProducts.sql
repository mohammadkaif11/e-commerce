create PROCEDURE [dbo].[sp_GetUserOrderProducts] 
      @UserId INT,
	  @Page INT,
      @Size INT
AS
BEGIN
     DECLARE @json NVARCHAR(MAX);

	SELECT *
     FROM OrderProducts where OrderId in (SELECT Id 
      FROM Orders WHERE UserId=@UserId
      ORDER BY Id desc
      OFFSET (@Page -1) * @Size ROWS FETCH NEXT @Size ROWS ONLY ); 
END