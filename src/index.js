/**
 * Created by codelovesme on 9/15/2015.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euglena = require("@euglena/core");
const euglena_template = require("@euglena/template");
const cessnalib_1 = require("cessnalib");
const path = require("path");
var constants = euglena_template.alive.constants;
const particles = require("./particles");
const chromosome = require("./chromosome");
process.on('uncaughtException', (err) => {
    console.log(err);
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//Load Organelles
let euglenaName = particles[cessnalib_1.sys.type.StaticTools.Array.indexOf(particles, { meta: { name: constants.particles.EuglenaName }, data: null }, (ai, t) => ai.meta.name == t.meta.name)].data;
let organelles = [];
let organelleInfos = cessnalib_1.sys.type.StaticTools.Array.getAllMatched(particles, { meta: { name: constants.particles.OrganelleInfo }, data: null }, (ai, t) => ai.meta.name === t.meta.name);
for (let o of organelleInfos) {
    switch (o.data.location.type) {
        case euglena_template.alive.particle.OrganelleInfoLocationType.NodeModules:
            let organelle = null;
            try {
                organelle = new (require(o.data.location.path)).Organelle();
            }
            catch (e) {
                console.log(o.data.name + " " + e.message);
            }
            if (!organelle)
                continue;
            organelles.push(organelle);
            console.log(`${organelle.name} attached to the body.`);
            break;
        case euglena_template.alive.particle.OrganelleInfoLocationType.FileSystemPath:
            let organelle2 = null;
            try {
                organelle2 = new (require(path.join(__dirname, o.data.location.path)).Organelle)();
            }
            catch (e) {
                console.log(o.data.name + " " + e.message);
            }
            if (!organelle2)
                continue;
            organelles.push(organelle2);
            console.log(`${organelle2.name} attached to the body.`);
            break;
    }
}
//Load Genes
new euglena.alive.Cytoplasm(particles, organelles, chromosome, euglenaName);
euglena.alive.Cytoplasm.receive(new euglena_template.alive.particle.EuglenaHasBeenBorn(euglenaName), "universe");
