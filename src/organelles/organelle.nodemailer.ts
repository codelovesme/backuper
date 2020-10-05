
"use strict";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import { sys, js } from "cessnalib";
import Particle = euglena.AnyParticle;
import Class = js.Class;
import organelle = euglena_template.alive.organelle;
import constants = euglena_template.alive.constants;

const nodemailer = require('nodemailer');

abstract class NodemailerOrganelle extends euglena.alive.Organelle<particles.incoming.SapContent>{
    constructor() { super(Organelle.NAME); }
}

let this_: Organelle = null;

export class Organelle extends NodemailerOrganelle {
    spawngo: any;
    static readonly NAME = "NodemailerOrganelle";
    private sapContent: particles.incoming.SapContent;
    transporter: any;
    constructor() {
        super();
        this_ = this;
    }
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void {
        addAction(particles.incoming.Sap.NAME, (particle: particles.incoming.Sap, callback) => {
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
        addAction(particles.incoming.SendMail.NAME, (particle: particles.incoming.SendMail, callback) => {

            // setup email data with unicode symbols
            let mailOptions = {
                from: this_.sapContent.user, // sender address '"Codeloves.me Admin" <admin@codeloves.me>'
                to: particle.data.to, // list of receivers 'info@codeloves.me'
                subject: particle.data.subject, // Subject line
                text: particle.data.text, // plain text body
                html: particle.data.html // html body
            };

            // send mail with defined transport object
            this.transporter.sendMail(mailOptions, (error: any, info: any) => {
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

export namespace particles {
    export namespace incoming {
        export interface SapContent {
            euglenaName: string;
            host: string;
            port: number;
            user: string;
            pass: string;
        }

        export class Sap extends euglena.ParticleV2<SapContent> {
            public static readonly NAME = Organelle.NAME + "Sap";
            constructor(content: SapContent, of: string) {
                super(new euglena.MetaV2(Sap.NAME, of), content);
            }
        }
        export class SendMail extends euglena.ParticleV2<{ to: string, subject: string, text: string, html: string }> {
            public static readonly NAME = "SendMail";
            constructor(opts: { to: string, subject: string, text: string, html: string }, of: string) {
                super(new euglena.MetaV2(SendMail.NAME, of), opts);
            }
        }
    }
    export namespace outgoing {

    }
    export namespace shared {

    }
}

