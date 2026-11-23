// lucianLabs UI 요소 갤러리 빌드
// 실행: node prompt-uxui/src/build.mjs
// 입력: src/tokens.css, src/order.json(컬렉션 안 완성도 순), src/popular.json(전체 보여 주는 순서), src/elements/NNN-slug.html (요소 400개: 001~200 인터페이스, 201~400 애니메이션), src/gallery/{index.html,gallery.css,gallery.js,i18n-core.js}
// 요소 파일 머리: <!-- @meta {...} --> 필수, <!-- @demo [...] --> 자동 재생 시연, <!-- @en {...} --> 영어 제목·설명·번역 목록
// 출력: prompt-uxui/prompt-uxui-lab/index.html (단일 파일, 모든 코드를 인라인으로 포함)
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const elDir = join(here, 'elements');
const galDir = join(here, 'gallery');
const outDir = join(here, '..', 'prompt-uxui-lab');
// UX_OUT으로 출력 파일을 바꿀 수 있습니다(여럿이 동시에 점검할 때 서로의 결과를 덮지 않게)
const outFile = process.env.UX_OUT || join(outDir, 'index.html');

// 분류와 기본 색(타일 빛 번짐). 요소 @meta의 hue, hue2가 있으면 그 값을 씁니다
const CATEGORIES = {
  '버튼': ['#7B61FF', '#3D8BFF'],
  '토글·선택': ['#14B8A6', '#7B61FF'],
  '입력·검색': ['#3D8BFF', '#22C3A6'],
  '메뉴·탭': ['#F59E0B', '#FF6B8B'],
  '카드·콘텐츠': ['#FF6B8B', '#7B61FF'],
  '로그인·가입': ['#6366F1', '#22C3A6'],
  '알림·피드백': ['#FB923C', '#7B61FF'],
  '로딩·진행': ['#06B6D4', '#7B61FF'],
  '빈·오류 상태': ['#10B981', '#3D8BFF'],
  '위젯·차트': ['#EAB308', '#FF6B8B'],
  '공간·일정·디자인 도구': ['#C16235', '#3D8BFF'],
  '문서·데이터 편집': ['#3D8BFF', '#22C3A6'],
  '분석·데이터': ['#EAB308', '#FF6B8B'],
  '작업·시스템': ['#6366F1', '#7B61FF'],
  // 201~400: 웹사이트를 만들 때 쓰는 애니메이션 컬렉션
  '텍스트 모션': ['#F43F5E', '#8B5CF6'],
  '히어로·배경': ['#6366F1', '#14B8A6'],
  '내비게이션': ['#0EA5E9', '#6366F1'],
  '스크롤 모션': ['#0EA5E9', '#A855F7'],
  '섹션·콘텐츠': ['#8B5CF6', '#EC4899'],
  '소셜 증명': ['#F59E0B', '#EC4899'],
  '커머스·가격': ['#F97316', '#EAB308'],
  '폼·입력': ['#22C55E', '#06B6D4'],
  '앱 화면': ['#6366F1', '#7B61FF'],
  '빌더 도구': ['#0891B2', '#22C55E'],
  '커서·호버': ['#E11D48', '#3D8BFF'],
  '프로모션·보상': ['#F59E0B', '#EF4444'],
  '데이터 모션': ['#10B981', '#6366F1'],
};
const ALIAS = { '메뉴·내비': '메뉴·탭', '탭': '메뉴·탭' };
const SHAPES = ['square', 'tall'];
const EXPECTED = 480;
// 컬렉션: 1은 처음 공개한 인터페이스 200개, 2는 애니메이션 200개, 3은 사이트 필수 요소 50개(401~, 갤러리에서 NEW로 표시)입니다
const setOf = (id) => (+id > 400 ? 3 : +id > 200 ? 2 : 1);

const errors = [];
const warns = [];
const coreSrc = readFileSync(join(galDir, 'i18n-core.js'), 'utf8');
const uxLocalize = new Function(coreSrc + '\nreturn uxLocalize;')();
const HANGUL = /[\u3131-\u318E\uAC00-\uD7A3]/;
// 자동 재생 시연 단계: [동작, 대상 선택자, 순번, ...값]
const DEMO_OPS = { wait: 1, tap: 1, hold: 1, hover: 1, leave: 1, glide: 1, drag: 1, key: 1, type: 1, erase: 1, set: 1, js: 1, reset: 1, scroll: 1 };
const STRICT = !process.env.UX_PARTIAL;
const files = readdirSync(elDir).filter((f) => /^\d{3}-[a-z0-9-]+\.html$/.test(f)).sort();
const items = [];
const seenSlug = new Set();

