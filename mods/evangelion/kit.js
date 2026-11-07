import { div, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { theme, settings, shared, openOverlay, run } from "herdr";
export const ART = "mods/evangelion/assets";
export const mono = "Geist Mono";
export const narrow = "Antonio";
export const pad = n => String(n).padStart(2,"0");
export function palette() {
  const t = theme(), dark = settings().dark !== false;
  return { ...t, dark, orange: dark ? "#ff9d35" : "#9e4000", red: dark ? "#ff5b52" : "#bd2424", green: dark ? "#a7e957" : "#3c6712", blue: dark ? "#6bcde0" : "#006779", purple: dark ? "#ba98ff" : "#6940a4" };
}
export function motion() { return shared("evangelion.motion") !== false; }
export function art(name, size) { return image(`${ART}/${name}.svg`).w(size).h(size).flex_none(); }
export function label(text, color, size = 11) { return div().font_family(mono).text_size(size).text_color(color).child(text); }
export function display(text, color, size = 25) { return div().font_family(narrow).font_weight(700).text_size(size).text_color(color).child(text); }
export function button(id, text, action, options = {}) {
  const p = palette();
  return h_flex().id(id).h(options.h ?? 28).px(options.px ?? 9).gap(5).items_center().justify_center().flex_none()
    .border(1).border_color(options.active ? p.orange : p.border).bg(options.active ? p.selected : p.surface)
    .text_color(options.color ?? p.foreground).font_family(mono).text_size(options.size ?? 10).cursor_pointer()
    .tooltip(options.tip ?? text).accessibility_label(options.tip ?? text)
    .hover(s => s.bg(p.hover).border_color(p.orange))
    .on_mouse_down("left", (_e,cx) => cx.stop_propagation())
    .on_click((e,cx) => { cx.stop_propagation(); action(e,cx); }).child(text);
}
export function section(title, code) {
  const p = palette();
  return h_flex().w_full().flex_none().h(28).items_center().justify_between().border_b(1).border_color(p.orange)
    .child(display(title,p.orange,15)).child(label(code,p.muted,9));
}
export function statusColor(status) { const p = palette(); return ({working:p.blue,blocked:p.red,done:p.green,idle:p.muted})[status] ?? p.muted; }
export function indicator(status) {
  let dot = div().size(6).bg(statusColor(status)).flex_none();
  if (status === "working" && motion()) dot = dot.loop("opacity",{from:.35,to:1,period:1800});
  return dot;
}
export function openRole(role, extra = {}) {
  return openOverlay({ mod:"evangelion", kind:"dialog", frame:"none", width: role === "agent" ? 440 : 630, height: role === "agent" ? 410 : 640, props:{role,...extra} });
}
export const context = (tab,target) => openOverlay({mod:"menu",kind:"popup",width:240,height:320,props:{tab,target}});
export const newMenu = () => openOverlay({mod:"new-menu",kind:"popup",width:260,height:500});
export function root() { const p=palette();return v_flex().size_full().min_h(0).bg(p.chrome).text_color(p.foreground).font_family(mono); }
export function launchFocused() { run("app.palette"); }
