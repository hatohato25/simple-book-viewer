// アプリケーション状態管理
// このファイルで定義された変数と関数は、グローバルスコープで他のモジュールから参照されます

// アプリケーション状態（imageViewer.jsから参照）
// biome-ignore lint/correctness/noUnusedVariables: グローバル変数として他のモジュールから使用
const state = {
  images: [],
  currentPage: 0,
  totalPages: 0,
  offsetEnabled: false, // 見開き調整が有効かどうか
  currentFileId: null, // 現在開いているファイルの識別子
  currentFileName: null, // 現在開いているファイル名
  currentFileType: null, // 現在開いているファイルタイプ（"image" or "pdf"）
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
  btnFullscreen: null,
  btnBookmark: null,
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
  elements.btnFullscreen = document.getElementById("btn-fullscreen");
  elements.btnBookmark = document.getElementById("btn-bookmark");
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

// ブックマーク管理機能

// ファイル識別子を生成（ファイル名 + サイズ + 最終更新日時のハッシュ）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function generateFileId(fileName, fileSize, lastModified) {
  // 簡易的なハッシュ関数（本格的にはSHA-256等を使用すべき）
  const str = `${fileName}-${fileSize}-${lastModified}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return `file_${Math.abs(hash)}`;
}

// ブックマークを保存
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function saveBookmark(fileId, fileName, currentPage, totalPages, fileType) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "{}");
    bookmarks[fileId] = {
      fileName,
      currentPage,
      totalPages,
      timestamp: Date.now(),
      fileType,
    };
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    console.log(
      `[Bookmark] 保存しました: ${fileName} (ページ ${currentPage}/${totalPages})`,
    );
    return true;
  } catch (error) {
    console.error("[Bookmark] 保存エラー:", error);
    return false;
  }
}

// ブックマークを読み込み
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function loadBookmark(fileId) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "{}");
    const bookmark = bookmarks[fileId];
    if (bookmark) {
      console.log(
        `[Bookmark] 読み込みました: ${bookmark.fileName} (ページ ${bookmark.currentPage}/${bookmark.totalPages})`,
      );
      return bookmark;
    }
    return null;
  } catch (error) {
    console.error("[Bookmark] 読み込みエラー:", error);
    return null;
  }
}

// ブックマークが存在するかチェック
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function hasBookmark(fileId) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "{}");
    return fileId in bookmarks;
  } catch (error) {
    console.error("[Bookmark] チェックエラー:", error);
    return false;
  }
}

// ブックマークを削除
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function deleteBookmark(fileId) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "{}");
    if (fileId in bookmarks) {
      const fileName = bookmarks[fileId].fileName;
      delete bookmarks[fileId];
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      console.log(`[Bookmark] 削除しました: ${fileName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Bookmark] 削除エラー:", error);
    return false;
  }
}