for (const file of files) {
  const id = file.slice(0, 3);
  const slug = file.slice(4, -5);
  let src = readFileSync(join(elDir, file), 'utf8').replace(/\r\n/g, '\n');

  const metaMatch = src.match(/^\s*<!--\s*@meta\s*([\s\S]*?)-->/);
  if (!metaMatch) { errors.push(`${file}: @meta 주석 없음`); continue; }
  let meta;
  try { meta = JSON.parse(metaMatch[1]); } catch (e) { errors.push(`${file}: @meta JSON 오류 ${e.message}`); continue; }
  src = src.slice(metaMatch[0].length).trim();
  let demo = [];
  const demoMatch = src.match(/^<!--\s*@demo\s*([\s\S]*?)-->/);
  if (demoMatch) {
    try { demo = JSON.parse(demoMatch[1]); } catch (e) { errors.push(`${file}: @demo JSON 오류 ${e.message}`); }
    src = src.slice(demoMatch[0].length).trim();
  }
  let en = null;
  const enMatch = src.match(/^<!--\s*@en\s*([\s\S]*?)-->/);
  if (enMatch) {
    try { en = JSON.parse(enMatch[1]); } catch (e) { errors.push(`${file}: @en JSON 오류 ${e.message}`); }
    src = src.slice(enMatch[0].length).trim();
  }
  if (!Array.isArray(demo)) { errors.push(`${file}: @demo는 배열이어야 합니다`); demo = []; }
  demo.forEach((st, k) => {
    if (!Array.isArray(st) || !DEMO_OPS[st[0]]) errors.push(`${file}: @demo ${k}번째 단계 "${JSON.stringify(st).slice(0, 40)}" 알 수 없음`);
  });
  if (!demo.length) (STRICT ? errors : warns).push(`${file}: @demo 없음`);

  const category = ALIAS[meta.category] || meta.category;
  if (!meta.title || !meta.summary) errors.push(`${file}: title/summary 필요`);
  if (!CATEGORIES[category]) errors.push(`${file}: 알 수 없는 분류 "${meta.category}"`);
  const shape = meta.shape || 'square';
  if (!SHAPES.includes(shape)) errors.push(`${file}: shape는 square 또는 tall`);
  if (seenSlug.has(slug)) errors.push(`${file}: slug 중복`);
  seenSlug.add(slug);

  const scriptMatch = src.match(/<script>([\s\S]*?)<\/script>\s*$/);
  if (!scriptMatch) { errors.push(`${file}: 끝에 <script>가 필요합니다`); continue; }
  const js = scriptMatch[1].trim();
  const html = src.slice(0, scriptMatch.index).trim();

  if ((src.match(/<script[\s>]/g) || []).length !== 1) errors.push(`${file}: <script>은 하나여야 합니다`);
  // 루트는 class="ux uNNN" 으로 시작하며, 상태 클래스가 뒤에 붙을 수 있습니다
  if (!new RegExp(`class="ux u${id}[" ]`).test(html)) errors.push(`${file}: 루트 class="ux u${id}" 누락`);
  if (!html.includes('<style>')) errors.push(`${file}: <style> 누락`);
  if (!js.includes('document.currentScript.previousElementSibling')) errors.push(`${file}: 루트 찾기(currentScript)가 필요합니다`);
  // 요소 CSS가 다른 요소에 새지 않도록 선택자 접두사를 확인합니다
  const css = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
  const bad = css.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('}').map((r) => r.split('{')[0].trim()).filter(Boolean)
    .filter((sel) => !sel.startsWith('@'))
    .flatMap((sel) => sel.split(','))
    .map((s) => s.trim())
    .filter((s) => s && !s.includes(`.u${id}`) && !/^(from|to|\d+%)$/.test(s));
  if (bad.length) errors.push(`${file}: 접두사 없는 선택자 ${bad.slice(0, 3).join(' | ')}`);
  // @property는 문서 전체에 등록되므로, 이름이 겹치면 다른 요소의 같은 변수까지 타입이 바뀝니다(예: --a를 각도로 등록하면 색 변수 --a가 깨짐)
  const props = (css.match(/@property\s+--[\w-]+/g) || []).filter((p) => !p.includes(`--u${id}-`));
  if (props.length) errors.push(`${file}: @property 이름은 --u${id}- 로 시작해야 합니다: ${props.join(', ')}`);

  // 영어판: 주석을 지우고 번역 목록을 적용한 결과에 한글이 남으면 안 됩니다
  if (!en) (STRICT ? errors : warns).push(`${file}: @en 없음`);
  else {
    const pairs = Array.isArray(en.map) ? en.map : [];
    if (!en.title || !en.summary) errors.push(`${file}: @en title/summary 필요`);
    pairs.forEach((p) => { if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'string' || typeof p[1] !== 'string') errors.push(`${file}: @en map 항목 형식 ${JSON.stringify(p).slice(0, 50)}`); });
    const eh = uxLocalize(html, 'html', pairs), ej = uxLocalize(js, 'js', pairs);
    const left = [];
    for (const [part, code] of [['html', eh], ['js', ej]]) {
      // keep: 영어판에도 그대로 두는 말(예: 언어 선택 목록의 '한국어'처럼 자기 언어로 쓰는 이름)
      const keep = Array.isArray(en.keep) ? en.keep : [];
      code.split('\n').forEach((line, n) => { const l2 = keep.reduce((acc, w) => acc.split(w).join(''), line); if (HANGUL.test(l2)) left.push(`${part}:${n + 1} ${line.trim().slice(0, 110)}`); });
    }
    if (left.length) errors.push(`${file}: 영어판에 한글이 남았습니다\n      ` + left.slice(0, 14).join('\n      ') + (left.length > 14 ? `\n      …외 ${left.length - 14}줄` : ''));
    const unused = pairs.filter((p) => !html.includes(p[0]) && !js.includes(p[0]));
    if (unused.length) warns.push(`${file}: 쓰이지 않는 번역 ${unused.map((p) => JSON.stringify(p[0])).slice(0, 4).join(', ')}`);
    for (const k of ['title', 'summary', 'hint']) if (en[k] && HANGUL.test(en[k])) errors.push(`${file}: @en ${k}에 한글`);
    demo.forEach((st) => st.forEach((v) => {
      if (typeof v === 'string' && HANGUL.test(v) && st[0] !== 'js') errors.push(`${file}: @demo 문자열에 한글이 있으면 {"ko","en"}로 나눠 주세요: ${v.slice(0, 30)}`);
    }));
  }

  const [h1, h2] = CATEGORIES[category] || ['#7B61FF', '#3D8BFF'];
  items.push({
    id, slug,
    set: setOf(id),
    title: meta.title,
    category,
    // 분류 칩을 늘어놓는 순서(CATEGORIES에 적은 차례)
    ci: Object.keys(CATEGORIES).indexOf(category),
    summary: meta.summary,
    hint: meta.hint || '',
    shape,
    // 폭이 컨테이너를 따르는 요소: 갤러리는 정해진 폭의 상자 안에 놓고, 크기가 바뀌면 배율을 다시 맞춥니다
    ...(meta.fluid ? { fluid: true } : {}),
    hue: meta.hue || h1,
    hue2: meta.hue2 || h2,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    html,
    js,
    demo,
    en: en ? { title: en.title, summary: en.summary, hint: en.hint || '', map: en.map || [], keep: Array.isArray(en.keep) ? en.keep : [] } : null,
  });
}

