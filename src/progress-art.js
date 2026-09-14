/* 五种非线性皮肤共享进度；0和1均有确定的空/满终态。 */
globalThis.ProgressArt={
 mount(anchor){
  const names={ink:"墨水圆池",sunset:"东升西落",dawn:"晨昏",sand:"沙漏",orbit:"轨道行星"};
  let selected="ink";try{const saved=localStorage.getItem("public-template.art");if(names[saved])selected=saved;}catch{}
  const pickerLabel=document.createElement("label");pickerLabel.className="art-picker";
  pickerLabel.innerHTML='进度样式 <select id="art-style">'+Object.entries(names).map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join("")+'</select>';
  document.querySelector(".topbar").append(pickerLabel);
  const host=document.createElement("div");host.className="progress-art";
  host.innerHTML='<div class="art-stage" role="progressbar" aria-label="当前计时进度" aria-valuemin="0" aria-valuemax="100"></div><p class="art-caption"></p><button class="art-motion" type="button" aria-pressed="false">暂停装饰动效</button>';
  anchor.before(host);
  const stage=host.querySelector(".art-stage"),picker=pickerLabel.querySelector("select");
  const svg=body=>'<svg viewBox="0 0 640 380" aria-hidden="true" focusable="false">'+body+'</svg>';
  const views={
   ink:()=>svg('<defs><clipPath id="ink-clip"><circle cx="320" cy="190" r="145"/></clipPath></defs><circle cx="320" cy="190" r="145" fill="#393f3c" stroke="#87938b" stroke-width="2"/><circle cx="320" cy="190" r="154" fill="none" stroke="#565f59" stroke-dasharray="2 10"/><g clip-path="url(#ink-clip)"><path id="ink-fill" fill="#88a59a"/><path id="ink-edge" class="ink-wave" fill="none" stroke="#bfd3c6" stroke-width="3"/></g>'),
   sunset:()=>svg('<path d="M90 290A230 230 0 0 1 550 290" fill="none" stroke="#6e6052" stroke-dasharray="2 9"/><path d="M50 290H590" stroke="#9c8267" stroke-width="2"/><path id="sun-trail" fill="none" stroke="#cb956c" stroke-width="3"/><circle id="sun-disc" r="27" fill="#e6ad77"/><path d="M240 316H400M275 331H365" stroke="#79614c" stroke-width="1"/><text x="90" y="324" text-anchor="middle" fill="#b8a58f" font-size="16">西 · 落</text><text x="550" y="324" text-anchor="middle" fill="#b8a58f" font-size="16">东 · 升</text>'),
   dawn:()=>svg('<defs><clipPath id="dawn-sky"><rect width="640" height="280"/></clipPath><radialGradient id="dawn-halo"><stop offset="0" stop-color="#fff4c1" stop-opacity=".85"/><stop offset=".48" stop-color="#f5bd69" stop-opacity=".4"/><stop offset="1" stop-color="#e89b57" stop-opacity="0"/></radialGradient><radialGradient id="dawn-disc"><stop offset="0" stop-color="#fff8d5"/><stop offset="1" stop-color="#eeb26b"/></radialGradient></defs><g clip-path="url(#dawn-sky)"><g id="dawn-light"><circle id="dawn-glow" cx="320" r="205" fill="url(#dawn-halo)"/><g id="dawn-rays" stroke="#fbd99c" stroke-width="2">'+Array.from({length:16},(_,i)=>'<path d="M0 -120V-160" transform="rotate('+(i*22.5)+')"/>').join("")+'</g></g><circle id="dawn-sun" cx="320" r="100" fill="url(#dawn-disc)"/></g><path d="M40 280H600" stroke="#9f866e" stroke-width="2"/><ellipse id="dawn-reflection" cx="320" cy="288" rx="120" ry="5" fill="url(#dawn-halo)"/>'),
   sand:()=>svg('<path d="M220 35H420M220 345H420" stroke="#b99b78" stroke-width="10" stroke-linecap="round"/><path d="M230 45Q230 120 304 178Q317 190 304 202Q230 260 230 335H410Q410 260 336 202Q323 190 336 178Q410 120 410 45Z" fill="#3d3933" stroke="#a9947b" stroke-width="2"/><path id="sand-top" fill="#d8b182"/><path id="sand-bottom" fill="#d8b182"/><path id="sand-stream" class="sand-stream" d="M320 181V323" stroke="#edcf9e" stroke-width="3" stroke-dasharray="2 8"/>'),
   orbit:()=>svg('<g transform="rotate(-18 320 190)"><ellipse cx="320" cy="190" rx="245" ry="125" fill="none" stroke="#706d6a" stroke-width="2"/><path id="orbit-trail" fill="none" stroke="#acb8c4" stroke-width="4"/><circle id="planet" r="14" fill="#dce6ec"/></g><circle cx="320" cy="190" r="34" fill="#b6a28e"/><ellipse cx="320" cy="190" rx="60" ry="12" fill="none" stroke="#d7c7b5" stroke-width="2" transform="rotate(-22 320 190)"/>')
  };
  const descriptions={ink:"水位记录时间",sunset:"东升西落",dawn:"晨昏之间，光随时间流转",sand:"时间在两端流转",orbit:"一圈，一个时段"};
  let v=0,remaining=true;
  const attr=(id,name,value)=>stage.querySelector(id).setAttribute(name,value);
  function render(){stage.innerHTML=views[selected]();host.dataset.style=selected;update(v,remaining);}
  function update(value,isRemaining){
   v=Math.max(0,Math.min(1,value));remaining=isRemaining;
   stage.setAttribute("aria-valuenow",Math.round(v*100));
   host.querySelector(".art-caption").textContent=(remaining?"剩余 ":"累计 ")+Math.round(v*100)+"% · "+descriptions[selected];
   if(selected==="ink"){
    // 圆弓面积反解水位，使面积比与进度接近一致，而不是直接按高度比例。
    let lo=-1,hi=1;
    for(let i=0;i<24;i++){const z=(lo+hi)/2,area=(Math.acos(z)-z*Math.sqrt(1-z*z))/Math.PI;if(area>v)lo=z;else hi=z;}
    const y=190+145*(lo+hi)/2;
    const wave='M155 '+y+'Q237 '+(y-7)+' 320 '+y+'T485 '+y;
    attr("#ink-fill","d",wave+"V340H155Z");
    attr("#ink-edge","d",wave);
    stage.querySelector("#ink-fill").style.opacity=v===0?0:1;
    stage.querySelector("#ink-edge").style.opacity=v>0&&v<1?1:0;
   }else if(selected==="sunset"){
    // 左西右东：累计从右侧东方升起；剩余递减向左侧西方落下。
    const a=v*Math.PI/2,x=320+(remaining?-1:1)*230*Math.cos(a),y=290-230*Math.sin(a);
    attr("#sun-disc","cx",x);attr("#sun-disc","cy",y);
    stage.querySelector("#sun-disc").style.opacity=.2+.8*v;
    attr("#sun-trail","d",remaining?(v===1?"M320 60":"M320 60A230 230 0 0 0 "+x+" "+y):(v===0?"M550 290":"M550 290A230 230 0 0 0 "+x+" "+y));
   }else if(selected==="dawn"){
    // 水平线裁切太阳：0时完全落下，1时整个太阳露出。
    const y=380-220*v;
    attr("#dawn-sun","cy",y);
    attr("#dawn-glow","cy",y);
    attr("#dawn-rays","transform","translate(320 "+y+")");
    stage.querySelector("#dawn-sun").style.opacity=.18+.82*v;
    stage.querySelector("#dawn-light").style.opacity=v*v;
    stage.querySelector("#dawn-rays").style.opacity=.5*v;
    stage.querySelector("#dawn-reflection").style.opacity=v;
   }else if(selected==="sand"){
    const top=remaining?v:1-v,bottom=1-top,a=Math.sqrt(top),b=Math.sqrt(bottom);
    attr("#sand-top","d","M"+(320-78*a)+" "+(178-118*a)+"H"+(320+78*a)+"L320 178Z");
    attr("#sand-bottom","d","M"+(320-78*b)+" 330H"+(320+78*b)+"L320 "+(330-118*b)+"Z");
    stage.querySelector("#sand-stream").style.opacity=top>0&&bottom>0?1:0;
    attr("#sand-stream","d","M320 181V"+(330-118*b));
   }else{
    const a=-Math.PI/2+2*Math.PI*v,x=320+245*Math.cos(a),y=190+125*Math.sin(a);
    attr("#planet","cx",x);attr("#planet","cy",y);
    attr("#orbit-trail","d",v>=1?"M320 65A245 125 0 1 1 319.99 65":v<=0?"M320 65":"M320 65A245 125 0 "+(v>.5?1:0)+" 1 "+x+" "+y);
   }
  }
  picker.value=selected;
  picker.onchange=()=>{selected=picker.value;try{localStorage.setItem("public-template.art",selected);}catch{}render();};
  host.querySelector(".art-motion").onclick=e=>{const paused=host.classList.toggle("art-paused");e.target.textContent=paused?"恢复装饰动效":"暂停装饰动效";e.target.setAttribute("aria-pressed",paused);};
  render();return {update};
 }
};
