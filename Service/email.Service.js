const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    "1f6af4c21948d6b3983096f764365223",
    "7c7706bf24fbf949951af9336ada75cd"
);

//here we can used genrate token insted of userId;
const SendEmail=(userId,email,callback)=>{
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'mohammadkaif0211@gmail.com',
          Name: 'From flip',
        },
        To: [
          {
            Email: email,
            Name: 'You',
          },
        ],
        Subject: 'Please Verify your identity',
        TextPart: 'Greetings from Mailjet!',
        HTMLPart:
          `<h3>Click here to verify <a href="http://localhost:8080/user/VerifyEmail/${userId}">Verfiy</a>!</h3><br />May the delivery force be with you!`,
      },
    ],
  })
  request
    .then(result => {
      console.log("verify email is send success ",result);
     callback(null,result.body);
    })
    .catch(err => {
      console.log("verify email is send failed ",err);
      callback(err,null);
    })
}

module.exports=SendEmail;