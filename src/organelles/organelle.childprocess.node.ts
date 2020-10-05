
"use strict";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import { sys, js } from "cessnalib";
import Particle = euglena.AnyParticle;
import Class = js.Class;
import organelle = euglena_template.alive.organelle;
import constants = euglena_template.alive.constants;

import { exec, spawnSync, spawn } from 'child_process';




abstract class ChildProcessOrganelle extends euglena.alive.Organelle<particles.incoming.ChildProcessOrganelleSapContent>{
    constructor() { super(Organelle.NAME); }
}

/**
 * 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
 */
export enum System { Windows, Mac, Linux, SunOS, All }
export interface Command { command: string, system: System, pwd: string, parameters: string[] }
let this_: Organelle = null;
export class Organelle extends ChildProcessOrganelle {
    static readonly NAME = "ChildProcessOrganelle";
    private sapContent: particles.incoming.ChildProcessOrganelleSapContent;
    constructor() {
        super();
        this_ = this;
    }
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void {
        addAction(constants.particles.DbOrganelleSap, (particle: particles.incoming.ChildProcessOrganelleSap, callback) => {
            this_.sapContent = particle.data;
        });
        addAction(particles.incoming.RunCommands.NAME, (particle: particles.incoming.RunCommands, callback) => {
            const platform = StaticTools.identifySystem();
            const matchedOnes = sys.type.StaticTools.Array.getAllMatched(particle.data, platform, (tt, t) => tt.system === t || tt.system === System.All);
            if (matchedOnes && matchedOnes.length > 0) {
                const commandText = matchedOnes[0].command;
                const commandParameters = matchedOnes[0].parameters;
                const cwd = matchedOnes[0].pwd;
                const child2 = spawn(commandText, commandParameters, { cwd });
                child2.stdout.setEncoding('utf-8');
                child2.stdout.on("data", (data: any) => {
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

export namespace particles {
    export namespace incoming {
        export interface ChildProcessOrganelleSapContent {
            euglenaName: string;
        }

        export class ChildProcessOrganelleSap extends euglena.ParticleV2<ChildProcessOrganelleSapContent> {
            public static readonly NAME = Organelle.NAME + ".sap";
            constructor(content: ChildProcessOrganelleSapContent, of: string) {
                super(new euglena.MetaV2(ChildProcessOrganelleSap.NAME, of), content);
            }
        }
        export class RunCommands extends euglena.ParticleV2<Command[]> {
            public static readonly NAME = "RunCommands";
            constructor(of: string, ...params: Command[]) {
                super(new euglena.MetaV2(RunCommands.NAME, of), params);
            }
        }
    }
    export namespace outgoing {

    }
    export namespace shared {

    }
}

export class StaticTools {
    public static identifySystem(): System {
        let platform = /^win/.test(process.platform) ? System.Windows :
            /^darwin/.test(process.platform) ? System.Mac :
                /^freebsd/.test(process.platform) ? System.Mac :
                    /^linux/.test(process.platform) ? System.Mac :
                        /^sunos/.test(process.platform) ? System.SunOS : System.Linux;
        return platform;
    }
}

