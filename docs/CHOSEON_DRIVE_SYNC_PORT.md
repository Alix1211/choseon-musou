# 초선무쌍의 ARPG Drive 저장 동기화 이식

기준 문서: [표준](standards/drive_save_sync.md) (ARPG의 파일을 글자 그대로 복사)
참조: `Alix1211/ARPG` `MainActivity.java` (`decide`, `requestSync`, `writeBackup`, `resolveConflict`, `parseRemote`, `writeDocument`), `src/town/backup.js`, `src/town/save_sync.js`.

- `SaveSyncDecider.java`의 `decide(lt,rt,bt)`는 ARPG와 조건·우선순위가 동일. Java 단위 검사 `tools/SaveSyncDeciderTest.java`.
- `SaveSyncManager.java`: SAF 영구 읽기/쓰기 URI, `baseT` 공유 설정 (`choseon_cloud`), 15초 읽기, 취소하지 않는 30초 대기 쓰기. 로컬 진척 저장은 읽지 않고 파일에 쓰기만 하며, 첫 저장 전 맞춤이 안 된 경우 최초 읽기.
- `_new/m3_sync.js`/내장 `index.html` 블록: Drive·기기 비교 창 (레벨/스테이지/금화/시각), 선택 확인, 취소 시 진행 보존, 저장 게이트, 재개 시 밀린 저장 1회 처리.
- 기존 v0.8 JSON 묶음 `{format:'choseon-musou-drive-backup',schema:1,createdAt,game,audio,defaultCut}` 유지. `game.t`는 기기 자체 진행 변경 시만 증가하고, 원격 가져오기·선택·이동에서 원본 시각을 새로 쓰지 않는다.
- **v0.8의 기존 파일 URI를 유지**하지만 `baseT=-1` 상태로 시작한다. 비교가 끝나기 전 무조건 파일을 덮어쓰지 않는다. 다른 기기에서는 `기존 저장 파일 연결`을 눌러 **동일한 파일**을 선택한다. 같은 이름의 새 파일을 별도로 만들면 동기화되지 않는다.
- 앱 시작·실제 복귀·네트워크 연결 복귀 및 사용자의 `지금 동기화`에서 읽고 맞춘다. 일반적인 저장 시 원격 파일을 다시 읽지 않는다.
- 기존 로컬 저장 키 `choseon_musou_v2`, 오디오 `choseon_audio`, 기본 일러스트 `choseon_cut`를 유지한다.
- 연결된 Google Drive 파일은 Android SAF 문서 공급자가 제공한다. 클라우드 반영이 느릴 수 있다. Google 로그인 정보나 API 키를 받지 않는다.
- **기기 검증 별도**: Google Drive 실제 계정 권한, 네트워크 단절, 파일 손상 복구, 여러 태블릿의 충돌 선택, WebView의 그림/게임 저장 등은 Java decide 단위 테스트만으로는 보장되지 않는다.
