const lessons = [
  {n:'01', kicker:'FOUNDATION', title:'말하는 AI에서 「일하는 AI」로', subtitle:'질문을 받아 판단하고, 구조화된 결과를 내는 첫 번째 에이전트', agent:'Classification Agent', project:'AI 민원·문의 해결사', desc:'질문 유형을 판단하고, 필요한 정보를 추출해 웹 화면에 구조화된 답변을 표시합니다.', concept:'Goal → Reason → Output', conceptText:'챗봇은 답하지만, 에이전트는 목표를 수행합니다. 오늘은 Tool과 Memory 없이 판단의 뼈대를 만듭니다.', flow:['질문 입력','분류','정보 추출','답변'], steps:[['01','화면 만들기','질문 입력창과 결과 카드 UI를 완성합니다.'],['02','Webhook 연결','n8n Webhook → AI Agent → Structured Output 흐름을 연결합니다.'],['03','실패 다루기','빈 질문과 모호한 질문의 결과를 비교하고 프롬프트를 고칩니다.']], mission:['질문을 일반/긴급/기타로 분류하기','중요도와 필요한 정보 함께 추출하기','JSON 결과를 화면에 렌더링하기'], tests:['장학금 신청기간이 언제예요?','이거 당장 처리해주세요!'], terms:['목표','판단','구조화 출력'], codeLab:[
    {label:'01 · index.html', title:'질문 입력 화면', code:`<form id="questionForm">
  <label for="question">무엇이 궁금한가요?</label>
  <textarea id="question" required
    placeholder="예: 장학금 신청기간이 언제예요?"></textarea>
  <button type="submit">문의 분류하기</button>
</form>
<section id="answerCard" aria-live="polite"></section>`},
    {label:'02 · app.js', title:'Webhook 호출과 결과 렌더링', code:`const form = document.querySelector('#questionForm');
const answerCard = document.querySelector('#answerCard');
const WEBHOOK_URL = 'https://YOUR-N8N-DOMAIN/webhook/classify';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = document.querySelector('#question').value.trim();
  if (!question) return;

  answerCard.textContent = '에이전트가 질문을 분석하고 있습니다...';
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!response.ok) throw new Error('Webhook 응답 오류');
    const result = await response.json();
    answerCard.innerHTML = ` + "`" + `<b>\${result.category}</b><p>${result.answer}</p><small>중요도: ${result.priority}</small>` + "`" + `;
  } catch (error) {
    answerCard.textContent = '연결에 실패했습니다. Webhook URL을 확인하세요.';
    console.error(error);
  }
});`},
    {label:'03 · n8n workflow', title:'Import 가능한 최소 워크플로', code:`{
  "name": "Classification Agent",
  "nodes": [
    {
      "parameters": {"path": "classify", "responseMode": "responseNode"},
      "name": "Webhook", "type": "n8n-nodes-base.webhook",
      "typeVersion": 2, "position": [240, 300]
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.body.question }}",
        "options": {"systemMessage": "질문을 general, scholarship, urgent 중 하나로 분류하고 category, priority, neededInfo, answer를 JSON으로 반환하라."}
      },
      "name": "AI Agent", "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7, "position": [500, 300]
    },
    {
      "parameters": {"respondWith": "json", "responseBody": "={{ $json.output }}"},
      "name": "Respond", "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1, "position": [800, 300]
    }
  ],
  "connections": {"Webhook": {"main": [[{"node":"AI Agent","type":"main","index":0}]]},"AI Agent": {"main": [[{"node":"Respond","type":"main","index":0}]]}}
}`}
  ]},
  {n:'02', kicker:'TOOLS', title:'도구를 쓰는 AI', subtitle:'필요한 순간에 외부 도구를 선택하고 결과를 판단하는 에이전트', agent:'Tool-Using Agent', project:'AI 여행 플래너', desc:'여행지와 날짜를 입력하면 날씨·검색·계산기 도구를 선택해 일정안을 만듭니다.', concept:'Tool Use / Function Calling', conceptText:'AI에게 모든 지식을 넣는 대신, 필요하면 도구를 사용하게 합니다. 도구 선택의 이유를 관찰하세요.', flow:['여행 요청','도구 선택','API 실행','일정 생성'], steps:[['01','도구 후보 설계','날씨, 웹 검색, 지도 중 에이전트가 고를 도구를 정의합니다.'],['02','HTTP Request 연결','n8n에서 도구별 실행 결과를 Agent에게 전달합니다.'],['03','결과 검증','실제 날씨와 계산 결과를 일정 카드에 반영합니다.']], mission:['도구 2개 이상 연결하기','도구가 필요 없는 질문도 테스트하기','맛집/쇼핑/취업 Agent로 변형하기'], tests:['이번 주말 대전에서 3명이 놀 계획을 짜줘.','비 오는 날에도 가능한 코스를 추천해줘.'], terms:['Tool','API','Function Calling']},
  {n:'03', kicker:'CONTEXT', title:'나를 기억하는 AI', subtitle:'사용자 맥락과 대화 상태를 이어가는 개인 비서', agent:'Memory Agent', project:'AI 개인 비서', desc:'사용자의 전공과 관심사를 기억하고, 다음 대화에서 맞춤형 계획을 제안합니다.', concept:'Memory + Context', conceptText:'Memory는 나를 기억하는 것, Context는 지금 대화의 맥락입니다. Agent = Model + State를 경험합니다.', flow:['User ID','Memory','대화 맥락','맞춤 답변'], steps:[['01','User ID 전달','웹앱에서 사용자별 세션 ID를 n8n으로 보냅니다.'],['02','Simple Memory 연결','대화와 핵심 프로필을 저장하고 다시 꺼냅니다.'],['03','기억력 테스트','같은 질문을 여러 세션에서 던져 정확도를 비교합니다.']], mission:['전공·관심사 기억시키기','단기 대화와 프로필 구분하기','팀별 기억력 게임 승리하기'], tests:['나는 마케팅학과 3학년이고 해외취업에 관심 있어.','나한테 맞는 이번 주 계획을 만들어줘.'], terms:['Session','Context','Persistent Memory']},
  {n:'04', kicker:'KNOWLEDGE', title:'모르는 것을 찾아보는 AI', subtitle:'내 문서에서 근거를 검색해 답하는 지식 전문가', agent:'Knowledge Agent', project:'AI 대학생활 규정 챗봇', desc:'학사규정·장학금·졸업요건 PDF를 검색하고 답변과 근거를 함께 제시합니다.', concept:'RAG (Retrieval-Augmented Generation)', conceptText:'Memory는 나를 기억하는 것, RAG는 자료를 찾아보는 것입니다. 모르는 것을 아는 척하지 않게 만듭니다.', flow:['질문','Vector Search','관련 문서','답변 + 근거'], steps:[['01','문서 준비','PDF를 업로드하고 텍스트 조각으로 나눕니다.'],['02','Vector Store 연결','Retriever가 질문과 가까운 문서를 찾도록 구성합니다.'],['03','근거 표시','답변 아래 출처 문서와 페이지를 함께 렌더링합니다.']], mission:['4개 규정 문서 인덱싱하기','근거 없는 답변 차단하기','졸업요건 질문으로 검증하기'], tests:['졸업하려면 최소 몇 학점이 필요해?','장학금 신청 자격과 기간을 알려줘.'], terms:['RAG','Retriever','Vector Store']},
  {n:'05', kicker:'CONTROL', title:'행동하지만 허락받는 AI', subtitle:'중요한 행동 전 사람에게 미리 보여주고 승인을 받는 업무비서', agent:'Action Agent', project:'AI 이메일 업무비서', desc:'수신자를 확인하고 메일을 작성한 뒤, Preview와 승인 단계를 거쳐 전송합니다.', concept:'Human-in-the-loop', conceptText:'Read는 비교적 자유롭게. Write는 조심스럽게. 중요한 Action은 반드시 승인받습니다.', flow:['요청','행동 계획','사람 승인','전송'], steps:[['01','행동 계획 만들기','수신자·제목·본문을 자동 생성하고 Preview합니다.'],['02','승인 단계 추가','승인 전에는 Gmail Tool이 실행되지 않도록 멈춥니다.'],['03','거절 케이스','수신자가 불명확하거나 위험한 요청을 안전하게 중단합니다.']], mission:['메일 Preview 화면 만들기','승인/거절 상태 구현하기','Read와 Write 권한 구분하기'], tests:['김교수님에게 내일 회의가 3시라는 메일 보내줘.','전체 학생에게 성적표를 공유해줘.'], terms:['Approval','Action','Human-in-the-loop']},
  {n:'06', kicker:'COLLABORATION', title:'AI끼리 팀을 만드는 법', subtitle:'역할을 나눠 더 나은 결과를 만드는 멀티 에이전트 시스템', agent:'Multi-Agent System', project:'AI 시장조사팀', desc:'Manager·Research·Data·Competitor·Writer Agent가 역할을 분담해 보고서를 만듭니다.', concept:'Multi-Agent Collaboration', conceptText:'시장조사, 분석, 보고서 작성을 한 사람이 모두 하지 않듯이 AI도 역할을 나눌 수 있습니다.', flow:['Manager','Research / Data','Writer','최종 보고서'], steps:[['01','역할 분해','하나의 큰 요청을 4개 전문 역할로 나눕니다.'],['02','Workflow 호출','다른 n8n Workflow를 Tool처럼 호출해 결과를 합칩니다.'],['03','팀 배틀','같은 과제를 주고 정확성·근거·속도를 비교합니다.']], mission:['전문 Agent 4개 설계하기','Manager가 작업을 배분하게 하기','보고서 품질을 팀별 비교하기'], tests:['한국에서 BYD 전기차 시장전략을 분석해줘.','경쟁사 3곳과 출처를 비교해줘.'], terms:['Manager Agent','Orchestration','Delegation']},
  {n:'07', kicker:'AUTONOMY', title:'스스로 움직이는 AI', subtitle:'질문을 기다리지 않고 이벤트에 반응하는 자율 업무 시스템', agent:'Autonomous Agent', project:'24시간 AI 업무 모니터링 에이전트', desc:'매일 뉴스를 수집하고 중요도를 평가해 필요한 브리핑만 알림으로 보냅니다.', concept:'Trigger → Monitor → Act', conceptText:'사람이 질문해야 시작하는 시스템에서, 이벤트가 발생하면 스스로 시작하는 시스템으로 확장합니다.', flow:['Schedule','수집','판단','알림 / 저장'], steps:[['01','Trigger 설정','Schedule 또는 Event Trigger로 매일 아침 실행을 예약합니다.'],['02','중요도 판단','뉴스를 수집하고 조건을 만족하는 것만 남깁니다.'],['03','최종 런칭','보고·저장·알림 중 행동을 선택해 자동화합니다.']], mission:['뉴스 모니터링 Workflow 만들기','중요도 임계값 설계하기','7개 Agent를 하나의 포트폴리오로 정리하기'], tests:['매일 오전 9시에 새로운 AI 뉴스를 브리핑해줘.','중요한 뉴스만 골라 슬랙으로 알려줘.'], terms:['Trigger','Monitoring','Autonomy']}
];

