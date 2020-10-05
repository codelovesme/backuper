
import * as euglena from "@euglena/core";
import * as euglena_template from "@euglena/template";

import {Organelle as MongoClientOrganelle, particles as MongoClientOrganelleParticles} from "./organelles/organelle.mongoclient";
import {Organelle as ChildProcessOrganelle, particles as ChildProcessOrganelleParticles} from "./organelles/organelle.childprocess.node";
import {Organelle as GitOrganelle, particles as GitOrganelleParticles} from "./organelles/organelle.git";
import {Organelle as FsOrganelle, particles as FsOrganelleParticles} from "./organelles/organelle.fs.nodejs";
import {Organelle as MailOrganelle, particles as MailOrganelleParticles} from "./organelles/organelle.nodemailer";

const euglenaName = "backuper";

const particles: euglena.AnyParticle[] = [
    {
        meta: {
            name: euglena_template.alive.constants.particles.EuglenaName,
            of: euglenaName
        },
        data: euglenaName
    },
    new euglena_template.alive.particle.OrganelleInfo(
        MongoClientOrganelle.NAME,
        euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath,
        "organelles/organelle.mongoclient",
        new MongoClientOrganelleParticles.incoming.MongoClientOrganelleSap({
            options: {
                db: "webserver",
                pwd: "../../../webserver-db"
            },
            euglenaName
        }, euglenaName),
        euglenaName
    ),
    new euglena_template.alive.particle.OrganelleInfo(
        ChildProcessOrganelle.NAME,
        euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath,
        "organelles/organelle.childprocess.node",
        new ChildProcessOrganelleParticles.incoming.ChildProcessOrganelleSap({
            euglenaName
        }, euglenaName),
        euglenaName
    ),
    new euglena_template.alive.particle.OrganelleInfo(
        FsOrganelle.NAME,
        euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath,
        "organelles/organelle.fs.nodejs",
        new FsOrganelleParticles.incoming.Sap(euglenaName, {
            euglenaName
        }),
        euglenaName),
    new euglena_template.alive.particle.OrganelleInfo(
        GitOrganelle.NAME,
        euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath,
        "organelles/organelle.git",
        new GitOrganelleParticles.incoming.GitOrganelleSap({
            userName: euglenaName,
            userEmail: "codelovesme@gmail.com",
            repositoryDirectory: "../../../../webserver-db",
            euglenaName
        }, euglenaName),
        euglenaName
    ),
    new euglena_template.alive.particle.OrganelleInfo(
        euglena_template.alive.constants.organelles.TimeOrganelle,
        euglena_template.alive.particle.OrganelleInfoLocationType.NodeModules,
        "@euglena/organelle.time.js",
        new euglena_template.alive.particle.TimeOrganelleSap({euglenaName}, euglenaName), euglenaName
    ),
    new euglena_template.alive.particle.OrganelleInfo(
        MailOrganelle.NAME,
        euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath,
        "organelles/organelle.nodemailer",
        new MailOrganelleParticles.incoming.Sap({
            host: 'smtp.yandex.com',
            user: "backuper@codeloves.me",
            pass: '2165',
            port: 465,
            euglenaName
        }, euglenaName),
        euglenaName
    )
];

export = particles;