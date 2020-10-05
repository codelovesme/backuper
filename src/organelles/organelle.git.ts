
"use strict";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import * as path from 'path'
import { sys, js } from "cessnalib";
import Particle = euglena.AnyParticle;
import Class = js.Class;
import organelle = euglena_template.alive.organelle;
import constants = euglena_template.alive.constants;

let simpleGit = require('simple-git');

abstract class GitOrganelle extends euglena.alive.Organelle<particles.incoming.GitOrganelleSapContent>{
    constructor() { super(Organelle.NAME); }
}

let this_: Organelle = null;
export class Organelle extends GitOrganelle {
    static readonly NAME = "GitOrganelle";
    private sapContent: particles.incoming.GitOrganelleSapContent;
    constructor() {
        super();
        this_ = this;
    }
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void {
        addAction(particles.incoming.GitOrganelleSap.NAME, (particle: particles.incoming.GitOrganelleSap, callback) => {
            this_.sapContent = particle.data;
            simpleGit = simpleGit(path.resolve(__dirname, particle.data.repositoryDirectory));
        });
        addAction(particles.incoming.Pull.NAME, (particle: particles.incoming.Pull, callback) => {
            
            //TODO:
        });
        addAction(particles.incoming.AddAndCommit.NAME, (particle: particles.incoming.AddAndCommit, callback) => {
            simpleGit.add(particle.data.filePath)
                .commit(particle.data.commitMessage,(err:any,data:any)=>{
                    if(err){
                        this.send(new euglena_template.alive.particle.Exception({innerException:null,message:JSON.stringify(err)},this.sapContent.euglenaName));
                    }else{
                        if(callback){
                            callback(new particles.outgoing.ASyncEnd(this_.sapContent.euglenaName,(data.summary.changes + data.summary.insertions + data.summary.deletions) > 0));
                        }
                        
                    }
                });
        });
        addAction(particles.incoming.Push.NAME, (particle: particles.incoming.Push, callback) => {
            simpleGit.push('origin', 'master',{},(err:any,data:any)=>{
                if(err){
                    this.send(new euglena_template.alive.particle.Exception({innerException:null,message:JSON.stringify(err)},this.sapContent.euglenaName));
                }else{
                    if(callback){
                        callback(new particles.outgoing.ASyncEnd(this_.sapContent.euglenaName));
                    }
                }
            });
        });
    }
}

export namespace particles {
    export namespace incoming {
        export interface GitOrganelleSapContent {
            userName: string;
            userEmail: string;
            repositoryDirectory: string;
            euglenaName: string;
        }

        export class GitOrganelleSap extends euglena.ParticleV2<GitOrganelleSapContent> {
            public static readonly NAME = Organelle.NAME + ".sap";
            constructor(content: GitOrganelleSapContent, of: string) {
                super(new euglena.MetaV2(GitOrganelleSap.NAME, of), content);
            }
        }
        export class Pull extends euglena.ParticleV2<void> {
            public static readonly NAME = "Pull";
            constructor(of: string) {
                super(new euglena.MetaV2(Pull.NAME, of));
            }
        }
        export class Push extends euglena.ParticleV2<void> {
            public static readonly NAME = "Push";
            constructor(of: string) {
                super(new euglena.MetaV2(Push.NAME, of));
            }
        }
        export class AddAndCommit extends euglena.ParticleV2<{ filePath: string, commitMessage: string }> {
            public static readonly NAME = "AddAndCommit";
            constructor(content: { filePath: string, commitMessage: string }, of: string) {
                super(new euglena.MetaV2(AddAndCommit.NAME, of), content);
            }
        }
    }
    export namespace outgoing {
        export class ASyncEnd extends euglena.ParticleV2<any> {
            public static readonly NAME = "ASyncEnd";
            constructor(of: string,data?:any) {
                super(new euglena.MetaV2(ASyncEnd.NAME, of),data);
            }
        }
    }
    export namespace shared {

    }
}

