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
   6분할 카드 뒤집기 + 모바일 포커스(모달) 표시 스크립트
   - 클릭/엔터/스페이스로 토글
   - 작은 화면에서는 중앙 확대 모드로 뒷면만 보여준다
   - ESC, 바깥 터치로 닫기
   ============================================================ */

(function(){
  // 유틸: 현재가 '좁은 화면(모바일)'인지 간단 판단 (원하면 기준 조정)
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  // 요소 참조
  const board = document.querySelector('.festival-board');
  const overlay = document.getElementById('tileFocus');

  if(!board) return; // 페이지에 보드가 없으면 무시

  // 델리게이션: 보드 내 타일을 클릭/키보드 조작 처리
  board.addEventListener('click', onTileActivate);
  board.addEventListener('keydown', (e) => {
    // Enter(13), Space(32) 또는 키 이름 기준
    if((e.key === 'Enter' || e.key === ' ') && e.target.closest('.tile')){
      e.preventDefault();
      onTileActivate(e);
    }
  });

  // 활성화 로직
  function onTileActivate(e){
    const tile = e.target.closest('.tile');
    if(!tile) return;

    // 모바일: 중앙 포커스 모드
    if(isMobile()){
      openFocus(tile);
      return;
    }

    // 데스크탑: 그 자리에서 flip 토글
    tile.classList.toggle('is-flipped');

    // 뒷면 이미지 src 동기화 (초기 로딩 지연을 줄이기 위해 필요 시 교체)
    const backUrl = tile.getAttribute('data-back');
    const backImg = tile.querySelector('.face.back img');
    if(backUrl && backImg && !backImg.src.includes(backUrl)){
      backImg.src = backUrl;
    }
  }

  // 포커스 모드 열기(모바일): 선택된 타일의 '뒷면'을 중앙에 크게 표시
  function openFocus(tile){
    const label = tile.getAttribute('data-label') || '';
    const backUrl = tile.getAttribute('data-back') || '';
    overlay.setAttribute('data-label', label);
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');

    // 기존 내용 제거
    overlay.innerHTML = '';

    // 포커스 카드 DOM을 동적으로 생성(간단 복제)
    const card = document.createElement('div');
    card.className = 'card';

    const back = document.createElement('div');
    back.className = 'face back';

    const img = document.createElement('img');
    img.alt = label + ' 이미지';
    if(backUrl) img.src = backUrl;

    back.appendChild(img);
    card.appendChild(back);
    overlay.appendChild(card);

    // 스크롤 잠금(바디)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  // 포커스 모드 닫기
  function closeFocus(){
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // 바깥 터치로 닫기 (오버레이 빈 곳 클릭)
  overlay.addEventListener('click', (e)=>{
    if(e.target === overlay) closeFocus();
  });

  // ESC로 닫기
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && overlay.classList.contains('active')){
      closeFocus();
    }
  });

  // 화면 리사이즈 시, 데스크탑으로 전환되면 열려있던 포커스 닫기
  window.addEventListener('resize', ()=>{
    if(!isMobile() && overlay.classList.contains('active')){
      closeFocus();
    }
  });
})();

