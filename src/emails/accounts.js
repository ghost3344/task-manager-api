var SibApiV3Sdk = require('sib-api-v3-sdk');

//# Instantiate the client\
var defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.SIB_API_KEY

let apiInstance1 = new SibApiV3Sdk.TransactionalEmailsApi() 
// let apiInstance = new SibApiV3Sdk.ContactsApi()
// let createContact = new SibApiV3Sdk.CreateContact()
// createContact.email = 'archana.patel147@gmail.com'
// createContact.listIds = [2]
var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

sendSmtpEmail.sender = {"name":"kashyapjivani","email":"kashyapjivani@gmail.com"};

//sendSmtpEmail.cc = [{"email":"kashyapjivani@gmail.com","name":"kashyap"}];
//sendSmtpEmail.bcc = [{"email":"John Doe","name":"example@example.com"}];
//sendSmtpEmail.replyTo = {"email":"replyto@domain.com","name":"John Doe"};
//sendSmtpEmail.headers = {"sendinblue header":"3344"};
//sendSmtpEmail.params = {"parameter":"Node js Email sending procedure","subject":"About email "};

const sendWelcomeEmail = (email, name)=>{
        sendSmtpEmail.subject = "Welcome Mail";  
        sendSmtpEmail.htmlContent = "<html><body><h1>Thanks for signing Up </h1></body></html>";
        sendSmtpEmail.to = [{"email":email,"name":name}];
        apiInstance1.sendTransacEmail(sendSmtpEmail).then(function(data) {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data) );
        }, function(error) {
        console.error(error);
        });
}

const cancellationEmail = (email, name)=>{
    sendSmtpEmail.subject = "Cancellation confirmation Mail";  
    sendSmtpEmail.htmlContent = "<html><body><p>Sorry to hear this , Let us know what went wrong  </p></body></html>";
    sendSmtpEmail.to = [{"email":email,"name":name}];
    apiInstance1.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data) );
    }, function(error) {
    console.error(error);
    });
}

module.exports = {sendWelcomeEmail,cancellationEmail }

