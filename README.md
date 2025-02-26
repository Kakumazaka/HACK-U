# 同棲彼女からのお使いメモ
![Image](https://github.com/user-attachments/assets/def738fe-d151-4132-ba8b-9acf20465b43)
- [発表スライドはこちら](https://www.canva.com/design/DAGRG-ZJbtA/Ni4mGHB5DEEIhurEOsnjSA/edit)
- [デモ動画はこちら(音でます！)](https://drive.google.com/file/d/1N8QG7fGLCDmdEzANq-Pex-fPUQuixr5P/view?usp=drive_link)
## 概要
消耗品がなくなりそうになったときに買い物メモに追加し、VRアバターが買い物メモを読み上げてくれるサービスです。  
消耗品は登録する必要があり、
- 手動で追加
- バーコードを読み込んで追加

の2パターンがあります。  
追加の際に消費期間を設定し、期間が過ぎると自動的に買い物メモに追加されます。

## 目的
何がなくなりそうか考えたり、買い物に行く気が起きなかったりというような買い物の面倒な部分をサポートするアプリを作ること。  
審査員賞とハッピーハッキング賞というハッカソン参加者の最多投票賞の2つの賞があり、ハッピーハッキング賞をとることを目指した。

## 使用技術
- Next.js
- Express.js
- PostgreSQL

## 機能一覧
Aituberkitの手を加えていない部分の機能は除きます。
- メモ読み上げ機能
    - VoiceVox nemo読み上げボイス連携機能
- メモ編集機能
    - メモの手動追加機能
    - 消耗品のメモ自動追加機能
- バーコード読み取り機能
    - 消耗品登録機能
    - 読み取った消耗品をメモから自動削除機能

## シーケンス図
```mermaid
sequenceDiagram
    participant User as ユーザー
    participant FE as フロントエンド
    participant BE as バックエンド
    participant DB as データベース
    participant ChatVRM as ChatVRMアバター

    User->>FE: メモ入力 (商品名, 使い切り期間)
    FE->>BE: メモ送信リクエスト (POST /memo)
    BE->>DB: メモと期間を保存
    DB-->>BE: 保存成功レスポンス
    BE-->>FE: 保存成功レスポンス
    FE-->>User: 保存完了メッセージ表示

    User->>FE: 保存されたメモの確認
    FE->>BE: メモ取得リクエスト (GET /memo)
    BE->>DB: メモ取得
    DB-->>BE: メモデータ返却
    BE-->>FE: メモデータ返却
    FE-->>User: メモ一覧表示

    User->>FE: 商品名の読み上げリクエスト
    FE->>BE: 商品名取得リクエスト (GET /products)
    BE->>DB: 商品名取得
    DB-->>BE: 商品名データ返却
    BE-->>FE: 商品名データ返却
    FE->>ChatVRM: 商品名を読み上げるリクエスト
    ChatVRM-->>User: 商品名の読み上げ

    User->>FE: 商品のバーコードをスキャン
    FE->>BE: バーコード情報送信 (POST /scan)
    BE->>DB: バーコードに基づく商品確認
    DB-->>BE: 商品データ返却 (使い切り期間の確認)
    BE->>DB: 商品をメモから削除
    DB-->>BE: 削除成功レスポンス
    BE-->>FE: 削除成功レスポンス
    FE-->>User: 商品がメモから削除されました通知

    note over BE, DB: 定期的な処理として、バックエンドがDBを参照
    BE->>DB: 使い切り期間経過した商品を確認
    DB-->>BE: 期間経過した商品を取得
    BE->>DB: 自動メモ追加処理
    DB-->>BE: 保存成功レスポンス
    BE-->>User: メモに商品が自動追加されました通知
```
