import { div, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, spaces, panes, machines, layouts, props, shared, setShared, setAgentOrder, run, window, exec, closeOverlay } from "herdr";
import Simulator from "./simulation.js";
import { palette, root, art, label, display, button, section, statusColor, indicator, openRole, context, newMenu, motion, mono, pad, ART } from "./kit.js";
import { STATUS, tally, livery, listedLayouts, layoutTitle, parseBattery, parseNetwork } from "./model.js";

const UNITS = [{name:"PROTOTYPE",pilot:"REI AYANAMI",color:"#d9a544"},{name:"TEST TYPE",pilot:"SHINJI IKARI",color:"#ac8ce8"},{name:"PRODUCTION",pilot:"ASUKA LANGLEY",color:"#ec6f5a"}];
const role = () => props()?.role ?? (props()?.pane ? "pane" : "layouts");
const who = a => a.title || a.program?.name || a.app || a.address;
const assigned = a => livery(a,shared(`evangelion.livery.${a.address}`));
const unitColor = i => palette().dark ? UNITS[i].color : ["#855b0a","#6940a4","#a92b25"][i];
const relevantSpace = () => spaces().find(s=>s.active);
const right = action => (_e,cx) => {cx.stop_propagation();action();};

export default class Evangelion extends Simulator {
  init(_props,cx) {
    this.logoClicks=0; this.magiClicks=0;
    this.net={state:"unknown",interfaces:[]};this.battery={present:null};this.telemetryAt=null;this.polling=false;
    this.initSimulation();
    if(role()==="bottom") { this.pollHost(cx);cx.timer.every(30000,c=>this.pollHost(c)); }
  }
  pollHost(cx) {
    if(this.polling)return;
    if(window()?.platform!=="macos") { this.net={state:"unknown",interfaces:[]};this.battery={present:false};return; }
    this.polling=true;
    cx.spawn(async c=>{
      const results=await Promise.allSettled([exec("/usr/sbin/scutil",["--nwi"]),exec("/usr/bin/pmset",["-g","batt"])]);
      const [n,b]=results;
      this.net=n.status==="fulfilled"&&n.value.code===0?parseNetwork(n.value.stdout):{state:"unknown",interfaces:[]};
      this.battery=b.status==="fulfilled"&&b.value.code===0?parseBattery(b.value.stdout):{present:this.battery.present===true?true:null,percent:null,charging:false,ac:false};
      this.telemetryAt=Date.now();this.polling=false;c.notify();
    });
  }
  render() {
    switch(role()) {
      case "top":return this.top(); case "side":return this.side(); case "tabs":return this.tabs();
      case "monitor":return this.monitor();case "bottom":return this.bottom();case "pane":return this.pane();
      case "simulation":return this.simulation();case "archive":return this.archive();case "penpen":return this.penpen();
      case "help":return this.help();case "agent":return this.agentDetails();default:return this.layoutMenu();
    }
  }
  top() {
    const p=palette(),s=relevantSpace(),counts=tally(agents());
    return h_flex().size_full().bg(p.chrome).border_b(2).border_color(p.orange).pr(12).pl(window()?.platform==="macos"?88:14).gap(12).items_center()
      .child(h_flex().id("nerv-emblem").gap(4).items_center().cursor_pointer().tooltip("NERV / three taps open a classified channel")
        .on_mouse_down("left",(_e,cx)=>cx.stop_propagation()).on_click((_e,cx)=>{this.logoClicks++;if(this.logoClicks%3===0)openRole("archive");cx.notify();})
        .child(art("nerv",43)).child(display("NERV",p.red,31)))
      .child(div().w(1).h(34).bg(p.border))
      .child(v_flex().flex_1().min_w(0).gap(1).child(label("特務機関 / OPERATIONS CONTROL",p.orange,10))
        .child(display(s?.name?.toUpperCase()??"AWAITING DEPLOYMENT",p.foreground,23).truncate()))
      .child(label(counts.blocked?`${pad(counts.blocked)} INPUT REQUESTS`:`${pad(agents().length)} UNITS LINKED`,counts.blocked?p.red:p.green,11))
      .child(button("toggle-monitor","MAGI",()=>run("layout.toggle",{id:"nerv-monitor"}),{tip:"Show or hide the MAGI monitor"}))
      .child(button("simulation-open","SIM",()=>openRole("simulation"),{tip:"Open tactical training games"}))
      .child(button("manual-open","?",()=>openRole("help"),{tip:"Operations manual and easter egg hints"}))
      .when(Boolean(window()?.buttons),el=>el
        .child(button("window-min","−",()=>run("window.minimize")))
        .child(button("window-max","□",()=>run("window.maximize")))
        .child(button("window-close","×",()=>run("window.close"))));
  }
  side() {
    const p=palette(),list=agents(),filter=shared("evangelion.filter")??"all";
    setAgentOrder(list.map(a=>a.address));
    // Include every agent in navigation even when a status filter hides its card.
    // Using model order keeps keyboard navigation stable across status changes.
    // setAgentOrder is called from the list, not from the monitor or header.
    return this.sidebarContent(p,list,filter);
  }
  sidebarContent(p,list,filter) {
    const visible=list.filter(a=>filter==="all"||a.status===filter);
    return root().p(12).gap(10)
      .child(section("DEPLOYMENTS", `${pad(spaces().length)} SPACES`))
      .child(v_flex().id("deployments-scroll").h(190).min_h(90).overflow_y_scrollbar().gap(4).children(spaces().map((s,i)=>
        v_flex().id(`deployment-${s.id}`).flex_none().p(7).gap(3).bg(s.active?p.selected:p.surface).border_l(s.active?3:1).border_color(s.active?p.orange:p.border)
          .cursor_pointer().tooltip(`${s.name}\n${s.folder}\n${s.machine??"Local computer"}`).on_click(()=>run("space.select",{id:s.id}))
          .on_mouse_down("right",right(()=>context("space",{space:s.id})))
          .child(h_flex().gap(7).items_center().child(label(pad(i+1),p.orange,12)).child(div().flex_1().min_w(0).text_size(12).truncate().child(s.name)).child(indicator(s.status)))
          .child(label(`${s.machine??"LOCAL"} / ${s.tabs.length} OPERATIONS`,p.muted,9).truncate()))))
      .child(button("new-deployment","+ DEPLOYMENT",()=>run("space.new"),{tip:"Create a new Herdr workspace"}))
      .child(section("EVA UNITS", `${pad(list.length)} AGENTS`))
      .child(h_flex().gap(4).child(button("filter-all","ALL",()=>setShared("evangelion.filter","all"),{active:filter==="all",h:23,px:6}))
        .child(button("filter-blocked","NEEDS YOU",()=>setShared("evangelion.filter","blocked"),{active:filter==="blocked",h:23,px:6}))
        .child(button("filter-working","ACTIVE",()=>setShared("evangelion.filter","working"),{active:filter==="working",h:23,px:6})))
      .child(v_flex().id("units-scroll").flex_1().min_h(0).overflow_y_scrollbar().gap(7)
        .children(visible.map(a=>this.unitCard(a)))
        .when(!visible.length,el=>el.child(label(filter==="all"?"No agents linked. Use + in the tab bar to launch one.":"No units in this state.",p.muted,11))))
      .child(label("CENTRAL DOGMA / TOKYO-3",p.orange,9));
  }
  unitCard(a) {
    const p=palette(),u=assigned(a);
    return v_flex().id(`eva-${a.address}`).flex_none().border(1).border_color(a.focused?p.orange:p.border).bg(p.surface).p(7).gap(5)
      .child(h_flex().id(`eva-focus-${a.address}`).gap(8).items_center().cursor_pointer().tooltip(`Focus ${who(a)} · ${a.address}`)
        .on_click(()=>run("agent.focus",{terminal:a.address})).on_mouse_down("right",right(()=>context("pane",{pane:a.pane,terminal:a.address})))
        .child(art(`unit${pad(u)}`,41))
        .child(v_flex().flex_1().min_w(0).gap(1).child(display(`EVA-${pad(u)} / ${a.address}`,unitColor(u),18).truncate())
          .child(div().text_size(11).truncate().child(who(a))).child(label(a.space_name,p.muted,9).truncate())))
      .child(h_flex().gap(5).items_center().child(indicator(a.status)).child(label(STATUS[a.status]??"UNKNOWN",statusColor(a.status),10)).child(div().flex_1())
        .child(button(`eva-info-${a.address}`,"DETAILS",()=>openRole("agent",{address:a.address}),{h:20,size:8,px:5})));
  }
  tabs() {
    const p=palette(),s=relevantSpace();
    return h_flex().size_full().gap(5).items_center()
      .child(h_flex().id("operations-tabs").flex_1().min_w(0).overflow_x_scroll().gap(5).children((s?.tabs??[]).map(t=>
        h_flex().id(`op-${t.id}`).h(31).min_w(85).max_w(220).px(9).gap(6).items_center().flex_none().bg(t.active?p.selected:p.surface)
          .border_b(t.active?3:1).border_color(t.active?p.orange:p.border).cursor_pointer().tooltip(`${t.name} · ${t.panes} panes`)
          .on_click(()=>run("tab.select",{id:t.id})).on_mouse_down("right",right(()=>context("tab",{tab:t.id})))
          .child(label(pad(t.index),p.orange,10)).child(div().truncate().text_size(11).child(t.name)).child(indicator(t.status)))))
      .child(button("new-operation","+",newMenu,{h:31,tip:"New terminal, agent, or workspace"}))
      .child(button("palette","⌘",()=>run("app.palette"),{h:31,tip:"Herdr command palette"}));
  }
  magiNode(name,index,status) {
    const p=palette(),n=tally(agents())[status],c=statusColor(status);
    return v_flex().id(`magi-${name}`).flex_1().min_w(0).p(6).gap(4).border(1).border_color(c).bg(p.surface).cursor_pointer()
      .tooltip(`${name} · ${STATUS[status]}: ${n} agents. Click to filter the unit list.`)
      .on_click(()=>setShared("evangelion.filter",status))
      .child(label(`${name}·${index}`,c,9)).child(display(pad(n),c,31)).child(label(STATUS[status],p.muted,8));
  }
  monitor() {
    const p=palette(),list=agents(),blocked=list.filter(a=>a.status==="blocked"),counts=tally(list);
    return root().p(12).gap(11)
      .child(h_flex().id("magi-heading").justify_between().items_center().cursor_pointer().tooltip("MAGI telemetry / seven taps reveal SEELE")
        .on_click((_e,cx)=>{this.magiClicks++;if(this.magiClicks%7===0)openRole("archive");cx.notify();})
        .child(display("MAGI",p.orange,32)).child(label("SYS / 127",p.muted,9)))
      .child(label("HERDR STATUS CHANNELS",p.muted,9))
      .child(svg(`${ART}/hazard.svg`).h(4).w_full().flex_none().text_color(p.orange))
      .child(h_flex().px(34).child(this.magiNode("BALTHASAR",2,"done")))
      .child(h_flex().gap(6).child(this.magiNode("CASPER",3,"blocked")).child(this.magiNode("MELCHIOR",1,"working")))
      .child(h_flex().h(26).justify_center().items_center().bg(counts.blocked?p.red:p.green).text_color(p.dark?"#111817":"#ffffff").font_family(mono).text_size(10)
        .child(counts.blocked?"審議中 / INPUT REQUIRED":"正常 / NO BLOCKED UNITS"))
      .child(section("CONTACT SIGNALS", `${pad(blocked.length)}`))
      .child(v_flex().id("contacts-scroll").flex_1().min_h(0).overflow_y_scrollbar().gap(7)
        .when(!blocked.length,el=>el.child(v_flex().gap(8).items_center().py(8).child(art("ramiel",70)).child(label("NO ANGEL CONTACT",p.muted,10)).child(label("No agents need input.",p.muted,10))))
        .children(blocked.map((a,i)=>h_flex().id(`contact-${a.address}`).p(5).gap(6).border_l(2).border_color(p.red).cursor_pointer()
          .on_click(()=>run("agent.focus",{terminal:a.address})).tooltip(`Input requested by ${who(a)}`)
          .child(art(i%2?"sachiel":"ramiel",32)).child(v_flex().flex_1().min_w(0).gap(3)
            .child(label("PATTERN BLUE",p.blue,9)).child(label(who(a),p.foreground,10).truncate()).child(label(`${a.address} / NEEDS YOU`,p.red,9))))))
      .child(section("UMBILICAL LINKS", "MACHINES"))
      .child(v_flex().id("machines-scroll").max_h(90).overflow_y_scrollbar().gap(4).children(machines().map(m=>h_flex().gap(6).items_center()
        .child(div().size(5).bg(m.layout==="ready"?p.green:m.layout==="loading"?p.orange:p.red))
        .child(label(m.name??"LOCAL",p.foreground,9).flex_1().truncate()).child(label(m.layout.toUpperCase(),p.muted,8)))))
      .child(button("refrigeration","REFRIGERATION / 02",()=>openRole("penpen"),{h:24,size:9,tip:"Inspect the refrigeration system"}));
  }
  bottom() {
    const p=palette(),counts=tally(agents()),net=this.net,b=this.battery;
    const batteryText=b.percent==null?"?":`${b.percent}%`;
    const batteryColor=b.percent!=null&&b.percent<=20&&!b.ac?p.red:p.green;
    const time=this.telemetryAt?new Date(this.telemetryAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"pending";
    return h_flex().size_full().px(9).gap(9).items_center().bg(p.chrome).border_t(1).border_color(p.orange)
      .child(button("evangelion-layout-switcher","EVANGELION ▾",()=>run("mod.open",{name:"evangelion"}),{h:24,color:p.orange,tip:"Switch Herdr layout"}))
      .child(label(`${pad(counts.working)} ACTIVE / ${pad(counts.blocked)} WAITING`,p.muted,10))
      .child(div().flex_1())
      .child(button("motion-toggle",motion()?"MOTION ON":"MOTION OFF",()=>setShared("evangelion.motion",!motion()),{h:23,size:9,tip:"Toggle decorative animation"}))
      .child(h_flex().id("host-network").gap(5).items_center().tooltip(`Local network: ${net.interfaces.join(", ")||net.state}. Link status only, not an Internet test. Updated ${time}.`)
        .child(svg(`${ART}/network.svg`).size(17).text_color(net.state==="up"?p.green:net.state==="down"?p.red:p.muted))
        .child(label(`LINK ${net.state.toUpperCase()}`,net.state==="up"?p.green:p.muted,9)))
      .when(b.present===true,el=>el.child(h_flex().id("host-battery").gap(5).items_center()
        .tooltip(`Local battery ${batteryText} · ${b.charging?"charging":b.ac?"AC power":b.state??"unknown"}. Updated ${time}.`)
        .child(svg(`${ART}/battery.svg`).w(23).h(19).text_color(batteryColor))
        .child(label(`${b.ac?"AC ":""}${batteryText}${b.charging?" +":""}`,batteryColor,10))))
      .when(b.present===null,el=>el.child(label("POWER ?",p.muted,9).tooltip("Battery hardware status unavailable.")))
      .child(button("nerv-settings","SYS",()=>run("app.settings"),{h:23,size:9,tip:"Herdr settings"}));
  }
  pane() {
    const p=palette(),pane=panes().find(x=>x.pane===props()?.pane);
    if(!pane)return div();
    const a=agents().find(x=>x.address===pane.terminal),u=a?assigned(a):null;
    return h_flex().id(`nerv-pane-${pane.pane}`).size_full().px(7).gap(7).items_center().bg(pane.focused?p.selected:p.surface)
      .border_b(1).border_color(pane.focused?p.orange:p.border).on_click(()=>run("pane.focus",{pane:pane.pane}))
      .on_mouse_down("right",right(()=>context("pane",{pane:pane.pane,terminal:pane.terminal})))
      .child(label(a?`EVA-${pad(u)} / ${a.address}`:"ENTRY PLUG",a?unitColor(u):p.orange,10))
      .child(div().flex_1().min_w(0).truncate().text_size(10).child(pane.title||pane.program?.name||"Terminal"))
      .child(indicator(pane.status))
      .child(button(`split-${pane.pane}`,"+",()=>run("pane.split",{pane:pane.pane,direction:"right"}),{h:19,px:4,tip:"Split this pane right"}))
      .child(button(`zoom-${pane.pane}`,pane.zoomed?"↙":"↗",()=>run("pane.zoom",{pane:pane.pane}),{h:19,px:4,tip:"Toggle pane zoom"}));
  }
  agentDetails() {
    const p=palette(),a=agents().find(x=>x.address===props()?.address);
    if(!a)return this.dialog("UNIT OFFLINE","LINK ENDED",label("This agent is no longer connected.",p.muted));
    const u=assigned(a);
    return this.dialog(`EVA-${pad(u)} / ${a.address}`,"UNIT CONFIGURATION",v_flex().gap(10)
      .child(h_flex().gap(14).items_center().child(art(`unit${pad(u)}`,88)).child(v_flex().gap(5).child(display(UNITS[u].name,p.orange,24)).child(label(who(a),p.foreground,12)).child(label(STATUS[a.status],statusColor(a.status)))))
      .child(label(`DEPLOYMENT: ${a.space_name}`,p.muted,11)).child(label(`OPERATION: ${a.tab_name}`,p.muted,11))
      .child(section("SELECT LIVERY", "COSMETIC"))
      .child(h_flex().gap(6).children(UNITS.map((unit,i)=>button(`livery-${i}`,`EVA-${pad(i)}`,()=>setShared(`evangelion.livery.${a.address}`,i),{active:u===i,color:unitColor(i)}))))
      .child(label("Liveries change the display only. Agent identity and behavior stay the same.",p.muted,10))
      .child(button("unit-focus","FOCUS UNIT",()=>{closeOverlay(props()?.overlay);run("agent.focus",{terminal:a.address});})));
  }
  layoutMenu() {
    const p=palette(),current=shared("layout");
    return v_flex().w_full().p(9).gap(3).bg(p.popover).border(2).border_color(p.orange).font_family(mono)
      .child(section("INTERFACE TRANSFER","NERV"))
      .children(listedLayouts(layouts()).map(name=>button(`layout-${name}`,`${name===current?"●":"○"}  ${layoutTitle(name)}`,()=>{closeOverlay(props()?.overlay);if(name!==current)run("layout.switch",{name});},{active:name===current,h:28}).w_full().justify_start()));
  }
}
