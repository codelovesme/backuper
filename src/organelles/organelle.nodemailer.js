"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euglena = require("@euglena/core");
const nodemailer = require('nodemailer');
class NodemailerOrganelle extends euglena.alive.Organelle {
    constructor() { super(Organelle.NAME); }
}
let this_ = null;
class Organelle extends NodemailerOrganelle {
    constructor() {
        super();
        this_ = this;
    }
    bindActions(addAction) {
        addAction(particles.incoming.Sap.NAME, (particle, callback) => {
            this_.sapContent = particle.data;
            /**
             * Preparation for mail send
             */
            let sp = this_.sapContent;
            // create reusable transporter object using the default SMTP transport
            this.transporter = nodemailer.createTransport({
                host: sp.host,
                port: sp.port,
                secure: false,
                auth: {
                    user: sp.user,
                    pass: sp.pass
                }
            });
        });
        addAction(particles.incoming.SendMail.NAME, (particle, callback) => {
            // setup email data with unicode symbols
            let mailOptions = {
                from: particle.data.from,
                to: particle.data.to,
                subject: particle.data.subject,
                text: particle.data.text,
                html: particle.data.html // html body
            };
            // send mail with defined transport object
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });
    }
}
Organelle.NAME = "NodemailerOrganelle";
exports.Organelle = Organelle;
var particles;
(function (particles) {
    let incoming;
    (function (incoming) {
        class Sap extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(Sap.NAME, of), content);
            }
        }
        Sap.NAME = Organelle.NAME + "Sap";
        incoming.Sap = Sap;
        class SendMail extends euglena.ParticleV2 {
            constructor(opts, of) {
                super(new euglena.MetaV2(SendMail.NAME, of), opts);
            }
        }
        SendMail.NAME = "SendMail";
        incoming.SendMail = SendMail;
    })(incoming = particles.incoming || (particles.incoming = {}));
})(particles = exports.particles || (exports.particles = {}));
