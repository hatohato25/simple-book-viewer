// アプリケーション状態管理
// このファイルで定義された変数と関数は、グローバルスコープで他のモジュールから参照されます

// アプリケーション状態（imageViewer.jsから参照）
// biome-ignore lint/correctness/noUnusedVariables: グローバル変数として他のモジュールから使用
const state = {
  images: [],
  currentPage: 0,
  totalPages: 0,
  offsetEnabled: false, // 見開き調整が有効かどうか
};

// DOM要素（imageViewer.js、app.jsから参照）
const elements = {
  dropZone: null,
  loading: null,
  viewer: null,
  pageRight: null,
  pageLeft: null,
  clickAreaPrev: null,
  clickAreaNext: null,
  btnReset: null,
  btnOffset: null,
  bottomControls: null,
  seekbarContainer: null,
  seekbar: null,
  seekbarCurrent: null,
  seekbarTotal: null,
};

// シークバー状態（imageViewer.jsから参照・再代入するためletで宣言）
// biome-ignore lint/style/useConst: 再代入が必要なためletを使用
// biome-ignore lint/correctness/noUnusedVariables: グローバル変数として他のモジュールから使用
let seekbarHideTimer = null;

// DOM要素の初期化（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function initElements() {
  elements.dropZone = document.getElementById("drop-zone");
  elements.loading = document.getElementById("loading");
  elements.viewer = document.getElementById("viewer");
  elements.pageRight = document.getElementById("page-right");
  elements.pageLeft = document.getElementById("page-left");
  elements.clickAreaPrev = document.getElementById("click-area-prev");
  elements.clickAreaNext = document.getElementById("click-area-next");
  elements.btnReset = document.getElementById("btn-reset");
  elements.btnOffset = document.getElementById("btn-offset");
  elements.bottomControls = document.getElementById("bottom-controls");
  elements.seekbarContainer = document.getElementById("seekbar-container");
  elements.seekbar = document.getElementById("seekbar");
  elements.seekbarCurrent = document.getElementById("seekbar-current");
  elements.seekbarTotal = document.getElementById("seekbar-total");
}

// ローディング表示/非表示（imageViewer.js、pdfViewer.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function showLoading() {
  elements.loading.classList.remove("hidden");
}

// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function hideLoading() {
  elements.loading.classList.add("hidden");
}
