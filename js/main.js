/**
 * ✅ 햄버거 메뉴(모바일) 토글
 */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    hamburger.classList.toggle('active');
  });
}

/**
 * ✅ 메인 포스터 클릭: 앞/뒤 flip (index.html 등에서 사용)
 */
const posterContainer = document.getElementById('posterContainer');
if (posterContainer) {
  posterContainer.addEventListener('click', () => {
    posterContainer.classList.toggle('flip');
  });
}

/**
 * ✅ 클럽 카드 클릭시 플립 (clubs.html에서 사용)
 */
document.querySelectorAll('.club-card').forEach(card => {
  card.addEventListener('click', function() {
    this.classList.toggle('flipped');
  });
});
