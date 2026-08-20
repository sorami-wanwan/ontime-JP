[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/cpvalente)

# Ontime — 日本語版 (ontime-JP)

**ontime-JP** は、ライブイベント向けタイムキーパー [Ontime](https://github.com/cpvalente/ontime) の日本語ローカライズ版フォークです。

UI の翻訳、ドキュメントの日本語化を通じて、日本語環境でのスムーズな導入と運用を目指しています。

> [!NOTE]
> **AI コーディングについて**
> このリポジトリの開発には [Google Antigravity](https://antigravity.google/) を活用した AI コーディングを使用しています。コミット履歴やプルリクエストに AI 生成のコードが含まれる場合があります。

---

## Ontime とは

Ontime は、ブラウザベースのイベント進行管理アプリケーションです。

イベントの進行表（ランダウン）管理、スケジュール追跡、オートメーション、部署間の情報共有をひとつのプラットフォームで実現します。

Ontime は映像エンジニアやエンターテインメント技術者によって開発され、以下のような現場で活用されています：

- カンファレンス・セミナーの運営
- ツアー公演・受け入れ会場
- 放送局・ライブ配信
- 劇場・オペラハウス
- 礼拝施設

## 主な機能

- **マルチプラットフォーム**: Windows、macOS、Linux、Docker で動作します
- **あらゆるデバイスで利用可能**: ブラウザがあれば、タブレット、スマートフォン、ノート PC、サイネージなどからアクセスできます
- **チームコラボレーション**: ディレクター、オペレーター、バックステージ、サイネージ向けの専用ビューを備えています
- **リアルタイム更新**: ランタイムの遅延を即座に管理・共有できます
- **自動化対応**: オペレーターによる手動操作、またはシステムクロックを使ったスタンドアロン運用が可能です
- **柔軟な連携**: OSC、HTTP、WebSocket の各 API や [Companion モジュール](https://bitfocus.io/connections/getontime-ontime)を使い、vMix・disguise・Qlab・OBS などと連携できます

### ライブ環境のために

Ontime はライブ環境での使用を前提に設計されています。
柔軟性が高く、さまざまなワークフローに効率的に組み込むことができます。

### チームのために

Ontime に登録されたすべての情報は、制作チームやワークフロー上の他のソフトウェア・ハードウェアと共有されます。
キューシートやオペレーター向け、パブリック・プロダクション向けの専用ビューにより、チームコラボレーションが向上します。

### シンプルなインフラ

すべてのデータはネットワーク経由で配信されるため、柔軟かつ低コストなインフラ構成が可能です。
Docker イメージを利用すれば、IT インフラを活用してチームやクライアントにオンラインで Ontime を提供することもできます。

![エディタ画面](https://github.com/cpvalente/ontime/blob/master/.github/aux-images/editor.png)

![ビュー一覧](https://github.com/cpvalente/ontime/blob/master/.github/aux-images/ontime-overview.webp)

[ドキュメントを読む（英語）](https://docs.getontime.no)

---

## ダウンロード

ontime-JP の最新インストーラは [Releases ページ](https://github.com/sorami-wanwan/ontime-JP/releases) からダウンロードできます。

- <a href="https://github.com/sorami-wanwan/ontime-JP/releases/latest/download/ontime-win64.exe">Windows (.exe)</a>
- <a href="https://github.com/sorami-wanwan/ontime-JP/releases/latest/download/ontime-macOS-arm64.dmg">macOS Apple Silicon (.dmg)</a>
- <a href="https://github.com/sorami-wanwan/ontime-JP/releases/latest/download/ontime-macOS-x64.dmg">macOS Intel (.dmg)</a>
- <a href="https://github.com/sorami-wanwan/ontime-JP/releases/latest/download/ontime-linux-x86_64.AppImage">Linux x86_64 (.AppImage)</a>
- <a href="https://github.com/sorami-wanwan/ontime-JP/releases/latest/download/ontime-linux-arm64.AppImage">Linux ARM64 (.AppImage)</a>
- <a href="https://github.com/sorami-wanwan/ontime-JP/releases/latest/download/ontime-linux-armv7l.AppImage">Linux ARMv7l (.AppImage)</a>

> [!NOTE]
> 上流プロジェクト（公式英語版）のその他のインストール方法：
>
> - <a href="https://hub.docker.com/r/getontime/ontime">Docker Hub</a>
> - <a href="https://www.npmjs.com/package/@getontime/cli">NPM</a>
> - <a href="https://formulae.brew.sh/cask/ontime">Homebrew</a>

### 初回起動時のセキュリティ警告について

ontime-JP の独自ビルドはオープンソースコミュニティ版のため、有償のコード署名を行っていません。そのため、初回起動時に各 OS で警告が表示される場合があります。以下の手順で起動してください。

- **macOS の場合**:
  - 「開発元を検証できないため開けません」または「悪質なソフトウェアかどうかを検証できないため開けません」と表示された場合：
    1. Finder でアプリケーションフォルダを開きます。
    2. `ontime` を **Control キーを押しながらクリック（または右クリック）** し、メニューから **「開く」** を選択します。
    3. 確認ダイアログで **「開く」** をクリックすると、次回以降は通常通り起動できます。
    4. それでも起動しない場合は、ターミナルで `xattr -cr /Applications/ontime.app` を実行してください。
- **Windows の場合**:
  - Microsoft Defender SmartScreen により「Windows によって PC が保護されました」という青い画面が表示された場合：
    1. 画面内の **「詳細情報」** をクリックします。
    2. 右下に表示される **「実行」** ボタンをクリックします。
- **Linux の場合**:
  - ダウンロードした `.AppImage` ファイルに実行権限を付与してください：
    ```bash
    chmod +x ontime-linux-*.AppImage
    ./ontime-linux-*.AppImage
    ```
  - ※ Ubuntu 22.04 以降で AppImage が起動しない場合は、`sudo apt install libfuse2` が必要になる場合があります。

---

## データ互換性と移行について

- ontime-JP は、公式版 Ontime と同一のデータ保存場所（プロジェクト設定やデータベース）を使用します。
- 公式版から ontime-JP への移行時は、既存のプロジェクトデータがそのまま読み込まれます。
- 大切な本番イベントデータをお持ちの場合は、念のため導入前に設定画面からプロジェクトデータのバックアップ（エクスポート）を行ってください。

---

## 使い方

### はじめに

ソースからビルドして使用する場合は、[開発ドキュメント](./DEVELOPMENT.md)のセットアップ手順を参照してください。

また、上流プロジェクトの[クラウドサービス](https://getontime.no)を使えば、インスタンスをすぐに立ち上げてインターネット経由で共有できます。

ローカルで実行する場合は、Ontime と同じネットワーク上のあらゆるデバイスからアクセスできます。

詳しい使い方は[公式ドキュメント（英語）](https://docs.getontime.no)をご覧ください。

---

## ヘルプ・サポート

- **ontime-JP（日本語版）固有の問題（翻訳ミス・文字化け・UI崩れ・独自ビルドの不具合）**:
  - [ontime-JP GitHub Issues](https://github.com/sorami-wanwan/ontime-JP/issues) で報告してください。
- **Ontime 本体の基本機能・操作方法・API 連携に関する質問**:
  - [GitHub Discussions](https://github.com/cpvalente/ontime/discussions)（公式・英語）
  - [Discord サーバー](https://discord.com/invite/eje3CSUEXm)（公式・英語）

> [!IMPORTANT]
> **本番運用におけるご注意**  
> ライブイベントや放送等の本番現場で使用される場合は、事前にリハーサル環境にて十分な動作確認およびバックアップを行ってからご利用ください。

---

## 開発に参加する

ontime-JP はアクティブに開発中です。あらゆる形での貢献を歓迎します。

コードで貢献したい場合は、プルリクエストを開く前に Issue で議論してください。

プロジェクトのセットアップ方法は[開発ドキュメント](./DEVELOPMENT.md)に記載しています。

---

## リンク

- [Ontime 公式サイト（英語）](https://getontime.no)
- [公式ドキュメント（英語）](https://docs.getontime.no)
- [ビデオチュートリアル（英語）](https://www.youtube.com/@ontimeapp)
- [Discord サーバー](https://discord.com/invite/eje3CSUEXm)
- [上流リポジトリ (cpvalente/ontime)](https://github.com/cpvalente/ontime)

---

## ライセンス

このプロジェクトは [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0) の条件に基づきライセンスされています。

## スポンサー

Ontime の開発を支援することができます。
寄付の詳細は上流プロジェクトの[寄付規約](https://github.com/cpvalente/ontime/blob/master/.github/FUNDING.md)をご参照ください。

<p align="center">
<br>
<a href="https://www.buymeacoffee.com/cpvalente" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200"></a>
</p>
