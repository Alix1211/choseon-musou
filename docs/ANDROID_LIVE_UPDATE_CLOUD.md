# 2026-10-30 · 채찍 근접화, 모바일 온라인 업데이트 및 Google Drive 백업

## 요청 및 적용
- 기술명(채찍 기존 7연속기 및 액티브 2개), 107개 음성, 능력치 및 실제 근접 타격 범위는 **변경하지 않음**.
- 기존 전격 광선/원거리 번개줄기(fx bolt) 효과 제거. 채찍은 검보다 넓은 **205px** 근접 범위(검 146px), 기본 타격 계수 **0.85**를 유지.
- Android 앱은 시작 시 사용자 확인된 **mobile-live** 브랜치 index.html을 HTTPS로 검사해 불러온다. 다음 시작 시 갱신되며 전투 중 강제 새로고침 하지 않는다.
- 원격 HTML은 WebViewAssetLoader의 **appassets.androidplatform.net 동일 origin**으로 노출해 기존 localStorage `choseon_musou_v2`를 유지한다.
- 인터넷/HTTP/검증 실패 시 최근 정상 업데이트 캐시 → APK 내장 index.html 순으로 실행. 미확인 GitHub Pages URL을 사용하지 않는다.
- Android 타이틀 화면 '설정'과 전투 일시정지에서 **Drive에 백업 / Drive에서 복원** 버튼 제공.
- Android Storage Access Framework 파일 선택 창에서 **Google Drive**를 직접 선택한다. Google Drive 로그인 비밀번호를 앱에 저장하지 않는다.
- 첫 저장 파일 선택 후 해당 URI를 유지하고, 2분마다 게임 저장 백업을 갱신한다. 동기화가 아니라 **1개 파일의 백업**이다.
- 복원은 사용자의 확인을 받아 현재 로컬 저장을 `choseon_backup_before_drive_restore`에 먼저 복사한다. 별도 기기/동시 변경의 3-way 충돌 병합은 미지원.
- 스토리 진행 localStorage, 음량 설정, 기본 서비스 컷 IndexedDB Blob을 JSON에 기록한다. 사용자가 외부 폴더에서 고른 일러스트 파일은 원본 폴더를 직접 관리한다.

## 업데이트 배포 절차
1. 개발은 `gpt-gimmicks` 브랜치에서 수정·검증한다.
2. 승인된 변경만 `mobile-live` 브랜치에 올린다. APK 재설치 없이 **앱을 완전히 종료하고 재실행하면** 최신 HTML을 가져온다.
3. **Java, Manifest, Android 엔진 변경**은 여전히 APK 재설치(동일 서명 덮어쓰기) 필요.
4. 새로운 이미지나 MP3 파일을 추가/변경하는 작업은 구버전 APK의 내장 자원과 다를 수 있으므로, 별도 파일 배포 검증 및 필요 시 APK 재빌드 필수.
5. GitHub Pages 활성화는 필요하지 않다. 원격 코드는 GitHub의 raw.githubusercontent.com/mobile-live/index.html에서 읽는다.

## 필수 보안/저장 주의
- 프로그램은 Google Drive 원격 API에 직접 로그인하지 않는다. 파일 선택 창의 Drive 공급자가 설치/활성화되어 있어야 Google Drive 저장 경로가 나타난다.
- 복원은 기존 데이터 변경 전 반드시 명시적 승인. 가정용 여러 기기에서 동시 자동 복원/동기화는 안 한다.
- `index.html`은 `_new/p2.py` 생성 결과다. 다음 스테이지 제작에서 **현재 온라인/음성/채찍/버튼 수정이 재생성으로 사라지지 않게 생성기와 반드시 동기화**할 것.
- 개인정보 및 저장 파일은 공개 GitHub에 올리지 않는다. 앱 데이터는 단말 및 사용자가 지정한 Drive 파일에만 저장한다.
