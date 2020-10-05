"use strict";
const cessnalib_1 = require("cessnalib");
const euglena_template = require("@euglena/template");
const euglena = require("@euglena/core");
const path = require("path");
const _particles = require("./particles");
var constants = euglena_template.alive.constants;
var Cytoplasm = euglena.alive.Cytoplasm;
var Gene = euglena.alive.dna.GeneV2;
const mongoclient = require("./organelles/organelle.mongoclient");
const git = require("./organelles/organelle.git");
const fs = require("./organelles/organelle.fs.nodejs");
const childprocess = require("./organelles/organelle.childprocess.node");
const nodemailer = require("./organelles/organelle.nodemailer");
/**
 * Getting EuglenaName of this Application from Cytoplasm
 */
let euglenaName = _particles[cessnalib_1.sys.type.StaticTools.Array.indexOf(_particles, { meta: { name: constants.particles.EuglenaName }, data: null }, (ai, t) => ai.meta.name == t.meta.name)].data;
/**
 * Genes are particles of Nucleus
 * You should write some gene to make your euglena move
 */
const whenFileCreatedOrModified = (particle) => {
    let filePath = particle.data;
    if (filePath.includes(".raw.json")) {
        /**
         * Format the json file
         */
        let newFilePath = filePath;
        newFilePath = newFilePath.replace(".raw.json", ".json");
        Cytoplasm.transmit(childprocess.Organelle.NAME, new childprocess.particles.incoming.RunCommands(euglenaName, {
            command: path.join(__dirname, "../../node_modules/json-beautifier/bin/json-beautify"),
            parameters: ["-f", filePath, "-o", newFilePath],
            pwd: "",
            system: childprocess.System.All
        }));
    }
    else {
        let rawFile = filePath;
        rawFile = rawFile.replace(".json", ".raw.json");
        Cytoplasm.transmit(fs.Organelle.NAME, new fs.particles.incoming.DeleteFile(rawFile, euglenaName), (p) => {
            if (p instanceof fs.particles.outgoing.FileDeleted) {
                /**
                 * After deletion
                 *
                 * git pull
                 * git add --all
                 * git commit -m "exported outputFile.json"
                 * git push
                 */
                let twoDigit = function (a) {
                    return a < 10 ? "0" + a : a;
                };
                let now = new Date();
                let commitMessage = "" + now.getUTCFullYear() + "." +
                    twoDigit(now.getUTCMonth()) + "." +
                    twoDigit(now.getUTCDate()) + " " +
                    twoDigit(now.getUTCHours()) + ":" +
                    twoDigit(now.getUTCMinutes()) + ":" +
                    twoDigit(now.getUTCSeconds());
                Cytoplasm.transmit(git.Organelle.NAME, new git.particles.incoming.AddAndCommit({
                    filePath: "./*",
                    commitMessage
                }, euglenaName), (p) => {
                    if (p instanceof git.particles.outgoing.ASyncEnd && p.data) {
                        /**
                         * There is some changes
                         * Must be pushed
                         */
                        Cytoplasm.transmit(git.Organelle.NAME, new git.particles.incoming.Push(euglenaName), (pp) => {
                            if (pp instanceof git.particles.outgoing.ASyncEnd) {
                                Cytoplasm.transmit(nodemailer.Organelle.NAME, new nodemailer.particles.incoming.SendMail({
                                    from: "admin@codeloves.me",
                                    html: "<div>Changes committed and pushed to db repo !</div>",
                                    subject: "Backup Result - Successfully Pushed",
                                    text: "Changes committed and pushed to db repo !",
                                    to: "fedai@codeloves.me"
                                }, euglenaName));
                            }
                        });
                    }
                    else {
                        /**
                         * Send an email to infor that there is no change
                         */
                        Cytoplasm.transmit(nodemailer.Organelle.NAME, new nodemailer.particles.incoming.SendMail({
                            from: "admin@codeloves.me",
                            html: "<div>There is no changes to be pushed !</div>",
                            subject: "Backup Result - No Change",
                            text: "There is no changes to be pushed !",
                            to: "fedai@codeloves.me"
                        }, euglenaName));
                    }
                });
            }
        });
    }
};
const chromosome = [
    new Gene("When received Exception, send an email to admin", { meta: { name: euglena_template.alive.constants.particles.Exception } }, (particle) => {
        let message = JSON.stringify(particle.data);
        Cytoplasm.transmit(nodemailer.Organelle.NAME, new nodemailer.particles.incoming.SendMail({
            from: "admin@codeloves.me",
            html: "<div>" + message + "</div>",
            subject: "Backuper Exception",
            text: message,
            to: "fedai@codeloves.me"
        }, euglenaName));
    }, euglenaName),
    new Gene("When Euglena has been born, send each organelle inital data to the corresponding organelle.", { meta: { name: constants.particles.EuglenaHasBeenBorn } }, (particle) => {
        /**
         * Fetching the TimeOrganelle information / initial data from Cytoplasm
         */
        let timeOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: euglena_template.alive.constants.organelles.TimeOrganelle }
        });
        /**
         * mongoclient organelle
         */
        let mongoclientOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: mongoclient.Organelle.NAME }
        });
        /**
         * fs organelle
         */
        let fsOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: fs.Organelle.NAME }
        });
        /**
         * git organelle
         */
        let gitOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: git.Organelle.NAME }
        });
        /**
         * childprocess organelle
         */
        let childprocessOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: childprocess.Organelle.NAME }
        });
        /**
         * nodemailer organelle
         */
        let nodemailerOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: nodemailer.Organelle.NAME }
        });
        /**
         * Transmitting the organelle initial data set into the organelle itself to
         * let the organelle initialize itself and getting alive
         */
        Cytoplasm.transmit(euglena_template.alive.constants.organelles.TimeOrganelle, timeOrganelleInfo.data.sap);
        Cytoplasm.transmit(git.Organelle.NAME, gitOrganelleInfo.data.sap);
        Cytoplasm.transmit(fs.Organelle.NAME, fsOrganelleInfo.data.sap);
        Cytoplasm.transmit(childprocess.Organelle.NAME, childprocessOrganelleInfo.data.sap);
        Cytoplasm.transmit(nodemailer.Organelle.NAME, nodemailerOrganelleInfo.data.sap);
        Cytoplasm.transmit(mongoclient.Organelle.NAME, mongoclientOrganelleInfo.data.sap);
    }, euglenaName),
    new Gene("When Euglena has been born, Listen .raw.json file to generate .json file", { meta: { name: constants.particles.EuglenaHasBeenBorn } }, (particle) => {
        /**
         * Mongoclient Organelle Info
         */
        let mongoclientOrganelleInfo = Cytoplasm.getParticle({
            meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
            data: { name: mongoclient.Organelle.NAME }
        });
        let repositoryDirectory = mongoclientOrganelleInfo.data.sap.data.options.pwd;
        /**
         * Listen to the exporting file - when generated fs throw FileCreated particle so
         */
        let now = new Date();
        let collection = "particles";
        let outputFile = path.join(__dirname, repositoryDirectory, collection);
        Cytoplasm.transmit(fs.Organelle.NAME, new fs.particles.incoming.WatchFile(outputFile + ".json", euglenaName));
        Cytoplasm.transmit(fs.Organelle.NAME, new fs.particles.incoming.WatchFile(outputFile + ".raw.json", euglenaName));
    }, euglenaName),
    new Gene("When received particle FileCreated", { meta: { name: fs.particles.outgoing.FileCreated.NAME } }, whenFileCreatedOrModified, euglenaName),
    new Gene("When received particle FileModified", { meta: { name: fs.particles.outgoing.FileModified.NAME } }, whenFileCreatedOrModified, euglenaName),
    new Gene("When received particle Time, print it on the console. ", { meta: { name: constants.particles.Time } }, (particle) => {
        /**
         * When received Particle Time, we can reach it from here and use how we desire
         * In this sample code below, we are printing the minute and second values on the console.
         */
        //if (particle.data.clock.minute == 0 && particle.data.clock.hour == 0) {
        console.log("seconds :" + particle.data.clock.second);
        if (particle.data.clock.second == 0) {
            /**
             * Mongoclient Organelle Info
             */
            let mongoclientOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: mongoclient.Organelle.NAME }
            });
            let repositoryDirectory = mongoclientOrganelleInfo.data.sap.data.options.pwd;
            /**
             * Export particles to file particles.raw.json
             */
            let collection = "particles";
            let fileName = collection + ".raw"; //+ now.getUTCFullYear() + twoDigit(now.getUTCMonth()) + twoDigit(now.getUTCDate());
            let outputFile = path.join(__dirname, repositoryDirectory, fileName);
            Cytoplasm.transmit(mongoclient.Organelle.NAME, new mongoclient.particles.incoming.Export({ collection, outputFile }, euglenaName));
        }
    }, euglenaName)
];
module.exports = chromosome;
