var nodemailer = require('nodemailer');

function Smtp() {};

module.exports = Smtp;

Smtp.send = function send(user,type,host, callback){
    var transport = nodemailer.createTransport("SMTP", {
        //service: 'Gmail', // use well known service.
        host: "smtp.163.com", // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth: {
            //user: "umlonweb2@gmail.com",
            //pass: "stigmergy"
            user: "umlonweb@163.com",
            pass: "stigmergy"
        }
    });

    console.log('SMTP Configured');

// Message object
    var activationLink = 'http://' + host + '/' + type + '/' + user.link;
    var message = {
        //from: 'umlonweb@gmail.com <umlonweb@gmail.com>',
        from: 'Stigmergic-Modeling <umlonweb@163.com>',
        to: '"'+ user.mail +'"' + '<' + user.mail + '>',
        subject: 'Link of Account Activation - From Stigmergic-Modeling', //
        headers: {
            'X-Laziness-level': 1000
        },
        text: 'Hello to myself!',
        // HTML body
        html:'<p><b>Confirmation：</b></p>'+
            '<p>User: ' + user.mail + '</p>'+
            '<p>Click the link below to activate your account:</p>'+
            '<a href="' + activationLink + '"><p>' + activationLink + '</p></a>'
    };
    console.log(message.to);
    console.log('Sending Mail');
    transport.sendMail(message, function(error){
        if(error){
            console.log('Error occured');
            console.log(error.message);
            return;
        }
        console.log('Message sent successfully!');
    });
    callback(null);
};
