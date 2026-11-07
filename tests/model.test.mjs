import assert from 'node:assert/strict';
import { test } from 'node:test';
import { containment,toggleCell,memoryDeck,memoryPick,parseBattery,parseNetwork,listedLayouts,layoutTitle,livery,tally } from '../mods/evangelion/model.js';
test('every generated containment board is nonempty and solvable by legal moves',()=>{
 for(let seed=0;seed<500;seed++){
  const {board,solution}=containment(seed);assert.ok(board.some(Boolean));
  assert.equal(solution.reduce((b,i)=>toggleCell(b,i),board).some(Boolean),false);
 }
});
test('grid edges do not wrap and moves are involutions',()=>{
 const empty=Array(25).fill(false),corner=toggleCell(empty,0);
 assert.deepEqual(corner.flatMap((v,i)=>v?[i]:[]),[0,1,5]);
 for(let i=0;i<25;i++)assert.deepEqual(toggleCell(toggleCell(empty,i),i),empty);
});
test('hints remain valid after arbitrary user moves',()=>{
 const {board,solution}=containment(145);const moves=[0,4,12,24,5,0];
 const state=moves.reduce((b,i)=>toggleCell(b,i),board);
 const parity=new Set();for(const i of [...solution,...moves]){if(parity.has(i))parity.delete(i);else parity.add(i);}
 assert.equal([...parity].reduce((b,i)=>toggleCell(b,i),state).some(Boolean),false);
});
test('memory has exactly eight pairs; matched cards cannot be replayed',()=>{
 const cards=memoryDeck(123);for(let value=0;value<8;value++)assert.equal(cards.filter(x=>x===value).length,2);
 let s={cards,open:[],matched:[],turns:0};
 for(let value=0;value<8;value++)for(let i=0;i<16;i++)if(cards[i]===value)s=memoryPick(s,i);
 assert.equal(s.matched.length,16);assert.equal(s.turns,8);assert.strictEqual(memoryPick(s,0),s);
});
test('memory ignores duplicate picks and waits for dismissal after a mismatch',()=>{
 let s={cards:memoryDeck(3),open:[],matched:[],turns:0};
 s=memoryPick(s,0);assert.strictEqual(memoryPick(s,0),s);
 const other=s.cards.findIndex(x=>x!==s.cards[0]);s=memoryPick(s,other);
 assert.equal(s.open.length,2);assert.equal(s.turns,1);assert.strictEqual(memoryPick(s,15),s);
});
test('battery distinguishes desktop, charging, discharging, charged, unknown',()=>{
 assert.deepEqual(parseBattery("Now drawing from 'AC Power'"),{present:false});
 assert.equal(parseBattery('').present,null);
 const b=parseBattery("Now drawing from 'Battery Power'\n-InternalBattery-0 18%; discharging; 1:20 remaining");
 assert.equal(b.present,true);assert.equal(b.percent,18);assert.equal(b.charging,false);assert.equal(b.ac,false);
 assert.equal(parseBattery("Now drawing from 'AC Power'\n-InternalBattery-0 40%; charging; 1:00 remaining").charging,true);
 assert.equal(parseBattery("Now drawing from 'AC Power'\n-InternalBattery-0 100%; charged;").charging,false);
 assert.equal(parseBattery('-InternalBattery-0 unreadable').percent,null);
});
test('network never mistakes failure for an online connection',()=>{
 assert.equal(parseNetwork('').state,'unknown');
 assert.equal(parseNetwork('No network information').state,'down');
 assert.equal(parseNetwork('Network interfaces: (none)').state,'down');
 assert.deepEqual(parseNetwork('REACH : flags 0x2 (Reachable)\nNetwork interfaces: en0 en10\n'),{state:'up',interfaces:['en0','en10']});
});
test('native layout list hides replacements and formats titles',()=>{
 assert.deepEqual(listedLayouts(['main','my-herdr','main','win98','win98-dark','evangelion']),['my-herdr','win98-dark','evangelion']);
 assert.equal(layoutTitle('win98-dark'),'Windows 98');assert.equal(layoutTitle('lcars'),'LCARS');assert.equal(layoutTitle('my-blue_moon'),'Blue Moon');
});
test('livery and tally preserve actual agent states',()=>{
 assert.equal(livery({app:'codex'}),1);assert.equal(livery({app:'claude-code'}),2);assert.equal(livery({app:'codex'},0),0);
 assert.deepEqual(tally([{status:'blocked'},{status:'working'},{status:'blocked'}]),{working:1,blocked:2,done:0,idle:0});
});
