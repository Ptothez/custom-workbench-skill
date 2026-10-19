import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function validateNavigation(spec){
 const errors=[],nodes=spec.interactionMap?.nodes;
 if(!Array.isArray(nodes)||!nodes.length)return ['interactionMap.nodes must describe actual pages'];
 const byId=new Map();
 for(const n of nodes){if(!n.id||byId.has(n.id))errors.push('duplicate or missing node id: '+n.id);byId.set(n.id,n);if(!n.label||!n.route)errors.push('missing label or route: '+n.id);if(n.kind==='external'&&n.openMode!=='new-context')errors.push('external entry must preserve workbench: '+n.id);}
 for(const n of nodes){if(n.parentId&&!byId.has(n.parentId))errors.push('unknown parent: '+n.id);let current=n;const seen=new Set();while(current){if(seen.has(current.id)){errors.push('parent cycle: '+n.id);break;}seen.add(current.id);current=byId.get(current.parentId);}}
 const routes=nodes.filter(n=>n.kind!=='external').map(n=>n.route);if(new Set(routes).size!==routes.length)errors.push('duplicate internal route');return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const spec=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),errors=validateNavigation(spec);if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('VALID navigation map: '+spec.interactionMap.nodes.length+' nodes');}catch(e){console.error(e.message);process.exitCode=1;}
}
