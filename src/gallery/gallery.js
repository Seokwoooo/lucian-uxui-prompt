(function () {
  'use strict';

  // 미리보기, 복사되는 프롬프트, 다운로드 파일은 모두 같은 소스(item.html, item.js)에서 만듭니다.
  // 영어판은 같은 소스에 요소별 번역 목록을 적용해 만들므로 세 경로가 언제나 같은 코드를 씁니다.
  var DATA = JSON.parse(document.getElementById('ux-data').textContent);
  var ITEMS = DATA.items;
  var TOKENS = DATA.tokens.trim();
  // 영어판 코드에는 한국어 주석을 뺀 토큰을 넣습니다
  var TOKENS_EN = uxLocalize(TOKENS, 'html', []).replace(/^\s*\n/, '');
  function tokens() { return lang === 'en' ? TOKENS_EN : TOKENS; }
  var THEME_KEY = 'ux-gallery-theme';
  var LANG_KEY = 'ux-gallery-lang';
  var AUTO_KEY = 'ux-gallery-auto';
  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQ = window.matchMedia('(max-width: 760px)');
  var wideQ = window.matchMedia('(min-width: 1100px)');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 저장할 수 없는 환경에서도 동작합니다 */ } }
  };
  var ICON = {
    open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6"/></svg>',
    prompt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h8M5 18h5"/><path d="M17.5 13.2l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5A5.5 5.5 0 0 1 12.5 20h-1a5 5 0 0 1-4-2l-2.6-3.6a1.4 1.4 0 0 1 2.2-1.7L9 14"/></svg>',
    // 카드 버튼: Claude 로고, OpenAI(Codex) 로고, 코드(꺾쇠), 복사됨(체크). 로고는 호환 표시로만 씁니다(모양: Simple Icons, CC0)
    claude: '<svg class="g-icn g-logo-claude" viewBox="0 0 24 24" aria-hidden="true"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>',
    codex: '<svg class="g-icn g-logo-codex" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>',
    codeTag: '<svg class="g-icn" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.6 5.5l-3.2 13"/></svg>',
    ok: '<svg class="g-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    mark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h10a1 1 0 0 1 1 1v14l-6-3.8-6 3.8v-14a1 1 0 0 1 1-1z"/></svg>',
    sun: '<svg class="g-tt-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8M6 6l1.3 1.3M16.7 16.7L18 18M6 18l1.3-1.3M16.7 7.3L18 6"/></svg>',
    moon: '<svg class="g-tt-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14.2A7.5 7.5 0 0 1 9.8 5a7.5 7.5 0 1 0 9.2 9.2z"/></svg>'
  };
  // 창이 열려 있는 동안 뒤쪽 움직임을 멈추는 표시입니다(:has 선택자는 요소를 붙일 때마다 다시 검사돼 무거워서 클래스로 둡니다)
  function markDialogs() { body.classList.toggle('has-dlg', !!$('dialog[open]')); }
  function openDialog(d) { if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); markDialogs(); syncAll(); }
  function closeDialog(d) { if (d.close) d.close(); else d.removeAttribute('open'); markDialogs(); syncAll(); }

  /* ---------- 언어: 저장한 값 → 한국 시간대나 한국어 브라우저면 한국어 → 그 밖에는 영어 ---------- */
  var CAT_EN = {
    '전체': 'All', '버튼': 'Buttons', '토글·선택': 'Toggles & Pickers', '입력·검색': 'Inputs & Search', '메뉴·탭': 'Menus & Tabs',
    '카드·콘텐츠': 'Cards & Content', '로그인·가입': 'Sign-in & Sign-up', '알림·피드백': 'Alerts & Feedback',
    '로딩·진행': 'Loading & Progress', '빈·오류 상태': 'Empty & Error States', '위젯·차트': 'Widgets & Charts',
    '공간·일정·디자인 도구': 'Layout, Schedule & Design', '문서·데이터 편집': 'Document & Data Editing',
    '분석·데이터': 'Analytics & Data', '작업·시스템': 'Workflow & Systems',
    '텍스트 모션': 'Text Motion', '히어로·배경': 'Hero & Backgrounds', '내비게이션': 'Navigation', '스크롤 모션': 'Scroll Motion',
    '섹션·콘텐츠': 'Sections & Content', '소셜 증명': 'Social Proof', '커머스·가격': 'Commerce & Pricing', '폼·입력': 'Forms & Input',
    '앱 화면': 'App Screens', '빌더 도구': 'Site Builder Tools', '커서·호버': 'Cursor & Hover', '프로모션·보상': 'Promos & Rewards', '데이터 모션': 'Data Motion'
  };
  var T = {
    ko: {
      docTitle: 'Lucian UX/UI Prompt',
      docDesc: '실제로 돌아가는 UX/UI 요소 450개. 카드에서 Claude·Codex용 프롬프트나 코드를 바로 복사해 프로젝트에 넣으세요.',
      skip: '요소 목록으로 건너뛰기',
      brand: 'Lucian UX/UI Prompt, 맨 위로',
      guideBtn: '적용 방법',
      langGroup: '언어',
      h1: 'Lucian UX/UI Prompt', w1: 'Lucian', w2: 'UX/UI', w3: 'Prompt',
      intro: '실제로 돌아가는 UI 요소 450개. 마음에 드는 카드에서 Claude나 Codex를 누르고 붙여넣으면, 내 프로젝트에 맞게 만들어 줍니다.',
      side: '사이드바', menuOpen: '메뉴 열기', menuClose: '메뉴 닫기',
      browseH: '둘러보기', collH: '컬렉션', takeH: '가져가기', setSaved: '저장됨',
      installT: '스킬로 설치하기', installS: 'Claude Code·Codex가 번호만으로 요소를 꺼내 씁니다.',
      searchGo: '맨 위로', searchClear: '검색 지우기', searchTry: '찾아보기: ', catsPrev: '앞쪽 분류 보기', catsNext: '뒤쪽 분류 보기',
      searchEx: ['가격표', '로그인', '차트', '토글', '장바구니', '히어로', '로딩', '캘린더', '파일 업로드', '알림'],
      qN: function (n) { return n + '개'; },
      cbCode: '코드 복사', cbCopied: '복사됨',
      aClaude: function (t) { return t + ', Claude용 프롬프트 복사'; },
      aCodex: function (t) { return t + ', Codex용 프롬프트 복사'; },
      aCode: function (t) { return t + ', 코드 복사'; },
      aSave: function (t) { return t + ' 저장'; },
      aPrompt: function (t) { return t + ', 프롬프트와 코드 보기'; },
      cardToLight: '이 카드를 라이트로 보기', cardToDark: '이 카드를 다크로 보기',
      tClaude: '프롬프트를 복사했어요. Claude에 붙여넣으세요', tCodex: '프롬프트를 복사했어요. Codex에 붙여넣으세요',
      tSaveOn: '저장했어요. 왼쪽 ‘저장됨’에 모여요', tSaveOff: '저장에서 뺐어요',
      savedEmptyT: '아직 저장한 요소가 없어요', savedEmptyS: '카드의 북마크를 누르면 여기에 모입니다. 이 브라우저에만 저장돼요.', savedEmptyB: '전체 보기',
      refClaude: function (id) { return '[참고] lucian-uxui 스킬이 설치돼 있으면 Claude Code에서 "/lucian-uxui ' + id + '번 요소 넣어줘"처럼 번호로 같은 요소를 부를 수 있습니다.'; },
      refCodex: function (id) { return '[참고] lucian-uxui 스킬이 설치돼 있으면 Codex에서 "$lucian-uxui ' + id + '번 요소 넣어줘"처럼 번호로 같은 요소를 부를 수 있습니다.'; },
      sets: '컬렉션', setAll: '전체', setNew: '애니메이션', setOld: '인터페이스', newBadge: '새로 추가',
      count: function (n) { return '<b id="count">' + n + '</b>개'; },
      metaTheme: '다크 · 라이트', metaCode: '코드 포함',
      cats: '분류',
      searchOpen: '검색 열기', searchPh: '버튼, 차트, 로그인…', searchLabel: '요소 검색',
      reelBtn: '릴스로 크게 넘겨 보기', reelLabel: '릴스',
      toDark: '다크 테마로 전환', toLight: '라이트 테마로 전환',
      autoOn: '자동 재생 켜짐. 누르면 멈춥니다', autoOff: '자동 재생 꺼짐. 누르면 다시 재생합니다', autoText: '자동 재생',
      grid: 'UI 요소',
      emptyT: '맞는 요소가 없어요', emptyS: '다른 단어로 찾거나 분류를 ‘전체’로 바꿔 보세요.', emptyB: '검색 지우기',
      reel: 'UI 요소 릴스', hud: '릴스 도구', back: '그리드로 돌아가기', backText: '그리드',
      close: '닫기', seg: '보기 전환', tabPrompt: '적용 프롬프트', tabCode: '코드',
      dl: '코드 파일 받기', copyPrompt: '프롬프트 복사', copyCode: '코드 복사',
      hintPrompt: function (n) { return '프롬프트 ' + n + '자 · 실행 코드 전체 포함'; },
      hintCode: function (n) { return '코드 ' + n + '자 · 실행 코드 전체 포함'; },
      areaPrompt: '적용 프롬프트', areaCode: '요소 코드',
      guideKick: '적용 방법', guideTitle: '이렇게 가져가세요',
      skillBtn: '에이전트 스킬', skillBtnLong: '에이전트 스킬로 쓰기 →', skillTitle: 'AI 에이전트에게 맡기기',
      skillLead: 'lucian-uxui 스킬을 설치하면 Claude Code, Codex 같은 코딩 에이전트가 이 갤러리에서 맞는 요소를 찾아 프로젝트에 옮겨 넣습니다.',
      skillAny: '모든 에이전트', skillPlugin: 'Claude Code 플러그인', copyCmd: '명령 복사', tCmdCopied: '복사했어요',
      useAsk: '말로 부탁하기', useAskEx: '“lucian-uxui 스킬로 요금제 토글이랑 FAQ 넣어줘”',
      usePick: '번호로 고르기', usePickEx: '“lucian-uxui 스킬로 056번 요소 넣어줘”',
      useCall: '바로 부르기', useCallEx: 'Claude Code <code>/lucian-uxui</code> (플러그인은 <code>/lucian-uxui:lucian-uxui</code>) · Codex <code>$lucian-uxui</code>',
      skillMore: '자세히 보기', skillLine: '에이전트 스킬로 부르기', skillHow: '설치 방법',
      skillAskId: function (id) { return 'lucian-uxui 스킬로 ' + id + '번 요소 넣어줘'; },
      guideSteps: [
        '<b>보고, 직접 눌러 보세요.</b> 요소는 화면에 보이면 스스로 조작 시연을 반복합니다. 요소를 직접 누르거나 키보드로 들어가면 시연이 멈추고, 손을 떼고 잠시 지나면 처음부터 다시 시작합니다.',
        '카드 아래 <b>Claude</b>·<b>Codex</b> 버튼은 실행 코드 전체와 적용 지침이 든 프롬프트를 복사합니다. 프로젝트의 AI 도구에 붙여넣고 넣을 자리만 알려 주면 됩니다. <b>코드 복사</b>는 요소 코드만 복사합니다.',
        '카드 이름을 누르면 프롬프트와 코드를 열어 보고, <b>코드 파일 받기</b>로 단독 HTML을 저장할 수 있습니다. 라이트·다크 토큰이 함께 들어 있어 바로 열립니다.',
        '북마크로 저장한 요소는 왼쪽 <b>저장됨</b>에 모입니다(이 브라우저에만 저장). 카드 오른쪽 위 해·달 버튼은 그 카드만 라이트·다크로 바꿉니다. 언어·테마는 왼쪽 아래에서 바꾸고, 고른 값은 다음 방문에도 유지됩니다.'
      ],
      guideNote: '개발 메모 · 요소마다 <code>.ux</code>와 <code>.uNNN</code> 접두사 안에서만 스타일과 스크립트가 동작합니다. 색은 <code>--ux-*</code> 토큰을 쓰므로 프로젝트 테마 변수에 연결하면 됩니다.',
      open: function (t) { return t + ' 크게 보기'; },
      railPrompt: '프롬프트', railCopy: '복사', railCode: '코드',
      tPromptCopied: '프롬프트를 복사했어요', tCodeCopied: '코드를 복사했어요', tSelect: '글을 선택해 두었어요. ⌘C로 복사하세요',
      tSaved: '코드 파일을 저장했어요', tCopyIn: '프롬프트 창에서 복사해 주세요',
      themeBtn: '테마 전환', num: 'ko-KR'
    },
    en: {
      docTitle: 'Lucian UX/UI Prompt',
      docDesc: '450 working UX/UI elements. Copy a prompt for Claude or Codex, or the code, straight from each card.',
      skip: 'Skip to the elements',
      brand: 'Lucian UX/UI Prompt, back to top',
      guideBtn: 'How to use',
      langGroup: 'Language',
      h1: 'Lucian UX/UI Prompt', w1: 'Lucian', w2: 'UX/UI', w3: 'Prompt',
      intro: '450 UI elements, running live. Press Claude or Codex on a card, paste it into your agent, and it builds the element into your project.',
      side: 'Sidebar', menuOpen: 'Open menu', menuClose: 'Close menu',
      browseH: 'Browse', collH: 'Collections', takeH: 'Take it', setSaved: 'Saved',
      installT: 'Install the skill', installS: 'Claude Code and Codex pull any element by its number.',
      searchGo: 'Back to top', searchClear: 'Clear search', searchTry: 'Try: ', catsPrev: 'Show earlier categories', catsNext: 'Show more categories',
      searchEx: ['pricing', 'login', 'chart', 'toggle', 'cart', 'hero', 'loading', 'calendar', 'file upload', 'toast'],
      qN: function (n) { return n + ' found'; },
      cbCode: 'Copy code', cbCopied: 'Copied',
      aClaude: function (t) { return 'Copy a prompt for Claude to add ' + t; },
      aCodex: function (t) { return 'Copy a prompt for Codex to add ' + t; },
      aCode: function (t) { return 'Copy the code for ' + t; },
      aSave: function (t) { return 'Save ' + t; },
      aPrompt: function (t) { return t + ', view the prompt and code'; },
      cardToLight: 'Show this card in light mode', cardToDark: 'Show this card in dark mode',
      tClaude: 'Prompt copied. Paste it into Claude', tCodex: 'Prompt copied. Paste it into Codex',
      tSaveOn: 'Saved. Find it under Saved on the left', tSaveOff: 'Removed from Saved',
      savedEmptyT: 'Nothing saved yet', savedEmptyS: 'Press the bookmark on a card and it shows up here. Saved in this browser only.', savedEmptyB: 'Show all',
      refClaude: function (id) { return '[Note] If the lucian-uxui skill is installed, Claude Code can bring in the same element by number: "/lucian-uxui add element #' + id + '".'; },
      refCodex: function (id) { return '[Note] If the lucian-uxui skill is installed, Codex can bring in the same element by number: "$lucian-uxui add element #' + id + '".'; },
      sets: 'Collection', setAll: 'All', setNew: 'Animation', setOld: 'Interface', newBadge: 'New',
      count: function (n) { return '<b id="count">' + n + '</b> elements'; },
      metaTheme: 'Dark · Light', metaCode: 'Code included',
      cats: 'Categories',
      searchOpen: 'Open search', searchPh: 'Button, chart, login…', searchLabel: 'Search elements',
      reelBtn: 'Browse full screen in Reels', reelLabel: 'Reels',
      toDark: 'Switch to dark theme', toLight: 'Switch to light theme',
      autoOn: 'Autoplay is on. Press to pause', autoOff: 'Autoplay is off. Press to play', autoText: 'Autoplay',
      grid: 'UI elements',
      emptyT: 'No matching elements', emptyS: 'Try another word, or switch the category to “All”.', emptyB: 'Clear search',
      reel: 'UI element reels', hud: 'Reel controls', back: 'Back to the grid', backText: 'Grid',
      close: 'Close', seg: 'Switch view', tabPrompt: 'Prompt', tabCode: 'Code',
      dl: 'Download code', copyPrompt: 'Copy prompt', copyCode: 'Copy code',
      hintPrompt: function (n) { return 'Prompt · ' + n + ' characters · includes the full working code'; },
      hintCode: function (n) { return 'Code · ' + n + ' characters · the full working element'; },
      areaPrompt: 'Prompt', areaCode: 'Element code',
      guideKick: 'How to use', guideTitle: 'Bring it into your project',
      skillBtn: 'Agent skill', skillBtnLong: 'Use it from an AI agent →', skillTitle: 'Let an AI agent do it',
      skillLead: 'Install the lucian-uxui skill and coding agents like Claude Code and Codex find the right elements in this gallery and port them into your project.',
      skillAny: 'Any agent', skillPlugin: 'Claude Code plugin', copyCmd: 'Copy command', tCmdCopied: 'Copied',
      useAsk: 'Ask in words', useAskEx: '“Add a pricing toggle and an FAQ with the lucian-uxui skill.”',
      usePick: 'Pick by number', usePickEx: '“Use the lucian-uxui skill to add element #056.”',
      useCall: 'Call it directly', useCallEx: 'Claude Code <code>/lucian-uxui</code> (as a plugin, <code>/lucian-uxui:lucian-uxui</code>) · Codex <code>$lucian-uxui</code>',
      skillMore: 'Read more', skillLine: 'Call it from an agent', skillHow: 'How to install',
      skillAskId: function (id) { return 'Use the lucian-uxui skill to add element #' + id; },
      guideSteps: [
        '<b>Watch, then try it.</b> Each element plays a short demo on a loop while it is on screen. Tap it or tab into it and the demo stops so you can use it yourself; leave it for a moment and it starts over.',
        'The <b>Claude</b> and <b>Codex</b> buttons under each card copy a prompt with the element’s full working code and instructions. Paste it into your project’s AI tool and say where it should go. <b>Copy code</b> copies just the element code.',
        'Press a card’s name to read the prompt and code, or use <b>Download code</b> to save a standalone HTML file with light and dark tokens included.',
        'Bookmarked elements gather under <b>Saved</b> on the left (kept in this browser only). The sun and moon button on a card switches just that card between light and dark. Language and theme live at the bottom left, and your choices are remembered next time.'
      ],
      guideNote: 'Dev note · Each element keeps its styles and scripts inside the <code>.ux</code> and <code>.uNNN</code> prefixes. Colors use <code>--ux-*</code> tokens, so you can map them to your project’s theme variables.',
      open: function (t) { return 'Open ' + t; },
      railPrompt: 'Prompt', railCopy: 'Copy', railCode: 'Code',
      tPromptCopied: 'Prompt copied', tCodeCopied: 'Code copied', tSelect: 'Text selected — press ⌘C to copy',
      tSaved: 'Code file saved', tCopyIn: 'Copy it from the prompt window',
      themeBtn: 'Switch theme', num: 'en-US'
    }
  };
  var lang = root.getAttribute('lang') === 'en' ? 'en' : 'ko';
  var t = function (k) { return T[lang][k]; };
  var catLabel = function (c) { return lang === 'en' ? (CAT_EN[c] || c) : c; };
  /*@I18N_CORE@*/
  // 현재 언어의 제목·설명·코드. 영어 코드는 처음 쓸 때 한 번 만들어 둡니다
  function loc(it) {
    if (lang !== 'en' || !it.en) return { title: it.title, summary: it.summary, hint: it.hint, category: it.category, html: it.html, js: it.js };
    if (!it._en) it._en = { html: uxLocalize(it.html, 'html', it.en.map), js: uxLocalize(it.js, 'js', it.en.map) };
    return { title: it.en.title, summary: it.en.summary, hint: it.en.hint, category: catLabel(it.category), html: it._en.html, js: it._en.js };
  }

  /* ---------- 테마 ---------- */
  function isDark() {
    var a = root.getAttribute('data-theme');
    if (a) return a === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncTheme() {
    var dark = isDark();
    var b = $('#theme');
    b.classList.toggle('is-dark', dark);
    b.setAttribute('aria-label', dark ? t('toLight') : t('toDark'));
    $('.g-hud-theme').setAttribute('aria-label', dark ? t('toLight') : t('toDark'));
    $$('.g-tile', document.getElementById('grid')).forEach(syncCardTheme);
  }
  // 누른 버튼 자리에서 원이 퍼지며 테마가 바뀝니다. 요소를 다시 만들지 않으므로 입력값과 진행 상태가 유지됩니다
  function toggleTheme(fromEl) {
    var next = isDark() ? 'light' : 'dark';
    var apply = function () {
      root.setAttribute('data-theme', next);
      $$('.g-tile[data-stage]').forEach(function (tl) { tl.removeAttribute('data-stage'); $('.g-stage', tl).removeAttribute('data-theme'); });
      syncTheme();
    };
    store.set(THEME_KEY, next);
    if (!document.startViewTransition || reduce.matches) { apply(); return; }
    var r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth / 2, top: 0, width: 0, height: 0 };
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var tr = document.startViewTransition(apply);
    tr.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () { /* 전환을 건너뛰어도 테마는 이미 적용됐습니다 */ });
  }
  $('#theme').addEventListener('click', function (e) { toggleTheme(e.currentTarget); });
  var schemeQ = window.matchMedia('(prefers-color-scheme: dark)');
  var onScheme = function () { if (!root.getAttribute('data-theme')) syncTheme(); };
  if (schemeQ.addEventListener) schemeQ.addEventListener('change', onScheme); else if (schemeQ.addListener) schemeQ.addListener(onScheme);

  /* ---------- 요소 마운트와 배율 맞춤 ---------- */
  // 사파리는 <style>을 넣거나 뺄 때마다 페이지 전체 스타일을 다시 계산합니다(카드 450개에서 한 번에 약 50ms, Chrome은 1ms 미만).
  // 그래서 요소 CSS는 카드에 붙일 때마다 넣지 않고 공용 시트에 요소당 한 번만 등록합니다. 등록이 필요할 때는
  // 그때까지 받아 둔 요소를 모두 한 번에 넣어, 스크롤 중 시트를 바꾸는 횟수를 줄입니다
  var STYLE_RE = /<style>([\s\S]*?)<\/style>/, cssKey = {}, cssText = {};
  function cssLang(it) { return lang === 'en' && it.en ? 'en' : 'ko'; }
  function regCss(list) {
    var buf = '';
    list.forEach(function (it) {
      if (!it || typeof it.html !== 'string') return;
      var k = cssLang(it);
      if (cssKey[it.id] === k) return;
      cssKey[it.id] = k;
      var m = STYLE_RE.exec(loc(it).html);
      // 언어를 바꿔도 CSS가 같으면(대부분) 다시 넣지 않습니다
      if (m && cssText[it.id] !== m[1]) { cssText[it.id] = m[1]; buf += m[1] + '\n'; }
    });
    if (!buf) return;
    var s = document.createElement('style');
    s.setAttribute('data-ux-elements', '');
    s.textContent = buf;
    document.head.appendChild(s);
  }
  // 코드가 이미 들어 있는 요소(단일 파일판)는 처음에 한 번에 등록합니다
  regCss(ITEMS);
  // 요소 HTML을 넣고 스크립트를 새로 만들어 붙입니다. 스크립트 바로 앞 형제가 요소의 루트입니다
  function mountInto(fit, it) {
    if (cssKey[it.id] !== cssLang(it)) regCss(ITEMS);
    var c = loc(it);
    fit.innerHTML = c.html.replace(STYLE_RE, '');
    var s = document.createElement('script');
    s.textContent = c.js;
    fit.appendChild(s);
  }
  function unmount(fit) { dropPlayer(fit); fit.innerHTML = ''; fit.removeAttribute('data-k'); }
  // 무대 안쪽 여백을 두고 요소를 배율로 맞춥니다. 요소 루트는 모든 상태에서 크기가 같도록 만들어져 있습니다
  // 폭이 컨테이너를 따르는 요소(is-fluid)는 펼치거나 줄을 더하면 높이가 바뀝니다. 그때마다 배율을 다시 맞춥니다
  var refit = window.ResizeObserver ? new ResizeObserver(function (entries) {
    entries.forEach(function (en) { var f = en.target; if (f._fa && f.isConnected) fitTo(f._fa[0], f, f._fa[1], f._fa[2]); });
  }) : null;
  function fitTo(stage, fit, maxK, padRatio) {
    if (refit && fit.classList.contains('is-fluid')) {
      if (!fit._fa) refit.observe(fit);
      fit._fa = [stage, maxK, padRatio];
    }
    var w = fit.offsetWidth, h = fit.offsetHeight;
    if (!w || !h) return;
    var sw = stage.clientWidth, sh = stage.clientHeight;
    var pad = Math.min(sw, sh) * (padRatio == null ? 0.09 : padRatio);
    var k = Math.min(maxK, (sw - pad * 2) / w, (sh - pad * 2) / h);
    k = Math.max(0.2, k);
    fit.dataset.k = k.toFixed(3);
    fit.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(4) + ')';
  }
  var fitTile = function (stage, fit) { fitTo(stage, fit, 1.3); };
  var fitSlide = function (stage, fit) { fitTo(stage, fit, mobileQ.matches ? 1.25 : 1.7, 0.04); };

  // 미리보기 안에서는 링크 이동과 폼 전송이 갤러리 주소를 바꾸지 않게 막고, 시연용 가짜 이벤트가 갤러리로 새지 않게 합니다
  function guardFit(fit) {
    if (fit._guard) return;
    fit._guard = true;
    fit.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) e.preventDefault(); });
    fit.addEventListener('submit', function (e) { e.preventDefault(); });
    ['pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointercancel', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'keydown', 'keyup', 'input', 'change', 'wheel'].forEach(function (type) {
      fit.addEventListener(type, function (e) { if (!e.isTrusted) e.stopPropagation(); });
    });
  }

  /* ---------- 자동 재생: 화면에 보이는 요소가 스스로 조작 시연을 반복합니다 ---------- */
  // 켜고 끄기는 저장됩니다. 저장한 값이 없으면 동작 줄이기 설정을 따릅니다
  var autoOn = (function () { var s = store.get(AUTO_KEY); return s === 'on' ? true : s === 'off' ? false : !reduce.matches; })();
  var players = [];
  var PID = 41;
  // 시연용 포인터는 실제 포인터가 아니어서 setPointerCapture가 예외를 던집니다. 미리보기에서만 조용히 넘깁니다
  ['setPointerCapture', 'releasePointerCapture'].forEach(function (m) {
    var orig = Element.prototype[m];
    if (!orig) return;
    Element.prototype[m] = function (id) { try { return orig.call(this, id); } catch (e) { return undefined; } };
  });
  var origHas = Element.prototype.hasPointerCapture;
  if (origHas) Element.prototype.hasPointerCapture = function (id) { return id === PID ? !!(this._demoCap) : origHas.call(this, id); };
  // 시연 중인 요소는 초점을 가져가지 않습니다. 사용자가 다른 곳에서 입력하던 흐름과 단축키를 지킵니다
  var nativeFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (o) {
    var f = this.closest && this.closest('.g-fit');
    if (f && f._pl && f._pl.on) return undefined;
    return nativeFocus.call(this, o);
  };
  // select()도 초점을 옮기므로, 시연 중에는 초점 없이 글자만 선택합니다
  [HTMLInputElement, HTMLTextAreaElement].forEach(function (C) {
    var nativeSelect = C.prototype.select;
    C.prototype.select = function () {
      var f = this.closest && this.closest('.g-fit');
      if (f && f._pl && f._pl.on) { try { this.setSelectionRange(0, this.value.length); } catch (e) { /* 선택을 못 하는 입력 종류 */ } return undefined; }
      return nativeSelect.call(this);
    };
  });

  function hostOf(fit) { return fit.closest('.g-tile, .g-slide'); }
  // 가짜 포인터로는 CSS :hover, :active가 켜지지 않습니다. 미리보기의 스타일시트에만 같은 규칙을 클래스판으로 하나씩 더해 둡니다
  // (원본 코드는 그대로이므로 복사·다운로드 결과에는 영향이 없습니다)
  function hoverShim(fit) {
    var st = fit.querySelector('style');
    if (!st || !st.sheet || st._shim) return;
    st._shim = true;
    var walk = function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        var r = list[i];
        if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
        var sel = r.selectorText;
        if (!sel || !/:(hover|active)/.test(sel) || /:not\([^)]*:(hover|active)/.test(sel)) continue;
        var alt = sel.replace(/:hover/g, '.g-hov').replace(/:active/g, '.g-act');
        try { (r.parentRule || st.sheet).insertRule(alt + '{' + r.style.cssText + '}', i + 1); } catch (e) { /* 규칙을 못 넣어도 시연은 계속됩니다 */ }
      }
    };
    try { walk(st.sheet.cssRules); } catch (e) { /* 무시 */ }
  }
  function attachPlayer(fit, idx, kind) {
    dropPlayer(fit);
    var it = ITEMS[idx];
    var P = { fit: fit, stage: fit.parentNode, host: hostOf(fit), idx: idx, kind: kind, steps: it.demo || [], on: false, gen: 0, dirty: false,
      user: false, lastUser: 0, mouseIn: false, vis: false, timers: [], hp: [], ht: null, down: null, muted: [], ghost: null, i: 0 };
    P.root = fit.querySelector(':scope > .ux');
    fit._pl = P;
    guardFit(fit);
    hoverShim(fit);
    var g = P.host.querySelector(':scope > .g-ghost');
    if (!g) { g = document.createElement('span'); g.className = 'g-ghost'; g.setAttribute('aria-hidden', 'true'); P.host.appendChild(g); }
    P.ghost = g;
    players.push(P);
    if (kind === 'tile') playIO.observe(P.stage);
    return P;
  }
  function dropPlayer(fit) {
    var P = fit && fit._pl;
    if (!P) return;
    stopPlayer(P);
    if (P.kind === 'tile') playIO.unobserve(P.stage);
    var i = players.indexOf(P);
    if (i >= 0) players.splice(i, 1);
    fit._pl = null;
  }
  function shouldRun(P) {
    return autoOn && P.vis && !P.user && P.steps.length > 0 && !document.hidden && !$('dialog[open]') &&
      P.fit.isConnected && (P.kind === 'tile' ? body.dataset.view === 'grid' : body.dataset.view === 'reel');
  }
  function syncPlayer(P) {
    var go = shouldRun(P);
    if (go && !P.on) startPlayer(P);
    else if (!go && P.on) stopPlayer(P);
  }
  function syncAll() { players.slice().forEach(syncPlayer); }

  function later(P, gen, ms, fn) {
    var id = setTimeout(function () {
      var k = P.timers.indexOf(id);
      if (k >= 0) P.timers.splice(k, 1);
      if (P.gen === gen && P.on) fn();
    }, ms);
    P.timers.push(id);
  }
  // 시연 중에는 요소의 안내 영역(aria-live)이 반복해서 읽히지 않게 잠시 끕니다
  function mute(P) {
    if (!P.root) return;
    $$('[aria-live], [role="status"], [role="alert"], [role="log"], [role="timer"]', P.root).forEach(function (el) {
      if (el.hasAttribute('data-g-live')) return;
      el.setAttribute('data-g-live', el.getAttribute('aria-live') || '');
      el.setAttribute('aria-live', 'off');
      P.muted.push(el);
    });
  }
  function unmute(P) {
    P.muted.forEach(function (el) {
      var v = el.getAttribute('data-g-live');
      el.removeAttribute('data-g-live');
      if (v) el.setAttribute('aria-live', v); else el.removeAttribute('aria-live');
    });
    P.muted = [];
  }
  function startPlayer(P) {
    P.on = true;
    P.gen += 1;
    var gen = P.gen;
    mute(P);
    if (P.dirty) softReset(P, gen, function () { P.i = 0; runStep(P, gen); });
    else { P.i = 0; runStep(P, gen); }
  }
  function stopPlayer(P) {
    if (!P.on && !P.timers.length) return;
    P.on = false;
    P.gen += 1;
    P.timers.forEach(clearTimeout);
    P.timers = [];
    if (P.raf) cancelAnimationFrame(P.raf);
    // 누르고 있던 시연 포인터는 놓고, 올려 둔 포인터는 빼서 요소가 눌린 채로 남지 않게 합니다
    if (P.down) { var d = P.down; P.down = null; d.el._demoCap = false; fire(P, d.el, 'pointerup', d.x, d.y, true, { button: 0, buttons: 0 }); }
    hoverTo(P, null, 0, 0);
    ghost(P, 'off');
    unmute(P);
    // 처음 상태로 되돌리려고 흐려지던 중에 멈추면 다시 그리는 예약이 취소되므로, 투명한 채로 남지 않게 바로 되살립니다
    if (P.fit.style.opacity === '0') P.fit.style.opacity = '';
  }
  // 처음 상태로 되돌립니다. 안 보일 때는 바로, 보일 때는 잠깐 흐려졌다가 새로 그립니다
  // 화면에 보이지 않을 때는 흐려지는 효과 없이 바로 처음 상태로 되돌려 둡니다. 다시 보일 때 깜빡이지 않습니다
  function quietReset(P) {
    var fit = P.fit;
    if (!fit.isConnected || P.on || fit._pl !== P) return;
    P.gen += 1;
    P.timers.forEach(clearTimeout); P.timers = [];
    fit.innerHTML = '';
    mountInto(fit, ITEMS[P.idx]);
    P.root = fit.querySelector(':scope > .ux');
    P.hp = []; P.ht = null; P.muted = []; P.user = false; P.i = 0;
    hoverShim(fit);
    (P.kind === 'tile' ? fitTile : fitSlide)(P.stage, fit);
    fit.style.transition = ''; fit.style.opacity = '';
    P.dirty = false;
  }
  function softReset(P, gen, done) {
    var fit = P.fit;
    var swap = function () {
      if (P.gen !== gen || !fit.isConnected) return;
      fit.innerHTML = '';
      mountInto(fit, ITEMS[P.idx]);
      P.root = fit.querySelector(':scope > .ux');
      P.hp = []; P.ht = null; P.muted = [];
      hoverShim(fit);
      (P.kind === 'tile' ? fitTile : fitSlide)(P.stage, fit);
      mute(P);
      P.dirty = false;
      fit.style.opacity = '';
      later(P, gen, reduce.matches ? 0 : 380, done);
    };
    if (reduce.matches) { swap(); return; }
    fit.style.transition = 'opacity .28s ease';
    fit.style.opacity = '0';
    later(P, gen, 300, swap);
  }

  // 대상 찾기: 선택자와 순번. 화면에 그려지지 않은 대상은 건너뜁니다
  function target(P, sel, n) {
    if (!P.root) return null;
    if (sel === ':root') return P.root;
    var list;
    try { list = P.root.querySelectorAll(sel); } catch (e) { return null; }
    // 순번이 음수면 뒤에서부터 셉니다(-1은 마지막)
    var el = list[n < 0 ? list.length + n : n || 0];
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return r.width || r.height ? el : null;
  }
  function pointIn(el, fx, fy) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width * (fx == null ? 0.5 : fx), y: r.top + r.height * (fy == null ? 0.5 : fy) };
  }
  function fire(P, el, type, x, y, bubbles, extra) {
    var init = { bubbles: bubbles !== false, cancelable: true, composed: true, view: window, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: P.down ? 1 : 0, detail: 1 };
    if (extra) for (var k in extra) init[k] = extra[k];
    P.actT = performance.now();
    var ev;
    if (type.indexOf('pointer') === 0) {
      init.pointerId = PID; init.pointerType = P.pt || 'mouse'; init.isPrimary = true; init.width = 1; init.height = 1;
      init.pressure = init.buttons ? 0.5 : 0;
      if (type === 'pointermove' && !extra) init.button = -1;
      ev = new PointerEvent(type, init);
    } else ev = new MouseEvent(type, init);
    try { if (type === 'click') holdScroll(function () { el.dispatchEvent(ev); }); else el.dispatchEvent(ev); } catch (e) { /* 요소 처리기 오류는 요소 쪽에서 보고됩니다 */ }
  }
  // 시연 클릭이 라벨에 닿으면 브라우저가 연결된 입력칸으로 초점을 옮깁니다(위의 focus() 막기를 거치지 않는 내장 동작).
  // 이때 반쯤 가려진 타일을 보이려고 페이지(또는 릴)가 위아래로 튀므로, 클릭을 보낸 자리에서 화면이 그려지기 전에 스크롤을 되돌립니다.
  // 사용자가 타일 밖(검색창 등)에 두었던 초점을 빼앗았다면 그것도 돌려줍니다
  function holdScroll(fn) {
    var wx = window.scrollX, wy = window.scrollY, rl = body.dataset.view === 'reel' ? reel : null, rt = rl ? rl.scrollTop : 0;
    var ae = document.activeElement;
    try { fn(); } finally {
      if (window.scrollX !== wx || window.scrollY !== wy) window.scrollTo(wx, wy);
      if (rl && rl.scrollTop !== rt) rl.scrollTop = rt;
      if (ae && ae !== body && ae !== document.activeElement && ae.isConnected && !ae.closest('.g-fit')) nativeFocus.call(ae, { preventScroll: true });
    }
  }
  // 실제 포인터처럼 들어가고 나오는 순서대로 enter/leave, over/out을 보냅니다
  // 맥 커서처럼 요소의 cursor 값에 따라 화살표·손가락·I자로 바꿉니다
  var TEXTY = /^(text|search|email|password|url|tel|number)$/;
  function curOf(el) {
    if (!el || el.nodeType !== 1) return 'arrow';
    var c = getComputedStyle(el).cursor;
    if (c === 'pointer') return 'hand';
    if (c === 'text' || c === 'vertical-text') return 'text';
    if (c !== 'auto') return 'arrow';
    if (el.isContentEditable || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTY.test(el.type))) return 'text';
    return el.closest('a[href]') ? 'hand' : 'arrow';
  }
  function setCur(P, kind) { if (P.ghost && P.ghost.getAttribute('data-cur') !== kind) P.ghost.setAttribute('data-cur', kind); }
  function hoverTo(P, el, x, y) {
    var np = [];
    for (var e = el; e && e !== P.fit; e = e.parentElement) np.push(e);
    var op = P.hp || [];
    if (P.ht && P.ht !== el && P.ht.isConnected) fire(P, P.ht, 'pointerout', x, y, true);
    op.forEach(function (o) { if (np.indexOf(o) < 0) { o.classList.remove('g-hov', 'g-act'); if (o.isConnected) fire(P, o, 'pointerleave', x, y, false); } });
    np.forEach(function (o) { o.classList.add('g-hov'); });
    if (el && P.ht !== el) fire(P, el, 'pointerover', x, y, true);
    np.slice().reverse().forEach(function (o) { if (op.indexOf(o) < 0) fire(P, o, 'pointerenter', x, y, false); });
    if (el) fire(P, el, 'pointermove', x, y, true);
    P.hp = np; P.ht = el;
    setCur(P, curOf(el));
  }
  // 시연 포인터: 화면 좌표를 타일(또는 릴스 화면) 안 좌표로 바꿔 그립니다
  function ghost(P, mode, x, y, ms) {
    var g = P.ghost;
    if (!g) return;
    clearTimeout(P.restT);
    if (mode === 'off') { g.classList.remove('is-on', 'is-down'); P.gpos = false; return; }
    // 누른 뒤에는 결과가 가려지지 않게 포인터가 그 자리에서 사라집니다. 다음 동작은 그 자리에서 다시 나타납니다
    if (mode === 'rest') { P.restT = setTimeout(function () { g.classList.remove('is-on', 'is-down'); }, 420); return; }
    if (x != null) {
      P.gpos = true;
      var hr = P.host.getBoundingClientRect();
      g.style.transitionDuration = (reduce.matches ? 0 : (ms == null ? 420 : ms)) + 'ms, 300ms, 160ms';
      g.style.setProperty('--gx', (x - hr.left).toFixed(1) + 'px');
      g.style.setProperty('--gy', (y - hr.top).toFixed(1) + 'px');
    }
    if (mode === 'on') g.classList.add('is-on');
    if (mode === 'down') { g.classList.add('is-on', 'is-down'); g.classList.remove('is-tap'); void g.offsetWidth; g.classList.add('is-tap'); }
    if (mode === 'up') g.classList.remove('is-down');
  }
  function glideTo(P, gen, p, ms, then) {
    setCur(P, 'arrow');
    if (!P.gpos) { var hr = P.host.getBoundingClientRect(); ghost(P, null, hr.left + hr.width * 0.78, hr.top + hr.height * 1.05, 0); }
    // 위치를 먼저 잡은 뒤 다음 프레임에 미끄러지게 합니다
    requestAnimationFrame(function () {
      if (P.gen !== gen) return;
      ghost(P, 'on', p.x, p.y, ms);
      later(P, gen, reduce.matches ? 30 : ms, then);
    });
  }
  function txt(v) { return v && typeof v === 'object' ? (v[lang] || v.ko || '') : String(v == null ? '' : v); }
  function setValue(el, v, type, data) {
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    var ev;
    try { ev = new InputEvent('input', { bubbles: true, inputType: type, data: data == null ? null : data }); } catch (e) { ev = new Event('input', { bubbles: true }); }
    el.dispatchEvent(ev);
  }

  // 단계 하나를 실행하고, 끝나면 다음 단계로 넘어갑니다
  function runStep(P, gen) {
    if (P.gen !== gen || !P.on) return;
    if (!P.fit.isConnected) { stopPlayer(P); return; }
    if (P.i >= P.steps.length) {
      P.i = 0;
      later(P, gen, 900, function () { runStep(P, gen); });
      return;
    }
    var st = P.steps[P.i++];
    var op = st[0];
    var next = function (ms) { later(P, gen, ms || 0, function () { runStep(P, gen); }); };
    P.dirty = true;
    if (P.log) P.log.push(op + ' ' + (st[1] || ''));
    if (op === 'wait') { next(st[1]); return; }
    if (op === 'reset') { hoverTo(P, null, 0, 0); ghost(P, 'off'); softReset(P, gen, function () { next(0); }); return; }
    if (op === 'leave') { hoverTo(P, null, 0, 0); ghost(P, 'off'); next(st[1] || 200); return; }
    if (op === 'js') {
      try { new Function('root', st[1])(P.root); } catch (e) { if (P.miss) P.miss.push('js ' + e.message); }
      next(st[2] || 0); return;
    }
    var el = target(P, st[1], st[2]);
    if (!el) { if (P.miss) P.miss.push(op + ' ' + st[1] + ' #' + (st[2] || 0)); next(60); return; }
    var o = (op === 'tap' || op === 'hold' || op === 'hover') ? (st[op === 'hold' ? 4 : 3] || {}) : {};
    P.pt = o.pt || 'mouse';

    if (op === 'tap' || op === 'hold' || op === 'hover') {
      var p = pointIn(el, o.fx, o.fy);
      glideTo(P, gen, p, o.glide == null ? 440 : o.glide, function () {
        if (!el.isConnected) { next(60); return; }
        p = pointIn(el, o.fx, o.fy);
        hoverTo(P, el, p.x, p.y);
        if (op === 'hover') { next(o.after == null ? 300 : o.after); return; }
        ghost(P, 'down', p.x, p.y, 0);
        P.down = { el: el, x: p.x, y: p.y };
        el._demoCap = true;
        P.hp.forEach(function (o) { o.classList.add('g-act'); });
        // {button:2}는 오른쪽 버튼: click 대신 contextmenu를 보냅니다
        var btn = o.button === 2 ? 2 : 0;
        fire(P, el, 'pointerdown', p.x, p.y, true, { button: btn, buttons: btn ? 2 : 1 });
        fire(P, el, 'mousedown', p.x, p.y, true, { button: btn, buttons: btn ? 2 : 1 });
        later(P, gen, op === 'hold' ? st[3] : 110, function () {
          P.down = null; el._demoCap = false;
          P.hp.forEach(function (o2) { o2.classList.remove('g-act'); });
          fire(P, el, 'pointerup', p.x, p.y, true, { button: btn, buttons: 0 });
          fire(P, el, 'mouseup', p.x, p.y, true, { button: btn, buttons: 0 });
          if (btn === 2) fire(P, el, 'contextmenu', p.x, p.y, true, { button: 2, buttons: 0 });
          else if (op === 'tap' || o.click) fire(P, el, 'click', p.x, p.y, true, { button: 0, buttons: 0 });
          ghost(P, 'up');
          ghost(P, 'rest');
          next(o.after == null ? 160 : o.after);
        });
      });
      return;
    }
    if (op === 'glide' || op === 'drag') {
      // [동작, 선택자, 순번, [x0,y0], [x1,y1], 시간(ms), {pt, frame, click}] : 좌표는 대상(또는 frame) 상자 안의 비율입니다
      var a = st[3] || [0.5, 0.5], b = st[4] || [0.5, 0.5], dur = st[5] || 900, oo = st[6] || {};
      P.pt = oo.pt || 'mouse';
      var fr = (oo.frame && target(P, oo.frame, 0)) || el;
      var p0 = pointIn(fr, a[0], a[1]);
      glideTo(P, gen, p0, 440, function () {
        if (!el.isConnected) { next(60); return; }
        var r = fr.getBoundingClientRect();
        var at = function (k) { return { x: r.left + r.width * (a[0] + (b[0] - a[0]) * k), y: r.top + r.height * (a[1] + (b[1] - a[1]) * k) }; };
        var s0 = at(0);
        hoverTo(P, el, s0.x, s0.y);
        if (op === 'drag') {
          ghost(P, 'down', s0.x, s0.y, 0);
          P.down = { el: el, x: s0.x, y: s0.y };
          el._demoCap = true;
          fire(P, el, 'pointerdown', s0.x, s0.y, true, { button: 0, buttons: 1 });
        }
        var t0 = performance.now();
        var tick = function (now) {
          if (P.gen !== gen || !P.on) return;
          var k = Math.min(1, (now - t0) / (reduce.matches ? 1 : dur));
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          var q = at(e);
          ghost(P, null, q.x, q.y, 0);
          if (P.down) { P.down.x = q.x; P.down.y = q.y; }
          fire(P, el, 'pointermove', q.x, q.y, true, { button: -1, buttons: op === 'drag' ? 1 : 0 });
          if (k < 1) { P.raf = requestAnimationFrame(tick); return; }
          if (op === 'drag') {
            P.down = null; el._demoCap = false;
            fire(P, el, 'pointerup', q.x, q.y, true, { button: 0, buttons: 0 });
            ghost(P, 'up');
            ghost(P, 'rest');
            if (oo.click) fire(P, el, 'click', q.x, q.y, true, { button: 0, buttons: 0 });
          }
          next(oo.after == null ? 200 : oo.after);
        };
        P.raf = requestAnimationFrame(tick);
      });
      return;
    }
    if (op === 'key') {
      // [key, 선택자, 순번, 키, 횟수, 간격, {shift,ctrl,meta}]
      var times = st[4] || 1, gap = st[5] || 260, mods = st[6] || {}, n = 0;
      var press = function () {
        var init = { key: st[3], code: st[3].length === 1 ? 'Key' + st[3].toUpperCase() : st[3], bubbles: true, cancelable: true, composed: true,
          shiftKey: !!mods.shift, ctrlKey: !!mods.ctrl, metaKey: !!mods.meta, altKey: !!mods.alt };
        try { el.dispatchEvent(new KeyboardEvent('keydown', init)); el.dispatchEvent(new KeyboardEvent('keyup', init)); } catch (e) { /* 무시 */ }
        n += 1;
        if (n < times) later(P, gen, gap, press); else next(gap);
      };
      press();
      return;
    }
    if (op === 'type') {
      // [type, 선택자, 순번, 글(문자열 또는 {ko,en}), 글자 간격]
      var s = txt(st[3]), per = st[4] || 85, k2 = 0;
      var one = function () {
        if (!el.isConnected) { next(60); return; }
        var ch = s.charAt(k2);
        setValue(el, el.value + ch, 'insertText', ch);
        k2 += 1;
        if (k2 < s.length) later(P, gen, per * (0.7 + Math.random() * 0.6), one); else next(per + 120);
      };
      one();
      return;
    }
    if (op === 'erase') {
      var cnt = st[3] === 'all' || st[3] == null ? el.value.length : st[3], per2 = st[4] || 45, k3 = 0;
      var del = function () {
        if (!el.isConnected || !el.value) { next(120); return; }
        setValue(el, el.value.slice(0, -1), 'deleteContentBackward', null);
        k3 += 1;
        if (k3 < cnt) later(P, gen, per2, del); else next(160);
      };
      del();
      return;
    }
    if (op === 'scroll') {
      // [scroll, 선택자, 순번, 이동량(px, 'end'), 시간] : 손가락으로 쓸어 올리듯 포인터를 움직이며 안쪽을 스크롤합니다
      var from = el.scrollTop, max = el.scrollHeight - el.clientHeight;
      var to = st[3] === 'end' ? max : st[3] === 'top' ? 0 : Math.max(0, Math.min(max, from + st[3]));
      var sd = st[4] || 900, pr = el.getBoundingClientRect(), up = to >= from;
      var g0 = { x: pr.left + pr.width * 0.62, y: pr.top + pr.height * (up ? 0.72 : 0.3) };
      glideTo(P, gen, g0, 420, function () {
        ghost(P, 'down', g0.x, g0.y, 0);
        var s0 = performance.now();
        var tk = function (now) {
          if (P.gen !== gen || !P.on) return;
          var k = Math.min(1, (now - s0) / (reduce.matches ? 1 : sd)), e = 1 - Math.pow(1 - k, 3);
          el.scrollTop = from + (to - from) * e;
          ghost(P, null, g0.x, g0.y + (up ? -1 : 1) * pr.height * 0.4 * e, 0);
          if (k < 1) { P.raf = requestAnimationFrame(tk); return; }
          ghost(P, 'up'); ghost(P, 'rest');
          next(200);
        };
        P.raf = requestAnimationFrame(tk);
      });
      return;
    }
    if (op === 'set') { setValue(el, txt(st[3]), 'insertReplacementText', txt(st[3])); next(st[4] || 120); return; }
    next(0);
  }

  // 사용자가 요소를 직접 만지면 시연을 멈추고, 손을 뗀 뒤 잠시 지나면 처음부터 다시 시연합니다
  function bindTakeover(host) {
    var P = function () { var f = $('.g-fit', host); return f && f._pl; };
    var touch = function (e) {
      if (!e.isTrusted) return;
      var p = P();
      if (!p || !e.target.closest || !e.target.closest('.ux')) return;
      // 시연의 클릭이 라벨을 거쳐 입력칸에 초점을 옮긴 경우는 사용자 조작이 아니므로 초점을 원래 자리로 돌려놓습니다
      // 라디오·체크박스 라벨을 누르면 브라우저가 보내는 input 이벤트도 시연이 만든 것입니다
      if (e.type === 'input' && p.on && performance.now() - (p.actT || 0) < 400) return;
      if (e.type === 'focusin' && p.on && performance.now() - (p.actT || 0) < 400) {
        var back = e.relatedTarget;
        if (back && document.contains(back) && !p.fit.contains(back)) nativeFocus.call(back, { preventScroll: true });
        else if (e.target.blur) e.target.blur();
        return;
      }
      p.lastUser = performance.now();
      if (!p.user) { p.user = true; stopPlayer(p); }
    };
    ['pointerdown', 'keydown', 'input', 'focusin'].forEach(function (type) { host.addEventListener(type, touch, true); });
    host.addEventListener('pointermove', function (e) { var p = P(); if (e.isTrusted && p && p.user) p.lastUser = performance.now(); }, true);
    host.addEventListener('pointerenter', function (e) { var p = P(); if (e.isTrusted && p && e.pointerType === 'mouse') p.mouseIn = true; });
    host.addEventListener('pointerleave', function (e) { var p = P(); if (e.isTrusted && p) { p.mouseIn = false; p.lastUser = Math.max(p.lastUser, performance.now() - 800); } });
  }
  setInterval(function () {
    var now = performance.now();
    players.forEach(function (P) {
      if (!P.user) return;
      var idle = P.kind === 'tile' ? 2600 : 6500;
      if (P.mouseIn || (document.activeElement && P.host.contains(document.activeElement) && document.activeElement !== P.host)) { P.lastUser = Math.max(P.lastUser, now - idle + 1200); return; }
      if (now - P.lastUser > idle) { P.user = false; P.dirty = true; syncPlayer(P); }
    });
  }, 500);
  document.addEventListener('visibilitychange', syncAll);

  // 타일은 60% 이상 보일 때 시연을 시작합니다(긴 타일은 화면 절반 이상)
  var playIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var fit = en.target.firstElementChild, P = fit && fit._pl;
      if (!P) return;
      // 시작은 60% 이상 보일 때, 멈춤은 15% 아래로 가려질 때입니다(가장자리에서 멈췄다 섰다 하지 않게)
      var r = en.intersectionRatio, big = en.intersectionRect.height >= innerHeight * 0.5;
      P.vis = en.isIntersecting && (P.on ? (r >= 0.15 || big) : (r >= 0.6 || big));
      syncPlayer(P);
      // 거의 다 가려졌으면 그 자리에서 되돌려 둡니다. 다시 보일 때 깜빡이지 않습니다
      if (!P.vis && P.dirty && !P.on && r < 0.15) quietReset(P);
    });
  }, { threshold: [0, 0.15, 0.3, 0.6, 0.9] });

  function setAuto(v) {
    autoOn = !!v;
    store.set(AUTO_KEY, autoOn ? 'on' : 'off');
    syncAutoBtn();
    syncAll();
  }
  function syncAutoBtn() {
    $$('[data-auto]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(autoOn));
      b.setAttribute('aria-label', autoOn ? t('autoOn') : t('autoOff'));
      b.title = t('autoText');
      b.classList.toggle('is-on', autoOn);
    });
  }
  $$('[data-auto]').forEach(function (b) { b.addEventListener('click', function () { setAuto(!autoOn); }); });

  /* ---------- 분류·검색 상태 ---------- */
  // 컬렉션: 'all'(새 애니메이션 200개를 먼저, 이어서 인터페이스 200개), '2'(애니메이션), '1'(인터페이스)
  var SET_KEY = 'ux-gallery-set';
  // 컬렉션(애니메이션·인터페이스) 구분은 없앴습니다. 둘러보기는 '전체'와 '저장됨'만 있습니다
  var activeSet = 'all';
  // 저장: 로그인 없이 이 브라우저에 요소 번호를 모아 둡니다. 'saved'는 저장한 요소만 보는 컬렉션입니다
  var SAVED_KEY = 'ux-gallery-saved';
  var saved = (function () {
    try { var a = JSON.parse(store.get(SAVED_KEY) || '[]'); return new Set(Array.isArray(a) ? a.filter(function (id) { return typeof id === 'string'; }) : []); } catch (e) { return new Set(); }
  })();
  function persistSaved() { store.set(SAVED_KEY, JSON.stringify(Array.from(saved))); }
  var inSet = function (it) { return activeSet === 'all' || (activeSet === 'saved' ? saved.has(it.id) : String(it.set || 1) === activeSet); };
  // 전체 순서: 웹사이트에서 많이 쓰는 요소부터(빌드가 popular.json으로 정한 pop). 없으면 예전처럼 새 컬렉션 먼저, 정해 둔 순서(rank), 번호 순입니다
  var rankOf = function (i) { return ITEMS[i].rank == null ? 1e9 : ITEMS[i].rank; };
  var popOf = function (i) { return ITEMS[i].pop == null ? 1e9 : ITEMS[i].pop; };
  var ORDER = ITEMS.map(function (_, i) { return i; }).sort(function (a, b) { return (popOf(a) - popOf(b)) || ((ITEMS[b].set || 1) - (ITEMS[a].set || 1)) || (rankOf(a) - rankOf(b)) || (a - b); });
  // 분류 알약도 흔한 분류가 앞에 옵니다(빌드가 popular.json의 categories로 정한 차례 ci)
  var CATS = [];
  ITEMS.forEach(function (it) { if (CATS.indexOf(it.category) < 0) CATS.push(it.category); });
  var ciOf = function (c) { var it = ITEMS.find(function (x) { return x.category === c; }); return it && it.ci != null && it.ci >= 0 ? it.ci : 99; };
  CATS.sort(function (a, b) { return ciOf(a) - ciOf(b); });
  var activeCat = '전체';
  var query = '';
  // 한국어·영어 어느 쪽으로 찾아도 걸리도록 두 언어를 함께 넣어 둡니다
  var HAY = ITEMS.map(function (it) {
    var en = it.en || {};
    return [it.id, it.title, it.summary, it.category, CAT_EN[it.category] || '', it.tags.join(' '), en.title || '', en.summary || '', it.set === 3 ? 'new 신규 새로운 필수 essential' : ''].join(' ').toLowerCase();
  });
  var visible = [];
  function computeVisible() {
    var words = query.split(/\s+/).filter(Boolean);
    visible = [];
    ORDER.forEach(function (i) {
      var it = ITEMS[i];
      var okC = activeCat === '전체' || it.category === activeCat;
      if (okC && inSet(it) && words.every(function (w) { return HAY[i].indexOf(w) >= 0; })) visible.push(i);
    });
  }

  /* ---------- 타일 그리드: 3열(모바일 2열), 다섯 칸마다 긴 타일 하나 ---------- */
  var grid = $('#grid');
  var more = $('#more');
  // 본문 폭에 맞춰 1~4열로 놓습니다(카드 최소 폭 340px)
  function colsOf() { var w = grid.clientWidth || innerWidth - 300; return Math.max(1, Math.min(4, Math.floor((w + 12) / 352))); }
  var cols = colsOf();
  function applyCols() { grid.style.setProperty('--cols', cols); grid.setAttribute('data-cols', String(cols)); }
  applyCols();
  // 요소마다 한 번씩만 놓습니다. 끝까지 내려가도 앞에서 본 요소를 다시 이어 붙이지 않습니다
  var stream, buffer, groupN, placed, done;
  function resetStream() { stream = { pos: 0 }; buffer = []; groupN = 0; placed = 0; done = false; }
  function nextIdx() { return stream.pos < visible.length ? visible[stream.pos++] : -1; }
  function fillBuffer(n) {
    while (buffer.length < n) {
      var i = nextIdx();
      if (i < 0) break;
      buffer.push({ i: i });
    }
  }
  // 목록 순서 그대로 한 묶음(두 줄 분량)씩 놓습니다. 긴 요소는 놓이는 자리에서 두 줄을 차지하고,
  // 그리드가 빈칸 없이 순서대로 채우므로 화면의 읽는 순서가 번호 순서와 같습니다
  function nextGroup() {
    fillBuffer(cols * 2);
    if (!buffer.length) return null;
    var out = [], cells = 0;
    while (buffer.length && cells < cols * 2) {
      var e = buffer.shift(), tall = ITEMS[e.i].shape === 'tall';
      out.push({ e: e, tall: tall }); cells += tall ? 2 : 1;
    }
    groupN += 1;
    return out;
  }
  function tileText(el, it) {
    var c = loc(it), L = T[lang];
    $('.g-cap-t span', el).textContent = c.title;
    $('.g-cap-t', el).setAttribute('aria-label', it.id + ' ' + L.aPrompt(c.title));
    $('.g-cap-s', el).textContent = c.category + ' · ' + it.id;
    $('.g-exp', el).setAttribute('aria-label', L.open(c.title));
    $('.g-save', el).setAttribute('aria-label', L.aSave(c.title));
    $$('.g-cb', el).forEach(function (b) {
      var k = b.dataset.act;
      b.setAttribute('aria-label', k === 'claude' ? L.aClaude(c.title) : k === 'codex' ? L.aCodex(c.title) : L.aCode(c.title));
      $('span', b).textContent = b.classList.contains('is-copied') ? L.cbCopied : cbLabel(k);
    });
    syncCardTheme(el);
  }
  function cbLabel(k) { return k === 'claude' ? 'Claude' : k === 'codex' ? 'Codex' : t('cbCode'); }
  // 카드 무대의 실제 테마(카드별 설정이 없으면 전체 테마)
  function stageTheme(tl) { return tl.getAttribute('data-stage') || (isDark() ? 'dark' : 'light'); }
  function syncCardTheme(tl) {
    var b = $('.g-tt', tl);
    if (b) b.setAttribute('aria-label', stageTheme(tl) === 'dark' ? t('cardToLight') : t('cardToDark'));
  }
  function makeTile(slot, delay) {
    var it = ITEMS[slot.e.i];
    var el = document.createElement('article');
    el.className = 'g-tile is-new' + (slot.tall ? ' is-tall' : '');
    el.dataset.idx = String(slot.e.i);
    el.style.setProperty('--h', it.hue);
    el.style.setProperty('--h2', it.hue2);
    el.style.setProperty('--d', delay + 'ms');
    el.id = 'tile-' + it.id;
    // 무대(.g-stage)는 카드 바로 아래 자식으로 둡니다. 마운트·지연 로딩이 stage.parentNode.dataset.idx로 요소를 찾습니다
    var on = saved.has(it.id);
    el.innerHTML =
      '<div class="g-stage"><div class="g-fit' + (it.fluid ? ' is-fluid' : '') + '"></div></div>' +
      '<div class="g-tile-top">' + (it.set === 3 ? '<em class="g-new" aria-hidden="true">NEW</em>' : '') +
        '<span class="g-tile-tools"><button class="g-ic g-exp" type="button" data-open="' + slot.e.i + '">' + ICON.open + '</button>' +
        '<button class="g-ic g-tt" type="button" data-act="theme">' + ICON.sun + ICON.moon + '</button></span></div>' +
      '<div class="g-info"><div class="g-cap"><button class="g-cap-t" type="button" data-act="prompt"><span></span></button><p class="g-cap-s"></p></div>' +
        '<button class="g-ic g-save" type="button" data-act="save" aria-pressed="' + on + '">' + ICON.mark + '</button></div>' +
      '<div class="g-acts">' +
        '<button class="g-cb" type="button" data-act="claude">' + ICON.claude + ICON.ok + '<span></span></button>' +
        '<button class="g-cb" type="button" data-act="codex">' + ICON.codex + ICON.ok + '<span></span></button>' +
        '<button class="g-cb" type="button" data-act="code">' + ICON.codeTag + ICON.ok + '<span></span></button></div>';
    tileText(el, it);
    bindTakeover(el);
    el.addEventListener('animationend', function () { el.classList.remove('is-new'); }, { once: true });
    return el;
  }
  function mountTile(stage) {
    var fit = stage.firstElementChild, idx = +stage.parentNode.dataset.idx;
    mountInto(fit, ITEMS[idx]);
    fitTile(stage, fit);
    attachPlayer(fit, idx, 'tile');
  }
  // 화면 2배(모바일 1.5배) 앞에서 미리 붙여 두고, 3.5배(모바일 3배) 넘게 멀어져야 뗍니다(빠르게 스크롤하거나 되돌아가도 비어 보이지 않게).
  // 붙일 때는 화면에 가까운 타일부터 한 프레임에 8ms 안에서만 붙여 스크롤이 끊기지 않게 합니다
  var mountQ = [], qRaf = 0;
  function distOf(st) { var r = st.getBoundingClientRect(); return r.bottom < 0 ? -r.bottom : r.top > innerHeight ? r.top - innerHeight : 0; }
  function queueMount(st) {
    if (mountQ.indexOf(st) < 0) mountQ.push(st);
    if (!qRaf) qRaf = requestAnimationFrame(drainMount);
  }
  function drainMount() {
    qRaf = 0;
    if (body.dataset.view !== 'grid') { mountQ = []; return; }
    mountQ.sort(function (a, b) { return distOf(a) - distOf(b); });
    var t0 = performance.now(), n = 0;
    while (mountQ.length && (n === 0 || performance.now() - t0 < 8)) {
      var st = mountQ.shift();
      if (st.isConnected && st._near && !st.firstElementChild.firstChild) { mountTile(st); n += 1; }
    }
    if (mountQ.length) qRaf = requestAnimationFrame(drainMount);
  }
  // 감시는 카드(.g-tile) 자체에 겁니다. 카드에 content-visibility:auto가 걸려 있어, 안쪽 무대를 감시하면 사파리는 화면 밖 카드를
  // 아예 안 보이는 것으로 보고 화면 가장자리에서 붙였다 뗐다를 되풀이합니다(스크롤이 초당 4~7프레임까지 떨어짐)
  var tileIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var st = en.target._st;
      st._near = en.isIntersecting;
      if (en.isIntersecting && !st.firstElementChild.firstChild) queueMount(st);
    });
  }, { rootMargin: mobileQ.matches ? '150% 0px' : '200% 0px' });
  var keepIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var fit = en.target._st.firstElementChild;
      if (!en.isIntersecting && fit.firstChild) unmount(fit);
    });
  }, { rootMargin: mobileQ.matches ? '300% 0px' : '350% 0px' });
  function watchStage(st) { var tl = st.parentNode; tl._st = st; tileIO.observe(tl); keepIO.observe(tl); }
  function unwatchAll() { tileIO.disconnect(); keepIO.disconnect(); mountQ = []; }
  var tileRO = new ResizeObserver(function (entries) {
    entries.forEach(function (en) {
      var fit = en.target.firstElementChild;
      if (fit.firstChild) fitTile(en.target, fit);
    });
  });
  function appendGroups(n) {
    var frag = document.createDocumentFragment();
    var d = 0;
    for (var g = 0; g < n && !done; g++) {
      var grp = nextGroup();
      if (!grp) { done = true; break; }
      grp.forEach(function (slot) {
        var tl = makeTile(slot, Math.min(d, 420));
        d += 45;
        frag.appendChild(tl);
        placed += 1;
      });
    }
    var fresh = $$('.g-tile', frag);
    $$('.g-stage', frag).forEach(function (st) { watchStage(st); tileRO.observe(st); });
    grid.appendChild(frag);
    // 화면 아래에서 미리 붙는 타일은 등장 효과 없이 처음부터 또렷하게 둡니다(스크롤하자마자 보이게)
    fresh.forEach(function (tl) {
      if (tl.getBoundingClientRect().top > innerHeight) tl.classList.remove('is-new');
    });
  }
  function fillIfNeeded() {
    if (body.dataset.view !== 'grid') return;
    var guard = 0;
    while (!done && guard++ < 6 && more.getBoundingClientRect().top < innerHeight + 1400) appendGroups(2);
  }
  new IntersectionObserver(function (en) {
    if (en.some(function (e) { return e.isIntersecting; })) fillIfNeeded();
  }, { rootMargin: '1400px 0px' }).observe(more);

  function rebuildGrid() {
    computeVisible();
    resetStream();
    $$('.g-fit', grid).forEach(function (f) { dropPlayer(f); });
    unwatchAll();
    tileRO.disconnect();
    grid.innerHTML = '';
    $('#count').textContent = visible.length;
    $('#empty').hidden = visible.length !== 0;
    syncEmpty();
    if (typeof syncSearchUi === 'function') syncSearchUi();
    reelDirty = true;
    if (visible.length) appendGroups(3);
    fillIfNeeded();
  }
  function syncEmpty() {
    var sv = activeSet === 'saved' && !saved.size;
    $('#empty-t').textContent = t(sv ? 'savedEmptyT' : 'emptyT');
    $('#empty-s').textContent = t(sv ? 'savedEmptyS' : 'emptyS');
    $('#empty-reset').textContent = t(sv ? 'savedEmptyB' : 'emptyB');
  }
  // 본문 폭이 바뀌어 열 수가 달라지면 다시 놓습니다
  var colsT = 0;
  new ResizeObserver(function () {
    clearTimeout(colsT);
    colsT = setTimeout(function () { var n = colsOf(); if (n !== cols) { cols = n; applyCols(); rebuildGrid(); } }, 120);
  }).observe(grid);

  grid.addEventListener('click', function (e) {
    // 요소도 data-open, data-act를 쓸 수 있으므로 요소 바깥의 갤러리 버튼만 봅니다
    var b = e.target.closest('.g-exp, [data-act]');
    if (!b || b.closest('.ux')) return;
    var tl = b.closest('.g-tile');
    if (!tl) return;
    var i = +tl.dataset.idx;
    if (b.classList.contains('g-exp')) { openReel(i, tl); return; }
    var act = b.dataset.act;
    if (act === 'prompt') openPrompt(i);
    else if (act === 'save') toggleSave(ITEMS[i], b);
    else if (act === 'theme') toggleCardTheme(tl);
    else if (act === 'claude' || act === 'codex' || act === 'code') cardCopy(i, act, b);
  });
  // 카드만 반대 테마로 봅니다. 전체 테마와 같아지면 카드 설정을 풉니다
  function toggleCardTheme(tl) {
    var next = stageTheme(tl) === 'dark' ? 'light' : 'dark', st = $('.g-stage', tl);
    if (next === (isDark() ? 'dark' : 'light')) { tl.removeAttribute('data-stage'); st.removeAttribute('data-theme'); }
    else { tl.setAttribute('data-stage', next); st.setAttribute('data-theme', next); }
    syncCardTheme(tl);
  }
  function toggleSave(it, b) {
    var on = !saved.has(it.id);
    if (on) saved.add(it.id); else saved.delete(it.id);
    persistSaved();
    $$('.g-save', grid).forEach(function (x) { if (+x.closest('.g-tile').dataset.idx === ITEMS.indexOf(it)) x.setAttribute('aria-pressed', String(on)); });
    b.classList.remove('is-pop'); void b.offsetWidth; if (on) b.classList.add('is-pop');
    syncSets();
    toast(t(on ? 'tSaveOn' : 'tSaveOff'));
    if (activeSet === 'saved' && !on) { renderCats(); rebuildGrid(); }
  }
  // Claude·Codex: 코드 전체가 든 프롬프트 + 스킬로 부르는 법 한 줄. 코드: 요소 코드만
  function cardText(it, kind) {
    if (kind === 'code') return codeOf(it);
    return promptOf(it) + '\n' + T[lang][kind === 'claude' ? 'refClaude' : 'refCodex'](it.id) + '\n';
  }
  function copiedState(b) {
    var sp = $('span', b);
    b.classList.add('is-copied');
    sp.textContent = t('cbCopied');
    clearTimeout(b._ct);
    b._ct = setTimeout(function () { b.classList.remove('is-copied'); sp.textContent = cbLabel(b.dataset.act); }, 1800);
  }
  function cardCopy(i, kind, b) {
    var it = ITEMS[i];
    var settled = false;
    var done = function (ok) {
      if (settled) return;
      settled = true;
      clearTimeout(b._bt);
      b.classList.remove('is-busy');
      if (ok) { copiedState(b); toast(kind === 'code' ? t('tCodeCopied') : t(kind === 'claude' ? 'tClaude' : 'tCodex')); return; }
      // 복사할 수 없는 환경이면 같은 글을 창에 띄워 직접 복사하게 합니다
      openPrompt(i);
      if (kind === 'code' && typeof ITEMS[i].html === 'string') setTab('code');
      toast(t('tCopyIn'));
    };
    if (typeof it.html === 'string') { copyText(cardText(it, kind)).then(done); return; }
    // 사이트판은 요소 코드를 나중에 받습니다. 받아 온 뒤 복사하되, 누른 동작 안에서 복사가 시작되게 합니다(Safari)
    if (typeof ensureItem !== 'function') { done(false); return; }
    b.classList.add('is-busy');
    var text = ensureItem(it, true).then(function () { return cardText(it, kind); });
    var tried = false;
    var later = function () {
      if (tried || settled) return;
      tried = true;
      text.then(copyText).then(done, function () { done(false); });
    };
    // 브라우저가 쓰기를 끝내지 않고 붙잡아 두면(사용자 동작이 아닌 클릭 등) 5초 뒤 다른 방법으로 넘어갑니다
    clearTimeout(b._bt);
    b._bt = setTimeout(function () { if (!settled) { later(); setTimeout(function () { done(false); }, 2500); } }, 5000);
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write && window.isSecureContext) {
      try {
        navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then(function (s) { return new Blob([s], { type: 'text/plain' }); }) })])
          .then(function () { done(true); }, later);
        return;
      } catch (e) { /* 아래 방법으로 이어 갑니다 */ }
    }
    later();
  }

  /* ---------- 분류 칩: 고른 칩 뒤로 알약이 미끄러집니다 ---------- */
  var cats = $('#cats');
  var pill = $('.g-cats-pill', cats);
  function renderCats() {
    $$('.g-cat', cats).forEach(function (b) { b.remove(); });
    var pool = ITEMS.filter(inSet);
    var list = CATS.filter(function (c) { return pool.some(function (it) { return it.category === c; }); });
    if (activeCat !== '전체' && list.indexOf(activeCat) < 0) activeCat = '전체';
    requestAnimationFrame(function () { cats.scrollLeft = 0; syncCatsNav(); });
    cats.insertAdjacentHTML('beforeend', ['전체'].concat(list).map(function (c) {
      var n = c === '전체' ? pool.length : pool.filter(function (it) { return it.category === c; }).length;
      return '<button class="g-cat" type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === activeCat) + '">' + esc(catLabel(c)) + '<i>' + n + '</i></button>';
    }).join(''));
  }
  function movePill(animate) {
    var b = $('.g-cat[aria-pressed="true"]', cats);
    if (!b || !pill) return;
    if (!animate) cats.classList.add('no-anim');
    pill.style.setProperty('--x', b.offsetLeft + 'px');
    pill.style.setProperty('--w', b.offsetWidth + 'px');
    if (!animate) requestAnimationFrame(function () { cats.classList.remove('no-anim'); });
  }
  cats.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (!b || b.dataset.cat === activeCat) return;
    activeCat = b.dataset.cat;
    $$('.g-cat', cats).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    movePill(true);
    b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce.matches ? 'auto' : 'smooth' });
    rebuildGrid();
    scrollToGridTop();
  });
  /* ---------- 컬렉션 스위치: 전체 · 애니메이션(새로 추가) · 인터페이스 ---------- */
  var sets = $('#sets');
  var setPill = $('.g-sets-pill', sets);
  function moveSetPill(animate) {
    var b = $('.g-set[aria-pressed="true"]', sets);
    if (!b || !setPill) return;
    if (!animate) sets.classList.add('no-anim');
    setPill.style.setProperty('--x', b.offsetLeft + 'px');
    setPill.style.setProperty('--w', b.offsetWidth + 'px');
    if (!animate) requestAnimationFrame(function () { sets.classList.remove('no-anim'); });
  }
  function syncSets() {
    $$('.g-set', sets).forEach(function (b) {
      var v = b.dataset.set;
      b.setAttribute('aria-pressed', String(v === activeSet));
      $('i', b).textContent = v === 'all' ? ITEMS.length : v === 'saved' ? saved.size : ITEMS.filter(function (it) { return String(it.set || 1) === v; }).length;
    });
  }
  function setSet(v, animate) {
    if (v === activeSet) return;
    activeSet = v;
    store.set(SET_KEY, v === 'saved' ? 'all' : v);
    activeCat = '전체';
    syncSets();
    moveSetPill(animate !== false);
    renderCats();
    movePill(false);
    rebuildGrid();
    scrollToGridTop();
  }
  sets.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set]');
    if (!b) return;
    setSet(b.dataset.set);
    setSide(false);
  });
  window.addEventListener('resize', function () { moveSetPill(false); });
  function scrollToGridTop() {
    var bar = $('#bar');
    var top = bar.getBoundingClientRect().top + scrollY - (narrowQ.matches ? 84 : 16);
    if (scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
  }
  window.addEventListener('resize', function () { movePill(false); });
  // 알약 줄이 넘치면 양 끝에 넘기기 버튼을 보입니다
  var catsNav = $$('.g-cats-nav');
  function syncCatsNav() {
    var max = cats.scrollWidth - cats.clientWidth;
    catsNav[0].hidden = cats.scrollLeft <= 4;
    catsNav[1].hidden = max <= 4 || cats.scrollLeft >= max - 4;
  }
  cats.addEventListener('scroll', syncCatsNav, { passive: true });
  window.addEventListener('resize', syncCatsNav);
  catsNav.forEach(function (b) {
    b.addEventListener('click', function () { cats.scrollBy({ left: +b.dataset.dir * cats.clientWidth * 0.7, behavior: reduce.matches ? 'auto' : 'smooth' }); });
  });

  /* ---------- 검색: 아래 가운데 떠 있는 입력창. 비어 있으면 예시 검색어가 쳐졌다 지워집니다 ---------- */
  var search = $('#search');
  var q = $('#q');
  var qGo = $('#q-go');
  var qN = $('#q-n');
  function syncSearchUi() {
    var has = !!q.value.trim();
    search.classList.toggle('has-q', has);
    qGo.setAttribute('aria-label', has ? t('searchClear') : t('searchGo'));
    qN.textContent = query ? T[lang].qN(visible.length) : '';
  }
  var qT = 0;
  q.addEventListener('input', function () {
    search.classList.toggle('has-q', !!q.value.trim());
    clearTimeout(qT);
    qT = setTimeout(function () {
      query = q.value.trim().toLowerCase();
      rebuildGrid();
      scrollToGridTop();
    }, 120);
  });
  function clearSearch() { clearTimeout(qT); q.value = ''; query = ''; rebuildGrid(); }
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); if (q.value) clearSearch(); else q.blur(); }
    if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      var first = $('.g-tile .g-cap-t', grid);
      if (first) { first.focus({ preventScroll: true }); first.closest('.g-tile').scrollIntoView({ block: 'center', behavior: reduce.matches ? 'auto' : 'smooth' }); }
    }
  });
  qGo.addEventListener('click', function () {
    if (q.value.trim()) { clearSearch(); q.focus(); return; }
    window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
  });
  // 예시 검색어: 한 글자씩 쳤다가 잠시 두고 지운 뒤 다음 낱말로 넘어갑니다(한 바퀴 약 3초)
  var phT = 0, phI = 0;
  function phStop() { clearTimeout(phT); phT = 0; }
  function phRun() {
    phStop();
    if (reduce.matches || q.value || document.activeElement === q || document.hidden || body.dataset.view !== 'grid') { q.placeholder = t('searchPh'); return; }
    var list = T[lang].searchEx, word = list[phI++ % list.length], pre = t('searchTry'), k = 0, dir = 1;
    (function step() {
      q.placeholder = pre + word.slice(0, k);
      if (dir > 0) { if (k < word.length) { k += 1; phT = setTimeout(step, 75); } else { dir = -1; phT = setTimeout(step, 1500); } }
      else if (k > 0) { k -= 1; phT = setTimeout(step, 35); }
      else phT = setTimeout(phRun, 380);
    })();
  }
  q.addEventListener('focus', function () { phStop(); q.placeholder = t('searchPh'); });
  q.addEventListener('blur', function () { phStop(); phT = setTimeout(phRun, 700); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) phStop(); else if (!phT) phRun(); });
  $('#empty-reset').addEventListener('click', function () {
    q.value = ''; query = '';
    if (activeSet !== 'all') { activeSet = 'all'; store.set(SET_KEY, 'all'); syncSets(); moveSetPill(true); }
    activeCat = '전체';
    renderCats();
    rebuildGrid();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && body.dataset.view === 'grid' && !e.target.closest('input, textarea, select, [contenteditable], .ux') && !$('dialog[open]')) {
      e.preventDefault();
      q.focus();
    }
  });

  /* ---------- 좁은 화면: 사이드바를 서랍처럼 엽니다 ---------- */
  var narrowQ = window.matchMedia('(max-width: 960px)');
  var sideBtn = $('#side-open');
  function setSide(open) {
    if (open && !narrowQ.matches) return;
    var was = body.classList.contains('side-open');
    if (was === open) return;
    body.classList.toggle('side-open', open);
    sideBtn.setAttribute('aria-expanded', String(open));
    if (open) { var f = $('.g-set[aria-pressed="true"]', sets) || $('#side-close'); f.focus({ preventScroll: true }); }
    else if ($('#side').contains(document.activeElement)) sideBtn.focus({ preventScroll: true });
  }
  sideBtn.addEventListener('click', function () { setSide(true); });
  $('#side-close').addEventListener('click', function () { setSide(false); });
  $('#scrim').addEventListener('click', function () { setSide(false); });
  // 서랍 안의 링크·버튼(스킬, 적용 방법)을 누르면 서랍을 닫고 진행합니다
  $('.g-head-r').addEventListener('click', function (e) { if (e.target.closest('a, button')) setSide(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('side-open')) { e.preventDefault(); setSide(false); } });
  var onNarrow = function () { if (!narrowQ.matches) setSide(false); };
  if (narrowQ.addEventListener) narrowQ.addEventListener('change', onNarrow); else if (narrowQ.addListener) narrowQ.addListener(onNarrow);

  /* ---------- 도구줄이 위에 붙으면 아랫선을 보입니다 ---------- */
  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  $('#bar').before(sentinel);
  new IntersectionObserver(function (en) { $('#bar').classList.toggle('is-stuck', !en[0].isIntersecting); }).observe(sentinel);

  /* ---------- 프롬프트·코드 생성 ---------- */
  var GUIDE = {
    ko: [
      '아래 UI 요소를 제 프로젝트에 적용해 주세요.',
      '',
      '[먼저 확인할 것]',
      '1. 프로젝트의 프레임워크(React, Next, Vue, Svelte, 순수 HTML 등), 스타일 방식(CSS 모듈, Tailwind, 전역 CSS), 기존 테마 방식(data-theme, dark 클래스, CSS 변수)을 찾아 확인하세요.',
      '2. 삽입 위치의 파일과 기존 요소를 먼저 찾고, 그 요소가 어디서 쓰이는지 보고하세요.',
      '',
      '[적용 방법]',
      '3. 삽입 위치에 새 컴포넌트로 추가하세요. 교체 대상이 있으면 그 요소를 아래 요소로 바꾸세요.',
      '4. 기존 데이터, props, 이벤트 핸들러, 폼 값, 접근성 속성(라벨, aria, 키보드 조작)은 그대로 유지하세요.',
      '5. 아래 코드의 구조, 형태, 모션 값(시간, 곡선, 지연)을 기준으로 옮기세요. 프레임워크에 맞게 컴포넌트와 상태로 바꾸되, 디자인을 새로 추측해 바꾸지 마세요.',
      '6. 색은 아래 --ux-* 토큰을 프로젝트의 기존 테마 변수에 연결하세요. 라이트와 다크 두 값을 모두 유지하고, 두 테마에서 확인하세요.',
      '7. 스타일은 이 요소의 클래스(.uNNN) 안에만 두고, 전역 CSS나 전역 스크립트는 바꾸지 마세요. 클래스 이름이 기존 요소와 겹치지 않게 하세요.',
      '8. 예시 문구와 예시 데이터는 프로젝트의 실제 데이터로 바꾸세요. 갤러리 전용 화면과 시연 코드는 가져오지 마세요. 코드 맨 위의 라이선스 주석 한 줄은 새 컴포넌트 파일 맨 위에 남겨 두세요.',
      '9. prefers-reduced-motion을 켠 상태에서도 기능과 최종 상태가 그대로 작동하는지 확인하세요.',
      '',
      '[완료 보고]',
      '10. 변경한 파일 목록, 기존 요소와 달라진 동작, 확인한 범위(두 테마, 모바일 너비, 키보드), 확인하지 못한 항목을 알려 주세요.',
      '',
      '[삽입 위치] 여기에 페이지나 컴포넌트 이름을 적으세요',
      '[교체 대상] 기존 요소의 파일 경로나 컴포넌트 이름을 적으세요. 없으면 "없음"'
    ].join('\n'),
    en: [
      'Please add the UI element below to my project.',
      '',
      '[Check first]',
      '1. Find out the project’s framework (React, Next, Vue, Svelte, plain HTML, etc.), styling approach (CSS modules, Tailwind, global CSS) and existing theming approach (data-theme, a dark class, CSS variables).',
      '2. Locate the file and any existing element at the insertion point first, and report where that element is used.',
      '',
      '[How to apply]',
      '3. Add it as a new component at the insertion point. If there is a replacement target, replace that element with the one below.',
      '4. Keep existing data, props, event handlers, form values and accessibility attributes (labels, aria, keyboard support) as they are.',
      '5. Port the structure, shapes and motion values (durations, curves, delays) of the code below as they are. Convert it into components and state for the framework, but do not guess a new design.',
      '6. Map the --ux-* color tokens below to the project’s existing theme variables. Keep both the light and dark values and check both themes.',
      '7. Keep styles inside this element’s class (.uNNN) and do not change global CSS or global scripts. Make sure the class names do not clash with existing ones.',
      '8. Replace the sample copy and sample data with the project’s real data. Do not bring over gallery-only screens or demo code. Keep the one-line license comment at the top of the new component file.',
      '9. Check that the feature and its final states still work with prefers-reduced-motion turned on.',
      '',
      '[Report when done]',
      '10. List the files you changed, behavior that differs from the old element, what you checked (both themes, mobile width, keyboard) and anything you could not check.',
      '',
      '[Insertion point] Write the page or component name here',
      '[Replacement target] Write the file path or component name of the existing element, or "none"'
    ].join('\n')
  };
  // 복사·다운로드되는 코드 맨 위에 붙는 출처·라이선스 한 줄
  function licenseOf(it) {
    return '<!-- Lucian UX/UI Prompt #' + it.id + ' · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#' + it.id + ' -->\n';
  }
  function codeOf(it) {
    var c = loc(it);
    return licenseOf(it) + '<style>\n' + tokens() + '\n<\/style>\n\n' + c.html + '\n\n<script>\n' + c.js + '\n<\/script>\n';
  }
  function promptOf(it) {
    var c = loc(it);
    if (lang === 'en') {
      return '[Element] ' + c.title + ' (' + it.id + ', ' + c.category + ')\n' +
        '[What it does] ' + c.summary + '\n' +
        (c.hint ? '[How to use it] ' + c.hint + '\n' : '') + '\n' +
        GUIDE.en + '\n\n' +
        '--- Code start (this whole code is the working original) ---\n' +
        codeOf(it) +
        '--- Code end ---\n';
    }
    return '[요소] ' + c.title + ' (' + it.id + ', ' + c.category + ')\n' +
      '[요소 설명] ' + c.summary + '\n' +
      (c.hint ? '[조작] ' + c.hint + '\n' : '') + '\n' +
      GUIDE.ko + '\n\n' +
      '--- 코드 시작 (이 코드 전체가 실제로 동작하는 원본입니다) ---\n' +
      codeOf(it) +
      '--- 코드 끝 ---\n';
  }
  // 단독 파일: 토큰(라이트·다크), 요소, 테마 전환 버튼을 한 파일에 담습니다
  function standaloneOf(it) {
    var c = loc(it);
    return '<!doctype html>\n' + licenseOf(it) + '<html lang="' + lang + '">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + esc(c.title) + ' · lucianLabs UI</title>\n' +
      '<style>\n' + tokens() + '\n<\/style>\n' +
      '<style>\nbody{margin:0;min-height:100vh;display:grid;place-items:center;padding:48px 24px;background:var(--ux-page);box-sizing:border-box}\n' +
      '.ux-theme-btn{position:fixed;top:16px;right:16px;height:38px;padding:0 16px;border-radius:999px;border:1px solid var(--ux-line-2);background:var(--ux-surface);color:var(--ux-ink);font:600 13px/1 system-ui,sans-serif;cursor:pointer}\n<\/style>\n' +
      '</head>\n<body>\n' + c.html + '\n' +
      '<button class="ux-theme-btn" type="button" id="ux-theme-btn">' + esc(t('themeBtn')) + '</button>\n' +
      '<script>\n' + c.js + '\n<\/script>\n' +
      '<script>\n(function(){var r=document.documentElement,b=document.getElementById("ux-theme-btn"),K="ux-theme";' +
      'try{var s=localStorage.getItem(K);if(s)r.setAttribute("data-theme",s)}catch(e){}' +
      'b.addEventListener("click",function(){var dark=r.getAttribute("data-theme")==="dark"||(!r.hasAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches);' +
      'var next=dark?"light":"dark";r.setAttribute("data-theme",next);try{localStorage.setItem(K,next)}catch(e){}});})();\n<\/script>\n' +
      '</body>\n</html>\n';
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    (document.querySelector('dialog[open]') || body).appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function download(it) {
    var blob = new Blob([standaloneOf(it)], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ux-' + it.id + '-' + it.slug + (lang === 'en' ? '-en' : '') + '.html';
    body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ---------- 알림과 완료 표시 ---------- */
  var toastEl = $('#toast');
  var toastT = 0;
  function toast(msg) {
    toastEl.innerHTML = ICON.check.replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"') + '<span></span>';
    toastEl.lastChild.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2000);
  }
  function markDone(btn) {
    btn.classList.add('is-done');
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.classList.remove('is-done'); }, 1500);
  }

  /* ---------- 프롬프트 시트: 프롬프트와 코드를 탭으로 오갑니다 ---------- */
  var dlgPrompt = $('#dlg-prompt');
  var prText = $('#pr-text');
  var prIdx = 0;
  var prTab = 'prompt';
  var segPill = $('.g-seg-pill', dlgPrompt);
  function setTab(tab) {
    prTab = tab;
    var it = ITEMS[prIdx];
    var b = $('#tab-' + tab);
    $('#tab-prompt').setAttribute('aria-selected', String(tab === 'prompt'));
    $('#tab-code').setAttribute('aria-selected', String(tab === 'code'));
    segPill.style.setProperty('--x', (b.offsetLeft - 4) + 'px');
    segPill.style.setProperty('--w', b.offsetWidth + 'px');
    prText.value = tab === 'prompt' ? promptOf(it) : codeOf(it);
    prText.setAttribute('aria-label', tab === 'prompt' ? t('areaPrompt') : t('areaCode'));
    prText.scrollTop = 0;
    $('#pr-copy span').textContent = tab === 'prompt' ? t('copyPrompt') : t('copyCode');
    var n = prText.value.length.toLocaleString(t('num'));
    $('#pr-hint').textContent = tab === 'prompt' ? T[lang].hintPrompt(n) : T[lang].hintCode(n);
  }
  function openPrompt(i) {
    prIdx = i;
    var c = loc(ITEMS[i]);
    $('#pr-num').textContent = ITEMS[i].id;
    $('#pr-cat').textContent = c.category;
    $('#pr-title').textContent = c.title;
    $('#pr-skill').textContent = T[lang].skillAskId(ITEMS[i].id);
    openDialog(dlgPrompt);
    setTab('prompt');
  }
  $('#tab-prompt').addEventListener('click', function () { setTab('prompt'); });
  $('#tab-code').addEventListener('click', function () { setTab('code'); });
  $('.g-seg', dlgPrompt).addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      var nx = prTab === 'prompt' ? 'code' : 'prompt';
      setTab(nx);
      $('#tab-' + nx).focus();
    }
  });
  $('#pr-copy').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    copyText(prText.value).then(function (ok) {
      if (ok) { markDone(btn); toast(prTab === 'prompt' ? t('tPromptCopied') : t('tCodeCopied')); }
      else { prText.focus(); prText.select(); toast(t('tSelect')); }
    });
  });
  $('#pr-dl').addEventListener('click', function () { download(ITEMS[prIdx]); toast(t('tSaved')); });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeDialog(b.closest('dialog')); }); });
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) closeDialog(d); });
    d.addEventListener('close', function () { markDialogs(); syncAll(); });
  });
  $('#to-guide').addEventListener('click', function () { openDialog($('#dlg-guide')); });
  // 에이전트 스킬 안내: 적용 방법 대화상자를 열고 스킬 블록으로 바로 갑니다
  function openSkill() {
    if (dlgPrompt.open) closeDialog(dlgPrompt);
    openDialog($('#dlg-guide'));
    var sec = $('#guide-skill');
    sec.scrollIntoView({ block: 'start' });
    sec.focus({ preventScroll: true });
  }
  $$('#to-skill, [data-open-skill]').forEach(function (b) { b.addEventListener('click', openSkill); });
  // 명령 한 줄 복사: 버튼 옆 code의 글을 복사하고, 안 되면 그 글을 선택해 둡니다
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.parentNode.querySelector('code');
      copyText(code.textContent).then(function (ok) {
        if (ok) { markDone(b); toast(t('tCmdCopied')); return; }
        var sel = window.getSelection();
        sel.removeAllRanges(); sel.selectAllChildren(code);
        toast(t('tSelect'));
      });
    });
  });

  /* ---------- 릴스: 한 화면에 요소 하나, 위아래로 넘깁니다 ---------- */
  var reel = $('#reel');
  var reelList = [];
  var reelDirty = true;
  var slides = [];
  var cur = -1;
  var mounted = {};
  var opener = null;
  function slideMeta(s, it) {
    var c = loc(it);
    s.setAttribute('aria-label', it.id + ' ' + c.title);
    $('.g-slide-meta', s).innerHTML =
      '<p class="g-slide-kick"><b>' + it.id + '</b> · ' + esc(c.category) + (it.set === 3 ? ' <em class="g-new">NEW</em>' : '') + '</p>' +
      '<h2 class="g-slide-t">' + esc(c.title) + '</h2>' +
      '<p class="g-slide-s">' + esc(c.summary) + '</p>' +
      (c.hint ? '<p class="g-slide-hint">' + ICON.hand + '<span>' + esc(c.hint) + '</span></p>' : '');
    $('.g-rail', s).innerHTML =
      '<button class="g-rb" type="button" data-act="prompt"><i>' + ICON.prompt + '</i><span>' + esc(t('railPrompt')) + '</span></button>' +
      '<button class="g-rb" type="button" data-act="copy"><i>' + ICON.copy + '</i><span>' + esc(t('railCopy')) + '</span></button>' +
      '<button class="g-rb" type="button" data-act="code"><i>' + ICON.code + '</i><span>' + esc(t('railCode')) + '</span></button>';
  }
  function buildReel(all) {
    Object.keys(mounted).forEach(function (k) { unmountSlide(+k); });
    reelList = visible.length && !all ? visible.slice() : ORDER.slice();
    reel.innerHTML = '';
    // 200장을 한 번에 그리면 여는 순간이 끊기므로, 높이만 있는 빈 화면을 만들고 내용은 fillSlide가 채웁니다
    var frag = document.createDocumentFragment();
    slides = reelList.map(function (idx, p) {
      var s = document.createElement('section');
      s.className = 'g-slide';
      s.dataset.p = String(p);
      s.setAttribute('aria-label', ITEMS[idx].id + ' ' + loc(ITEMS[idx]).title);
      frag.appendChild(s);
      return s;
    });
    reel.appendChild(frag);
    mounted = {};
    cur = -1;
    reelDirty = false;
  }
  function fillSlide(p) {
    var s = slides[p];
    if (!s || s._filled) return;
    var it = ITEMS[reelList[p]];
    s.style.setProperty('--h', it.hue);
    s.style.setProperty('--h2', it.hue2);
    s.innerHTML =
      '<div class="g-slide-bg" aria-hidden="true"></div>' +
      '<div class="g-slide-stage"><div class="g-fit' + (it.fluid ? ' is-fluid' : '') + '"></div></div>' +
      '<div class="g-slide-meta"></div>' +
      '<div class="g-rail"></div>';
    slideMeta(s, it);
    if (!s._bound) { bindTakeover(s); s._bound = true; }
    s._filled = true;
  }
  // 멀어진 화면은 다시 비워 둡니다(요소가 올라가 있으면 그대로 둡니다)
  function emptySlide(p) {
    var s = slides[p];
    if (!s || !s._filled || mounted[p]) return;
    s.innerHTML = '';
    s._filled = false;
  }
  function stageOf(p) { fillSlide(p); return slides[p].querySelector('.g-slide-stage'); }
  // 좁은 화면에서는 설명 블록의 실제 높이만큼 무대를 띄워 요소와 설명이 겹치지 않게 합니다
  function placeStage(p) {
    var s = slides[p], st = stageOf(p), m = $('.g-slide-meta', s);
    if (wideQ.matches || !m) { st.style.bottom = ''; return; }
    st.style.bottom = Math.ceil(m.offsetHeight + (parseFloat(getComputedStyle(m).bottom) || 0) + 20) + 'px';
  }
  function mountSlide(p) {
    if (mounted[p]) return;
    var st = stageOf(p);
    mountInto(st.firstElementChild, ITEMS[reelList[p]]);
    mounted[p] = true;
    placeStage(p);
    fitSlide(st, st.firstElementChild);
    attachPlayer(st.firstElementChild, reelList[p], 'slide');
  }
  function unmountSlide(p) {
    if (!mounted[p]) return;
    if (slides[p]) unmount(stageOf(p).firstElementChild);
    delete mounted[p];
  }
  function setCurrent(p) {
    if (p === cur || p < 0 || p >= slides.length) return;
    if (cur >= 0 && slides[cur]) slides[cur].classList.remove('is-on');
    cur = p;
    slides[p].classList.add('is-on');
    for (var k = Math.max(0, p - 2); k <= Math.min(slides.length - 1, p + 2); k++) fillSlide(k);
    [p - 1, p, p + 1].forEach(function (k) { if (k >= 0 && k < slides.length) mountSlide(k); });
    slides.forEach(function (s, k) { if (s._filled && Math.abs(k - p) > 4) emptySlide(k); });
    Object.keys(mounted).forEach(function (k) { k = +k; if (Math.abs(k - p) > 1) unmountSlide(k); });
    // 지금 화면의 요소만 시연하고, 이웃 화면은 멈춰 둡니다
    Object.keys(mounted).forEach(function (k) {
      var f = stageOf(+k).firstElementChild, P = f._pl;
      if (P) {
        P.vis = +k === p; syncPlayer(P);
        // 옆 화면은 흐려지며 사라진 뒤(0.7초)에 되돌려 둡니다
        if (!P.vis && P.dirty) setTimeout(function () { if (!P.vis && !P.on) quietReset(P); }, 700);
      }
    });
    var it = ITEMS[reelList[p]];
    $('#prog-n').textContent = it.id;
    $('#prog-t').textContent = String(slides.length).padStart(3, '0');
    $('#prog-bar').style.setProperty('--p', ((p + 1) / slides.length).toFixed(4));
    if (body.dataset.view === 'reel') history.replaceState({ reel: true }, '', '#' + it.id);
  }
  var scrollRaf = 0;
  reel.addEventListener('scroll', function () {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = 0;
      var h = reel.clientHeight || 1;
      setCurrent(Math.round(reel.scrollTop / h));
    });
  }, { passive: true });
  function goTo(p, smooth) {
    p = Math.max(0, Math.min(slides.length - 1, p));
    reel.scrollTo({ top: p * reel.clientHeight, behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
    if (!smooth) setCurrent(p);
  }
  var gridOffT = 0;
  function openReel(idx, fromTile, noPush) {
    if (reelDirty || !slides.length) buildReel();
    var p = reelList.indexOf(idx);
    if (p < 0) { buildReel(true); reelDirty = true; p = reelList.indexOf(idx); }
    opener = fromTile || null;
    body.dataset.view = 'reel';
    reel.setAttribute('aria-hidden', 'false');
    // 그리드의 요소는 잠시 해제해서 릴스만 움직이게 합니다. 여는 순간 한꺼번에 내리면 첫 화면이 끊기므로 릴스가 펼쳐진 뒤에 내립니다
    unwatchAll();
    clearTimeout(gridOffT);
    gridOffT = setTimeout(function () {
      if (body.dataset.view !== 'reel') return;
      $$('.g-fit', grid).forEach(function (f) { if (f.firstChild) unmount(f); });
    }, 700);
    if (!noPush) history.pushState({ reel: true }, '', '#' + ITEMS[idx].id);
    requestAnimationFrame(function () {
      goTo(p, false);
      var s = slides[p];
      s.setAttribute('tabindex', '-1');
      s.focus({ preventScroll: true });
      syncAll();
    });
  }
  function closeReel(fromPop) {
    if (body.dataset.view !== 'reel') return;
    body.dataset.view = 'grid';
    reel.setAttribute('aria-hidden', 'true');
    Object.keys(mounted).forEach(function (k) { unmountSlide(+k); });
    cur = -1;
    $$('.g-stage', grid).forEach(function (st) { watchStage(st); });
    if (!fromPop) {
      if (history.state && history.state.reel) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    var back = opener && opener.isConnected ? $('.g-exp', opener) : null;
    if (back) back.focus({ preventScroll: true });
  }
  window.addEventListener('popstate', function () {
    var m = /^#(\d{3})$/.exec(location.hash);
    var idx = m ? ITEMS.findIndex(function (it) { return it.id === m[1]; }) : -1;
    if (idx >= 0) { if (body.dataset.view !== 'reel') openReel(idx, null, true); else goTo(reelList.indexOf(idx), true); }
    else closeReel(true);
  });
  $('#to-reel').addEventListener('click', function () {
    var first = visible.length ? visible[0] : 0;
    openReel(first, null);
  });
  reel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.closest('.ux')) return;
    var p = +b.closest('.g-slide').dataset.p;
    var it = ITEMS[reelList[p]];
    var act = b.dataset.act;
    if (act === 'prompt') openPrompt(reelList[p]);
    else if (act === 'copy') {
      copyText(promptOf(it)).then(function (ok) {
        if (ok) { markDone(b); toast(t('tPromptCopied')); }
        else { openPrompt(reelList[p]); toast(t('tCopyIn')); }
      });
    } else if (act === 'code') { download(it); markDone(b); toast(t('tSaved')); }
  });
  $('#hud').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'back') closeReel(false);
    if (b.dataset.act === 'theme') toggleTheme(b);
  });
  document.addEventListener('keydown', function (e) {
    if (body.dataset.view !== 'reel' || $('dialog[open]')) return;
    var inEl = e.target.closest && e.target.closest('.ux');
    var k = e.key;
    if (k === 'Escape') {
      e.preventDefault();
      // 요소 안에 초점이 있으면 먼저 요소에서 빠져나오고, 한 번 더 누르면 그리드로 돌아갑니다
      if (inEl) { slides[cur].focus({ preventScroll: true }); return; }
      closeReel(false);
      return;
    }
    if (inEl || e.target.matches('input, textarea, select')) return;
    if (k === 'ArrowDown' || k === 'PageDown' || k === 'j' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); goTo(cur + 1, true); }
    else if (k === 'ArrowUp' || k === 'PageUp' || k === 'k' || (k === ' ' && e.shiftKey)) { e.preventDefault(); goTo(cur - 1, true); }
    else if (k === 'Home') { e.preventDefault(); goTo(0, true); }
    else if (k === 'End') { e.preventDefault(); goTo(slides.length - 1, true); }
  });
  var rT = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      Object.keys(mounted).forEach(function (k) { var st = stageOf(+k); placeStage(+k); fitSlide(st, st.firstElementChild); });
      if (body.dataset.view === 'reel' && cur >= 0) reel.scrollTop = cur * reel.clientHeight;
    }, 120);
  });

  /* ---------- 언어 적용: 정적 문구, 분류, 타일, 릴스, 열린 대화상자까지 한 번에 바꿉니다 ---------- */
  function applyStatic() {
    root.setAttribute('lang', lang);
    document.title = t('docTitle');
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', t('docDesc'));
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':');
        if (kv.length === 2) el.setAttribute(kv[0].trim(), t(kv[1].trim()));
      });
    });
    $('#count-wrap').innerHTML = T[lang].count(visible.length || ITEMS.length);
    $('#guide-steps').innerHTML = T[lang].guideSteps.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    $$('.g-lang-b').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    var on = $('.g-lang-b[aria-pressed="true"]');
    var lp = $('.g-lang-pill');
    if (on && lp) { lp.style.setProperty('--x', on.offsetLeft + 'px'); lp.style.setProperty('--w', on.offsetWidth + 'px'); }
    syncTheme();
    syncAutoBtn();
    syncEmpty();
    syncSearchUi();
  }
  function setLang(next) {
    if (next !== 'ko' && next !== 'en') return;
    store.set(LANG_KEY, next);
    if (next === lang) return;
    lang = next;
    regCss(ITEMS);
    applyStatic();
    renderCats();
    movePill(false);
    moveSetPill(false);
    // 타일은 자리를 그대로 두고 문구와 요소만 바꿉니다
    $$('.g-tile', grid).forEach(function (el) {
      var it = ITEMS[+el.dataset.idx];
      if (!it) return;
      tileText(el, it);
      var stage = $('.g-stage', el), fit = stage && stage.firstElementChild;
      if (fit && fit.firstChild) { unmount(fit); mountTile(stage); }
    });
    if (slides.length) {
      if (body.dataset.view === 'reel' && cur >= 0) {
        var keep = cur;
        slides.forEach(function (s, p) {
          var it = ITEMS[reelList[p]];
          if (s._filled) slideMeta(s, it); else s.setAttribute('aria-label', it.id + ' ' + loc(it).title);
        });
        Object.keys(mounted).forEach(function (k) { unmountSlide(+k); });
        cur = -1;
        setCurrent(keep);
      } else reelDirty = true;
    }
    if (dlgPrompt.open) openPrompt(prIdx);
    phRun();
  }
  $$('.g-lang-b').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  /* ---------- 시작 ---------- */
  computeVisible();
  applyStatic();
  syncSets();
  renderCats();
  rebuildGrid();
  movePill(false);
  moveSetPill(false);
  root.classList.remove('i18n-wait');
  setTimeout(phRun, 900);
  requestAnimationFrame(function () { $('.g-head').classList.add('is-ready'); applyStatic(); moveSetPill(false); });
  var m0 = /^#(\d{3})$/.exec(location.hash);
  if (m0) {
    var i0 = ITEMS.findIndex(function (it) { return it.id === m0[1]; });
    if (i0 >= 0) { history.replaceState(null, '', location.pathname + location.search); openReel(i0, null); }
  }

  // 자동 점검과 다른 스크립트가 쓰는 도구입니다
  window.UXG = {
    ITEMS: ITEMS, promptOf: promptOf, codeOf: codeOf, standaloneOf: standaloneOf, openReel: openReel, closeReel: closeReel,
    openPrompt: openPrompt, toggleTheme: toggleTheme, isDark: isDark, loc: loc, setLang: setLang, setAuto: setAuto,
    lang: function () { return lang; }, auto: function () { return autoOn; }, players: players, localize: uxLocalize
  };
})();
