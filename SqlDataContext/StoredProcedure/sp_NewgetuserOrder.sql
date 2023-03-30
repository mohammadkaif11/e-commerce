create PROCEDURE [dbo].[sp_NewgetuserOrder] 
      @UserId INT,
	  @Page INT,
      @Size INT
AS
BEGIN
	 SELECT * 
      FROM Orders WHERE UserId=@UserId
      ORDER BY Id desc
      OFFSET (@Page -1) * @Size ROWS FETCH NEXT @Size ROWS ONLY 
END
