/* 通用课表引擎：北京时间；学校相关规则全部由数据模块提供。 */
(function(){
 const D=TIMETABLE_DATA,C=CAMPUS_CALENDAR,DAY=86400000;
 const key=t=>new Date(+t+8*3600000).toISOString().slice(0,10);
 const today=new Date(key(new Date())+"T00:00:00+08:00");
 const fallback=new Date(+today-((new Date(+today+8*3600000).getUTCDay()+6)%7)*DAY);
 const date=s=>s?new Date(s+"T00:00:00+08:00"):new Date(fallback);
 const at=(d,time)=>new Date(d+"T"+time+":00+08:00");
 const add=(d,n)=>new Date(+d+n*DAY);
 const clamp=x=>Math.max(0,Math.min(1,x));
 const start=date(D.semester.startDate);
 const clock=t=>new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",hour:"2-digit",minute:"2-digit",hour12:false}).format(t);
 const fmt=t=>new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(t);
 const timePattern=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
 if(!Number.isInteger(D.semester.totalWeeks)||D.semester.totalWeeks<1||D.semester.totalWeeks>60)throw Error("教学周数必须在1至60之间");
 if(D.semester.startDate&&(!Number.isFinite(+start)||new Date(+start+8*3600000).getUTCDay()!==1))throw Error("学期起始日期应为周一");
 for(const [p,t]of Object.entries(C.common))if(!t.every(s=>timePattern.test(s))||t[0]>=t[1])throw Error("第"+p+"节示例时间无效");
 if((D.rules.length||C.extraLessons.length)&&!D.semester.startDate)throw Error("请先配置学期起始日期");
 function expand(r,w,explicit){
   if(!D.courses.some(c=>c.id===r.courseId))throw Error("课程ID不存在："+r.courseId);
   if(!Number.isInteger(w)||w<1||w>D.semester.totalWeeks||!Number.isInteger(r.weekday)||r.weekday<1||r.weekday>7)throw Error("周次或星期无效");
   if(!Number.isInteger(r.startPeriod)||!Number.isInteger(r.endPeriod)||r.startPeriod>r.endPeriod)throw Error("节次无效");
   const day=explicit||key(add(start,(w-1)*7+r.weekday-1));
   const units=[];
   for(let p=r.startPeriod;p<=r.endPeriod;p++){
     if(!C.common[p])throw Error("缺少第"+p+"节作息");
     units.push({period:p,start:at(day,C.common[p][0]),end:at(day,C.common[p][1])});
   }
   return {...r,week:w,day,units,course:D.courses.find(c=>c.id===r.courseId),start:units[0].start,end:units.at(-1).end};
 }
 const events=D.rules.flatMap(r=>r.weeks.map(w=>expand(r,w))).concat(C.extraLessons.map(r=>expand(r,r.week,r.date))).filter(e=>!C.cancelledDates.includes(e.day)).sort((a,b)=>a.start-b.start);
 const units=events.flatMap(e=>e.units.map(u=>({...u,event:e}))).sort((a,b)=>a.start-b.start);
 const sessions=[];
 for(const u of units){
   const last=sessions.at(-1);
   if(last&&+last.end===+u.start&&last.event.courseId===u.event.courseId&&last.event.room===u.event.room&&last.event.teacher===u.event.teacher)last.end=u.end;
   else sessions.push({start:u.start,end:u.end,event:u.event});
 }
 const holiday=t=>C.holidays.find(h=>h.start<=key(t)&&h.end>=key(t));
 function state(t,custom){
   if(custom&&Number.isFinite(custom.start)&&Number.isFinite(custom.end)&&custom.start<=+t&&custom.end>+t)return {label:custom.label,start:new Date(custom.start),end:new Date(custom.end),custom:true};
   const current=sessions.find(s=>s.start<=t&&t<s.end),next=sessions.find(s=>s.start>t),prev=sessions.filter(s=>s.end<=t).at(-1),k=key(t),h=holiday(t);
   if(current)return {...current,label:"上课中",kind:"class",next};
   let label=events.length?"休息":"尚未配置课程";
   if(h)label="节假日";
   else if(prev&&next&&key(prev.end)===k&&key(next.start)===k&&next.start-prev.end<=C.breakMinutes*60000)label="课间";
   else if(events.length&&t>=at(k,C.lunch[0])&&t<at(k,C.lunch[1]))label="午间";
   return {label,kind:"rest",start:prev?.end||date(k),end:next?.start||add(date(k),1),next,holiday:h,hasNext:!!next};
 }
 function progress(list,t){const all=list.flatMap(e=>e.units),done=all.filter(u=>u.end<=t).length;return {done,left:all.length-done,total:all.length,value:all.length?done/all.length:0};}
 function free(t){
   if(!events.length)return [];
   const times=Object.values(C.common),k=key(t),end=at(k,times.at(-1)[1]),out=[];
   let cursor=at(k,times[0][0]);
   for(const s of sessions.filter(s=>s.event.day===k)){if(s.start>cursor)out.push({start:cursor,end:s.start});if(s.end>cursor)cursor=s.end;}
   if(cursor<end)out.push({start:cursor,end});return out;
 }
 const week=t=>D.semester.startDate?Math.floor((date(key(t))-start)/DAY/7)+1:0;
 const dayPart=t=>{const h=+clock(t).slice(0,2);return h<6?"凌晨":h<11?"上午":h<14?"中午":h<18?"下午":"夜晚";};
 const duration=ms=>{const s=Math.max(0,Math.floor(ms/1000)),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return(d?d+"天 ":"")+(h?h+"小时 ":"")+m+"分 "+String(s%60).padStart(2,"0")+"秒";};
 globalThis.ScheduleEngine={events,units,sessions,state,progress,free,holiday,week,dayPart,date,key,at,add,clock,fmt,duration,clamp,expand};
})();
