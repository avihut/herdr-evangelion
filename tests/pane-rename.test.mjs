import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Exercise the actual integration functions with Herdr's file/overlay boundary
// replaced. No installed optional plugin or live window is changed.
const helperSource=await readFile(new URL('../mods/evangelion/pane-rename.js',import.meta.url),'utf8');
const kitSource=await readFile(new URL('../mods/evangelion/kit.js',import.meta.url),'utf8');
let serial=0;
async function fixture(read,shared=()=>null) {
  const opened=[],reads=[];
  const key=`__paneRenameFixture${++serial}`;
  globalThis[key]={shared,readTextFile:async path=>{reads.push(path);return read(path);},appHome:()=>'/example',openOverlay:options=>{opened.push(options);return 'overlay-id';}};
  const helperText=helperSource.replace(/import \{([^}]+)\} from "herdr";/,`const {$1}=globalThis[${JSON.stringify(key)}];`);
  const url='data:text/javascript;base64,'+Buffer.from(helperText).toString('base64');
  const helper=await import(url);
  const kitText=kitSource.replace('"./pane-rename.js"',JSON.stringify(url))
    .replace(/import \{[^}]+\} from "gpui-kit";/,'const div=()=>{}, image=()=>{};')
    .replace(/import \{[^}]+\} from "gpui-base";/,'const h_flex=()=>{}, v_flex=()=>{};')
    .replace(/import \{([^}]+)\} from "herdr";/,`const {$1}=globalThis[${JSON.stringify(key)}];`);
  const kit=await import('data:text/javascript;base64,'+Buffer.from(kitText).toString('base64'));
  delete globalThis[key];
  return {helper,kit,opened,reads};
}

test('absent optional dependency routes pane context to the ordinary menu',async()=>{
  const f=await fixture(()=>{throw Error('not installed');});
  const target={pane:'clicked-pane',terminal:'clicked-terminal'};
  await f.kit.context('pane',target);
  assert.equal(f.opened[0].mod,'menu');
  assert.deepEqual(f.opened[0].props,{tab:'pane',target});
});
test('malformed and unsupported capability manifests fail closed',async()=>{
  for(const text of ['{','null','{}','{"pane_rename_api":2}']) {
    const f=await fixture(()=>text);
    assert.equal(await f.helper.paneRenameAvailable(),false);
  }
});
test('supported pane menu preserves clicked target and content sizing',async()=>{
  const f=await fixture(()=>' {"pane_rename_api":1}');
  const target={pane:'unfocused-pane',terminal:'other-terminal'};
  await f.kit.context('pane',target);
  assert.equal(f.opened[0].mod,'pane-rename-menu');
  assert.deepEqual(f.opened[0].props.target,target);
  assert.equal(f.opened[0].height,undefined);
  assert.equal(f.reads.length,1);
});
test('space and tab menus do not probe the optional capability',async()=>{
  const f=await fixture(()=>{throw Error('should not be read');});
  await f.kit.context('space',{space:'space'});
  await f.kit.context('tab',{tab:'tab'});
  assert.equal(f.reads.length,0);
  assert.ok(f.opened.every(x=>x.mod==='menu'));
});
test('pane names are identity-scoped and invalid values fall back',async()=>{
  const p={pane:'pane',terminal:'terminal',mod:null};
  const key='pane-rename.v1:'+JSON.stringify(['pane','terminal',null]);
  const f=await fixture(()=>null,k=>k===key?'名前 🚀':null);
  assert.equal(f.helper.renamedPane(p),'名前 🚀');
  assert.equal(f.helper.renamedPane({...p,terminal:'replaced-terminal'}),null);
  assert.equal(f.helper.renamedPane(null),null);
});
