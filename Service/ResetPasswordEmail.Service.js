const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
    "1f6af4c21948d6b3983096f764365223",
    "a53ec6c3ca45e7897b438f21067a3e4b"
);
//here we can ussd genrate token insted of userId;

const ResetPassword=(email,callback)=>{
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
        Subject: 'Forget Password',
        TextPart: 'Greetings from Flip!',
        HTMLPart:
          `<h3>click here for <a href="http://localhost:8080/ForgetPassword/${email}">Change your Password</a>!</h3><br />`,
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

module.exports=ResetPassword;