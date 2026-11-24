# 登録候補作品（未登録）

`dist/data.js` へ追加する前の調査メモ。ここに書いた作品はまだ公開索引に載っていない。

- 作成：2026-11-24（Claude）
- 公開URLの到達確認：**未実施**（この環境からは外部サイトへアクセスできなかった）
- このファイルは公開リポジトリにある。私的なURL、個人に結びつく情報、他人の名前は書かない。

## 調査の根拠と書き分け

| 区分 | 意味 |
|---|---|
| **確認済み** | GitHub上のファイルなど、今回この目で確認できたもの |
| **本人の記述** | 過去の制作会話で Ūrēi 本人が述べた内容。成果物そのものはまだ確認していない |
| **推測** | 上の二つから考えられるだけのこと。事実として扱わない |

## 横断的な発見（確認済み）

- `8viliv8/8viliv8.github.io` に、以前作った作品棚 **UREI / ATELIER** がある（最終コミット 2026-10-17）。
  - `data.js` に13件の作品が登録されている。その中には、この索引にまだない作品が含まれる：横濱寫眞、YOHAKU、OBSERVATION CONSOLE、PON / CUT、GRAINLAB、THRESHOLD / LINE / PAINT、APP DECK、粒子写真アプリ。
  - 状態の分類は「公開中／制作中／構想／要確認」。
  - 同じ内容の README が `8viliv8/Lens` の `atelier/` にもある。
  - ATELIER と母艦のどちらを正本にするか（統合、リダイレクト、併存）は未決定。
- `8viliv8/observation-console` には `luxury1912/` と `grainlab/` のほかに、`poncut-v09`〜`v13`、`threshold-line-*` がある。

## 候補一覧

### 1. 額装室（gakuso.html）
- **目的（本人の記述）**：写真やイラストに額縁とマットを合わせて試せるWebアプリ。読み込むときにトリミングなどの軽い編集もできる。
- **公開URL**：不明
- **ソースの所在**：不明。確認した4リポジトリ（Lens、8viliv8.github.io、observation-console、socializer）には `gakuso.html` がない。
- **確認済み**：なし
- **推測**：Claude Artifact か、チャット内のHTMLとして残っている可能性がある。
- **次に調べること**：会話やArtifactの一覧から `gakuso.html` を探す。YOHAKU（写真フレームアプリ）と役割が重なるかを整理する。

### 2. 映写機（eishaki.html）と派生の走馬灯（soumatou.html）
- **目的（本人の記述）**：
  - 映写機：暗い部屋で、カラカラ回る音、ちらつく映像、光に浮かぶ埃を体験するWebGL作品。
  - 走馬灯：手持ちの写真を読み込むと、断片的な写真コラージュとして壁に投影される派生版。
  - ほかに Fujicascope 風の版もある。映像はセピアではなくカラーにする方針。
- **公開URL**：不明
- **ソースの所在**：不明
- **確認済み**：ATELIER の `data.js` に「映写機」が「要確認・URL未登録」として載っている。ATELIER の README には「完成物URLは取得できていません」とある。
- **推測**：1作品として載せるか、映写機・走馬灯・Fujicascope版の系列として載せるかは未決定。
- **次に調べること**：最終版のHTMLがどこにあるか。各版の関係。Midjourney などの生成素材を使っている場合はクレジットの扱い。

### 3. 薄暮の橋（hakubo-bridge.html）
- **目的（本人の記述）**：夕暮れが終わりかける時間に、橋の上をドライブする体験をWebで再現する。
  - 版は「都会ver」と「田舎ver」。
  - 友人に見せるための版「A Long Drive」がある。曲が流れ、季節も変えられる構想。
- **公開URL**：不明
- **ソースの所在**：不明。A Long Drive は友人側の環境で開発を続けている。
- **確認済み**：なし
- **推測**：A Long Drive には友人の楽曲などが含まれるので、そのまま公開索引に載せるのは適さない可能性が高い。
- **次に調べること**：
  - 都会ver・田舎verの最終HTMLがどこにあるか
  - A Long Drive を載せてよいか（友人の楽曲と個人情報の扱い）
  - 生成素材のクレジット

