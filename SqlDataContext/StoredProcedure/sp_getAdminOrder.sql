create PROCEDURE [dbo].[sp_getAdminOrder]
      @AdminId INT,
	  @OrderId INT
AS
BEGIN
	  SELECT *  FROM OrderProducts as t1
      JOIN Orders AS t2 ON t1.OrderId = t2.Id
	  WHERE t1.AdminId=@AdminId AND t1.OrderId=@OrderId
	  Order By  t2.Id desc
END
