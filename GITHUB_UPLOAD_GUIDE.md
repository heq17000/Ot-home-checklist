# GitHub Pages 업로드 방법

이 폴더 안의 파일과 폴더를 GitHub 저장소 루트에 업로드하면 됩니다.

## 업로드 순서

1. GitHub에서 새 저장소를 만듭니다.
2. `github-pages-upload` 폴더 안의 파일과 폴더를 모두 업로드합니다.
3. 저장소에서 `Settings` -> `Pages`로 이동합니다.
4. `Build and deployment`를 `Deploy from a branch`로 설정합니다.
5. Branch는 `main`, 폴더는 `/root`로 선택하고 저장합니다.
6. 몇 분 뒤 표시되는 Pages 주소로 접속합니다.

## 꼭 포함해야 하는 파일

- `index.html`
- `app.js`
- `style.css`
- `survey.html`
- `resources.html`
- `.nojekyll`
- `assets/images/` 폴더 전체

## 참고

업로드 폴더는 모바일 로딩 속도를 위해 WebP 이미지를 중심으로 정리했습니다. 원본 PNG는 작업용 `home-safety-game/assets/images/` 폴더에 보관되어 있고, GitHub Pages 업로드에는 압축된 WebP 운영 이미지를 사용합니다.
