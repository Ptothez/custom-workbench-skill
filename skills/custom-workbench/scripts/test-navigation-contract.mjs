import assert from 'node:assert/strict';
import {validateNavigation} from './validate-navigation-contract.mjs';
const root={id:'home',label:'Today',route:'/',kind:'page'},child={id:'records',parentId:'home',label:'Records',route:'/records',kind:'page'};
assert.deepEqual(validateNavigation({interactionMap:{nodes:[root,child]}}),[]);
for(const nodes of [[root,{...child,parentId:'missing'}],[root,{...child,id:'home'}],[{...root,parentId:'records'},child],[root,{...child,route:'/'}],[root,{...child,kind:'external',route:'https://example.org'}]])assert.ok(validateNavigation({interactionMap:{nodes}}).length);
assert.ok(validateNavigation({}).length);console.log('Navigation contract: 7 cases passed');
