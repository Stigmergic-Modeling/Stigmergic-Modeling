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
    var message = {
        //from: 'umlonweb@gmail.com <umlonweb@gmail.com>',
        from: 'umlonweb@163.com <umlonweb@163.com>',
        to: '"'+ user.mail +'"' + '<' + user.mail + '>',
        subject: 'Test - Link of 激活账号 _ UML On Web', //
        headers: {
            'X-Laziness-level': 1000
        },
        text: 'Hello to myself!',
        // HTML body
        html:'<p><b>Confirmation：</b><br/></p>'+
            '<p>User:' + user.mail + '<br/></p>'+
            '<p>Click on the link below to activate your account:<br/></p>'+
            '<p>http://'+host+'/'+type+'/'+user.mail+'/'+ user.link+'<br/></p>'
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
