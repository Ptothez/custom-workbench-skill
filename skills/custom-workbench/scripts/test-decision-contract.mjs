import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'workbench-contract-'));
const base=JSON.parse(fs.readFileSync(path.join(root,'assets/workbench-spec.example.json'),'utf8'));
const source=base.dataSources[0].id;
const decision={...structuredClone(base),schemaVersion:'1.1',workbenchType:'decision',decisionSupport:{goalSourceIds:[source],candidateSourceIds:[source],rankingOrder:['用户确认的目标贡献','同等贡献时考虑期限'],selectionMode:'model',fallbackMode:'rule',confirmationMode:'human-confirmed',planStore:'data/plans.json',refreshTriggers:['打开','跨日','来源变化'],invalidationInputs:['日期','目标版本','来源处理版本','确认版本'],failurePolicy:'单次超时、互斥、冷却、规则提案明确标识',executionBoundary:'只生成提案；本人确认计划；不自动执行'}};
let count=0;
function run(name,spec,valid){const file=path.join(temp,name+'.json');fs.writeFileSync(file,JSON.stringify(spec));const r=spawnSync(process.execPath,[path.join(root,'scripts/validate-workbench-spec.mjs'),file],{encoding:'utf8'});assert.equal(r.status===0,valid, name+' '+r.stdout+r.stderr);count++;}
run('legacy',{...base,schemaVersion:'1.0',workbenchType:undefined},true);run('decision',decision,true);run('operations',{...base,schemaVersion:'1.1',workbenchType:'operations'},true);
for(const key of ['goalSourceIds','rankingOrder','candidateSourceIds','fallbackMode','confirmationMode','failurePolicy','invalidationInputs','refreshTriggers','executionBoundary','planStore']){const x=structuredClone(decision);delete x.decisionSupport[key];run('missing-'+key,x,false);}
run('missing-decision',{...decision,decisionSupport:undefined},false);
const badSource=structuredClone(decision);badSource.decisionSupport.goalSourceIds=['unknown'];run('unknown-source',badSource,false);
const approval=structuredClone(decision);approval.decisionSupport.confirmationMode='automatic';run('fake-human-confirmation',approval,false);
const empty=structuredClone(decision);empty.decisionSupport.invalidationInputs=[];run('no-cache-invalidation',empty,false);
console.log(JSON.stringify({allPassed:true,checks:count,level:'contract-validation-only',fixtureDirectory:temp,behavioralSkillEvaluation:false}));
