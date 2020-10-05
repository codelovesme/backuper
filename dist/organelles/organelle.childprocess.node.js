"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticTools = exports.particles = exports.Organelle = exports.System = void 0;
const euglena_template = require("@euglena/template");
const euglena = require("@euglena/core");
const cessnalib_1 = require("cessnalib");
var constants = euglena_template.alive.constants;
const child_process_1 = require("child_process");
class ChildProcessOrganelle extends euglena.alive.Organelle {
    constructor() { super(Organelle.NAME); }
}
/**
 * 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
 */
var System;
(function (System) {
    System[System["Windows"] = 0] = "Windows";
    System[System["Mac"] = 1] = "Mac";
    System[System["Linux"] = 2] = "Linux";
    System[System["SunOS"] = 3] = "SunOS";
    System[System["All"] = 4] = "All";
})(System = exports.System || (exports.System = {}));
let this_ = null;
class Organelle extends ChildProcessOrganelle {
    constructor() {
        super();
        this_ = this;
    }
    bindActions(addAction) {
        addAction(constants.particles.DbOrganelleSap, (particle, callback) => {
            this_.sapContent = particle.data;
        });
        addAction(particles.incoming.RunCommands.NAME, (particle, callback) => {
            const platform = StaticTools.identifySystem();
            const matchedOnes = cessnalib_1.sys.type.StaticTools.Array.getAllMatched(particle.data, platform, (tt, t) => tt.system === t || tt.system === System.All);
            if (matchedOnes && matchedOnes.length > 0) {
                const commandText = matchedOnes[0].command;
                const commandParameters = matchedOnes[0].parameters;
                const cwd = matchedOnes[0].pwd;
                const child2 = child_process_1.spawn(commandText, commandParameters, { cwd });
                child2.stdout.setEncoding('utf-8');
                child2.stdout.on("data", (data) => {
                    console.log(data);
                });
                child2.stderr.setEncoding('utf-8');
                child2.stderr.on("data", (data) => {
                    console.error(data);
                    process.abort();
                });
            }
        });
    }
}
exports.Organelle = Organelle;
Organelle.NAME = "ChildProcessOrganelle";
var particles;
(function (particles) {
    let incoming;
    (function (incoming) {
        class ChildProcessOrganelleSap extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(ChildProcessOrganelleSap.NAME, of), content);
            }
        }
        ChildProcessOrganelleSap.NAME = Organelle.NAME + ".sap";
        incoming.ChildProcessOrganelleSap = ChildProcessOrganelleSap;
        class RunCommands extends euglena.ParticleV2 {
            constructor(of, ...params) {
                super(new euglena.MetaV2(RunCommands.NAME, of), params);
            }
        }
        RunCommands.NAME = "RunCommands";
        incoming.RunCommands = RunCommands;
    })(incoming = particles.incoming || (particles.incoming = {}));
})(particles = exports.particles || (exports.particles = {}));
class StaticTools {
    static identifySystem() {
        let platform = /^win/.test(process.platform) ? System.Windows :
            /^darwin/.test(process.platform) ? System.Mac :
                /^freebsd/.test(process.platform) ? System.Mac :
                    /^linux/.test(process.platform) ? System.Mac :
                        /^sunos/.test(process.platform) ? System.SunOS : System.Linux;
        return platform;
    }
}
exports.StaticTools = StaticTools;
