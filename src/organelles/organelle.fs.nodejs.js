"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cessnalib_nodejs_1 = require("cessnalib.nodejs");
const euglena_template = require("@euglena/template");
const euglena = require("@euglena/core");
const fs = require("fs");
class Organelle extends euglena.alive.Organelle {
    constructor() {
        super(Organelle.NAME);
    }
    IfCallback(callback, particle) {
        if (callback)
            callback(particle);
        else
            this.send(particle);
    }
    bindActions(addAction) {
        addAction(particles.incoming.Sap.NAME, (particle, callback) => {
            this.sapContent = particle.data;
            this.getAlive();
        });
        addAction(particles.incoming.WriteBase64File.NAME, (particle, callback) => {
            let base64Content = particle.data.file.data.content;
            let fileName = particle.data.file.data.name;
            let folder = particle.data.path;
            cessnalib_nodejs_1.io.FileSystem.base64ToFile(base64Content, folder, fileName, (err) => {
                if (err)
                    console.error(err);
            });
        });
        addAction(particles.incoming.DeleteFile.NAME, (particle, callback) => {
            fs.unlink(particle.data, (err) => {
                if (err) {
                    throw err;
                }
                else {
                    this.IfCallback(callback, new particles.outgoing.FileDeleted(particle.data, this.sapContent.euglenaName));
                }
            });
            if (callback)
                callback(new particles.outgoing.SyncEnd(this.sapContent.euglenaName));
        });
        addAction(particles.incoming.WatchFile.NAME, (particle, callback) => {
            if (callback)
                callback(new particles.outgoing.ParticleReceived(this.sapContent.euglenaName));
            fs.watchFile(particle.data, (currentState, previousState) => {
                if (new Date(currentState.mtime).getUTCMilliseconds() == 0) {
                    this.IfCallback(callback, new particles.outgoing.FileDeleted(particle.data, this.sapContent.euglenaName));
                }
                else if (new Date(currentState.atime).getUTCMilliseconds() == new Date(currentState.birthtime).getUTCMilliseconds()) {
                    this.IfCallback(callback, new particles.outgoing.FileCreated(particle.data, this.sapContent.euglenaName));
                }
                else {
                    this.IfCallback(callback, new particles.outgoing.FileModified(particle.data, this.sapContent.euglenaName));
                }
            });
            if (callback)
                callback(new particles.outgoing.SyncEnd(this.sapContent.euglenaName));
        });
        addAction(particles.incoming.UnWatchFile.NAME, (particle) => {
            fs.unwatchFile(particle.data);
        });
        /**
         * TODO:
         * Add Actions below in this method "bindActions"
         *
         */
    }
    getAlive() {
        /**
         * TODO:
         * Write something to make state of the organelle that
         * organelle can take requests, and work.
         */
        /**
         * send a notification to the Cytoplasm
         * to inform about the organelle has been ready to get requests
         * */
        this.send(new euglena_template.alive.particle.OrganelleHasComeToLife(this.name, this.sapContent.euglenaName));
    }
}
Organelle.NAME = "euglena.organelle.fs.nodejs";
exports.Organelle = Organelle;
var particles;
(function (particles) {
    let incoming;
    (function (incoming) {
        class Sap extends euglena.ParticleV2 {
            /**
             *  TODO:
             * Add fields needed from outside
             * before started the organelle working
             */
            constructor(of, data) {
                super(new euglena.MetaV2(Sap.NAME, of), data);
            }
        }
        Sap.NAME = Organelle.NAME + ".sap";
        incoming.Sap = Sap;
        class WriteBase64File extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(WriteBase64File.NAME, of), content);
            }
        }
        WriteBase64File.NAME = "WriteBase64File";
        incoming.WriteBase64File = WriteBase64File;
        class WatchFile extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(WatchFile.NAME, of), content);
            }
        }
        WatchFile.NAME = "WatchFile";
        incoming.WatchFile = WatchFile;
        class UnWatchFile extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(WatchFile.NAME, of), content);
            }
        }
        UnWatchFile.NAME = "UnWatchFile";
        incoming.UnWatchFile = UnWatchFile;
        class DeleteFile extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(DeleteFile.NAME, of), content);
            }
        }
        DeleteFile.NAME = "DeleteFile";
        incoming.DeleteFile = DeleteFile;
    })(incoming = particles.incoming || (particles.incoming = {}));
    let outgoing;
    (function (outgoing) {
        class ParticleReceived extends euglena_template.VoidParticle {
            constructor(of) {
                super(new euglena.MetaV2(FileDeleted.NAME, of));
            }
        }
        ParticleReceived.NAME = "ParticleReceived";
        outgoing.ParticleReceived = ParticleReceived;
        class SyncEnd extends euglena_template.VoidParticle {
            constructor(of) {
                super(new euglena.MetaV2(SyncEnd.NAME, of));
            }
        }
        SyncEnd.NAME = "SyncEnd";
        outgoing.SyncEnd = SyncEnd;
        class FileDeleted extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(FileDeleted.NAME, of), content);
            }
        }
        FileDeleted.NAME = "FileDeleted";
        outgoing.FileDeleted = FileDeleted;
        class FileCreated extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(FileCreated.NAME, of), content);
            }
        }
        FileCreated.NAME = "FileCreated";
        outgoing.FileCreated = FileCreated;
        class FileModified extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(FileModified.NAME, of), content);
            }
        }
        FileModified.NAME = "FileModified";
        outgoing.FileModified = FileModified;
    })(outgoing = particles.outgoing || (particles.outgoing = {}));
    let shared;
    (function (shared) {
        ``;
    })(shared = particles.shared || (particles.shared = {}));
})(particles = exports.particles || (exports.particles = {}));
