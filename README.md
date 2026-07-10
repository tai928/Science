# Science Lab

研究用の理科教材シミュレーションサイトです。

## 教材

- 中和反応シミュレーション
  - HCl / NaOH の体積と濃度を変更
  - pH、液性、BTB溶液の色を即時表示
  - H⁺、OH⁻、H₂O、Na⁺、Cl⁻を模式的に可視化
- 粒子運動・状態変化シミュレーション
  - 固体・液体・気体の粒子モデルを比較
  - 温度による運動の変化を表示
  - 軌跡表示、一時停止に対応

## 構成

外部ライブラリやUnity WebGLを使用せず、HTML / CSS / JavaScriptのみで動作します。

- `index.html` 教材一覧・研究概要
- `first.html` 中和反応
- `second.html` 粒子運動・状態変化
- `neutralization.js` 中和反応の計算・描画
- `particles.js` 粒子運動の計算・描画
- `site.js` 共通ナビゲーション
- `style.css` 共通デザイン

既存のUnityビルドファイルはロールバック用に残していますが、新しいページからは参照していません。
