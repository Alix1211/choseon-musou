# 초선무쌍 Android / ARPG 표준 이식 현황

> 2026-10-30 기준. 기존 기획 메모를 실제 코드 상태로 갱신. **단위 검사와 실제 기기 동작은 반드시 구분**한다.

## 현재 구현

- 고정 디버그 서명과 증가 버전 코드, 기존 `com.kane.choseonmusou` 앱 ID 유지.
- `mobile-live` 최신 HTML을 다음 실행 때 같은 `appassets.androidplatform.net` origin에서 가져오고, 실패 시 로컬 HTML 사용.
- 게임 저장 키 `choseon_musou_v2`, 사운드 `choseon_audio`, 기본 일러스트 `choseon_cut` 유지.
- **2026-10-30 ARPG Drive 표준 이식 완료(코드)**: `SaveSyncDecider.java`, `SaveSyncManager.java`, `_new/m3_sync.js`/inlined `index.html` 구현. v0.8의 단방향 `autoBackup` 코드 제거.
- 기준 문서 `docs/standards/drive_save_sync.md`는 `Alix1211/ARPG/docs/standards/drive_save_sync.md`와 동일 내용/동일 Git Blob SHA(`24d3f5dab8241b1b0947a4afca376105272acc2d`).
- 저장할 때는 원격 파일을 재조회하지 않고 쓰기만 함. 앱 시작·복귀·온라인 재연결·`지금 동기화`에서 읽음. 이 실행에서 아직 비교하지 못했다면 최초 쓰기 전에 읽어 맞춤.
- 고르는 동안 파일 쓰기와 웹 저장 차단, 충돌 진행 비교(레벨·스테이지·금화·저장 시각), 선택 후 확인. 기존 JSON 묶음 형식과 저장 시각을 원격 적용에서 변경하지 않음.
- 신규 파일 연결 시 `baseT=-1`; 기존 v0.8 URI도 유지하되 기존 기준을 모르는 것으로 시작.
- 변경한 소스 생성기 `_new/p2sync.py`와 `_new/m3_sync.js`에 기록. 소스 생성의 전 범위 회귀는 별도 검증 필요.
- APK v0.9는 음성 107개를 내장해 별도로 서명했으며, v0.8과 동일 서명 인증서를 확인함.

## 검사 완료

- GitHub Actions run `41052285901`: ARPG `decide` 이식의 Java 단위 검사 16개 PASS, 정적 배선 검사 PASS, Android 컴파일 PASS, APK 서명 확인 PASS.
- 브라우저 **Native 브리지 모의 시험**: 충돌 표시·취소 시 호출 없음·선택 요청·저장 게이트 유지, 스크립트 오류 없음. 실제 Android나 Google Drive를 대신하지 않음.

## 확인 못 함

- Android 태블릿에서 선택한 Google Drive 파일의 실제 읽기·쓰기·동기화.
- 두 실제 기기 간 충돌/취소/재선택, 느린 Drive 공급자, 깨진 파일의 실제 복구.
- 기기 저장/기본 일러스트 유지, 네트워크 장애·앱 백그라운드 복귀에 대한 실기 회귀.
- 네이티브 진동 브리지(ARPG의 구현은 아직 이식하지 않음).

## 조작

1. v0.9 APK를 **기존 앱 위에 덮어쓰기 설치** (기존 앱 삭제 금지).
2. 첫 기기: 시작 화면 **설정 → Drive 파일 연결 → 새 저장 파일 만들기**. Android 파일 선택 화면에서 Google Drive 위치 선택.
3. 두 번째 기기: **설정 → Drive 파일 연결 → 기존 저장 파일 연결**. 같은 계정의 **똑같은 파일** 선택.
4. 충돌 선택창은 한쪽을 고르고 다시 확인하기 전까지 파일과 게임 저장을 중단한다.

## 표준 원칙

- 늦은 저장 시각으로 다른 기기 진행을 자동 덮어쓰지 말 것. 반드시 `baseT` 기준.
- 선택 충돌 상태에서 강제 쓰기/자동 진행 금지.
- 쓰기 Future를 타임아웃 중 취소하지 말 것.
- Drive 공급자의 업로드 지연을 실시간 동기화 성공으로 보고하지 말 것.
- 완성된 기능은 단위 검사 결과와 실기 검증 상태를 별도로 표기할 것.
