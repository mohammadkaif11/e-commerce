const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    "1f6af4c21948d6b3983096f764365223",
    "a53ec6c3ca45e7897b438f21067a3e4b"
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
     callback(null,result.body);
    })
    .catch(err => {
      callback(err,null);
    })
}

module.exports=SendEmail;