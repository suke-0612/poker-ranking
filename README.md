ポーカーランキングアプリ 開発引き継ぎ書本ドキュメントは、ポーカーの大会における獲得点数ランキングを管理・表示するWebアプリケーションの開発要件および設計仕様をまとめたものです。1. プロジェクト概要目的: ポーカーのゲームごとの得点を記録し、最新のランキングおよび景品をリアルタイム（ポーリング）で画面に表示する。想定ユーザー:一般ユーザー（プレイヤー・観客）: 会場モニターや個人のスマホからアクセスし、ランキングを閲覧。管理者 (admin): 1名のみ。スマホまたはPCからスコア入力、マスタ管理を行う。2. 技術スタックフレームワーク: Next.js (App Router)ホスティング: Vercel (Hobbyプラン想定)データベース: Supabase (PostgreSQL)ORM: Prismaスタイリング: Tailwind CSS, shadcn/uiデータフェッチ: SWR (ランキング画面のポーリング用)3. インフラ・セキュリティ要件と実装上の注意点Vercelの無料枠およびサーバーレス環境の制約を回避するため、以下の対策を必ず実装すること。アクセス制御 (Basic認証):Next.js Middlewareを使用してBasic認証を実装する。適用範囲は /admin/:path* に限定し、閲覧用のルート (/ など) には認証処理を走らせないこと。ポーリングとAPIキャッシュ:ランキング画面はSWRを用いて定期的にデータフェッチを行う。ポーリング間隔は15〜30秒程度とする。Vercelの関数実行制限・DBアクセス過多を防ぐため、ランキング取得APIには数秒間のキャッシュ (Next.jsの revalidate) を設定すること。DB接続:サーバーレス環境からの接続枯渇を防ぐため、Prismaの接続先はSupabaseのコネクションプーリング用URL（Transaction mode等）を使用すること。4. データベース設計 (Prisma Schema想定)「リセット」要件を満たすため、物理削除ではなく「大会（Tournament）」の概念を用いた履歴保持型の設計とする。model User {
  id        Int      @id @default(autoincrement())
  username  String
  isActive  Boolean  @default(true) // 論理削除用
  createdAt DateTime @default(now()) // 同点時のソート保証用
  scores    Score[]
}

model Tournament {
  id        Int      @id @default(autoincrement())
  isActive  Boolean  @default(true) // 進行中の大会のみ true
  createdAt DateTime @default(now())
  prizes    Prize[]
  games     Game[]
}

model Prize {
  tournamentId Int
  rank         Int      // 1 〜 10
  description  String
  tournament   Tournament @relation(fields: [tournamentId], references: [id])

  @@id([tournamentId, rank])
}

model Game {
  id           Int        @id @default(autoincrement())
  tournamentId Int
  createdAt    DateTime   @default(now())
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  scores       Score[]
}

model Score {
  gameId Int
  userId Int
  score  Int    // 0以上の絶対値
  game   Game   @relation(fields: [gameId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@id([gameId, userId])
}
5. 機能要件・ビジネスロジック5.1 ランキング画面（閲覧用 / 一般アクセス可）UI仕様: 横長のPC画面に最適化すること（会場モニター用）。表示条件: 現在 isActive = true となっている Tournament の、最新の Game のスコア情報を表示する。表示件数: スコア上位10名。表示項目: 順位、ユーザー名、得点、景品（該当順位の Prize.description）。同点時の順位ロジック: * 同点の場合は同じ順位とする（例: 1位, 1位, 3位）。同順位内の表示順は、User.createdAt の昇順（古い順）とする。景品表示ロジック: 同点の場合も、システム側での山分け計算等は行わない。両者に同じ「X位の景品」の文字列を表示すること。5.2 スコア入力画面（管理者用 / /admin 配下）UI仕様: スマホ・PCレスポンシブ対応。入力方式:対象ユーザーをセレクトボックス等で選択（ここでの新規作成不可）。入力値は**絶対値（0以上）**の得点。バリデーション: フロントエンドで、得点が「0未満」になる入力を受け付けないようにする。ゲーム（回）の管理と引継ぎ（重要）:新しい Game のスコア入力枠を作成する際、システムは**「直前の Game の全 User の Score」を新しい Game の Score として自動でコピー・INSERT** すること。管理者は、点数が変動したユーザーの得点のみを更新して保存する運用とする（未参加・変動なしのユーザーは前回のスコアが維持される）。修正機能:過去の Game のスコアも修正可能とする。ただし、ランキング画面に影響を与えるのは「最新の Game のスコア」のみである。5.3 大会リセット機能（管理者用）現在の大会の全スコアを0に戻す「リセット」機能。処理内容: 1. 現在 isActive = true の Tournament を false に更新。2. 新しい Tournament を作成し、isActive = true に設定。※これにより、過去のデータは物理削除されず保持される。5.4 マスタ管理画面（管理者用 / /admin 配下）ユーザー管理:ユーザーの新規登録（username のみ）。ユーザーの論理削除（isActive = false への更新）。※過去のスコア参照エラーを防ぐため物理削除は厳禁。景品管理:現在アクティブな Tournament に対する、1位〜10位の景品（description）の登録・編集機能。