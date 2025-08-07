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
