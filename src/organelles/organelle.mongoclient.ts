
"use strict";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import {sys, js} from "cessnalib";
import Particle = euglena.AnyParticle;
import Class = js.Class;
import organelle = euglena_template.alive.organelle;
import constants = euglena_template.alive.constants;

const Spawngo = require("spawngo");


abstract class MongoClientOrganelle extends euglena.alive.Organelle<particles.incoming.MongoClientOrganelleSapContent>{
    constructor() {super(Organelle.NAME);}
}

let this_: Organelle = null;


function Utf8ArrayToStr(array: any[]) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

export class Organelle extends MongoClientOrganelle {
    spawngo: any;
    static readonly NAME = "MongoClientOrganelle";
    private sapContent: particles.incoming.MongoClientOrganelleSapContent;
    constructor() {
        super();
        this_ = this;
    }
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void {
        addAction(particles.incoming.MongoClientOrganelleSap.NAME, (particle: particles.incoming.MongoClientOrganelleSap, callback) => {
            this_.sapContent = particle.data;
            this_.spawngo = new Spawngo(this_.sapContent.options);
        });
        addAction(particles.incoming.Export.NAME, (particle: particles.incoming.Export, callback) => {
            let collectionName = particle.data.collection;

            //set outputfile
            this_.spawngo.set("outputFile", particle.data.outputFile);

            // this will return a child process object
            let childProcess = this_.spawngo.export(collectionName)

            // handle events as needed
            childProcess.stdout.on('data', function (data: any) {
                // block to handle stdout
                console.log(Utf8ArrayToStr(data))
            })

            childProcess.stderr.on('data', function (data: any) {
                // block to handle stderr
                console.error(Utf8ArrayToStr(data))
            })

            childProcess.on('close', function (data: any) {
                console.log(Utf8ArrayToStr(data))
            })
        });
        addAction(particles.incoming.Import.NAME, (particle: particles.incoming.Import, callback) => {
            let fileName = particle.data;

            let childProcess = this_.spawngo.import(fileName);

            // handle events as needed
            childProcess.stdout.on('data', function (data: any) {
                // block to handle stdout
                console.log(Utf8ArrayToStr(data))
            })

            childProcess.stderr.on('data', function (data: any) {
                // block to handle stderr
                console.error(Utf8ArrayToStr(data))
            })

            childProcess.on('close', function (data: any) {
                // block to handle close
                console.log(Utf8ArrayToStr(data))
            })
        });
    }
}

export namespace particles {
    export namespace incoming {
        export interface MongoClientOrganelleSapContent {
            euglenaName: string;
            options: {
                host?: string;
                user?: string;
                pwd?: string;
                db: string;
                jsonArray?: boolean;
                upsertFields?: undefined;
                cpus?: number;
                drop?: false;
                outputFile?: string;
            }
        }

        export class MongoClientOrganelleSap extends euglena.ParticleV2<MongoClientOrganelleSapContent> {
            public static readonly NAME = Organelle.NAME + "Sap";
            constructor(content: MongoClientOrganelleSapContent, of: string) {
                super(new euglena.MetaV2(MongoClientOrganelleSap.NAME, of), content);
            }
        }
        export class Export extends euglena.ParticleV2<{collection: string, outputFile: string}> {
            public static readonly NAME = "Export";
            constructor(opts: {collection: string, outputFile: string}, of: string) {
                super(new euglena.MetaV2(Export.NAME, of), opts);
            }
        }
        export class Import extends euglena.ParticleV2<string> {
            public static readonly NAME = "Import";
            constructor(fileName: string, of: string) {
                super(new euglena.MetaV2(Export.NAME, of), fileName);
            }
        }
    }
    export namespace outgoing {

    }
    export namespace shared {

    }
}

