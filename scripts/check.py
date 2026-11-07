#!/usr/bin/env python3
"""Check native roles in temporary copies. Never switch or edit the live layout."""
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ROLES = ['layouts','top','side','tabs','monitor','bottom','pane','simulation','archive','penpen','help','agent']

def prepare(folder, role, variant):
    shutil.copytree(ROOT/'mods/evangelion', folder)
    path=folder/'main.js'; code=path.read_text()
    code=re.sub(r'const role = .*?;', f'const role = () => {json.dumps(role)};', code, count=1)
    code=code.replace('if(role()==="bottom") { this.pollHost(cx);cx.timer.every(30000,c=>this.pollHost(c)); }','')
    if variant=='populated':
        for name in ['agents','spaces','panes','machines','props']:
            code=re.sub(r'\b'+name+r'(?=,)', name+' as live_'+name, code, count=1)
        code+='''
const props=()=>({pane:"example-pane",address:"example-agent"});
const agents=()=>[{address:"example-agent",pane:"example-pane",app:"codex",title:"Example agent",status:"blocked",space_name:"Example deployment",tab_name:"Example operation",focused:true}];
const spaces=()=>[{id:"example-space",name:"Example deployment",folder:"~",machine:null,active:true,status:"blocked",tabs:[{id:"example-tab",name:"Example operation",index:1,panes:1,active:true,status:"blocked"}]}];
const panes=()=>[{pane:"example-pane",terminal:"example-agent",title:"Example terminal",status:"blocked",focused:true}];
const machines=()=>[{name:null,layout:"ready"}];
'''
    if variant.startswith('battery-'):
        b={'present':True,'percent':19,'ac':variant=='battery-charging','charging':variant=='battery-charging','state':'discharging'}
        code=code.replace('this.initSimulation();','this.initSimulation();this.battery='+json.dumps(b)+';')
    path.write_text(code)
    sim=folder/'simulation.js'; code=sim.read_text()
    if variant=='israfel': code=code.replace('this.game = props()?.game ?? "ireul";','this.game = "israfel";')
    if variant=='fridge-open': code=code.replace('this.fridge = false;','this.fridge = true;')
    if variant=='ireul-win': code=code.replace('this.grid = this.puzzle.board;','this.grid = Array(25).fill(false);')
    if variant=='israfel-win':
        code=code.replace('this.game = props()?.game ?? "ireul";','this.game = "israfel";')
        code=code.replace('matched:[],turns:0','matched:Array.from({length:16},(_,i)=>i),turns:8')
    sim.write_text(code)

def main():
    if not shutil.which('herdr-app'): raise SystemExit('herdr-app is required for native role checks')
    cases=[(r,'default') for r in ROLES]
    cases += [(r,'populated') for r in ['side','tabs','monitor','pane','agent']]
    cases += [('simulation',v) for v in ['israfel','ireul-win','israfel-win']]
    cases += [('penpen','fridge-open'),('bottom','battery-charging'),('bottom','battery-discharging')]
    with tempfile.TemporaryDirectory(prefix='herdr-evangelion-check-') as tmp:
        for role,variant in cases:
            folder=Path(tmp)/f'{role}-{variant}';prepare(folder,role,variant)
            result=subprocess.run(['herdr-app','check',str(folder)],capture_output=True,text=True,timeout=30)
            if result.returncode: raise SystemExit(f'FAIL {role}/{variant}\n{result.stdout}\n{result.stderr}')
            print(f'PASS {role}/{variant}',flush=True)
    print(f'{len(cases)} native fixtures passed')

if __name__=='__main__':main()