// 컬렉션 안에서 보여 줄 순서(order.json): 완성도가 높은 요소를 먼저 놓습니다. 목록에 없는 요소는 번호순으로 뒤에 붙습니다
const orderSrc = JSON.parse(readFileSync(join(here, 'order.json'), 'utf8'));
for (const [set, list] of Object.entries(orderSrc)) {
  if (set.startsWith('_')) continue;
  const seen = new Set();
  list.forEach((id, n) => {
    if (seen.has(id)) errors.push(`order.json: ${id}가 두 번 있습니다`);
    seen.add(id);
    const it = items.find((x) => x.id === id);
    if (!it) { if (!process.env.UX_PARTIAL) errors.push(`order.json: 없는 요소 ${id}`); return; }
    if (String(it.set) !== set) errors.push(`order.json: ${id}는 컬렉션 ${it.set}입니다`);
    it.rank = n;
  });
  if (!process.env.UX_PARTIAL) items.filter((x) => String(x.set) === set && !seen.has(x.id)).forEach((x) => errors.push(`order.json: ${x.id}가 순서에 빠졌습니다`));
}

// 갤러리 '전체'의 순서(popular.json): 웹사이트에서 많이 쓰는 요소부터 놓습니다(쿠키 동의, 헤더, 히어로, 요금제, FAQ…).
// 모든 요소가 한 번씩 있어야 합니다. 컬렉션 보기도 이 순서를 따르고, 분류 알약도 흔한 분류가 앞에 옵니다
{
  const popSrc = JSON.parse(readFileSync(join(here, 'popular.json'), 'utf8'));
  const pop = popSrc.order;
  // 분류 알약 차례(ci)도 여기서 정합니다
  const cats = popSrc.categories || [];
  Object.keys(CATEGORIES).filter((c) => !cats.includes(c)).forEach((c) => errors.push(`popular.json: 분류 "${c}"가 categories에 없습니다`));
  items.forEach((it) => { it.ci = cats.indexOf(it.category); });
  const seen = new Set();
  pop.forEach((id, n) => {
    if (seen.has(id)) errors.push(`popular.json: ${id}가 두 번 있습니다`);
    seen.add(id);
    const it = items.find((x) => x.id === id);
    if (!it) { if (!process.env.UX_PARTIAL) errors.push(`popular.json: 없는 요소 ${id}`); return; }
    it.pop = n;
  });
  if (!process.env.UX_PARTIAL) items.filter((x) => !seen.has(x.id)).forEach((x) => errors.push(`popular.json: ${x.id}가 순서에 빠졌습니다`));
}

