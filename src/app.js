globalThis.renderSchedulePage=function(){
"use strict";
globalThis.disposeSchedulePage?.();
document.body.classList.remove("immersive");
document.body.classList.remove("progress-only");
document.body.classList.remove("has-progress-art");
let progressArt=null;
const E=ScheduleEngine,D=TIMETABLE_DATA,C=CAMPUS_CALENDAR,$=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const page=document.body.dataset.page||"home",pages={home:["首页","index.html"],dashboard:["进度看板","dashboard.html"],focus:["沉浸模式","focus.html"],classic:["经典课表","classic.html"],semester:["学期总览","semester.html"]};
const now=()=>new Date();
document.documentElement.style.setProperty("--period-count",Object.keys(C.common).length);
let mode="remaining",custom=null,lastMinute="",lastState="",selection=Math.max(1,Math.min(D.semester.totalWeeks,E.week(now())));
try{custom=JSON.parse(localStorage.getItem("public-template.custom")||"null");mode=localStorage.getItem("public-template.mode")||mode;}catch{}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}}
function weekLabel(t){if(!D.semester.startDate)return "学期尚未设置";const w=E.week(t);return w<1?"开学前":w>D.semester.totalWeeks?"学期已结束":"第 "+w+" 教学周";}
function progress(title,p,color="#c96442"){
 if(!p.total)return '<div class="meter-item"><div class="meter-title"><strong>'+esc(title)+'</strong><span>暂无课程</span></div><div class="meter"><small>0 / 0 课时</small></div></div>';
 const pc=Math.round(p.value*100);
 return '<div class="meter-item"><div class="meter-title"><strong>'+esc(title)+'</strong><span>'+pc+'%</span></div><div class="meter" role="progressbar" aria-label="'+esc(title)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pc+'" aria-valuetext="已完成'+p.done+'课时，剩余'+p.left+'课时"><i style="--fill:'+color+';transform:scaleX('+p.value+')"></i><small>'+p.done+' / '+p.left+' 课时</small></div></div>';
}
function card(e,t){const ended=e.end<=t;return '<article class="event-card '+(ended?"is-ended":"")+'" style="--course:'+e.course.color+'"><div class="event-time">'+E.clock(e.start)+'<small>'+E.clock(e.end)+'</small></div><div><h3>'+esc(e.course.name)+'</h3><p>'+esc(e.room)+' · '+esc(e.teacher)+'</p><p>'+e.units.length+' 课时'+(ended?' · 已结束':e.start<=t?' · 进行中':' · 待开始')+'</p></div></article>';}
function heading(title,sub){return '<div class="section-heading"><div><h1>'+title+'</h1><p class="subtle">'+sub+'</p></div></div>';}
$("#app").innerHTML='<header class="topbar"><a class="brand" href="./index.html"><span class="brand-mark"></span>课表</a><nav aria-label="主导航">'+Object.entries(pages).map(([id,[label,file]])=>'<a href="./'+file+'"'+(id===page?' aria-current="page"':'')+'>'+label+'</a>').join("")+'</nav></header><main id="content"></main>';
if(page==="home"){
 $("#content").innerHTML='<section class="hero"><div class="hero-inner"><p class="eyebrow" id="home-week"></p><h1 id="part" class="part"></h1><div class="hero-time" id="home-clock"></div><p class="hero-date" id="home-date"></p><a class="primary-link" href="./dashboard.html">进入进度看板</a></div></section>';
}
if(page==="home"){
 $(".primary-link").insertAdjacentHTML("beforebegin",'<article id="home-next" class="status-card home-next" aria-label="下一节课"></article>');
}
if(page==="dashboard"){
 $("#content").innerHTML='<section class="page">'+heading("课程进度","按实际课时统计；条内数字为 完成课时 / 剩余课时。")+'<div class="overview-grid"><article class="panel span-2"><div class="panel-heading"><h2>整体进度</h2><span id="week-label"></span></div><div id="overall" class="progress-stack"></div></article><article class="panel"><h2>节假日</h2><div id="holidays"></div></article><article class="panel span-2"><div class="panel-heading"><h2>今日安排</h2><span id="today-date"></span></div><div id="today" class="event-list"></div></article><article class="panel"><h2>今日空闲</h2><div id="free" class="free-list"></div></article><article class="panel span-3"><h2>每门课程</h2><div id="courses" class="course-progress-grid"></div></article></div><details class="calendar-details"><summary>全年节假日与调休安排</summary><div id="calendar-list"></div><p>法定放假日期仅作提示，学校停补课以校历为准。</p><p>'+C.pendingNote+'</p><a href="'+C.source+'" target="_blank" rel="noopener">查看公开来源</a></details></section>';
}
if(page==="focus"||page==="progress"){
 document.body.classList.add("immersive");
 $("#content").innerHTML='<section class="focus-page"><p id="focus-date" class="focus-date"></p><div class="focus-clock" id="focus-clock"></div><div class="focus-state"><p><span class="state-pill" id="state-label"></span></p><h1 id="focus-title"></h1><p id="focus-detail"></p><div class="timer-rotator" id="rotator"><div id="timer-label"></div><strong id="timer-value"></strong></div><div class="capsule" id="capsule" role="progressbar" aria-label="当前计时进度" aria-valuemin="0" aria-valuemax="100"><i id="capsule-fill"></i><small id="capsule-caption"></small></div><button class="mode-button" id="toggle-mode" aria-pressed="false">切换为累计时间</button><p class="subtle" id="holiday-note"></p></div><details class="custom-panel"><summary>自定义状态与结束时间</summary><form id="custom-form"><label>当前状态<input id="custom-label" list="state-options" maxlength="30" required placeholder="例如：自习"></label><datalist id="state-options"><option value="休息"><option value="课间"><option value="午间"><option value="上课中"><option value="节假日"><option value="自习"></datalist><label>结束日期与时间<input id="custom-end" type="datetime-local" required></label><p id="form-error" role="alert"></p><div class="form-actions"><button type="submit">开始自定义状态</button><button type="button" id="reset-custom">恢复自动状态</button></div><p id="custom-hint">到达结束时间后自动恢复课表状态。时间使用北京时间。</p></form></details></section>';
 const defaultEnd=new Date(+now()+3600000);
 $("#custom-end").value=E.key(defaultEnd)+"T"+E.clock(defaultEnd);
 $("#toggle-mode").onclick=()=>{
   mode=mode==="remaining"?"elapsed":"remaining";
   try{localStorage.setItem("public-template.mode",mode);}catch{}
   $("#rotator").getAnimations().forEach(a=>a.cancel());
   if(!matchMedia("(prefers-reduced-motion: reduce)").matches)$("#rotator").animate([{transform:"rotateX(-70deg)",opacity:0},{transform:"rotateX(0)",opacity:1}],{duration:420,easing:"cubic-bezier(.2,.7,.2,1)"});
   tickFocus(now());
 };
 $("#custom-form").onsubmit=e=>{
   e.preventDefault();const label=$("#custom-label").value.trim(),end=Date.parse($("#custom-end").value+":00+08:00");
   if(!label||!Number.isFinite(end)||end<=+now()){$("#form-error").textContent="请输入状态，并选择未来的结束时间。";return;}
   custom={label,start:+now(),end};
   const persisted=save("public-template.custom",custom);
   $("#form-error").textContent="";
   $("#custom-hint").textContent=persisted?"已保存，到时自动恢复课表状态。":"当前浏览器无法保存，状态仅本次打开有效。";
   tickFocus(now());
 };
 $("#reset-custom").onclick=()=>{custom=null;save("public-template.custom",null);$("#form-error").textContent="";$("#custom-hint").textContent="已恢复自动状态。";tickFocus(now());};
 if(page==="focus"){
   $(".custom-panel").insertAdjacentHTML("beforebegin",'<button type="button" id="demo-timer" class="mode-button">体验10分钟计时</button>');
   $("#demo-timer").onclick=()=>{custom={label:"专注体验 · 演示",start:+now(),end:+now()+600000};save("public-template.custom",custom);tickFocus(now());};
   $("#toggle-mode").insertAdjacentHTML("afterend",'<a class="mode-button progress-link" href="./progress.html">进度全屏</a>');
 }else{
   document.body.classList.add("progress-only");
   $("#focus-clock").remove();
   $("#focus-date").remove();
   $(".custom-panel").remove();
   $(".topbar").innerHTML='<a class="back-focus" href="./focus.html">返回沉浸模式</a><button id="browser-fullscreen" type="button">浏览器全屏</button>';
   $(".back-focus").onclick=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});};
   $("#browser-fullscreen").onclick=async()=>{
     try{
       if(document.fullscreenElement)await document.exitFullscreen();
       else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
       else $("#fullscreen-hint").textContent="当前浏览器不支持全屏；已使用无时钟的全屏布局。";
     }catch{$("#fullscreen-hint").textContent="浏览器未允许全屏；可继续使用当前布局。";}
   };
   $("#capsule").insertAdjacentHTML("beforeend",'<div class="rail-ticks" aria-hidden="true">'+Array.from({length:41},(_,i)=>'<b class="'+(i%10===0?'major':'')+'"></b>').join("")+'</div><span class="rail-cursor" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 1 15 9 23 12 15 15 12 23 9 15 1 12 9 9Z" fill="currentColor"/></svg></span>');
   $("#capsule").insertAdjacentHTML("afterend",'<div class="rail-scale" aria-hidden="true"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div><p class="rail-note">每一刻，都在向前。</p>');
   $(".focus-state").insertAdjacentHTML("beforeend",'<p id="fullscreen-hint" role="status"></p>');
   progressArt=globalThis.ProgressArt.mount($("#capsule"));
   document.body.classList.add("has-progress-art");
 }
}
function tickFocus(t){
 if(custom&&custom.end<=+t){custom=null;save("public-template.custom",null);}
 const s=E.state(t,custom),elapsed=E.clamp((t-s.start)/(s.end-s.start)),remaining=mode==="remaining";
 const hasEnd=s.custom||s.kind==="class"||s.hasNext;
 if($("#focus-clock"))$("#focus-clock").textContent=E.clock(t);
 if($("#focus-date"))$("#focus-date").textContent=E.fmt(t)+" · "+weekLabel(t);
 $("#state-label").textContent=s.label+(s.custom?" · 自定义":"");
 $("#focus-title").textContent=s.custom?s.label:s.event?s.event.course.name:s.next?s.next.event.course.name:(D.courses.length?"本学期课程已结束":"尚未配置课程");
 $("#focus-detail").textContent=s.custom?"结束于 "+E.fmt(s.end)+" "+E.clock(s.end):s.event?s.event.room+" · "+s.event.teacher+" · "+E.clock(s.start)+"–"+E.clock(s.end):s.next?"下一节 · "+E.fmt(s.next.start)+" "+E.clock(s.next.start)+" · "+s.next.event.room:"可使用下方演示计时，或填写模板课程。";
 $("#timer-label").textContent=s.custom?(remaining?"距离结束":"已经持续"):s.kind==="class"?(remaining?"还有多久下课":"已经上课"):hasEnd?(remaining?"还有多久上课":"已经休息"):"已经休息";
 $("#timer-value").textContent=!hasEnd&&!D.courses.length?"—":E.duration(remaining&&hasEnd?s.end-t:t-s.start);
 const value=hasEnd?(remaining?1-elapsed:elapsed):0;
 if(progressArt)progressArt.update(value,remaining);
 $("#capsule-fill").style.transform="scaleX("+value+")";
 if(page==="progress"){
   $("#capsule").style.setProperty("--position",(value*100)+"%");
   $("#browser-fullscreen").textContent=document.fullscreenElement?"退出浏览器全屏":"浏览器全屏";
 }
 $("#capsule").setAttribute("aria-valuenow",Math.round(value*100));
 $("#capsule-caption").textContent=hasEnd?(remaining?"流逝 · 剩余 ":"累计 · 已过 ")+Math.round(value*100)+"%":"尚无下一节课程";
 $("#toggle-mode").textContent=remaining?"切换为累计时间":"切换为剩余时间";
 $("#toggle-mode").setAttribute("aria-pressed",!remaining);
 const h=E.holiday(t);
 $("#holiday-note").textContent=h?h.name+"假期"+(s.event?" · 当前课表仍有排课，请以校历为准":""):"";
 const identity=s.label+String(s.start);
 if(lastState&&lastState!==identity&&!matchMedia("(prefers-reduced-motion: reduce)").matches)$("#state-label").animate([{opacity:.2},{opacity:1}],{duration:300});
 lastState=identity;
}
function renderDashboard(t){
 const day=E.key(t),w=E.week(t);
 $("#week-label").textContent=weekLabel(t);
 $("#overall").innerHTML=progress("本周",E.progress(E.events.filter(e=>e.week===w),t))+progress("本月",E.progress(E.events.filter(e=>e.day.slice(0,7)===day.slice(0,7)),t))+progress("本学期",E.progress(E.events,t));
 $("#today-date").textContent=day;
 const today=E.events.filter(e=>e.day===day);
 $("#today").innerHTML=today.length?today.map(e=>card(e,t)).join(""):'<p class="empty-state">今天没有课程。</p>';
 $("#free").innerHTML=E.free(t).map(g=>'<div class="'+(g.end<=t?"is-ended":"")+'"><strong>'+E.clock(g.start)+'–'+E.clock(g.end)+'</strong><span>'+(g.end<=t?"已结束":g.start<=t?"当前空闲":"待开始")+'</span></div>').join("")||'<p class="empty-state">配置课表后显示空闲时间。</p>';
 $("#courses").innerHTML=D.courses.map(c=>progress(c.name,E.progress(E.events.filter(e=>e.courseId===c.id),t),c.color)).join("")||'<p class="empty-state">尚未添加课程。</p>';
 const h=C.holidays.find(h=>h.end>=day);
 $("#holidays").innerHTML=h?'<div class="holiday"><strong>'+h.name+'</strong><span>'+h.start+' 至 '+h.end+'</span><p>'+(h.start<=day?"假期中":"还有 "+Math.ceil((E.date(h.start)-E.date(day))/86400000)+" 天")+'</p>'+(h.pending?'<small>连休安排待公布</small>':"")+'</div>':'<p>暂无后续假期安排。</p>';
 $("#calendar-list").innerHTML=C.holidays.map(h=>'<p>'+h.name+'：'+h.start+' 至 '+h.end+(h.pending?"（连休待公布）":"")+'</p>').join("")+'<p>调休上班：'+(C.workdays.join("、")||"尚未配置")+'</p>';
}
if(page==="classic"){
 $("#content").innerHTML='<section class="page">'+heading("经典课表","周一至周日 · 空白排课模板，作息时间可自行维护。")+'<div class="week-controls"><button id="prev">上一周</button><label>教学周 <select id="week-select">'+Array.from({length:D.semester.totalWeeks},(_,i)=>'<option value="'+(i+1)+'">第 '+(i+1)+' 周</option>').join("")+'</select></label><button id="next">下一周</button><button id="this-week">本周</button></div><p id="week-range"></p><div class="schedule-scroll"><div id="classic-grid" class="classic-grid"></div></div><details class="calendar-details"><summary>查看示例作息</summary><div class="schedule-scroll"><table class="time-table"><thead><tr><th>节次</th><th>示例时间</th></tr></thead><tbody>'+Object.entries(C.common).map(([n,t])=>'<tr><th>'+n+'</th><td>'+t.join("–")+'</td></tr>').join("")+'</tbody></table></div><p>以下作息为通用演示配置，不代表任何学校，请按实际情况修改。</p></details></section>';
 $("#week-select").value=selection;$("#week-select").onchange=e=>{selection=+e.target.value;renderClassic();};
 $("#prev").onclick=()=>{selection=Math.max(1,selection-1);renderClassic();};
 $("#next").onclick=()=>{selection=Math.min(D.semester.totalWeeks,selection+1);renderClassic();};
 $("#this-week").onclick=()=>{selection=Math.max(1,Math.min(D.semester.totalWeeks,E.week(now())));renderClassic();};renderClassic();
}
function renderClassic(){
 $("#week-select").value=selection;$("#prev").disabled=selection===1;$("#next").disabled=selection===D.semester.totalWeeks;
 const start=E.add(E.date(D.semester.startDate),(selection-1)*7);
 $("#week-range").textContent=D.semester.startDate?E.key(start)+" 至 "+E.key(E.add(start,6)):"请先设置学期起始日期";
 let html='<div class="grid-corner">节次</div>';
 const days=["周一","周二","周三","周四","周五","周六","周日"];
 html+=days.map((d,i)=>'<div class="day-head" style="grid-column:'+(i+2)+'">'+d+'<small>'+(D.semester.startDate?E.key(E.add(start,i)).slice(5):"")+'</small></div>').join("");
 for(let p=1;p<=Object.keys(C.common).length;p++){
   html+='<div class="period-label" style="grid-row:'+(p+1)+'"><strong>'+p+'</strong><span>'+(C.common[p]?.[0]||"未设置")+'</span></div>';
   for(let d=1;d<=7;d++)html+='<div class="grid-guide" style="grid-row:'+(p+1)+';grid-column:'+(d+1)+'"></div>';
 }
 html+=E.events.filter(e=>e.week===selection).map(e=>'<article class="schedule-event '+(e.end<=now()?"is-ended":"")+'" style="--course:'+e.course.color+';grid-column:'+(e.weekday+1)+';grid-row:'+(e.units[0].period+1)+'/'+(e.units.at(-1).period+2)+'"><strong>'+esc(e.course.name)+'</strong><span>'+esc(e.room)+'</span><small>'+E.clock(e.start)+'–'+E.clock(e.end)+'</small><small>'+esc(e.teacher)+'</small></article>').join("");
 $("#classic-grid").innerHTML=html;
}
if(page==="semester"){
 $("#content").innerHTML='<section class="page">'+heading("学期总览","共 "+D.semester.totalWeeks+" 周 · 填写课表后显示每周安排。")+'<label class="week-picker">跳至 <select id="jump-week">'+Array.from({length:D.semester.totalWeeks},(_,i)=>'<option value="'+(i+1)+'">第 '+(i+1)+' 周</option>').join("")+'</select></label><div class="semester-weeks semester-long">'+Array.from({length:D.semester.totalWeeks},(_,i)=>{
 const w=i+1,start=E.add(E.date(D.semester.startDate),i*7);
 return '<article class="week-card" id="week-'+w+'"><header><strong>第 '+w+' 周</strong><span>'+(D.semester.startDate?E.key(start)+' — '+E.key(E.add(start,6)):'起始日期待设置')+'</span></header>'+["周一","周二","周三","周四","周五","周六","周日"].map((d,n)=>'<div class="semester-day"><span>'+d+'</span><div>'+E.events.filter(e=>e.week===w&&e.weekday===n+1).map(e=>'<i class="'+(e.end<=now()?"is-ended":"")+'" style="--course:'+e.course.color+'">'+E.clock(e.start)+'–'+E.clock(e.end)+' '+esc(e.course.name)+' · '+esc(e.room)+'</i>').join("")+'</div></div>').join("")+'</article>';
 }).join("")+'</div></section>';
 $("#jump-week").onchange=e=>$("#week-"+e.target.value).scrollIntoView({behavior:"instant",block:"start"});
}
function tick(){
 const t=now();
 if(page==="home"){
   const next=E.sessions.find(s=>s.start>t);
   const identity=next?String(+next.start)+next.event.courseId:"none";
   if($("#home-next").dataset.lesson!==identity){
     $("#home-next").dataset.lesson=identity;
     $("#home-next").innerHTML=next
       ? '<span class="status-kicker">下一节课</span><h2>'+esc(next.event.course.name)+'</h2><p>'+E.fmt(next.start)+'</p><p>'+E.clock(next.start)+'–'+E.clock(next.end)+' · '+esc(next.event.room)+' · '+esc(next.event.teacher)+'</p>'
       : '<span class="status-kicker">下一节课</span><h2>尚未配置课程</h2><p>填入课表后，这里会自动显示下一节课。</p>';
   }
 }
 if(page==="home"){$("#home-week").textContent=weekLabel(t);$("#part").textContent=E.dayPart(t);$("#home-clock").textContent=E.clock(t)+":"+String(new Date(+t+8*3600000).getUTCSeconds()).padStart(2,"0");$("#home-date").textContent=E.fmt(t);}
 if(page==="focus"||page==="progress")tickFocus(t);
 const marker=E.key(t)+E.clock(t);
 if(page==="dashboard"&&marker!==lastMinute){renderDashboard(t);lastMinute=marker;}
}
tick();
const timer=setInterval(tick,1000);
document.addEventListener("visibilitychange",tick);
globalThis.disposeSchedulePage=()=>{
 clearInterval(timer);
 document.removeEventListener("visibilitychange",tick);
};
};
if(!globalThis.SCHEDULE_SINGLE_FILE)globalThis.renderSchedulePage();
