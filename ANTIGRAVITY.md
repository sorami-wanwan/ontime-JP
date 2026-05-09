# Antigravity Rules & Guidelines

## 開発フロー (Development Workflow)

- **Pull Request (PR) 必須**: タスク実行時は直接 `master` ブランチに変更をPushせず、必ず新しい作業用ブランチを作成し、そこにPushした上でPull Request (PR) を作成すること。
- **PRの自動マージ禁止**: 作成したPRは決して自分でマージしてはいけません。ローカライズの正確性の確認や、CIの通過確認を含めたコードレビューを実施するため、PRは必ずオープンのままユーザーにレビューを依頼してください。
