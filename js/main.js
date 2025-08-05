/**
 * ✅ 변수 설명
 * hamburger: 햄버거 메뉴 아이콘 요소
 * navLinks: 네비게이션 메뉴 리스트 (모바일에서 토글)
 * posterContainer: 메인 포스터 컨테이너 (클릭 시 앞/뒤 회전)
 */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const posterContainer = document.getElementById('posterContainer');

/**
 * ✅ 함수: 햄버거 메뉴 클릭 이벤트
 * 역할:
 *  - navLinks에 'show' 클래스를 토글 → 메뉴 보이기/숨기기
 *  - hamburger에 'active' 클래스를 토글 → 아이콘 애니메이션
 */
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('active'); // (선택사항) X로 변환할 때 사용
});

/**
 * ✅ 함수: 포스터 클릭 이벤트
 * 역할:
 *  - posterContainer에 'flip' 클래스를 토글 → 앞면 ↔ 뒷면 회전
 */
posterContainer.addEventListener('click', () => {
  posterContainer.classList.toggle('flip');
});
