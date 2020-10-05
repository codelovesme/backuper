"use strict";
const euglena_template = require("@euglena/template");
const organelle_mongoclient_1 = require("./organelles/organelle.mongoclient");
const organelle_childprocess_node_1 = require("./organelles/organelle.childprocess.node");
const organelle_git_1 = require("./organelles/organelle.git");
const organelle_fs_nodejs_1 = require("./organelles/organelle.fs.nodejs");
const organelle_nodemailer_1 = require("./organelles/organelle.nodemailer");
const euglenaName = "backuper";
const particles = [
    {
        meta: {
            name: euglena_template.alive.constants.particles.EuglenaName,
            of: euglenaName
        },
        data: euglenaName
    },
    new euglena_template.alive.particle.OrganelleInfo(organelle_mongoclient_1.Organelle.NAME, euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath, "organelles/organelle.mongoclient", new organelle_mongoclient_1.particles.incoming.MongoClientOrganelleSap({
        options: {
            db: "webserver",
            pwd: "../../../webserver-db"
        },
        euglenaName
    }, euglenaName), euglenaName),
    new euglena_template.alive.particle.OrganelleInfo(organelle_childprocess_node_1.Organelle.NAME, euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath, "organelles/organelle.childprocess.node", new organelle_childprocess_node_1.particles.incoming.ChildProcessOrganelleSap({
        euglenaName
    }, euglenaName), euglenaName),
    new euglena_template.alive.particle.OrganelleInfo(organelle_fs_nodejs_1.Organelle.NAME, euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath, "organelles/organelle.fs.nodejs", new organelle_fs_nodejs_1.particles.incoming.Sap(euglenaName, {
        euglenaName
    }), euglenaName),
    new euglena_template.alive.particle.OrganelleInfo(organelle_git_1.Organelle.NAME, euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath, "organelles/organelle.git", new organelle_git_1.particles.incoming.GitOrganelleSap({
        userName: euglenaName,
        userEmail: "codelovesme@gmail.com",
        repositoryDirectory: "../../../../webserver-db",
        euglenaName
    }, euglenaName), euglenaName),
    new euglena_template.alive.particle.OrganelleInfo(euglena_template.alive.constants.organelles.TimeOrganelle, euglena_template.alive.particle.OrganelleInfoLocationType.NodeModules, "@euglena/organelle.time.js", new euglena_template.alive.particle.TimeOrganelleSap({ euglenaName }, euglenaName), euglenaName),
    new euglena_template.alive.particle.OrganelleInfo(organelle_nodemailer_1.Organelle.NAME, euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath, "organelles/organelle.nodemailer", new organelle_nodemailer_1.particles.incoming.Sap({
        host: 'smtp.yandex.com',
        user: "backuper@codeloves.me",
        pass: '2165',
        port: 465,
        euglenaName
    }, euglenaName), euglenaName)
];
module.exports = particles;
