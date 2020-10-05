"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euglena_template = require("@euglena/template");
const euglena = require("@euglena/core");
const path = require("path");
let simpleGit = require('simple-git');
class GitOrganelle extends euglena.alive.Organelle {
    constructor() { super(Organelle.NAME); }
}
let this_ = null;
class Organelle extends GitOrganelle {
    constructor() {
        super();
        this_ = this;
    }
    bindActions(addAction) {
        addAction(particles.incoming.GitOrganelleSap.NAME, (particle, callback) => {
            this_.sapContent = particle.data;
            simpleGit = simpleGit(path.resolve(__dirname, particle.data.repositoryDirectory));
        });
        addAction(particles.incoming.Pull.NAME, (particle, callback) => {
            //TODO:
        });
        addAction(particles.incoming.AddAndCommit.NAME, (particle, callback) => {
            simpleGit.add(particle.data.filePath)
                .commit(particle.data.commitMessage, (err, data) => {
                if (err) {
                    this.send(new euglena_template.alive.particle.Exception({ innerException: null, message: JSON.stringify(err) }, this.sapContent.euglenaName));
                }
                else {
                    if (callback) {
                        callback(new particles.outgoing.ASyncEnd(this_.sapContent.euglenaName, (data.summary.changes + data.summary.insertions + data.summary.deletions) > 0));
                    }
                }
            });
        });
        addAction(particles.incoming.Push.NAME, (particle, callback) => {
            simpleGit.push('origin', 'master', {}, (err, data) => {
                if (err) {
                    this.send(new euglena_template.alive.particle.Exception({ innerException: null, message: JSON.stringify(err) }, this.sapContent.euglenaName));
                }
                else {
                    if (callback) {
                        callback(new particles.outgoing.ASyncEnd(this_.sapContent.euglenaName));
                    }
                }
            });
        });
    }
}
Organelle.NAME = "GitOrganelle";
exports.Organelle = Organelle;
var particles;
(function (particles) {
    let incoming;
    (function (incoming) {
        class GitOrganelleSap extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(GitOrganelleSap.NAME, of), content);
            }
        }
        GitOrganelleSap.NAME = Organelle.NAME + ".sap";
        incoming.GitOrganelleSap = GitOrganelleSap;
        class Pull extends euglena.ParticleV2 {
            constructor(of) {
                super(new euglena.MetaV2(Pull.NAME, of));
            }
        }
        Pull.NAME = "Pull";
        incoming.Pull = Pull;
        class Push extends euglena.ParticleV2 {
            constructor(of) {
                super(new euglena.MetaV2(Push.NAME, of));
            }
        }
        Push.NAME = "Push";
        incoming.Push = Push;
        class AddAndCommit extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(AddAndCommit.NAME, of), content);
            }
        }
        AddAndCommit.NAME = "AddAndCommit";
        incoming.AddAndCommit = AddAndCommit;
    })(incoming = particles.incoming || (particles.incoming = {}));
    let outgoing;
    (function (outgoing) {
        class ASyncEnd extends euglena.ParticleV2 {
            constructor(of, data) {
                super(new euglena.MetaV2(ASyncEnd.NAME, of), data);
            }
        }
        ASyncEnd.NAME = "ASyncEnd";
        outgoing.ASyncEnd = ASyncEnd;
    })(outgoing = particles.outgoing || (particles.outgoing = {}));
})(particles = exports.particles || (exports.particles = {}));
