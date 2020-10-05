"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euglena = require("@euglena/core");
const Spawngo = require("spawngo");
class MongoClientOrganelle extends euglena.alive.Organelle {
    constructor() { super(Organelle.NAME); }
}
let this_ = null;
function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
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
class Organelle extends MongoClientOrganelle {
    constructor() {
        super();
        this_ = this;
    }
    bindActions(addAction) {
        addAction(particles.incoming.MongoClientOrganelleSap.NAME, (particle, callback) => {
            this_.sapContent = particle.data;
            this_.spawngo = new Spawngo(this_.sapContent.options);
        });
        addAction(particles.incoming.Export.NAME, (particle, callback) => {
            let collectionName = particle.data.collection;
            //set outputfile
            this_.spawngo.set("outputFile", particle.data.outputFile);
            // this will return a child process object
            let childProcess = this_.spawngo.export(collectionName);
            // handle events as needed
            childProcess.stdout.on('data', function (data) {
                // block to handle stdout
                console.log(Utf8ArrayToStr(data));
            });
            childProcess.stderr.on('data', function (data) {
                // block to handle stderr
                console.error(Utf8ArrayToStr(data));
            });
            childProcess.on('close', function (data) {
                console.log(Utf8ArrayToStr(data));
            });
        });
        addAction(particles.incoming.Import.NAME, (particle, callback) => {
            let fileName = particle.data;
            let childProcess = this_.spawngo.import(fileName);
            // handle events as needed
            childProcess.stdout.on('data', function (data) {
                // block to handle stdout
                console.log(Utf8ArrayToStr(data));
            });
            childProcess.stderr.on('data', function (data) {
                // block to handle stderr
                console.error(Utf8ArrayToStr(data));
            });
            childProcess.on('close', function (data) {
                // block to handle close
                console.log(Utf8ArrayToStr(data));
            });
        });
    }
}
Organelle.NAME = "MongoClientOrganelle";
exports.Organelle = Organelle;
var particles;
(function (particles) {
    let incoming;
    (function (incoming) {
        class MongoClientOrganelleSap extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(MongoClientOrganelleSap.NAME, of), content);
            }
        }
        MongoClientOrganelleSap.NAME = Organelle.NAME + "Sap";
        incoming.MongoClientOrganelleSap = MongoClientOrganelleSap;
        class Export extends euglena.ParticleV2 {
            constructor(opts, of) {
                super(new euglena.MetaV2(Export.NAME, of), opts);
            }
        }
        Export.NAME = "Export";
        incoming.Export = Export;
        class Import extends euglena.ParticleV2 {
            constructor(fileName, of) {
                super(new euglena.MetaV2(Export.NAME, of), fileName);
            }
        }
        Import.NAME = "Import";
        incoming.Import = Import;
    })(incoming = particles.incoming || (particles.incoming = {}));
})(particles = exports.particles || (exports.particles = {}));
