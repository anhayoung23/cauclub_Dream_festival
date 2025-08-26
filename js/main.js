// ✅ DOM 요소 변수
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const posterContainer = document.getElementById('posterContainer');

// ✅ 햄버거 메뉴 클릭: 네비 토글
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    hamburger.classList.toggle('active');
  });
}

// ✅ 메인 포스터 클릭: 앞/뒤 flip
if (posterContainer) {
  posterContainer.addEventListener('click', () => {
    posterContainer.classList.toggle('flip');
  });
}

// ✅ 부스 소개 카드 슬라이드 플립
document.querySelectorAll('.club-card').forEach(card => {
  card.addEventListener('click', function() {
    this.classList.toggle('flipped');
  });
});


/* =======================================================================
   main.js
   - 모바일 네비(햄버거) 토글
   - About 페이지 이미지 슬라이더 (자동재생/일시정지/스와이프/포커스 제어)
   - 주석을 자세히 달아, 유지보수/확장에 용이하게 구성
======================================================================= */

/* ------------------------------------------------------------
   1) 모바일 네비게이션(햄버거) 토글
   - 작은 화면에서 메뉴 펼침/접힘 제어
------------------------------------------------------------ */
(function initHamburger(){
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
    // 접근성: 펼침 상태를 스크린리더에 전달
    const expanded = navLinks.classList.contains('is-open');
    hamburger.setAttribute('aria-expanded', String(expanded));
  });
})();

/* ------------------------------------------------------------
   3) 슬라이더 초기화 함수
   - root: 슬라이더 최상위 요소(.slider)
------------------------------------------------------------ */
function createSlider(root){
  const slidesWrap = root.querySelector('.slides');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const prevBtn = root.querySelector('.nav.prev');
  const nextBtn = root.querySelector('.nav.next');
  const dotsWrap = root.querySelector('.dots');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.dot')) : [];
  const toggleBtn = root.querySelector('.toggle');

  // 설정값(HTML data-속성에서 읽음)
  const autoplay = root.getAttribute('data-autoplay') !== 'false';
  const intervalMs = Number(root.getAttribute('data-interval') || 4000);

  let index = 0;          // 현재 슬라이드 인덱스
  let timer = null;       // setInterval 핸들
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 슬라이드를 보여주는 핵심 함수
  const show = (i) => {
    index = (i + slides.length) % slides.length; // 음수/초과 방지
    slides.forEach((s, si) => {
      s.classList.toggle('is-active', si === index);
      // aria-selected 갱신(접근성)
      s.setAttribute('aria-hidden', si === index ? 'false' : 'true');
    });
    if(dots.length){
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
      dots.forEach((d, di) => d.setAttribute('aria-selected', di === index ? 'true' : 'false'));
    }
  };

  const next = () => show(index + 1);
  const prev = () => show(index - 1);

 

  // 버튼 이벤트
  prevBtn && prevBtn.addEventListener('click', () => { prev(); stop(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); stop(); });

  // 점(인디케이터) 클릭으로 특정 슬라이드로 이동
  if(dots.length){
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const to = Number(dot.getAttribute('data-slide') || 0);
        show(to);
        stop(); // 사용자가 조작하면 자동재생 정지(일반적인 UX)
      });
    });
  }

  // 토글(자동재생 on/off)
  if(toggleBtn){
    toggleBtn.addEventListener('click', () => {
      if(timer){ stop(); } else { start(); }
    });
  }


  // 터치 스와이프(모바일 제스처)
  let touchStartX = 0, touchEndX = 0;
  const onTouchStart = (e) => { touchStartX = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    // 스와이프 임계값(화면 폭의 약 6% 혹은 40px)
    const threshold = Math.max(root.clientWidth * 0.06, 40);
    if(Math.abs(delta) > threshold){
      delta < 0 ? next() : prev();
      stop(); // 제스처 조작 후 자동정지
    }
  };
  root.addEventListener('touchstart', onTouchStart, {passive: true});
  root.addEventListener('touchend', onTouchEnd, {passive: true});

  // 페이지가 백그라운드로 가면 정지 / 다시 오면 재생
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){ stop(); } else { start(); }
  });

  // 초기 표시 & 자동재생 시작
  show(0);
  start();

  // 외부에서 참조할 수 있도록 제어 메서드 반환(선택 사항)
  return { show, next, prev, start, stop, get index(){ return index; } };
}

/* ------------------------------------------------------------
   4) DOM 로드 후 슬라이더 활성화
------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('aboutSlider');
  if(slider) createSlider(slider);
});



/* ============================================================
   festival.html 전용 인터랙션 (교체용)
   - 모바일(<=767px): 카드 탭 → 모달로 뒷면 이미지 중앙 확대
   - 데스크톱(>767px): 카드 클릭/키보드 → 제자리 뒤집기
   - ESC/바깥 클릭 → 모달 닫기
   - data-back 또는 .back img src 사용, 선로딩으로 지연 최소화
   - .f- 접두사(신규)와 기존 .festival-board/.tile 혼용 커버
   ============================================================ */

