(() => {
const $ = id => document.getElementById(id);
const MIN = 60000, HOUR = 60*MIN, DAY = 24*HOUR, NEW_CONVO = 8*HOUR;

/* ---------- sample conversation (fictional, seeded) ---------- */
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildSample(){
  const r = mulberry(42), pick = a => a[Math.floor(r()*a.length)];
  const P = {
    mOpen:["Morning! Did you end up going to that ramen place?","Okay you have to see this video of a cat stuck in a cereal box 😂","How did the presentation go??","I'm making pasta again, don't judge","Thinking about the lake trip, are we still on for the 20th?","Just finished the book you recommended. That ending!!","Long day. How's yours going?","Random question: favorite season and why","The coffee place on 5th finally reopened ☕","Hey! Free this weekend?"],
    mRep:["haha stop 😂","wait really?","that's so good to hear","omg same","okay that makes sense","love that","lol yes","I'd be down","aw that's sweet","how are you feeling about it?","what are you up to later?","no way!","I miss hanging out","we should do that again soon"],
    mLate:["you good? you've been quiet","no worries if you're busy!","hope your week's getting better","did you see my message about saturday?","okay! let me know"],
    jOpen:["Okay I can't stop thinking about that taco truck, we're going back this week","Good morning!! What's the plan today?","You will not believe what happened at work 😂","Found a hiking trail we have to try, sending pics later","Just heard a song that is so you, sending it now"],
    jRep:["Haha that's amazing, tell me everything","Yes!! I'm so in, what time works for you?","That made my whole day 😊","Wait that's so cool, how did you find it?","Same here, I've been looking forward to it all week","No way, I love that! We should go together","That's hilarious 😂 you always find the best stuff","Of course! How are you feeling about everything?","Ugh I wish I was there, sounds like so much fun","Definitely, count me in!"],
    jLate:["haha yeah","nice","busy rn, talk later","sorry just saw this","ok","yeah maybe","lol","cool","sounds good","been a crazy week","not sure yet","sorry, slammed at work"],
    jLateOpen:["hey","what's up"]
  };
  const start = new Date(2026,7,17).getTime(), days = 56, out = [];
  let last = 0;
  const lateness = p => p<0.4?0.04:p<0.62?(p-0.4)*4:0.9;
  for(let d=0; d<days; d++){
    const p = d/days, lp = lateness(p);
    if(r() > (0.92 - 0.35*p)) continue;
    let t = start + d*DAY + (8 + r()*13)*HOUR;
    if(t < last + NEW_CONVO + HOUR) t = last + NEW_CONVO + HOUR;
    let jordanStarts = r() < (0.5 - 0.4*Math.min(1,p*1.4));
    let sender = jordanStarts ? "Jordan" : "Maya";
    const late = () => r() < lp;
    let text = sender==="Jordan" ? (late()?pick(P.jLateOpen):pick(P.jOpen)) : pick(P.mOpen);
    out.push({t, s:sender, x:text});
    const n = Math.round((lp>0.5? 2+r()*3 : 5+r()*7));
    for(let i=0;i<n;i++){
      const same = r()<0.15; const next = same ? sender : (sender==="Maya"?"Jordan":"Maya");
      let delay;
      if(same) delay = (0.2 + r()*2)*MIN;
      else if(next==="Jordan"){ const L = late(); delay = L ? Math.exp(Math.log(40)+r()*(Math.log(320)-Math.log(40)))*MIN : (1+r()*14)*MIN;
        text = L ? pick(P.jLate) : pick(P.jRep); }
      else { delay = (1+r()*18)*MIN; text = (lp>0.5 && r()<0.3) ? pick(P.mLate) : pick(P.mRep); }
      if(same) text = next==="Jordan" ? (lp>0.5?pick(P.jLate):pick(P.jRep)) : pick(P.mRep);
      t += delay; sender = next; out.push({t, s:sender, x:text});
    }
    last = t;
  }
  let t = Math.max(last + NEW_CONVO + HOUR, start + (days)*DAY + 18*HOUR);
  out.push({t, s:"Maya", x:"Are we still doing the lake trip this weekend? I was really looking forward to it"});
  out.push({t:t+5.2*HOUR, s:"Jordan", x:"yeah maybe, we'll see"});
  const pad = n => String(n).padStart(2,"0");
  return out.map(m => { const d = new Date(m.t); return `[${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}] ${m.s}: ${m.x}`; }).join("\n");
}

/* ---------- parsing ---------- */
const RE_ISO = /^\[?(\d{4})-(\d{2})-(\d{2})[ T,]+(\d{1,2}):(\d{2})(?::\d{2})?\]?\s*[-–]?\s*([^:\n]{1,40}?):\s(.*)$/;
const RE_US  = /^\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp]\.?[Mm]\.?)?\]?\s*[-–]?\s*([^:\n]{1,40}?):\s(.*)$/;
function parse(raw){
  const msgs = [];
  for(let line of raw.replace(/[  ‎]/g," ").split(/\r?\n/)){
    if(!line.trim()) continue;
    let m = line.match(RE_ISO), t, s, x;
    if(m){ t = new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]).getTime(); s=m[6]; x=m[7]; }
    else if((m = line.match(RE_US))){
      let a=+m[1], b=+m[2], y=+m[3]; if(y<100) y+=2000; let mo=a, da=b; if(a>12){mo=b;da=a;}
      let h=+m[4]; const ap=(m[6]||"").toLowerCase(); if(ap.startsWith("p")&&h<12)h+=12; if(ap.startsWith("a")&&h===12)h=0;
      t = new Date(y, mo-1, da, h, +m[5]).getTime(); s=m[7]; x=m[8];
    }
    if(t){ msgs.push({t, s:s.trim(), x:x.trim()}); }
    else if(msgs.length){ msgs[msgs.length-1].x += "\n"+line.trim(); }
  }
  msgs.sort((a,b)=>a.t-b.t);
  const counts = {}; msgs.forEach(m=>counts[m.s]=(counts[m.s]||0)+1);
  const people = Object.keys(counts).sort((a,b)=>counts[b]-counts[a]).slice(0,2);
  return { msgs: msgs.filter(m=>people.includes(m.s) && !/^<media omitted>$/i.test(m.x)), people, others: Object.keys(counts).length-people.length };
}