const firebaseConfig = {
  apiKey: "AIzaSyCxCl_Q6t0lNlCthUFcb2EP-6xEpMg3zOQ",
  authDomain: "game-da4c1.firebaseapp.com",
  databaseURL: "https://game-da4c1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-da4c1",
  storageBucket: "game-da4c1.firebasestorage.app",
  messagingSenderId: "252734109667",
  appId: "1:252734109667:web:5ccd208f7c9966bfd912d6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const state = { current: 0, completed: JSON.parse(localStorage.getItem('agentic-completed') || '[]'), notes: JSON.parse(localStorage.getItem('agentic-notes') || '{}'), steps: {}, tab: 'steps', user: null, syncing: false };
const localStepKey=(l,s)=>`agentic-step-${l}-${s}`;
const storageSnapshot=()=>({ completed: state.completed, notes: state.notes, steps: Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('agentic-step-')).map(k=>[k.replace('agentic-step-',''), localStorage.getItem(k)==='1'])) });
async function syncToFirebase(){ if(!state.user) return; state.syncing=true; updateAuthUI(); const data=storageSnapshot(); await database.ref(`users/${state.user.uid}`).update({ email: state.user.email || '', displayName: state.user.displayName || '', lastSeenAt: firebase.database.ServerValue.TIMESTAMP }); await database.ref(`progress/${state.user.uid}`).set({ completed:data.completed, steps:data.steps }); await database.ref(`notes/${state.user.uid}`).set(data.notes); state.syncing=false; updateAuthUI(); }
async function loadFromFirebase(user){ const [progressSnap, notesSnap] = await Promise.all([database.ref(`progress/${user.uid}`).once('value'), database.ref(`notes/${user.uid}`).once('value')]); const progress=progressSnap.val()||{}; const notes=notesSnap.val()||{}; if(progress.completed || Object.keys(notes).length){ state.completed=Array.isArray(progress.completed)?progress.completed:[]; state.notes=notes; state.steps=progress.steps||{}; localStorage.setItem('agentic-completed',JSON.stringify(state.completed)); localStorage.setItem('agentic-notes',JSON.stringify(state.notes)); Object.entries(state.steps).forEach(([key,value])=>localStorage.setItem(`agentic-step-${key}`,value?'1':'0')); } else { await syncToFirebase(); } render(); }
function updateAuthUI(){ const button=$('#authButton'), status=$('#saveStatus'); if(!button) return; if(state.user){ button.textContent=state.user.email ? `${state.user.email.split('@')[0]} · 로그아웃` : '로그아웃'; status.textContent=state.syncing?'저장 중…':'Firebase 동기화'; } else { button.textContent='로그인'; status.textContent='로컬 저장'; } }
const $ = s => document.querySelector(s);
function renderNav(){ $('#lessonNav').innerHTML = lessons.map((l,i)=>`<button class="lesson-nav-item ${i===state.current?'active':''} ${state.completed.includes(i)?'completed':''}" data-index="${i}" type="button"><span class="nav-number">${state.completed.includes(i)?'✓':l.n}</span><span><b class="nav-title">${l.title}</b><small class="nav-agent">${l.agent}</small></span></button>`).join(''); document.querySelectorAll('.lesson-nav-item').forEach(b=>b.addEventListener('click',()=>{state.current=+b.dataset.index; state.tab='steps'; render(); document.querySelector('.lesson-panel').scrollIntoView({behavior:'smooth',block:'start'})})); }
function renderLesson(){const l=lessons[state.current], done=state.completed.includes(state.current); $('#lessonKicker').textContent=`${l.n} / 07 · ${l.kicker}`; $('#lessonTitle').textContent=l.title; $('#lessonSubtitle').textContent=l.subtitle; $('#conceptTitle').textContent=l.concept; $('#conceptText').textContent=l.conceptText; $('#projectIndex').textContent=l.n; $('#projectTitle').textContent=l.project; $('#projectDescription').textContent=l.desc; $('#completionBadge').className=`completion-badge ${done?'done':''}`; $('#completionBadge').innerHTML=done?'<span>✓</span> 완료됨':'<span>○</span> 진행 전'; $('#flowDiagram').innerHTML=l.flow.map((x,i)=>`${i?'<span class="flow-arrow">→</span>':''}<span class="flow-node">${x}</span>`).join(''); renderTab(); }
function escapeCode(code){return code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')} function renderTab(){const l=lessons[state.current]; document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t.dataset.tab===state.tab)}); if(state.tab==='steps') $('#tabContent').innerHTML=`<div class="step-list">${l.steps.map((s,i)=>`<label class="step-item"><input class="step-check" type="checkbox" data-step="${i}" ${getStep(state.current,i)?'checked':''}><span><b>${s[0]} · ${s[1]}</b><p>${s[2]}</p></span></label>`).join('')}</div>${l.codeLab?`<div class="code-lab"><div class="code-lab-heading"><div><span class="card-label">HANDS-ON CODE LAB · LESSON 01</span><h3>Classification Agent 직접 완성하기</h3><p>아래 순서대로 파일과 n8n을 연결하면 첫 번째 작동하는 에이전트가 완성됩니다.</p></div><span class="code-lab-count">${l.codeLab.length} FILES</span></div><div class="code-grid">${l.codeLab.map((c,i)=>`<article class="code-card"><div class="code-card-top"><div><span>${c.label}</span><h4>${c.title}</h4></div><button class="copy-code" type="button" data-code="${i}">복사</button></div><pre><code>${escapeCode(c.code)}</code></pre></article>`).join('')}</div></div>`:''}<div style="margin-top:18px;color:#929bb2;font:10px var(--mono)">TIP · Codex에게 먼저 구조를 설계하게 하고, 학생은 Import → Run → Error 확인 → 수정 요청을 반복합니다.</div>`; if(state.tab==='mission') $('#tabContent').innerHTML=`<div class="mission-layout"><div class="mission-box"><h4>이번 주 미션 <button class="run-demo" id="runDemo" type="button">데모 실행</button></h4><ul>${l.mission.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="mission-box"><h4>테스트 질문</h4><ul>${l.tests.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`; if(state.tab==='notes') $('#tabContent').innerHTML=`<textarea class="notes-area" id="notesArea" placeholder="이번 실습에서 발견한 것, 막힌 지점, 다음에 개선할 점을 기록하세요.">${state.notes[state.current]||''}</textarea><button class="notes-save" id="saveNote" type="button">메모 저장</button>`; bindTabEvents(); }
const stepKey=(l,s)=>`agentic-step-${l}-${s}`; function getStep(l,s){return localStorage.getItem(stepKey(l,s))==='1'} function bindTabEvents(){document.querySelectorAll('.copy-code').forEach(button=>button.addEventListener('click',async()=>{const code=lessons[state.current].codeLab[+button.dataset.code].code;try{await navigator.clipboard.writeText(code);button.textContent='복사됨 ✓';setTimeout(()=>button.textContent='복사',1500)}catch(error){showToast('브라우저에서 클립보드 권한을 허용해주세요.')}})); document.querySelectorAll('.step-check').forEach(c=>c.addEventListener('change',async e=>{localStorage.setItem(stepKey(state.current,+e.target.dataset.step),e.target.checked?'1':'0');e.target.closest('.step-item').classList.toggle('checked',e.target.checked); if(state.user) try{await database.ref(`progress/${state.user.uid}/steps/${state.current}-${e.target.dataset.step}`).set(e.target.checked); }catch(err){showToast('Firebase 저장에 실패했습니다. 로컬에는 저장되었습니다.')} if([...document.querySelectorAll('.step-check')].every(x=>x.checked)) completeCurrent()})); $('#runDemo')?.addEventListener('click',()=>showToast(`${lessons[state.current].agent} 데모 실행 완료 · 결과를 확인하고 실패 케이스를 추가해보세요.`)); $('#saveNote')?.addEventListener('click',async()=>{state.notes[state.current]=$('#notesArea').value;localStorage.setItem('agentic-notes',JSON.stringify(state.notes));if(state.user) try{await database.ref(`notes/${state.user.uid}/${state.current}`).set(state.notes[state.current]);}catch(err){showToast('Firebase 저장에 실패했습니다. 로컬에는 저장되었습니다.');return} showToast(state.user?'Firebase에 메모를 저장했습니다.':'메모가 이 브라우저에 저장되었습니다.')}); }
function completeCurrent(){if(!state.completed.includes(state.current)){state.completed.push(state.current);localStorage.setItem('agentic-completed',JSON.stringify(state.completed));if(state.user) database.ref(`progress/${state.user.uid}/completed`).set(state.completed);showToast('차시 완료! 다음 에이전트가 열렸습니다.');render()}}
function renderGlossary(){ $('#glossaryGrid').innerHTML=lessons.map(l=>`<article class="glossary-card"><span class="glossary-number">${l.n}</span><h3>${l.agent}</h3><p>${l.terms.join(' · ')}</p></article>`).join('') }
function render(){renderNav();renderLesson();renderGlossary();$('#completedCount').textContent=state.completed.length;$('#progressBar').style.width=`${state.completed.length/7*100}%`}
function openAuth(){$('#authModal').classList.add('open');$('#authModal').setAttribute('aria-hidden','false');setTimeout(()=>$('#authEmail').focus(),50)} function closeAuth(){$('#authModal').classList.remove('open');$('#authModal').setAttribute('aria-hidden','true')} function showAuthError(err){const messages={'auth/invalid-credential':'이메일 또는 비밀번호를 확인하세요.','auth/email-already-in-use':'이미 가입된 이메일입니다.','auth/weak-password':'비밀번호는 6자 이상이어야 합니다.','auth/popup-closed-by-user':'로그인 창이 닫혔습니다.'};showToast(messages[err.code]||`인증 오류: ${err.message}`)}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),3000)}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{state.tab=t.dataset.tab;renderTab()})); $('#authButton').addEventListener('click',()=>{if(state.user){auth.signOut().catch(showAuthError)}else openAuth()}); $('#authClose').addEventListener('click',closeAuth); $('#authModal').addEventListener('click',e=>{if(e.target.id==='authModal')closeAuth()}); $('#authForm').addEventListener('submit',async e=>{e.preventDefault();try{await auth.signInWithEmailAndPassword($('#authEmail').value,$('#authPassword').value);closeAuth();showToast('로그인되었습니다. 학습 기록을 불러옵니다.')}catch(err){showAuthError(err)}}); $('#signupButton').addEventListener('click',async()=>{try{await auth.createUserWithEmailAndPassword($('#authEmail').value,$('#authPassword').value);closeAuth();showToast('계정이 생성되었습니다.')}catch(err){showAuthError(err)}}); $('#googleButton').addEventListener('click',async()=>{try{await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());closeAuth();showToast('Google 로그인되었습니다.')}catch(err){showAuthError(err)}}); $('#startLearning').addEventListener('click',()=>{$('#roadmap').scrollIntoView({behavior:'smooth'});setTimeout(()=>{state.current=0;render()},300)}); $('#showRoadmap').addEventListener('click',()=>$('#roadmap').scrollIntoView({behavior:'smooth'})); $('#resetProgress').addEventListener('click',async()=>{if(confirm('진행률과 실습 체크를 초기화할까요?')){state.completed=[];state.notes={};Object.keys(localStorage).filter(k=>k.startsWith('agentic-')).forEach(k=>localStorage.removeItem(k));if(state.user){await database.ref(`progress/${state.user.uid}`).remove();await database.ref(`notes/${state.user.uid}`).remove()}render();showToast('학습 기록이 초기화되었습니다.')}}); auth.onAuthStateChanged(async user=>{state.user=user;updateAuthUI();if(user){try{await loadFromFirebase(user);showToast('Firebase에서 학습 기록을 불러왔습니다.')}catch(err){showAuthError(err)}}else render()}); updateAuthUI(); render();
