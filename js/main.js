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
