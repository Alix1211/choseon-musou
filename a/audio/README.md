# 소리 출처와 연결

사용자가 직접 제공하고 배치를 지정한 BGM 원본:

- `bgm/title.mp3`: zhenyavegasmusic-chinese-epic-dance-background-434215.mp3 — 메인
- `bgm/camp.mp3`: antipodeanwriter-chinese-oriental-tune-05-12063.mp3 — 병영·시나리오·결과
- `bgm/battle.mp3`: seaeagle_music-the-battle-is-near-flute-170235.mp3 — 일반·보스 전투

원본은 바꾸지 않고 게임용 복사본만 128kbps, 44.1kHz, loudnorm I=-18/TP=-1.5/LRA=11로 변환했다. 보스 전용 4번째 곡은 이번 첨부에 없어 추가하지 않았다.

효과음은 사용자 지정 골든퀘스트 `Alix1211/ARPG`, 커밋 `414096eaf187ffd98884556428b8245b97847fa6`, `assets/sfx/`에서 그대로 복사했다. 공격=swing, 돌진=thrust, 내려베기=slash, 회전=spin, 부채=staff, 명중=hit, 피격·일반 처치=punch, 보스 처치·장수 제압=explosion, 구출·합류=heal. teleport는 후속 연결용으로 함께 보관한다.

실행 코드는 `_new/m3_audio.js`, 빌드 연결은 `_new/p2audio.py`. 첫 터치/키 입력 뒤 재생하며 일시정지·백그라운드에서 BGM을 멈춘다. 메뉴·일시정지 화면의 배경음/효과음 버튼은 각각 설정을 저장한다. 오디오 경로는 페이지 URL 기준으로 계산해 시험본의 이미지 전용 base 주소와 분리한다.
