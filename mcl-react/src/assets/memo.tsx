// 나만의 컬렉션에 댓글 탭 추가

// 비공개 샘플 링크타고 가는거 막기

// 관리자 페이지 (유저 관리)

// -------------------------------

// // 날짜 기반 난수 생성기 (Seeded Random)
//   const getDailyRandomIndex = (max: number) => {
//     const date = new Date();
//     // 20231128 같은 숫자를 만듦
//     const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

//     // 간단한 해시 함수로 인덱스 생성
//     const x = Math.sin(seed) * 10000;
//     return Math.floor((x - Math.floor(x)) * max);
//   };

//   useEffect(() => {
//     const names = Object.keys(POKEMON_NAME_MAP);

//     // 랜덤(Math.random) 대신 날짜 기반 인덱스 사용
//     const dailyIndex = getDailyRandomIndex(names.length);

//     const randomName = names[dailyIndex];

// -------------------------------

// 토스트 사용중 : app.tsx , loginpage.tsx

// 스위트 얼러트 : sidebar.tsx
