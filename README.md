# 理科シミュレーション

中学化学の主要単元を、操作しながら確認できる研究用Web教材です。

## ページ構成

- `index.html`：サイト概要と中学化学ページへの入口
- `chemistry.html`：中学1〜3年の全シミュレーション

`chemistry.html`では、学年・単元を切り替えてもページ全体を再読み込みしません。URLのハッシュだけを変更し、JavaScriptで表示内容を差し替えます。

例：

- `chemistry.html#density`
- `chemistry.html#particles`
- `chemistry.html#neutralization`

## 収録単元

### 中学1年

- 密度と物質の区別
- 気体の性質
- 溶解度と結晶
- 粒子運動・状態変化

### 中学2年

- 質量保存の法則
- 酸化と還元

### 中学3年

- イオンと沈殿
- 電気分解
- 化学電池
- 酸・アルカリと中和

## ファイル構成

- `index.html`
- `chemistry.html`
- `style.css`
- `chemistry.css`
- `site.js`
- `chemistry.js`

外部ライブラリやUnity WebGLは使用していません。各単元には、教科書に合わせた文章を追加するための「教科書による解説」欄を用意しています。