### 4. 水辺 — Clearwater Pond（clearwater-pond.html）
- **目的（本人の記述）**：OSSの水面描画 Clearwater（github.com/Aureliengmz/clearwater）と three.js を使い、池のまわりを歩けるWebサイト。草木の質感を上げるために FABOTANIC の利用を検討していた。
- **公開URL**：不明
- **ソースの所在**：不明
- **確認済み**：なし（Clearwater本体のリポジトリも今回は確認していない）
- **推測**：制作途中の段階。IN DEVELOPMENT が妥当と思われる。
- **次に調べること**：
  - 最終HTMLがどこにあるか
  - Clearwater のライセンスとクレジットの表記
  - FABOTANIC素材を使った場合の利用条件
  - 参考作品として技術レーダーにも登録するか

### 5. SNS AUDIO SOCIALIZER
- **目的（本人の記述）**：ボイスメモを、SNS向けの音声と9:16の動画へブラウザ内だけで変換する（サーバーへ送らない）。iPhone Safari を優先する。DSPは VST3プラグイン SAYONARA へ移植されている。
- **公開URL**：README に「公開版は claude.ai のアーティファクトリンク」とあるが、URL自体は記載されていない。GitHub Pages は未確認。
- **ソースの所在**：**確認済み**。`8viliv8/socializer`（公開、`socializer.html` と `README.md`、最終コミット 2026-09-17）
- **確認済み**：リポジトリと README の内容（v0.1 の機能一覧、Web Audio / Canvas / MediaRecorder による実装）。
- **推測**：ソースはそろっているので、Pages を有効にすれば LIVE にできる見込み。
- **次に調べること**：
  - Artifact版のURL
  - リポジトリの版がArtifact版と同じか
  - 状態を LIVE と ARCHIVED のどちらにするか

### 6. LUXURY 1912（旧 LISSAJOUS）
- **目的（本人の記述）**：リサジュースコープ映像作品のためのブラウザ楽器。テキストや図形を音に変える図形オシレーターと、2系統の重ね合わせ・交互切替を持つ。
- **公開URL**：ATELIER の記録では `https://8viliv8.github.io/observation-console/luxury1912/` が 2026-10-16 にHTTP 200。今回のアクセス確認は**未実施**。
- **ソースの所在**：**確認済み**。`8viliv8/observation-console` の `luxury1912/index.html`（title：「LUXURY 1912 — XY signal instrument」）
- **確認済み**：ソースファイルがあること、タイトル。
- **推測**：OBSERVATION CONSOLE 系列の一作品として、LIVE で登録できる見込み。
- **次に調べること**：公開URLの到達確認。会話内の最終版（テキスト描画を気に入っていた版）とリポジトリの版が同じかどうか。

### 7. IMAENGINE（旧 WASH-INK）
- **目的（本人の記述）**：iPhoneの写真を、粒子の粗いモノクロのストリート写真風に変換する。
  - 処理の流れ：WASH → INK → BURN → GRAIN
  - 関連機能：Palette Memory / REPAINT、画像の粒子へデータを埋め込む Data Grain
  - PZP/AIQR 研究と系譜がつながっている。
- **公開URL**：ChatGPT側でホストしたURL（v0.4.2「SELECTIVE GRAIN」）の記録がある。ただし私的な識別子を含む可能性があるため、ここには書かない。
- **ソースの所在**：不明。確認した4リポジトリにはない。
- **確認済み**：ATELIER の `data.js` に「WASH–INK」が「要確認・URL未登録」として載っている。
- **推測**：まず SOURCE HUNTING で登録するのが妥当と思われる。
- **次に調べること**：
  - ChatGPT公開URLを母艦に載せてよいか
  - ソースの所在
  - 現行の版
  - ATELIER の「粒子写真アプリ」や GRAINLAB と同じ作品かどうか

## 次の段階での登録方針（案）

- 確認済みのソースや公開URLがあるもの（SOCIALIZER、LUXURY 1912）から登録する。
- それ以外は、状態を SOURCE HUNTING または IN DEVELOPMENT として登録する。
- 番号（`no`）は 05 から順に付け、以後は変えない。
- ATELIER にあってこの一覧にない作品（横濱寫眞、YOHAKU、OBSERVATION CONSOLE、PON / CUT、GRAINLAB、THRESHOLD / LINE / PAINT ほか）は、ATELIER との関係を決めてから扱う。