(function initFestival(){
  document.addEventListener('DOMContentLoaded', () => {
    const BOARD_SEL = '.f-board, .festival-board';
    const TILE_SEL  = '.f-tile, .tile';

    const board   = document.querySelector(BOARD_SEL);
    if(!board) return; // 👉 festival 페이지가 아니면 실행 안 함

    // 오버레이 탐색: #fFocus → #tileFocus → 없으면 자동 생성
    let overlay = document.getElementById('fFocus') || document.getElementById('tileFocus');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'fFocus';
      overlay.className = 'f-focus tile-focus'; // 둘 다 커버
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    // 클릭/탭(위임)
    board.addEventListener('click', (e) => {
      const tile = e.target.closest(TILE_SEL);
      if(!tile || !board.contains(tile)) return;
      handleTileActivate(tile, overlay);
    });

    // 키보드(Enter/Space)
    board.addEventListener('keydown', (e) => {
      if((e.key === 'Enter' || e.key === ' ') && e.target.closest(TILE_SEL)){
        e.preventDefault();
        const tile = e.target.closest(TILE_SEL);
        handleTileActivate(tile, overlay);
      }
    });

    // 오버레이 닫기 (바깥 클릭/ESC)
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) closeOverlay(overlay);
    });
    window.addEventListener('keydown', (e) => {
      if((e.key === 'Escape') && (overlay.classList.contains('is-active') || overlay.classList.contains('active'))){
        closeOverlay(overlay);
      }
    });

    // 접근성 초기값
    board.querySelectorAll(TILE_SEL).forEach((tile)=>{
      tile.setAttribute('aria-pressed', 'false');
    });

    // 뒷면 이미지 선로딩
    preloadBackImages(board);
  });

  // 모바일 판별
  function isSmallScreen(){
    return window.matchMedia('(max-width: 767px)').matches;
  }

  // 활성화 분기
  function handleTileActivate(tile, overlay){
    if(isSmallScreen()){
      openOverlayWithBack(tile, overlay);        // 모바일: 모달로 확대
    }else{
      const card = tile.querySelector('.f-card, .card');
      if(card){
        tile.classList.toggle('is-flipped');     // 데스크톱: flip
        tile.setAttribute('aria-pressed', tile.classList.contains('is-flipped') ? 'true' : 'false');
      }else{
        openOverlayWithBack(tile, overlay);      // 카드 구조 없으면 모달로 대체
      }
    }
  }

  // 모달 열기 (뒷면 이미지)
  function openOverlayWithBack(tile, overlay){
    const label = tile.getAttribute('data-label') || tile.getAttribute('aria-label') || '';

    // 우선순위: data-back → .f-back/.face.back 내 <img src>
    const dataBack = tile.getAttribute('data-back') || '';
    const backImg  = tile.querySelector('.f-back img, .face.back img');
    const src      = dataBack || (backImg ? backImg.getAttribute('src') : '');

    // 오버레이 표시
    overlay.innerHTML = '';
    overlay.setAttribute('data-label', label);
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');   // f-focus용
    overlay.classList.add('active');      // tile-focus용

    // 카드 DOM(모달은 뒷면만)
    const card = document.createElement('div');
    card.className = 'f-card card';

    const back = document.createElement('div');
    back.className = 'f-face f-back face back';

    const img = document.createElement('img');
    img.alt = (label ? label + ' ' : '') + '상세 이미지';
    if(src) img.src = src;

    back.appendChild(img);
    card.appendChild(back);
    overlay.appendChild(card);

    // 배경 스크롤 잠금
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  // 모달 닫기
  function closeOverlay(overlay){
    overlay.classList.remove('is-active', 'active');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // back 이미지 선로딩
  // ✅ back 이미지 선로딩 + 로드 완료 시 중앙 정렬 보강
function preloadBackImages(scope){
  const imgs = [...scope.querySelectorAll('.f-back img, .face.back img')];

  const shouldCenterTarget = (imgEl) => {
    const tile       = imgEl.closest('.f-tile, .tile');
    const overlay    = document.getElementById('fFocus');
    const overlayOn  = overlay && (overlay.classList.contains('is-active') || overlay.classList.contains('active'));
    // 모바일(모달) 우선, 아니면 데스크톱(뒤집힌 타일)
    return overlayOn ? (overlay.querySelector('.f-card, .card') || overlay) 
                     : (tile && tile.classList.contains('is-flipped') ? tile : null);
  };

  const onReady = (imgEl) => {
    const target = shouldCenterTarget(imgEl);
    if(target) scrollTileToViewportCenter(target);
  };

  imgs.forEach((imgEl) => {
    // 로딩 힌트
    if(!imgEl.hasAttribute('loading')) imgEl.loading = 'lazy';
    imgEl.decoding = 'async';

    // 캐시되어 이미 로드된 경우에도 즉시 보정
    if(imgEl.complete) onReady(imgEl);
    else imgEl.addEventListener('load', () => onReady(imgEl), { once:true });

    // 실제 프리로드(오프스크린 이미지) 유지
    const pic = new Image();
    pic.decoding = 'async';
    pic.src = imgEl.currentSrc || imgEl.src;
  });
}

  
})();