/* ---------- features ---------- */
const POS = new Set("love loved lovely amazing great good happy fun excited awesome sweet best haha hahaha lol yes yay definitely glad miss beautiful perfect thanks thank enjoy enjoyed hilarious wonderful cute proud fantastic in absolutely course".split(" "));
const NEG = new Set("sorry busy tired ugh sad bad hate annoyed upset stressed slammed whatever fine ok k meh crazy".split(" "));
const HEDGE = [/\bmaybe\b/i,/\bnot sure\b/i,/we'?ll see/i,/\bidk\b/i,/\blater\b/i,/\bbusy\b/i];
const EMO = /[\u{1F600}-\u{1F64F}\u{1F90C}-\u{1F9FF}❤\u{1F496}-\u{1F49F}☕\u{1F525}✨]/gu;
function feat(m){
  const words = (m.x.toLowerCase().match(/[a-z']+/g)||[]);
  let pos=0,neg=0; words.forEach(w=>{ if(POS.has(w))pos++; if(NEG.has(w))neg++; });
  const emo=(m.x.match(EMO)||[]).length, ex=Math.min(2,(m.x.match(/!/g)||[]).length), hedge=HEDGE.filter(r=>r.test(m.x)).length;
  m.words = words.length; m.q = m.x.includes("?");
  m.warm = pos - neg + 0.6*emo + 0.4*ex - 0.6*hedge + Math.min(1, words.length/12)*0.5;
}
const median = a => { if(!a.length) return null; const s=[...a].sort((x,y)=>x-y), h=s.length>>1; return s.length%2?s[h]:(s[h-1]+s[h])/2; };
const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;

function analyze(data){
  const {msgs, people} = data;
  msgs.forEach(feat);
  msgs.forEach((m,i)=>{
    const prev = msgs[i-1];
    m.init = !prev || (m.t - prev.t) >= NEW_CONVO;
    m.reply = prev && prev.s !== m.s && !m.init ? (m.t - prev.t) : null;
  });
  const t0 = msgs[0].t, t1 = msgs[msgs.length-1].t, mid = t0 + (t1-t0)/2;
  const daysSpan = Math.max(1,(t1-t0)/DAY);
  function stats(list, spanDays){
    const res = {};
    for(const p of people){
      const mine = list.filter(m=>m.s===p);
      const inits = list.filter(m=>m.init);
      res[p] = {
        n: mine.length,
        perDay: mine.length/spanDays,
        reply: median(mine.filter(m=>m.reply!=null).map(m=>m.reply/MIN)),
        words: mean(mine.map(m=>m.words)),
        warm: mean(mine.map(m=>m.warm)),
        q: mine.length? mine.filter(m=>m.q).length/mine.length : 0,
        initShare: inits.length? inits.filter(m=>m.s===p).length/inits.length : 0,
        inits: inits.filter(m=>m.s===p).length
      };
    }
    return res;
  }
  const early = msgs.filter(m=>m.t<mid), recent = msgs.filter(m=>m.t>=mid);
  const all = stats(msgs, daysSpan), E = stats(early, daysSpan/2), R = stats(recent, daysSpan/2);

  // weekly series
  const nW = Math.max(1, Math.ceil((t1-t0+1)/ (7*DAY)));
  const weeks = Array.from({length:nW},(_,i)=>({start:t0+i*7*DAY}));
  const weekly = {};
  for(const p of people){
    weekly[p] = {n:Array(nW).fill(0), reply:[], warm:[]};
    const rb = Array.from({length:nW},()=>[]), wb = Array.from({length:nW},()=>[]);
    msgs.filter(m=>m.s===p).forEach(m=>{ const w=Math.min(nW-1,Math.floor((m.t-t0)/(7*DAY))); weekly[p].n[w]++; wb[w].push(m.warm); if(m.reply!=null) rb[w].push(m.reply/MIN); });
    weekly[p].reply = rb.map(median); weekly[p].warm = wb.map(mean);
  }
  return {msgs, people, all, E, R, weeks, weekly, t0, t1, mid, findings: findings(people, E, R, all)};
}

/* ---------- findings ---------- */
const fmtDur = m => m==null?"—": m<1?"<1 min": m<60?`${Math.round(m)} min`: m<1440?`${(m/60).toFixed(m<600?1:0)} h`:`${(m/1440).toFixed(1)} d`;
const pct = x => `${Math.round(x*100)}%`;
function findings(people, E, R){
  const out = [];
  const add = (sev, text, key, p) => out.push({sev, text, key, p});
  for(const p of people){
    const e=E[p], r=R[p];
    if(e.reply!=null && r.reply!=null){
      const ratio = r.reply/Math.max(e.reply,0.5);
      if(ratio>=3) add("big", `${p}'s typical reply time went from ${fmtDur(e.reply)} to ${fmtDur(r.reply)}.`, "reply", p);
      else if(ratio>=1.6) add("mid", `${p} is replying more slowly: ${fmtDur(e.reply)} → ${fmtDur(r.reply)}.`, "reply", p);
      else if(ratio<=0.6) add("mid", `${p} is replying faster than before: ${fmtDur(e.reply)} → ${fmtDur(r.reply)}.`, "reply", p);
    }
    if(e.words && r.words){
      const ch = r.words/e.words;
      if(ch<=0.55) add("big", `${p}'s messages got much shorter: ${e.words.toFixed(1)} → ${r.words.toFixed(1)} words on average.`, "len", p);
      else if(ch<=0.75) add("mid", `${p}'s messages are shorter: ${e.words.toFixed(1)} → ${r.words.toFixed(1)} words.`, "len", p);
      else if(ch>=1.35) add("mid", `${p} is writing longer messages: ${e.words.toFixed(1)} → ${r.words.toFixed(1)} words.`, "len", p);
    }
    if(e.warm!=null && r.warm!=null){
      const d = r.warm - e.warm;
      if(d<=-0.9) add("big", `${p}'s tone cooled noticeably (warmth ${e.warm.toFixed(2)} → ${r.warm.toFixed(2)}): fewer emoji, exclamation points and positive words, more hedges like "maybe" and "busy".`, "tone", p);
      else if(d<=-0.45) add("mid", `${p}'s tone is a little cooler (warmth ${e.warm.toFixed(2)} → ${r.warm.toFixed(2)}).`, "tone", p);
      else if(d>=0.45) add("mid", `${p}'s tone got warmer (warmth ${e.warm.toFixed(2)} → ${r.warm.toFixed(2)}).`, "tone", p);
    }
    const dq = r.q - e.q;
    if(dq<=-0.15) add(dq<=-0.25?"big":"mid", `${p} asks fewer questions: ${pct(e.q)} → ${pct(r.q)} of messages. Asking questions is one of the clearest signs of interest in the other person.`, "q", p);
  }
  const [a,b] = people;
  if(b){
    const ea=E[a].initShare, ra=R[a].initShare;
    if(Math.abs(ra-ea)>=0.15){
      const who = ra>ea?a:b, other = who===a?b:a;
      add(Math.abs(ra-ea)>=0.3?"big":"mid", `${who} now starts most conversations (${pct(R[who].initShare)}, up from ${pct(E[who].initShare)}). ${other} rarely reaches out first anymore.`, "init", who);
    }
    const ratio = (R[a].perDay+R[b].perDay)/Math.max(0.01,E[a].perDay+E[b].perDay);
    if(ratio<=0.7) add(ratio<=0.5?"big":"mid", `Overall you're texting less: ${(E[a].perDay+E[b].perDay).toFixed(1)} → ${(R[a].perDay+R[b].perDay).toFixed(1)} messages a day.`, "vol");
  }
  if(!out.length) add("low","No major shifts between the first and second half of this conversation. Patterns look stable.","none");
  const order={big:0,mid:1,low:2}; out.sort((x,y)=>order[x.sev]-order[y.sev]);
  return out;
}

/* ---------- rendering ---------- */
let A = null, me = null;
const colorOf = p => p===A.people[0] ? "var(--pa)" : "var(--pb)";
const fmtDate = t => new Date(t).toLocaleDateString(undefined,{month:"short",day:"numeric"});
function el(tag, cls, text){ const e=document.createElement(tag); if(cls)e.className=cls; if(text!=null)e.textContent=text; return e; }

function render(){
  const {people, msgs, all, E, R} = A;
  $("srcTitle").textContent = people.length>1 ? `${people[0]} & ${people[1]}` : people[0];
  $("srcSub").textContent = `${msgs.length} messages · ${fmtDate(A.t0)} – ${new Date(A.t1).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
  const sel = $("meSel"); sel.innerHTML="";
  [["","Not specified"],...people.map(p=>[p,p])].forEach(([v,l])=>{const o=el("option",null,l);o.value=v;sel.append(o);});
  if(!people.includes(me)) me = people.length>1 ? people[0] : "";
  sel.value = me||"";
  $("splitNote").textContent = `Comparing ${fmtDate(A.t0)}–${fmtDate(A.mid)} with ${fmtDate(A.mid)}–${fmtDate(A.t1)}`;

  // person cards
  const box = $("people"); box.innerHTML="";
  for(const p of people){
    const card = el("section","panel person");
    const who = el("div","who"); const sw=el("span","swatch"); sw.style.background=colorOf(p);
    who.append(sw, el("h2",null,p)); if(p===me) who.append(el("span","pill","you"));
    const st = el("div","stats");
    const items = [
      ["Messages", all[p].n, null, null],
      ["Median reply", fmtDur(all[p].reply), E[p].reply, R[p].reply, "time"],
      ["Starts convos", pct(all[p].initShare), E[p].initShare, R[p].initShare, "share"],
      ["Avg words", all[p].words?.toFixed(1), E[p].words, R[p].words, "num"],
      ["Asks questions", pct(all[p].q), E[p].q, R[p].q, "share"],
      ["Warmth", all[p].warm?.toFixed(2), E[p].warm, R[p].warm, "warm"]
    ];
    for(const [k,v,e,r,kind] of items){
      const s=el("div","stat"); s.append(el("span","label",k), el("span","v",String(v??"—")));
      if(kind && e!=null && r!=null){
        let txt, cls="flat";
        if(kind==="time"){ const ratio=r/Math.max(e,0.5); txt=`${fmtDur(e)} → ${fmtDur(r)}`; cls= ratio>1.6?"down":ratio<0.6?"up":"flat"; }
        else if(kind==="share"){ const d=r-e; txt=`${d>=0?"+":"−"}${Math.abs(Math.round(d*100))} pts`; cls=d<=-0.12?"down":d>=0.12?"up":"flat"; }
        else if(kind==="num"){ const d=r/e; txt=`${e.toFixed(1)} → ${r.toFixed(1)}`; cls=d<0.75?"down":d>1.3?"up":"flat"; }
        else { const d=r-e; txt=`${d>=0?"+":"−"}${Math.abs(d).toFixed(2)}`; cls=d<=-0.45?"down":d>=0.45?"up":"flat"; }
        s.append(el("span","d "+cls,txt));
      } else s.append(el("span","d flat","whole chat"));
      st.append(s);
    }
    card.append(who, st, el("span","hint","Small figures show the first half → second half of the chat."));
    box.append(card);
  }

  // findings
  const fb = $("findings"); fb.innerHTML="";
  const label = {big:"Big shift", mid:"Notable", low:"Stable"};
  for(const f of A.findings){ const r=el("div","finding"); r.append(el("span","tag "+f.sev,label[f.sev]), el("div",null,f.text)); fb.append(r); }

  // legend + charts
  const lg=$("legend"); lg.innerHTML="";
  people.forEach(p=>{const s=el("span"); const sw=el("span","swatch"); sw.style.background=colorOf(p); s.append(sw,document.createTextNode(p)); lg.append(s);});
  const labels = A.weeks.map(w=>fmtDate(w.start));
  lineChart($("c1"), labels, people.map(p=>({c:colorOf(p), v:A.weekly[p].n})), v=>Math.round(v));
  lineChart($("c2"), labels, people.map(p=>({c:colorOf(p), v:A.weekly[p].reply.map(x=>x==null?null:x/60)})), v=>v<1?`${Math.round(v*60)}m`:`${v.toFixed(v<10?1:0)}h`);
  lineChart($("c3"), labels, people.map(p=>({c:colorOf(p), v:A.weekly[p].warm})), v=>(Math.abs(v)<0.05?0:v).toFixed(1), true);

  // transcript
  const tr=$("transcript"); tr.innerHTML="";
  const recent = msgs.slice(-80); let lastDay="";
  recent.forEach((m,i)=>{
    const day = new Date(m.t).toDateString();
    if(day!==lastDay){ tr.append(el("div","daynote", new Date(m.t).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}))); lastDay=day; }
    if(m.reply!=null && m.reply>=20*MIN){ tr.append(el("div","gapnote"+(m.reply>=HOUR?" slow":""), `${m.s} replied ${fmtDur(m.reply/MIN)} later`)); }
    const b=el("div","msg "+(m.s===people[0]?"a":"b"), m.x); b.title=new Date(m.t).toLocaleString(); tr.append(b);
  });
  tr.scrollTop = tr.scrollHeight;

  // chips
  const other = people.find(p=>p!==me) || people[1] || "them";
  const chips = [`Has something changed between us?`, `Is ${other} losing interest?`, `What did ${other} mean by their last message?`, `Who puts in more effort?`, `Am I overthinking this?`];
  const cb=$("chips"); cb.innerHTML="";
  chips.forEach(c=>{const b=el("button","chip",c); b.type="button"; b.onclick=()=>{$("q").value=c; ask(c);}; cb.append(b);});
}

function lineChart(host, labels, series, fmt, allowNeg){
  const W=320,H=180,L=34,Rr=8,T=10,B=24, n=labels.length;
  const vals = series.flatMap(s=>s.v).filter(v=>v!=null);
  let lo = allowNeg ? Math.min(0,...vals) : 0, hi = Math.max(...vals, lo+1);
  hi = hi + (hi-lo)*0.08;
  const x = i => n<=1 ? L+(W-L-Rr)/2 : L + i*(W-L-Rr)/(n-1);
  const y = v => T + (H-T-B)*(1-(v-lo)/(hi-lo));
  const ns="http://www.w3.org/2000/svg", svg=document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`); svg.setAttribute("role","img");
  const mk=(t,a)=>{const e=document.createElementNS(ns,t); for(const k in a)e.setAttribute(k,a[k]); svg.append(e); return e;};
  for(let k=0;k<=3;k++){ const v=lo+(hi-lo)*k/3, yy=y(v);
    mk("line",{x1:L,x2:W-Rr,y1:yy,y2:yy,stroke:"var(--line)","stroke-width":1});
    const t=mk("text",{x:L-6,y:yy+3.5,"text-anchor":"end","font-size":10,fill:"var(--muted)","font-family":"var(--f-mono)"}); t.textContent=fmt(v); }
  const step = Math.ceil(n/4);
  labels.forEach((l,i)=>{ if(i%step && i!==n-1) return; const t=mk("text",{x:x(i),y:H-6,"text-anchor":i===0?"start":i===n-1?"end":"middle","font-size":10,fill:"var(--muted)"}); t.textContent=l; });
  for(const s of series){
    let d="", pen=false;
    s.v.forEach((v,i)=>{ if(v==null){pen=false;return;} d+=(pen?"L":"M")+x(i).toFixed(1)+","+y(v).toFixed(1); pen=true; });
    mk("path",{d,fill:"none",stroke:s.c,"stroke-width":2.2,"stroke-linejoin":"round","stroke-linecap":"round"});
    s.v.forEach((v,i)=>{ if(v==null)return; const c=mk("circle",{cx:x(i),cy:y(v),r:i===n-1?4:2.4,fill:s.c}); const tt=document.createElementNS(ns,"title"); tt.textContent=`${labels[i]}: ${fmt(v)}`; c.append(tt); });
  }
  host.innerHTML=""; host.append(svg);
}

/* ---------- asking ---------- */
let sample = null, ctl = null;
window.claude?.use?.("sample").then(s=>{ sample=s; }).catch(()=>{});

function mdToNodes(text){
  const frag = document.createDocumentFragment(); let ul=null;
  const inline = (s, node) => { s.split(/(\*\*[^*]+\*\*)/g).forEach(part=>{ if(/^\*\*[^*]+\*\*$/.test(part)) node.append(el("strong",null,part.slice(2,-2))); else if(part) node.append(document.createTextNode(part)); }); return node; };
  for(const raw of text.split("\n")){
    const line = raw.trim();
    if(!line){ ul=null; continue; }
    if(/^#{1,4}\s/.test(line)){ ul=null; frag.append(inline(line.replace(/^#+\s/,""), el("h3"))); }
    else if(/^[-*•]\s/.test(line)){ if(!ul){ul=el("ul");frag.append(ul);} ul.append(inline(line.replace(/^[-*•]\s/,""), el("li"))); }
    else { ul=null; frag.append(inline(line, el("p"))); }
  }
  return frag;
}

function buildPrompt(q){
  const {people, E, R, all, msgs, findings} = A;
  const other = people.find(p=>p!==me);
  const metrics = {};
  for(const p of people) metrics[p] = { whole_chat:{messages:all[p].n, median_reply:fmtDur(all[p].reply), starts_conversations:pct(all[p].initShare)},
    first_half:{median_reply:fmtDur(E[p].reply), avg_words:+(E[p].words||0).toFixed(1), warmth:+(E[p].warm||0).toFixed(2), question_rate:pct(E[p].q), starts_conversations:pct(E[p].initShare), msgs_per_day:+E[p].perDay.toFixed(1)},
    second_half:{median_reply:fmtDur(R[p].reply), avg_words:+(R[p].words||0).toFixed(1), warmth:+(R[p].warm||0).toFixed(2), question_rate:pct(R[p].q), starts_conversations:pct(R[p].initShare), msgs_per_day:+R[p].perDay.toFixed(1)} };
  const fmtLine = m => `[${new Date(m.t).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}${m.reply!=null && m.reply>=HOUR?` · after ${fmtDur(m.reply/MIN)}`:""}] ${m.s}: ${m.x}`;
  let early = msgs.slice(0,40).map(fmtLine).join("\n"), recent = msgs.slice(-160).map(fmtLine).join("\n");
  if(recent.length>30000) recent = recent.slice(-30000);
  return `You are the analysis engine of "Between The Lines", an app that helps people understand their text conversations using evidence rather than guesswork.
${me ? `The person asking is ${me}. The other person is ${other}. Speak to ${me} as "you".` : `The participants are ${people.join(" and ")}. The asker hasn't said which one they are; answer neutrally.`}

QUESTION: ${q}

COMPUTED METRICS (warmth = lexicon score from positive words, emoji and exclamation points minus hedges like "maybe"/"busy"; conversation start = first message after an 8+ hour gap):
${JSON.stringify(metrics, null, 1)}

PATTERN FINDINGS:
${findings.map(f=>"- "+f.text).join("\n")}

EARLIEST MESSAGES:
${early}

MOST RECENT MESSAGES:
${recent}

Write the answer:
- Open with a 1–2 sentence direct answer to the question.
- "### What the data shows": 3–5 bullets, each citing a specific number or quoting a short message with its date.
- "### Other explanations": 1–2 bullets with plausible, kinder explanations.
- "### A next step": one concrete, kind suggestion (it may include a sample message they could send).
Be honest about uncertainty: texting patterns are signals, not proof of feelings. Don't diagnose anyone. Under 260 words. Use only **bold**, "- " bullets and "### " headings for formatting.`;
}

function fallbackAnswer(q){
  const {people, E, R, findings} = A;
  const other = people.find(p=>p!==me) || people[1];
  const big = findings.filter(f=>f.sev==="big"), mid = findings.filter(f=>f.sev==="mid");
  const aboutOther = findings.filter(f=>f.p===other && f.sev!=="low");
  const last = A.msgs[A.msgs.length-1];
  let lead;
  if(/mean|last message|said/i.test(q)){
    const hedgy = HEDGE.some(r=>r.test(last.x));
    lead = `The last message is from ${last.s}: "${last.x}"${last.reply!=null?`, sent ${fmtDur(last.reply/MIN)} after the previous message`:""}. ${hedgy?"It contains hedging language, which usually signals uncertainty or reluctance to commit, not a firm no.":"On its own it reads as fairly neutral."} Read it alongside the trend below rather than in isolation.`;
  } else if(big.length){
    lead = `Yes, the data shows a real shift, not just a feeling. ${big.length} big change${big.length>1?"s":""} stand out between the first and second half of the chat.`;
  } else if(mid.length){
    lead = `There are some changes, but they're moderate. This could be normal variation as much as anything meaningful.`;
  } else lead = `The patterns look stable. Nothing in the timing, length or tone suggests a meaningful change.`;
  const bullets = (aboutOther.length?aboutOther:findings).slice(0,4).map(f=>"- "+f.text).join("\n");
  const effort = people.length>1 ? `- Effort balance in the recent half: ${people.map(p=>`${p} started ${pct(R[p].initShare)} of conversations and asked questions in ${pct(R[p].q)} of messages`).join("; ")}.` : "";
  return `${lead}

### What the data shows
${bullets}
${effort}

### Other explanations
- A busy stretch at work or school can slow replies and shorten messages without any change in feelings.
- Some people text less as they get comfortable, saving conversation for in person.

### A next step
Ask directly and kindly, e.g. **"Hey, you've seemed busier lately. Everything okay with us?"** A real conversation will tell you more than any pattern.

*Rule-based reading. Claude isn't available in this view, so this summary was generated from the metrics only.*`;
}

async function ask(q){
  q = (q||"").trim(); if(!q || !A) return;
  const out = $("answer"); out.hidden=false; out.innerHTML="";
  const body = el("div"); body.style.display="flex"; body.style.flexDirection="column"; body.style.gap="8px";
  const meta = el("span","meta", `Question: ${q}`);
  out.append(meta, body);
  if(!sample){ body.append(mdToNodes(fallbackAnswer(q).replace(/^\*(.*)\*$/m,"$1"))); return; }
  body.append(el("p","thinking","Reading the conversation…"));
  $("askBtn").disabled=true; $("stopBtn").hidden=false;
  ctl = new AbortController();
  try{
    await sample(buildPrompt(q), { signal: ctl.signal, onText: ({text}) => { body.innerHTML=""; body.append(mdToNodes(text)); } });
  }catch(e){
    if(e && e.code==="cancelled"){ if(!e.text){ body.innerHTML=""; body.append(el("p","muted","Stopped.")); } }
    else if(e && (e.code==="not_granted"||e.code==="sampling_disabled"||e.code==="capability_disabled"||e.code==="not_declared")){ sample=null; body.innerHTML=""; body.append(mdToNodes(fallbackAnswer(q))); }
    else if(e && e.code==="rate_limited"){ body.append(el("p","muted","Too many questions at once. Wait a moment and ask again.")); }
    else if(e && e.code==="refused"){ body.innerHTML=""; body.append(el("p","muted","Claude couldn't answer that one. Try rephrasing the question.")); }
    else { body.append(el("p","muted","The answer was interrupted. Ask again to retry.")); }
  }finally{ $("askBtn").disabled=false; $("stopBtn").hidden=true; }
}

/* ---------- wiring ---------- */
function load(raw, label){
  const data = parse(raw);
  if(data.msgs.length < 4 || data.people.length < 1){
    $("srcTitle").textContent = "Couldn't read that chat";
    $("srcSub").textContent = "Check that each line starts with a date and time, then a name and a colon.";
    return false;
  }
  A = analyze(data);
  if(data.others>0) A.findings.push({sev:"low", text:`This looks like a group chat. Only the two most active people (${data.people.join(" and ")}) are analyzed.`});
  $("answer").hidden=true; render(); return true;
}
$("sampleBtn").onclick = () => { me = "Maya"; load(buildSample()); };
$("pasteBtn").onclick = () => { $("pasteBox").hidden = !$("pasteBox").hidden; if(!$("pasteBox").hidden) $("pasteIn").focus(); };
$("analyzeBtn").onclick = () => { if(load($("pasteIn").value)) $("pasteBox").hidden = true; };
$("fileIn").onchange = e => { const f=e.target.files[0]; if(!f) return; const fr=new FileReader(); fr.onload=()=>load(String(fr.result)); fr.readAsText(f); e.target.value=""; };
$("meSel").onchange = e => { me = e.target.value; render(); };
$("askForm").onsubmit = e => { e.preventDefault(); ask($("q").value); };
$("stopBtn").onclick = () => ctl?.abort();

me = "Maya"; load(buildSample());

// Expose the sample generator so `node scripts/` or the console can export it
window.BTL = { buildSample, parse };
})();
