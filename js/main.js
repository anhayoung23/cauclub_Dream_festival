/**
 * ✅ DOM 요소 변수
 */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const posterContainer = document.getElementById('posterContainer');

/**
 * ✅ 햄버거 메뉴 클릭: 네비 토글
 */
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('active');
});

/**
 * ✅ 메인 포스터 클릭: 앞/뒤 flip
 */
posterContainer.addEventListener('click', () => {
  posterContainer.classList.toggle('flip');
});

/**
 * ✅ (슬라이더 기능이 필요한 경우에만!)
 * - index.html에는 기본적으로 슬라이더 없음.
 * - about.html 등에서 slider-container 쓸 경우 이 부분 추가 사용!
 */
// const slides = document.querySelectorAll("#slider img");
// let current = 0;
// setInterval(() => {
//   slides[current].classList.remove("active");
//   current = (current + 1) % slides.length;
//   slides[current].classList.add("active");
// }, 3000);

/**
 * ✅ 부스 소개 페이지: 카드 클릭 시 이미지 플립
 * - 카드에 data-front, data-back 속성 필수!
 */
document.querySelectorAll('.club-card').forEach(card => {
  card.addEventListener('click', function() {
    const cardInner = this.querySelector('.card-inner');
    const img = cardInner.querySelector('img');
    const frontSrc = this.getAttribute('data-front');
    const backSrc = this.getAttribute('data-back');
    const isFlipped = this.classList.toggle('flipped');
    // 카드가 반쯤 돌아간 타이밍에 이미지 교체 (자연스럽게)
    setTimeout(() => {
      img.src = isFlipped ? backSrc : frontSrc;
    }, 300); // card-inner transition-duration의 절반과 맞춤 (0.6s)
  });
});
