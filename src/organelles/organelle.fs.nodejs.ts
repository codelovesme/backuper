"use strict";
import { io } from "cessnalib.nodejs";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import { sys, js } from "cessnalib";
import * as fs from "fs";

import Particle = euglena.AnyParticle;

export class Organelle extends euglena.alive.Organelle<particles.incoming.SapContent> {
    public static readonly NAME = "euglena.organelle.fs.nodejs"
    private sapContent: particles.incoming.SapContent;
    constructor() {
        super(Organelle.NAME);
    }
    private IfCallback(callback: any, particle: Particle): void {
        if (callback) callback(particle);
        else this.send(particle);
    }
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void {
        addAction(particles.incoming.Sap.NAME, (particle: particles.incoming.Sap, callback) => {
            this.sapContent = particle.data;
            this.getAlive();
        });
        addAction(particles.incoming.WriteBase64File.NAME, (particle: particles.incoming.WriteBase64File, callback) => {
            let base64Content = particle.data.file.data.content;
            let fileName = particle.data.file.data.name;
            let folder = particle.data.path;
            io.FileSystem.base64ToFile(base64Content, folder, fileName, (err: Error) => {
                if (err) console.error(err)
            });
        });
        addAction(particles.incoming.DeleteFile.NAME, (particle, callback) => {
            fs.unlink(particle.data,(err)=>{
                if(err){
                    throw err;
                }else{
                    this.IfCallback(callback, new particles.outgoing.FileDeleted(particle.data, this.sapContent.euglenaName));
                }
            });
            if (callback) callback(new particles.outgoing.SyncEnd(this.sapContent.euglenaName));
        })
        addAction(particles.incoming.WatchFile.NAME, (particle: particles.incoming.WatchFile, callback) => {
            if (callback) callback(new particles.outgoing.ParticleReceived(this.sapContent.euglenaName));
            fs.watchFile(particle.data, (currentState, previousState) => {
                if (new Date(currentState.mtime).getUTCMilliseconds() == 0) {
                    this.IfCallback(callback, new particles.outgoing.FileDeleted(particle.data, this.sapContent.euglenaName));
                } else if (new Date(currentState.atime).getUTCMilliseconds() == new Date(currentState.birthtime).getUTCMilliseconds()) {
                    this.IfCallback(callback, new particles.outgoing.FileCreated(particle.data, this.sapContent.euglenaName));
                } else {
                    this.IfCallback(callback, new particles.outgoing.FileModified(particle.data, this.sapContent.euglenaName));
                }
            });
            if (callback) callback(new particles.outgoing.SyncEnd(this.sapContent.euglenaName));
        });
        addAction(particles.incoming.UnWatchFile.NAME, (particle: particles.incoming.UnWatchFile) => {
            fs.unwatchFile(particle.data);
        });
        /**
         * TODO:
         * Add Actions below in this method "bindActions" 
         * 
         */
    }
    private getAlive() {

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

export namespace particles {
    export namespace incoming {
        export interface SapContent {
            euglenaName: string
        }
        export class Sap extends euglena.ParticleV2<SapContent>{
            public static readonly NAME = Organelle.NAME + ".sap";

            /**
             *  TODO:
             * Add fields needed from outside
             * before started the organelle working
             */

            constructor(of: string, data: SapContent) {
                super(new euglena.MetaV2(Sap.NAME, of), data);
            }
        }

        export interface WriteBase64FileContent { file: euglena_template.alive.particle.Base64File, path: string }

        export class WriteBase64File extends euglena.ParticleV2<WriteBase64FileContent>{
            public static readonly NAME = "WriteBase64File";
            constructor(content: WriteBase64FileContent, of: string) {
                super(new euglena.MetaV2(WriteBase64File.NAME, of), content);
            }
        }

        export class WatchFile extends euglena.ParticleV2<string>{
            public static readonly NAME = "WatchFile";
            constructor(content: string, of: string) {
                super(new euglena.MetaV2(WatchFile.NAME, of), content);
            }
        }
        export class UnWatchFile extends euglena.ParticleV2<string>{
            public static readonly NAME = "UnWatchFile";
            constructor(content: string, of: string) {
                super(new euglena.MetaV2(WatchFile.NAME, of), content);
            }
        }
        export class DeleteFile extends euglena.ParticleV2<string>{
            public static readonly NAME = "DeleteFile";
            constructor(content: string, of: string) {
                super(new euglena.MetaV2(DeleteFile.NAME, of), content);
            }
        }
    }
    export namespace outgoing {

        export class ParticleReceived extends euglena_template.VoidParticle {
            public static readonly NAME = "ParticleReceived";
            constructor(of: string) {
                super(new euglena.MetaV2(FileDeleted.NAME, of));
            }
        }
        export class SyncEnd extends euglena_template.VoidParticle {
            public static readonly NAME = "SyncEnd";
            constructor(of: string) {
                super(new euglena.MetaV2(SyncEnd.NAME, of));
            }
        }
        export class FileDeleted extends euglena.ParticleV2<string>{
            public static readonly NAME = "FileDeleted";
            constructor(content: string, of: string) {
                super(new euglena.MetaV2(FileDeleted.NAME, of), content);
            }
        }
        export class FileCreated extends euglena.ParticleV2<string>{
            public static readonly NAME = "FileCreated";
            constructor(content: string, of: string) {
                super(new euglena.MetaV2(FileCreated.NAME, of), content);
            }
        }
        export class FileModified extends euglena.ParticleV2<string>{
            public static readonly NAME = "FileModified";
            constructor(content: string, of: string) {
                super(new euglena.MetaV2(FileModified.NAME, of), content);
            }
        }
    }
    export namespace shared {``

    }
}