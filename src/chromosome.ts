
"use strict";

import { sys, js } from "cessnalib";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import * as path from "path";

import * as _particles from "./particles";

import constants = euglena_template.alive.constants;
import ParticleV2 = euglena.ParticleV2;
import Particle = euglena.AnyParticle;
import organelles = euglena_template.alive.organelle;
import particles = euglena_template.alive.particle;
import Cytoplasm = euglena.alive.Cytoplasm;
import Gene = euglena.alive.dna.GeneV2;

import * as mongoclient from "./organelles/organelle.mongoclient";
import * as git from "./organelles/organelle.git";
import * as fs from "./organelles/organelle.fs.nodejs";
import * as childprocess from "./organelles/organelle.childprocess.node";
import * as nodemailer from "./organelles/organelle.nodemailer";

/**
 * Getting EuglenaName of this Application from Cytoplasm
 */
let euglenaName = _particles[sys.type.StaticTools.Array.indexOf(_particles, { meta: { name: constants.particles.EuglenaName }, data: null }, (ai: Particle, t: Particle) => ai.meta.name == t.meta.name)].data;

/**
 * Genes are particles of Nucleus
 * You should write some gene to make your euglena move
 */

const whenFileCreatedOrModified = (particle: euglena.AnyParticle) => {
    /**
     * 
     * git pull
     * git add --all
     * git commit -m "exported outputFile.json"
     * git push 
     */
    let twoDigit = function (a: number) {
        return a < 10 ? "0" + a : a;
    }
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
    }, euglenaName), (p: Particle) => {
        if (p instanceof git.particles.outgoing.ASyncEnd && p.data) {
            /**
             * There is some changes
             * Must be pushed
             */
            Cytoplasm.transmit(git.Organelle.NAME, new git.particles.incoming.Push(euglenaName), (pp) => {
                if (pp instanceof git.particles.outgoing.ASyncEnd) {
                    Cytoplasm.transmit(nodemailer.Organelle.NAME, new nodemailer.particles.incoming.SendMail({
                        html: "<div>Changes committed and pushed to db repo !</div>",
                        subject: "Backup Result - Successfully Pushed",
                        text: "Changes committed and pushed to db repo !",
                        to: "fedai@codeloves.me"
                    }, euglenaName));
                }
            });
        } else {
            /**
             * Send an email to infor that there is no change
             */
            Cytoplasm.transmit(nodemailer.Organelle.NAME, new nodemailer.particles.incoming.SendMail({
                html: "<div>There is no changes to be pushed !</div>",
                subject: "Backup Result - No Change",
                text: "There is no changes to be pushed !",
                to: "fedai@codeloves.me"
            }, euglenaName));
        }
    });
}


const chromosome: Gene[] = [
    new Gene(
        "When received Exception, send an email to admin",
        { meta: { name: euglena_template.alive.constants.particles.Exception } },
        (particle: euglena_template.alive.particle.Exception) => {
            let message = JSON.stringify(particle.data);
            Cytoplasm.transmit(nodemailer.Organelle.NAME, new nodemailer.particles.incoming.SendMail({
                html: "<div>" + message + "</div>",
                subject: "Backuper Exception",
                text: message,
                to: "fedai@codeloves.me"
            }, euglenaName));
        },
        euglenaName
    ),
    new Gene(
        "When Euglena has been born, send each organelle inital data to the corresponding organelle.",
        { meta: { name: constants.particles.EuglenaHasBeenBorn } },
        (particle: particles.EuglenaHasBeenBorn) => {
            /**
             * Fetching the TimeOrganelle information / initial data from Cytoplasm
             */
            let timeOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: euglena_template.alive.constants.organelles.TimeOrganelle }
            }) as euglena_template.alive.particle.OrganelleInfo<euglena_template.alive.particle.TimeOrganelleSap>;

            /**
             * mongoclient organelle
             */
            let mongoclientOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: mongoclient.Organelle.NAME }
            }) as euglena_template.alive.particle.OrganelleInfo<mongoclient.particles.incoming.MongoClientOrganelleSap>;

            /**
             * fs organelle
             */
            let fsOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: fs.Organelle.NAME }
            }) as euglena_template.alive.particle.OrganelleInfo<fs.particles.incoming.Sap>;


            /**
             * git organelle
             */
            let gitOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: git.Organelle.NAME }
            }) as euglena_template.alive.particle.OrganelleInfo<git.particles.incoming.GitOrganelleSap>;

            /**
             * childprocess organelle
             */
            let childprocessOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: childprocess.Organelle.NAME }
            }) as euglena_template.alive.particle.OrganelleInfo<childprocess.particles.incoming.ChildProcessOrganelleSap>;

            /**
             * nodemailer organelle
             */
            let nodemailerOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: nodemailer.Organelle.NAME }
            }) as euglena_template.alive.particle.OrganelleInfo<nodemailer.particles.incoming.Sap>;
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
        },
        euglenaName
    ),
    new Gene(
        "When Euglena has been born, Listen particles.json file",
        { meta: { name: constants.particles.EuglenaHasBeenBorn } },
        (particle: particles.EuglenaHasBeenBorn) => {
            /**
             * Mongoclient Organelle Info
             */
            let mongoclientOrganelleInfo = Cytoplasm.getParticle({
                meta: { name: euglena_template.alive.constants.particles.OrganelleInfo, of: euglenaName },
                data: { name: mongoclient.Organelle.NAME }
            }) as euglena_template.alive.particle.OrganelleInfo<mongoclient.particles.incoming.MongoClientOrganelleSap>;
            let repositoryDirectory = mongoclientOrganelleInfo.data.sap.data.options.pwd;
            /**
             * Listen to the exporting file - when generated fs throw FileCreated particle so 
             */
            let collection = "particles";
            let outputFile = path.join(__dirname, repositoryDirectory, collection);

            Cytoplasm.transmit(fs.Organelle.NAME, new fs.particles.incoming.WatchFile(outputFile + ".json", euglenaName));
        },
        euglenaName
    ),
    new Gene(
        "When received particle FileCreated",
        { meta: { name: fs.particles.outgoing.FileCreated.NAME } },
        whenFileCreatedOrModified,
        euglenaName
    ),
    new Gene(
        "When received particle FileModified",
        { meta: { name: fs.particles.outgoing.FileModified.NAME } },
        whenFileCreatedOrModified,
        euglenaName
    ),
    new Gene(
        "When received particle Time, print it on the console. ",
        { meta: { name: constants.particles.Time } },
        (particle: particles.Time) => {
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
                }) as euglena_template.alive.particle.OrganelleInfo<mongoclient.particles.incoming.MongoClientOrganelleSap>;
                let repositoryDirectory = mongoclientOrganelleInfo.data.sap.data.options.pwd;
                /**
                 * Export particles to file particles.raw.json
                 */
                let collection = "particles";
                let fileName = collection; //+ now.getUTCFullYear() + twoDigit(now.getUTCMonth()) + twoDigit(now.getUTCDate());
                let outputFile = path.join(__dirname, repositoryDirectory, fileName);
                Cytoplasm.transmit(mongoclient.Organelle.NAME, new mongoclient.particles.incoming.Export({ collection, outputFile }, euglenaName));
            }
        },
        euglenaName
    )
];

export = chromosome;