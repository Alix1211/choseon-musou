# 초선무쌍 Android 자동 업데이트 / 저장 / 진동 개선 작업 메모

> 2026-10-30 사용자가 원하는 기준: ARPG처럼 작은 게임 수정은 매번 APK 재설치 없이 적용. 기존 저장 보존, 태블릿 진동 연결. **아래 미구현 사항을 완료했다고 말하지 말 것.**

## 현재 확인된 구현
- 앱 ID: com.kane.choseonmusou; Android MainActivity: android/app/src/main/java/com/kane/choseonmusou/MainActivity.java
- 앱은 APK 안의 https://appassets.androidplatform.net/assets/index.html만 불러온다. 웹 코드 갱신에도 APK 재설치가 필요한 구조.
- 고정 테스트 서명(android/choseon-test.keystore)과 자동 증가 versionCode는 적용돼 있다. **동일 서명 APK는 기존 앱에 덮어쓰기로 설치**한다.
- 로컬 저장: localStorage 키 choseon_musou_v2. 소리 설정: choseon_audio. 기본 서비스 컷: IndexedDB choseon_cut.
- 임의 선택 일러스트 폴더 UI.cutFiles는 Object URL 임시 목록이라 앱 재시작 후에는 유지되지 않는다. WebView의 폴더 선택 및 하위 폴더 열거를 위해 Android SAF를 검토한다.
- 현재 진동은 주로 index.html의 cutThump -> navigator.vibrate에 의존한다. ARPG형 네이티브 진동 브리지는 없다.
- 음성 107개는 사용자가 받은 v0.7 APK에 내장. GitHub 저장소와 GitHub Pages에 107개 MP3의 영속적인 전체 사본이 아직 배포되지 않았다.

## 실제 참고한 ARPG 코드
- Alix1211/ARPG/android/app/src/main/java/com/alix/arpg/MainActivity.java: 온라인 GitHub Pages 게임 우선, 연결 실패 시 로컬 예비판; SharedPreferences 저장 미러; Java Vibrator/VibrationEffect 브리지; SAF 백업.
- Alix1211/ARPG/src/town/save_sync.js 및 docs/standards/drive_save_sync.md: 기준 저장(baseT)에 의한 3방향 충돌 판단. 단순한 최신 저장 시각 우선은 금지.
- Alix1211/ARPG/android/app/build.gradle: 서명 키 고정, 빌드마다 versionCode 증가.
- Alix1211/ARPG/.github/workflows/android-apk.yml: app-latest GitHub Release에 동일 다운로드 주소로 최신 APK 제공.

## 구현 순서 (모두 후속 작업, 현재 미완료)
1. 초선무쌍 GitHub Pages 주소 및 모든 그림/음성 에셋 경로를 실제 접속으로 검증한다. 현재 https://alix1211.github.io/choseon-musou/ 은 접속 검증되지 않았다. 확인 전 원격 모드 강제 전환 금지.
2. **저장 보호가 최우선**: WebView appassets origin과 GitHub Pages origin은 서로 다른 localStorage/IndexedDB 공간이다. v0.7의 레벨, 장비, 인벤토리, 스테이지, 오디오 설정, 기본 일러스트를 네이티브 저장 미러와 마이그레이션으로 보존한다. 이 절차 없이 주소를 바꾸면 새 게임처럼 보일 위험이 있다.
3. 온라인 새 게임 페이지 우선 + APK 속 로컬 판은 네트워크 장애 시 백업. 사용자가 플레이 중인 스테이지를 강제 새로고침하지 않음. 대용량 음성 파일도 온라인 판에서 모두 사용 가능한지 확인.
4. AndroidManifest VIBRATE 권한과 Java VibratorManager/VibrationEffect 브리지를 도입한다. JS 진동 우선순위/강도/중복 호출 방지/일시정지/설정 저장을 ARPG 구현과 동일한 원칙으로 검증한다.
5. 필요 시 Google Drive SAF 파일 기반 백업을 추가하되 ARPG의 baseT 충돌 규칙을 그대로 따른다. 사용자 확인 없이 드라이브 진행과 기기 진행을 덮어쓰지 않는다.
6. 정식 게임 코드 수정은 웹으로 즉시 배포하되, Android 셸이 바뀌는 경우에만 고정 서명 APK를 만든다. APK는 최신 릴리스에 직접 다운로드 가능한 단일 파일로 게시한다. 실제 음성 포함 완료 파일만 배포.

## 필수 검증
- v0.7에서 신규 방식으로 전환한 뒤 저장 상태, 소리 설정, 일러스트 기본컷 그대로 유지
- 네트워크 차단/느림/Pages 404/에셋 404에서 로컬 게임 실행 및 저장 유지
- 실행 중 강제 갱신 없음, 다음 실행 때 최신 웹 코드 적용 확인
- 아이플레이70 mini Pro 태블릿에서 타격/피격/필살기 진동, 꺼짐, 취소 시험
- 사용자 승인 없이 진행 초기화나 개인 자료 공개 금지

## 별도 주의
- index.html은 _new/p2.py의 생성 결과다. 장기적인 JS 수정은 원본 생성기에도 반영해야 재생성 시 유지된다.
- 테스트 서명 키는 공개 저장소에 있으므로 정식 앱 배포에 사용하면 안 된다.