// UX_PARTIAL=1 이면 작성 중인 부분 빌드를 허용합니다. 최종 빌드에서는 반드시 400개여야 합니다.
if (!process.env.UX_PARTIAL && items.length !== EXPECTED) errors.push(`요소 ${items.length}개 (목표 ${EXPECTED})`);
if (warns.length) console.warn('참고:\n' + warns.map((w) => ' - ' + w).join('\n'));
if (errors.length) {
  console.error('빌드 중단:\n' + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}

const tokens = readFileSync(join(here, 'tokens.css'), 'utf8');
const galleryHtml = readFileSync(join(galDir, 'index.html'), 'utf8');
const galleryBaseCss = readFileSync(join(galDir, 'gallery.css'), 'utf8');
// 카드별 라이트·다크: tokens.css의 라이트(:root)와 다크(:root[data-theme="dark"]) 값을 무대(.g-stage)에도 걸어 둡니다.
// 무대에 data-theme을 붙이면 그 안의 요소만 반대 테마 토큰을 물려받습니다
const tokenBlock = (re) => { const m = tokens.match(re); if (!m) { console.error('빌드 중단: tokens.css에서 테마 블록을 찾지 못했습니다'); process.exit(1); } return m[1].trim(); };
const stageThemes = '\n/* 카드별 테마 토큰(빌드가 tokens.css에서 만듭니다) */\n' +
  '.g-stage[data-theme="light"]{' + tokenBlock(/^:root\{([^}]*)\}/m) + '}\n' +
  '.g-stage[data-theme="dark"]{' + tokenBlock(/^:root\[data-theme="dark"\]\{([^}]*)\}/m) + '}\n';
const galleryCss = galleryBaseCss + stageThemes;
const galleryJs = readFileSync(join(galDir, 'gallery.js'), 'utf8').replace('/*@I18N_CORE@*/', () => coreSrc);

// JSON을 <script> 안에 넣을 때 </script> 종료 방지
const data = JSON.stringify({ tokens, items }).replace(/<\//g, '<\\/');

// 스크립트가 꺼져도 목록이 보이도록 타일의 제목 구조를 미리 HTML로 넣습니다. 스크립트가 켜지면 다시 그립니다
const escH = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const byShow = (a, b) => ((a.pop ?? 1e9) - (b.pop ?? 1e9)) || (b.set - a.set) || ((a.rank ?? 1e9) - (b.rank ?? 1e9)) || a.id.localeCompare(b.id);
const staticTiles = items.slice().sort(byShow).map((it) =>
  `<article class="g-tile${it.shape === 'tall' ? ' is-tall' : ''}"><div class="g-stage"></div><div class="g-info"><div class="g-cap"><p class="g-cap-t"><b>${it.id}</b><span>${escH(it.title)}</span></p><p class="g-cap-s">${escH(it.category)}</p></div></div></article>`).join('');

const page = galleryHtml
  .replace('<!--@GRID_TILES@-->', () => staticTiles)
  .replace('/*@GALLERY_CSS@*/', () => galleryCss)
  .replace('/*@GALLERY_JS@*/', () => galleryJs)
  .replace('/*@TOKENS@*/', () => tokens)
  .replace('__UX_DATA__', () => data);

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, page);
const kb = (Buffer.byteLength(page) / 1024).toFixed(1);
console.log(`OK: 요소 ${items.length}개 → ${outFile} (${kb} KB)`);
