# PoC

## Install と git hooks の設定

```
git clone git@github.com:DeCartography/PoC.git
yarn install
yarn simple-git-hooks
```

## コマンドの実行

yarn workspaces を用いてサブモジュール管理を行っているため、

```
yarn workspace frontend [コマンド名]
yarn workspace functions [コマンド名]
```

などのように workspace を指定し、該当`workspace`内のコマンドを用いる。例: `yarn workspace frontend preview`
root ディレクトリではなく、直接`packages/*/`に入ってコマンドを打つのであれば、該当パッケージの`package.json`を参照すれば良い。
