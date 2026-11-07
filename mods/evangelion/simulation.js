import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { props, shared, setShared, closeOverlay } from "herdr";
import { palette, root, art, label, display, button, section, motion, mono } from "./kit.js";
import { containment, toggleCell, memoryDeck, memoryPick } from "./model.js";

const CARD_ART = ["unit01","unit02","unit00","ramiel","sachiel","penpen","lance","moon"];
const CARD_NAMES = ["EVA-01","EVA-02","EVA-00","RAMIEL","SACHIEL","PEN PEN","LONGINUS","MOON"];
export default class Simulator extends View {
  initSimulation() {
    this.game = props()?.game ?? "ireul";
    this.seed = Date.now() >>> 0;
    this.newContainment(); this.newMemory();
    this.fridge = false; this.warks = 0;
  }
  newContainment() { this.puzzle = containment(++this.seed); this.grid = this.puzzle.board; this.moves = 0; this.trail = []; this.history = []; this.hint = null; }
  newMemory() { this.memory = {cards:memoryDeck(++this.seed),open:[],matched:[],turns:0}; }
  saveWin(game, score) {
    const old = shared(`evangelion.best.${game}`);
    if (!Number.isFinite(old) || score < old) setShared(`evangelion.best.${game}`,score);
    setShared(`evangelion.clear.${game}`,true);
  }
  dialog(title, subtitle, body) {
    const p=palette();
    return root().border(2).border_color(p.orange).p(16).gap(12)
      .child(h_flex().gap(12).items_center().flex_none()
        .child(art("nerv",30)).child(v_flex().flex_1().child(display(title,p.orange,26)).child(label(subtitle,p.muted,10)))
        .child(button("dialog-close","CLOSE",()=>closeOverlay(props()?.overlay))))
      .child(div().id("dialog-body").flex_1().min_h(0).overflow_y_scrollbar().child(body));
  }
  simulation() {
    const p=palette();
    const nav=h_flex().gap(8).child(button("game-ireul","13 / IREUL",(_e,cx)=>{this.game="ireul";cx.notify();},{active:this.game==="ireul"}))
      .child(button("game-israfel","09 / ISRAFEL",(_e,cx)=>{this.game="israfel";cx.notify();},{active:this.game==="israfel"}));
    return this.dialog("TACTICAL SIMULATION", "NERV TRAINING / LOCAL GAME",v_flex().gap(12).child(nav).child(this.game==="ireul" ? this.ireul() : this.israfel())
      .child(label("Simulations never send input to agents or change terminals.",p.muted,10)));
  }
  ireul() {
    const p=palette(), cleared=!this.grid.some(Boolean);
    const board=v_flex().gap(5).items_center();
    for (let row=0;row<5;row++) board.child(h_flex().gap(5).children(Array.from({length:5},(_,col)=>{
      const i=row*5+col, infected=this.grid[i];
      return button(`cell-${i}`,infected?"侵蝕":"·",(_e,cx)=>{
        if(cleared)return;
        this.history.push([...this.grid]);this.grid=toggleCell(this.grid,i);this.trail.push(i);this.moves++;this.hint=null;
        if(!this.grid.some(Boolean))this.saveWin("ireul",this.moves);
        cx.notify();
      },{h:44,px:0,color:infected?p.red:p.green,active:infected,tip:`Sector ${row+1}.${col+1}: ${infected?"infected":"clear"}. Toggle it and its four neighbors.`}).w(58);
    })));
    return v_flex().gap(12)
      .child(section("MAGI / CONTAINMENT", "EPISODE 13"))
      .child(label("Ireul has entered the simulation grid. Clear every red cell.",p.foreground,12))
      .child(label("A click toggles that cell and its four adjacent neighbors.",p.muted,11))
      .child(board)
      .child(h_flex().gap(8).justify_center()
        .child(button("ireul-new","NEW GRID",(_e,cx)=>{this.newContainment();cx.notify();}))
        .child(button("ireul-undo","UNDO",(_e,cx)=>{if(this.history.length){this.grid=this.history.pop();this.trail.pop();this.moves=Math.max(0,this.moves-1);this.hint=null;}cx.notify();}))
        .child(button("ireul-hint","MAGI HINT",(_e,cx)=>{
          const parity=new Set(); for(const i of [...this.puzzle.solution,...this.trail]) { if(parity.has(i))parity.delete(i);else parity.add(i); }
          const i=[...parity][0];this.hint=i===undefined?"All sectors clear.":`Try sector ${Math.floor(i/5)+1}.${i%5+1}`;cx.notify();
        })))
      .child(label(`${this.moves} MOVES / ${this.grid.filter(Boolean).length} INFECTED / BEST ${shared("evangelion.best.ireul")??"—"}`,p.orange,11))
      .child(label(cleared?"CASPER-3: CONTAINMENT COMPLETE. ALL GREEN.":this.hint??"MAGI consensus pending.",cleared?p.green:p.muted,12))
      .when(cleared,el=>el.child(this.congratulations()))
      .child(label("Episode 13's computer-infiltrating Angel inspired this reversible logic puzzle.",p.muted,10));
  }
  israfel() {
    const p=palette(),state=this.memory,won=state.matched.length===16;
    const board=v_flex().gap(5).items_center();
    for(let row=0;row<4;row++) board.child(h_flex().gap(5).children(Array.from({length:4},(_,col)=>{
      const i=row*4+col,matched=state.matched.includes(i),face=matched||state.open.includes(i),value=state.cards[i];
      return v_flex().id(`memory-${i}`).w(96).h(65).items_center().justify_center().gap(1).bg(matched?p.selected:p.surface)
        .border(1).border_color(matched?p.green:face?p.orange:p.border).cursor_pointer()
        .accessibility_label(`Card ${i+1}: ${face?CARD_NAMES[value]:"face down"}`)
        .on_mouse_down("left",(_e,cx)=>cx.stop_propagation())
        .on_click((_e,cx)=>{const before=this.memory;this.memory=memoryPick(before,i);if(before.matched.length<16&&this.memory.matched.length===16)this.saveWin("israfel",this.memory.turns);cx.notify();})
        .child(face?art(CARD_ART[value],38):display("SYNC",p.muted,21))
        .child(label(face?CARD_NAMES[value]:`${i+1}`,matched?p.green:p.muted,9));
    })));
    return v_flex().gap(12)
      .child(section("ISRAFEL / SYNCHRONIZATION", "EPISODE 09"))
      .child(label("Find all eight pairs. Reveal two cards per attempt.",p.foreground,12))
      .child(label("After a mismatch, use CONTINUE to turn them face down.",p.muted,11))
      .child(board)
      .child(h_flex().gap(8).justify_center()
        .child(button("memory-new","NEW DRILL",(_e,cx)=>{this.newMemory();cx.notify();}))
        .child(button("memory-next","CONTINUE",(_e,cx)=>{if(this.memory.open.length===2)this.memory={...this.memory,open:[]};cx.notify();},{active:state.open.length===2})))
      .child(label(`${state.matched.length/2}/8 PAIRS / ${state.turns} ATTEMPTS / BEST ${shared("evangelion.best.israfel")??"—"}`,p.orange,11))
      .when(won,el=>el.child(this.congratulations()))
      .child(label("The synchronized Eva-01 / Eva-02 battle inspired this matching drill.",p.muted,10));
  }
  congratulations() {
    const p=palette();
    let title=div().font_family("Times New Roman").font_weight(700).text_size(29).text_color(p.green).child("CONGRATULATIONS.");
    if(motion())title=title.loop("opacity",{from:.65,to:1,period:2400});
    return v_flex().items_center().py(6).child(title).child(label("おめでとう / TRAINING COMPLETE",p.muted,10));
  }
  archive() {
    const p=palette();
    return this.dialog("CLASSIFIED / SEELE", "ACCESS GRANTED · THE DEAD SEA SCROLLS",v_flex().gap(14).items_center()
      .child(art("seele",150)).child(display("HUMAN INSTRUMENTALITY",p.red,27))
      .child(label("CASPER-3 REFUSES THE PROPOSAL.",p.orange,12))
      .child(label("Your terminals remain separate. Your agents keep their identities.",p.foreground,11))
      .child(section("ARCHIVE / DISCOVERIES", "SECRET 01"))
      .child(label(`Ireul containment: ${shared("evangelion.clear.ireul")?"CLEARED":"UNRESOLVED"}`,p.muted))
      .child(label(`Israfel drill: ${shared("evangelion.clear.israfel")?"SYNCHRONIZED":"UNRESOLVED"}`,p.muted))
      .child(label("The seventh eye watches the MAGI. Refrigeration is not empty.",p.muted,10)));
  }
  penpen() {
    const p=palette();
    return this.dialog("REFRIGERATION / UNIT 02", "MISATO'S QUARTERS · OFF-DUTY CHANNEL",v_flex().gap(16).items_center()
      .child(display(this.fridge?"RESIDENT DETECTED":"KEEP REFRIGERATED",p.blue,27))
      .child(this.fridge?art("penpen",180):div().w(140).h(180).border(3).border_color(p.blue).bg(p.surface).p(20).child(display("02",p.blue,65)).child(label("PEN PEN",p.muted)))
      .child(button("fridge",this.fridge?"CLOSE DOOR":"OPEN REFRIGERATOR",(_e,cx)=>{this.fridge=!this.fridge;cx.notify();}))
      .when(this.fridge,el=>el.child(button("wark","WARK?",(_e,cx)=>{this.warks++;cx.notify();})))
      .child(label(this.fridge?["WARK. Breaks improve synchronization.","WARK! The penguin has no pending reviews.","WARK. Please close the refrigerator."][this.warks%3]:"A familiar resident is waiting inside.",p.muted,11)));
  }
  help() {
    const p=palette();
    const lines=[
      ["DEPLOYMENTS", "Spaces are deployments; operation tabs and every real name stay visible. Right-click a space or tab for Herdr actions."],
      ["EVA UNITS", "Click a unit to focus its agent. The DETAILS button selects an EVA-00, EVA-01 or EVA-02 livery. The terminal address distinguishes every unit."],
      ["REAL STATUS", "ACTIVE = working; NEEDS YOU = blocked; COMPLETE = done; STANDBY = idle. MAGI channels count those states; they are not additional AI agents."],
      ["ANGEL CONTACT", "A blocked agent appears as a stylized Angel contact. The alert always names the actual agent and means it needs your input."],
      ["UMBILICAL", "Bottom-bar link and battery readings describe this computer. Remote machine readiness appears in the monitor. Local link availability does not prove Internet access."],
      ["TRAINING", "SIM opens the Ireul containment puzzle and Israfel matching drill. Games save best scores locally, never run terminal commands, and never send agent prompts."],
      ["QUIET OPERATIONS", "MOTION in the status bar disables decorative motion. There are no automatic sounds, flashing alarms, or takeover screens."],
      ["CLASSIFIED HINTS", "Tap the NERV emblem three times. Tap the MAGI heading seven times. Inspect REFRIGERATION / 02 in the monitor. Complete a training exercise."],
      ["TYPOGRAPHY", "Original vector emblems and silhouettes; bundled OFL Antonio for condensed labels. Times / Hiragino Mincho give title-card contrast; the proprietary Matisse font is not bundled."],
    ];
    return this.dialog("OPERATIONS MANUAL", "NERV / HERDR ADAPTATION",v_flex().gap(14).children(lines.map(([head,body])=>v_flex().gap(4).child(display(head,p.orange,18)).child(div().font_family(mono).text_size(12).text_color(p.foreground).child(body)))));
  }
}
