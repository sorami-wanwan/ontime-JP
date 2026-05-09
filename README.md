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

> [!NOTE]
> 以下は上流プロジェクト (cpvalente/ontime) の公式リリースへのリンクです。
> ontime-JP の独自ビルドについては、今後 [Releases](https://github.com/sorami-wanwan/ontime-JP/releases) ページで提供予定です。

- <a href="https://github.com/cpvalente/ontime/releases/latest/download/ontime-win64.exe">Windows</a>
- <a href="https://github.com/cpvalente/ontime/releases/latest/download/ontime-macOS-arm64.dmg">macOS (Apple Silicon)</a>
- <a href="https://github.com/cpvalente/ontime/releases/latest/download/ontime-macOS-x64.dmg">macOS (Intel)</a>
- <a href="https://github.com/cpvalente/ontime/releases/latest/download/ontime-linux-x86_64.AppImage">Linux (Intel / AMD 64-bit)</a>
- <a href="https://github.com/cpvalente/ontime/releases/latest/download/ontime-linux-arm64.AppImage">Linux (ARM 64-bit, Raspberry Pi 4+)</a>
- <a href="https://github.com/cpvalente/ontime/releases/latest/download/ontime-linux-armv7l.AppImage">Linux (ARM 32-bit, 旧 Raspberry Pi)</a>

その他のインストール方法：

- <a href="https://hub.docker.com/r/getontime/ontime">Docker Hub</a>
- <a href="https://www.npmjs.com/package/@getontime/cli">NPM</a>
- <a href="https://formulae.brew.sh/cask/ontime">Homebrew</a>

---

## 使い方

### はじめに

ソースからビルドして使用する場合は、[開発ドキュメント](./DEVELOPMENT.md)のセットアップ手順を参照してください。

また、上流プロジェクトの[クラウドサービス](https://getontime.no)を使えば、インスタンスをすぐに立ち上げてインターネット経由で共有できます。

ローカルで実行する場合は、Ontime と同じネットワーク上のあらゆるデバイスからアクセスできます。

詳しい使い方は[公式ドキュメント（英語）](https://docs.getontime.no)をご覧ください。

---

## ヘルプ・サポート

ほとんどの内容は公式ドキュメントでカバーされていますが、それでも解決しない場合は以下をご利用ください：

- [GitHub Issue でバグ報告](https://github.com/sorami-wanwan/ontime-JP/issues)
- [GitHub Discussions で質問](https://github.com/cpvalente/ontime/discussions)（上流プロジェクト・英語）
- [Discord サーバー](https://discord.com/invite/eje3CSUEXm)でチャット（上流プロジェクト・英語）

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
