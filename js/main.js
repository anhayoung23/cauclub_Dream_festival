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
   2) 유틸: 보이는 탭 여부 확인 (백그라운드 시 자동재생 일시정지)
------------------------------------------------------------ */
const pageVisibility = {
  isHidden: () => document.hidden
};

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

  // 자동재생 시작/중지
  const start = () => {
    if(!autoplay || reducedMotion) return;
    stop(); // 중복 방지
    timer = setInterval(() => {
      if(!pageVisibility.isHidden()){
        next();
      }
    }, intervalMs);
    toggleBtn && toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn && (toggleBtn.textContent = '⏸'); // 일시정지 표시
  };
  const stop = () => {
    if(timer){ clearInterval(timer); timer = null; }
    toggleBtn && toggleBtn.setAttribute('aria-pressed', 'true');
    toggleBtn && (toggleBtn.textContent = '▶'); // 재생 표시
  };

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

  // 호버 시 일시정지(모바일은 hover 없음)
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

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
