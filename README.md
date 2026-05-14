# 우리집 안전점검

집 안의 위험요소를 찾아보고 안전한 환경 개선 방법을 배우는 웹 게임입니다.
HTML, CSS, JavaScript만 사용하는 정적 사이트라서 GitHub Pages에 바로 올려 운영할 수 있습니다.

## 로컬 실행

1. 압축을 풉니다.
2. `index.html` 파일을 브라우저로 엽니다.
3. 화면 흐름을 테스트합니다.

별도 설치 과정은 없습니다.

## GitHub Pages 배포

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더의 파일을 저장소 루트에 업로드합니다.
3. 저장소의 `Settings` → `Pages`로 이동합니다.
4. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
5. `Branch`는 `main`, 폴더는 `/root`로 설정하고 저장합니다.
6. 잠시 후 표시되는 Pages 주소로 접속합니다.

배포 후 기본 주소는 보통 아래 형식입니다.

```text
https://사용자이름.github.io/저장소이름/
```

## 파일 구조

```text
home-safety-game/
├─ index.html
├─ survey.html
├─ resources.html
├─ style.css
├─ app.js
├─ README.md
└─ assets/
   └─ images/
      ├─ main-bg.svg
      ├─ apartment-1.svg ~ apartment-4.svg
      ├─ apartment-entry-before.png / apartment-entry-after.png
      ├─ house-entry-before.png / house-entry-after.png
      ├─ entrance-before.svg / entrance-after.svg
      ├─ hallway-before.svg / hallway-after.svg
      ├─ living-before.svg / living-after.svg
      ├─ kitchen-before.svg / kitchen-after.svg
      ├─ bedroom-before.svg / bedroom-after.svg
      └─ bathroom-before.svg / bathroom-after.svg
```

## 게임 흐름

```text
메인화면
→ 게임방법
→ 주거유형 선택
→ 출입구
→ 현관
→ 거실
→ 주방
→ 침실
→ 욕실
→ 결과 화면
→ 설문조사 / 더 알아보기
```

## 콘텐츠 수정 위치

스테이지 내용은 `app.js`의 `stages` 배열에서 수정합니다.
18개 개선점의 교육 기준은 `ELDERLY_HOME_SAFETY_18.md`에서 관리합니다.

```js
{
  id: "entrance",
  title: "출입구",
  beforeImage: "assets/images/entrance-before.svg",
  afterImage: "assets/images/entrance-after.svg",
  hint: "밝기, 턱, 통로를 살펴보세요.",
  items: [
    {
      id: "light",
      label: "어두운 조명을 찾아보세요",
      afterText: "센서등을 설치해 출입구가 밝아졌어요.",
      x: 72,
      y: 18,
      radius: 8
    }
  ]
}
```

## 정답 위치 조정 방법

- `x`: 이미지 가로 위치, 0~100 퍼센트
- `y`: 이미지 세로 위치, 0~100 퍼센트
- `radius`: 클릭 허용 범위

예시:

```js
x: 50,
y: 76,
radius: 9
```

이미지의 가로 50%, 세로 76% 지점을 중심으로 반경 9% 안쪽을 누르면 정답 처리됩니다.

## 실제 이미지로 교체하는 방법

1. `IMAGE_PRODUCTION_PLAN.md`에서 이미지 기준을 확인합니다.
2. `IMAGE_PROMPTS.md`의 프롬프트로 이미지를 제작합니다.
3. 제작한 PNG 원본 이미지를 `assets/images/` 폴더에 넣습니다.
4. 같은 이름의 WebP 최적화본도 함께 넣습니다.
5. 게임은 WebP를 먼저 사용하고, 문제가 있으면 PNG/SVG로 대체합니다.
6. 이미지가 바뀌면 각 위험요소의 `x`, `y`, `radius`를 다시 맞춥니다.

아직 PNG가 없는 이미지는 기존 SVG 임시 이미지로 자동 대체됩니다.

## 이미지 최적화

현재 웹 운영용 이미지는 `.webp`를 우선 사용합니다.
PNG 원본은 보관용이며, GitHub Pages에서 실제 로딩되는 용량은 WebP 기준으로 줄어듭니다.

## 사운드

현재는 별도 mp3 없이 브라우저 Web Audio API로 간단한 성공/실패/클리어 효과음을 만듭니다.
나중에 실제 효과음을 쓰려면 `safePlay()` 함수를 mp3 재생 방식으로 바꾸면 됩니다.
