// PDFビューアーモジュール
// このファイルで定義された関数は、グローバルスコープで他のモジュールから参照されます

// 先読み用の画像オブジェクトを保持
let pdfPreloadedImages = [];

// PDFビューアーの初期化（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function initPdfViewer() {
  // 初期化時は何もしない（PDF読み込み時にイベントを設定）
}

// 次と前のページを先読みする（PDF用：左→右読み）
function preloadAdjacentPdfPages() {
  // 既存の先読み画像をクリア
  pdfPreloadedImages = [];

  // 次の見開き（左→右読みなので +2, +3）
  const nextLeftIndex = state.currentPage + 2;
  const nextRightIndex = state.currentPage + 3;

  // 前の見開き（左→右読みなので -2, -1）
  const prevLeftIndex = state.currentPage - 2;
  const prevRightIndex = state.currentPage - 1;

  // 次のページを先読み
  if (nextLeftIndex >= 0 && nextLeftIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[nextLeftIndex];
    pdfPreloadedImages.push(img);
  }

  if (nextRightIndex >= 0 && nextRightIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[nextRightIndex];
    pdfPreloadedImages.push(img);
  }

  // 前のページを先読み
  if (prevLeftIndex >= 0 && prevLeftIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[prevLeftIndex];
    pdfPreloadedImages.push(img);
  }

  if (prevRightIndex >= 0 && prevRightIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[prevRightIndex];
    pdfPreloadedImages.push(img);
  }
}

// クリック領域のハンドラー（PDF用）
function handlePdfClickPrev() {
  navigatePdfPage(2); // 右側をクリック → 次のページ
  showControls();
}

function handlePdfClickNext() {
  navigatePdfPage(-2); // 左側をクリック → 前のページ
  showControls();
}

// マウスホイールのハンドラー（PDF用：左→右読み）
function handlePdfWheel(e) {
  // ビューアが非表示の場合は何もしない
  if (elements.viewer.classList.contains("hidden")) return;

  e.preventDefault();

  // deltaY > 0: ホイール下 → 次のページ（右へ進む）
  // deltaY < 0: ホイール上 → 前のページ（左へ戻る）
  if (e.deltaY > 0) {
    navigatePdfPage(2); // 次のページ
  } else if (e.deltaY < 0) {
    navigatePdfPage(-2); // 前のページ
  }

  showControls();
}

// フルスクリーンハンドラー（PDF用）
function handlePdfFullscreenClick() {
  togglePdfFullscreen();
}

function togglePdfFullscreen() {
  if (!document.fullscreenElement) {
    // フルスクリーンに入る
    elements.viewer
      .requestFullscreen()
      .then(() => {
        // 成功時の処理はfullscreenchangeイベントで行う
      })
      .catch((err) => {
        console.error("フルスクリーンの開始に失敗しました:", err);
      });
  } else {
    // フルスクリーンを終了
    document.exitFullscreen();
  }
}

function handlePdfFullscreenChange() {
  // フルスクリーン状態に応じてボタンのスタイルとタイトルを変更
  if (document.fullscreenElement) {
    elements.btnFullscreen.classList.add("active");
    elements.btnFullscreen.textContent = "⛶";
    elements.btnFullscreen.title = "最大化表示を終了";
  } else {
    elements.btnFullscreen.classList.remove("active");
    elements.btnFullscreen.textContent = "⛶";
    elements.btnFullscreen.title = "最大化表示";
  }
}

// ブックマークハンドラー（PDF用）
function handlePdfBookmarkClick() {
  if (!state.currentFileId) {
    console.warn("[Bookmark] ファイルIDが設定されていません");
    return;
  }

  // 既存のブックマークをチェック
  const bookmark = loadBookmark(state.currentFileId);

  if (bookmark && bookmark.currentPage === state.currentPage) {
    // 現在のページが保存されたページと一致する場合のみ削除
    if (deleteBookmark(state.currentFileId)) {
      updateBookmarkButton();
    }
  } else {
    // それ以外の場合は現在のページで上書き保存
    if (
      saveBookmark(
        state.currentFileId,
        state.currentFileName,
        state.currentPage,
        state.totalPages,
        state.currentFileType,
      )
    ) {
      updateBookmarkButton();
    }
  }
}

// イベントリスナーの初期化
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function setupPdfViewerEvents() {
  // クリック領域（ページ遷移とコントロール表示）
  // PDFは左から右に読むため、左=前、右=次
  // CSSでは click-area-prev=右側、click-area-next=左側のため、逆に設定
  elements.clickAreaPrev.addEventListener("click", handlePdfClickPrev);
  elements.clickAreaNext.addEventListener("click", handlePdfClickNext);

  // リセットボタン
  elements.btnReset.addEventListener("click", resetPdfViewer);

  // 見開き調整ボタン
  elements.btnOffset.addEventListener("click", togglePdfOffset);

  // 最大化ボタン
  elements.btnFullscreen.addEventListener("click", handlePdfFullscreenClick);

  // ブックマークボタン
  elements.btnBookmark.addEventListener("click", handlePdfBookmarkClick);

  // サムネイルボタン
  elements.btnThumbnail.addEventListener("click", toggleThumbnailOverlay);

  // サムネイルオーバーレイの閉じるボタン
  elements.thumbnailCloseBtn.addEventListener("click", closeThumbnailOverlay);

  // サムネイルオーバーレイ背景クリック
  elements.thumbnailOverlay.addEventListener(
    "click",
    handleThumbnailOverlayClick,
  );

  // フルスクリーン状態の変化を監視
  document.addEventListener("fullscreenchange", handlePdfFullscreenChange);

  // キーボード操作
  document.addEventListener("keydown", handlePdfKeydown);

  // ESCキーでサムネイルを閉じる
  document.addEventListener("keydown", handleThumbnailEscape);

  // マウスホイール操作
  document.addEventListener("wheel", handlePdfWheel, { passive: false });

  // ページコンテナクリックで表示
  const pageContainer = document.querySelector(".page-container");
  pageContainer.addEventListener("click", showControls);

  // コントロール領域での操作時はタイマーをリセット
  elements.bottomControls.addEventListener("mouseenter", keepControlsVisible);
  elements.bottomControls.addEventListener("mousemove", keepControlsVisible);
  elements.btnReset.addEventListener("mouseenter", keepControlsVisible);
  elements.btnOffset.addEventListener("mouseenter", keepControlsVisible);

  // シークバー操作
  elements.seekbar.addEventListener("input", handlePdfSeekbarInput);
  elements.seekbar.addEventListener("change", handlePdfSeekbarChange);

  // ドキュメント全体でクリックを監視
  document.addEventListener("click", handleDocumentClick);
}

// イベントリスナーの削除
function removePdfViewerEvents() {
  // クリック領域のイベントリスナーを削除
  elements.clickAreaPrev.removeEventListener("click", handlePdfClickPrev);
  elements.clickAreaNext.removeEventListener("click", handlePdfClickNext);

  // リセットボタン
  elements.btnReset.removeEventListener("click", resetPdfViewer);

  // 見開き調整ボタン
  elements.btnOffset.removeEventListener("click", togglePdfOffset);

  // 最大化ボタン
  elements.btnFullscreen.removeEventListener("click", handlePdfFullscreenClick);

  // ブックマークボタン
  elements.btnBookmark.removeEventListener("click", handlePdfBookmarkClick);

  // サムネイルボタン
  elements.btnThumbnail.removeEventListener("click", toggleThumbnailOverlay);

  // サムネイルオーバーレイの閉じるボタン
  elements.thumbnailCloseBtn.removeEventListener(
    "click",
    closeThumbnailOverlay,
  );

  // サムネイルオーバーレイ背景クリック
  elements.thumbnailOverlay.removeEventListener(
    "click",
    handleThumbnailOverlayClick,
  );

  // フルスクリーン状態の変化を監視
  document.removeEventListener("fullscreenchange", handlePdfFullscreenChange);

  // キーボード操作
  document.removeEventListener("keydown", handlePdfKeydown);

  // ESCキーでサムネイルを閉じる
  document.removeEventListener("keydown", handleThumbnailEscape);

  // マウスホイール操作
  document.removeEventListener("wheel", handlePdfWheel);

  // ページコンテナ
  const pageContainer = document.querySelector(".page-container");
  if (pageContainer) {
    pageContainer.removeEventListener("click", showControls);
  }

  // コントロール領域
  elements.bottomControls.removeEventListener(
    "mouseenter",
    keepControlsVisible,
  );
  elements.bottomControls.removeEventListener("mousemove", keepControlsVisible);
  elements.btnReset.removeEventListener("mouseenter", keepControlsVisible);
  elements.btnOffset.removeEventListener("mouseenter", keepControlsVisible);

  // シークバー操作
  elements.seekbar.removeEventListener("input", handlePdfSeekbarInput);
  elements.seekbar.removeEventListener("change", handlePdfSeekbarChange);

  // ドキュメント全体
  document.removeEventListener("click", handleDocumentClick);
}

// PDFを読み込む（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function loadPdf(file, existingFileId = null) {
  try {
    // ローディング表示
    showLoading();

    // PDF.jsを使用してPDFを読み込む
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // すべてのページをCanvasとしてレンダリング
    const pages = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // ビューポートを設定（スケール2でより高解像度に）
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // ページをレンダリング
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // CanvasをBlob URLに変換
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      const url = URL.createObjectURL(blob);
      pages.push(url);
    }

    // 既存の画像URLを解放
    state.images.forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });

    state.images = pages;
    state.currentPage = 0;
    state.offsetEnabled = false;
    state.totalPages = Math.ceil(state.images.length / 2);

    // ファイル情報を保存（ブックマーク用）
    // 既存のfileIdがあればそれを使用（履歴から開いた場合）
    state.currentFileId =
      existingFileId || generateFileId(file.name, file.size, file.lastModified);
    state.currentFileName = file.name;
    state.currentFileType = "pdf";

    // ブックマークが存在する場合は復元
    const bookmark = loadBookmark(state.currentFileId);
    if (bookmark) {
      state.currentPage = bookmark.currentPage;
      console.log(
        `[Bookmark] 前回の位置から再開: ページ ${bookmark.currentPage}/${bookmark.totalPages}`,
      );
    }

    // シークバーを初期化
    elements.seekbar.max = state.totalPages;
    elements.seekbar.value = 1;
    elements.seekbarTotal.textContent = state.totalPages;

    // 見開き調整ボタンの状態をリセット
    elements.btnOffset.classList.remove("active");

    // シークバーを左から右（LTR）に設定
    elements.seekbar.style.direction = "ltr";

    // ページコンテナを左から右（row）に設定
    const pageContainer = document.querySelector(".page-container");
    pageContainer.style.flexDirection = "row";

    // UIを更新
    elements.dropZone.classList.add("hidden");
    elements.viewer.classList.remove("hidden");

    // コントロールボタンを表示
    elements.bottomControls.classList.add("visible");
    elements.seekbarContainer.classList.remove("hidden");
    elements.btnOffset.classList.remove("hidden");
    elements.btnFullscreen.classList.remove("hidden");
    elements.btnBookmark.classList.remove("hidden");
    elements.btnThumbnail.classList.remove("hidden");
    elements.btnReset.classList.remove("hidden");

    updatePdfPageDisplay();

    // ブックマークボタンの状態を更新
    updateBookmarkButton();

    // ローディング非表示
    hideLoading();

    // 履歴に保存
    try {
      const thumbnail = await generateThumbnail(state.images[0]);
      await saveFileHistory({
        fileId: existingFileId || state.currentFileId,
        fileName: file.name,
        fileType: "pdf",
        fileBlob: file,
        thumbnail: thumbnail,
        totalPages: state.images.length,
      });
      await renderRecentFiles();
    } catch (error) {
      console.error("[History] 履歴の保存に失敗しました:", error);
    }
  } catch (error) {
    console.error("[PDF] PDF読み込みエラー:", error);
    // ローディング非表示
    hideLoading();
    alert("PDFの読み込みに失敗しました。");
  }
}

// 見開き調整を切り替える
function togglePdfOffset() {
  const currentPageNumber = Math.floor(state.currentPage / 2) + 1;

  if (state.offsetEnabled) {
    // オフにする：先頭の空要素を削除
    state.images.shift();
    state.offsetEnabled = false;
    elements.btnOffset.classList.remove("active");

    // 現在のページ番号を維持
    state.currentPage = (currentPageNumber - 1) * 2;
  } else {
    // オンにする：先頭に空要素を挿入
    state.images.unshift(null);
    state.offsetEnabled = true;
    elements.btnOffset.classList.add("active");

    // 現在のページ番号を維持
    state.currentPage = (currentPageNumber - 1) * 2;
  }

  // ページ数を再計算
  state.totalPages = Math.ceil(state.images.length / 2);
  elements.seekbar.max = state.totalPages;
  elements.seekbarTotal.textContent = state.totalPages;

  // 表示を更新
  updatePdfPageDisplay();
}

// 画像を確実に読み込んで表示する
function loadAndDisplayPdfImage(imgElement, url) {
  return new Promise((resolve, reject) => {
    // イベントハンドラをクリーンアップする関数
    const cleanup = () => {
      imgElement.onload = null;
      imgElement.onerror = null;
    };

    // onload/onerrorを設定
    imgElement.onload = () => {
      cleanup();
      imgElement.classList.remove("hidden");
      resolve();
    };

    imgElement.onerror = (e) => {
      cleanup();
      console.error("[PDF Display] 画像読み込みエラー:", url);
      imgElement.classList.add("hidden");
      reject(e);
    };

    // すでにキャッシュされている場合の対応
    if (
      imgElement.complete &&
      imgElement.naturalWidth > 0 &&
      imgElement.src === url
    ) {
      cleanup();
      imgElement.classList.remove("hidden");
      resolve();
      return;
    }

    // srcを設定
    imgElement.src = url;
  });
}

// ページ表示を更新（左から右の読み順）
async function updatePdfPageDisplay() {
  // PDFは左から右に読む
  // CSSで flex-direction: row を使用しているため、
  // DOM上の page-right, page-left の順がそのまま画面の左→右に表示される
  // したがって、page-right に左側のページ、page-left に右側のページを割り当てる
  const leftPageIndex = state.currentPage; // 左側に表示するページ（1,3,5...）
  const rightPageIndex = state.currentPage + 1; // 右側に表示するページ（2,4,6...）

  // 左側に表示（elements.pageRight に割り当て）
  if (leftPageIndex < state.images.length) {
    const leftPageImage = state.images[leftPageIndex];
    if (leftPageImage === null) {
      // 空要素の場合は非表示
      elements.pageRight.classList.add("hidden");
      elements.pageRight.src = "";
    } else {
      try {
        await loadAndDisplayPdfImage(elements.pageRight, leftPageImage);
      } catch {
        // エラー時は非表示にする
        elements.pageRight.classList.add("hidden");
        elements.pageRight.src = "";
      }
    }
  } else {
    elements.pageRight.classList.add("hidden");
    elements.pageRight.src = "";
  }

  // 右側に表示（elements.pageLeft に割り当て）
  if (rightPageIndex < state.images.length) {
    const rightPageImage = state.images[rightPageIndex];
    if (rightPageImage === null) {
      // 空要素の場合は非表示
      elements.pageLeft.classList.add("hidden");
      elements.pageLeft.src = "";
    } else {
      try {
        await loadAndDisplayPdfImage(elements.pageLeft, rightPageImage);
      } catch {
        // エラー時は非表示にする
        elements.pageLeft.classList.add("hidden");
        elements.pageLeft.src = "";
      }
    }
  } else {
    elements.pageLeft.classList.add("hidden");
    elements.pageLeft.src = "";
  }

  // ページ情報を更新
  const currentPageNumber = Math.floor(state.currentPage / 2) + 1;

  // シークバーを更新
  elements.seekbar.value = currentPageNumber;
  elements.seekbarCurrent.textContent = currentPageNumber;
  updatePdfSeekbarProgress();

  // クリック領域の表示/非表示を更新
  // PDFは左から右に読むため、画像ビューアと逆
  // 最初のページ：左側（次へ）を非表示
  if (state.currentPage <= 0) {
    elements.clickAreaNext.classList.add("hidden");
  } else {
    elements.clickAreaNext.classList.remove("hidden");
  }

  // 最後のページ：右側（前へ）を非表示
  if (state.currentPage + 2 >= state.images.length) {
    elements.clickAreaPrev.classList.add("hidden");
  } else {
    elements.clickAreaPrev.classList.remove("hidden");
  }

  // ブックマークボタンの状態を更新（ページ遷移時）
  updateBookmarkButton();

  // 前後のページを先読み（ページ遷移を高速化）
  preloadAdjacentPdfPages();
}

// ページ遷移
function navigatePdfPage(delta) {
  const newPage = state.currentPage + delta;

  if (newPage < 0) {
    state.currentPage = 0;
  } else if (newPage >= state.images.length) {
    state.currentPage = Math.max(0, state.images.length - 2);
  } else {
    state.currentPage = newPage;
  }

  updatePdfPageDisplay();
}

// キーボード操作（左から右の読み順）
function handlePdfKeydown(e) {
  if (elements.viewer.classList.contains("hidden")) return;

  switch (e.key) {
    case "ArrowLeft":
      navigatePdfPage(-2); // 前のページ
      break;
    case "ArrowRight":
      navigatePdfPage(2); // 次のページ
      break;
  }
}

// ビューアをリセット
function resetPdfViewer() {
  // イベントリスナーを削除
  removePdfViewerEvents();

  // 画像URLを解放
  state.images.forEach((url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  // 状態をリセット
  state.images = [];
  state.currentPage = 0;
  state.totalPages = 0;

  // UIをリセット
  elements.viewer.classList.add("hidden");
  elements.dropZone.classList.remove("hidden");
  elements.pageRight.src = "";
  elements.pageLeft.src = "";

  // シークバーを元の設定（RTL）に戻す
  elements.seekbar.style.direction = "rtl";

  // ページコンテナを元の設定（row-reverse）に戻す
  const pageContainer = document.querySelector(".page-container");
  pageContainer.style.flexDirection = "row-reverse";

  // シークバーとリセットボタンを非表示
  elements.seekbarContainer.classList.add("hidden");
  elements.btnOffset.classList.add("hidden");
  elements.btnReset.classList.add("hidden");
  elements.bottomControls.classList.remove("visible");
}

// シークバーのプログレス表示を更新（PDF用）
function updatePdfSeekbarProgress() {
  const seekbar = elements.seekbar;
  const value =
    ((seekbar.value - seekbar.min) / (seekbar.max - seekbar.min)) * 100;
  // PDFはLTR（左から右）なので、そのまま値を使用
  seekbar.style.setProperty("--seekbar-value", `${value}%`);
}

// シークバーの入力処理（リアルタイム更新）
function handlePdfSeekbarInput(e) {
  const pageNumber = Number.parseInt(e.target.value, 10);
  elements.seekbarCurrent.textContent = pageNumber;
  updatePdfSeekbarProgress();
}

// シークバーの変更処理（ページ遷移）
function handlePdfSeekbarChange(e) {
  const pageNumber = Number.parseInt(e.target.value, 10);
  const newPage = (pageNumber - 1) * 2; // ページ番号からインデックスに変換
  state.currentPage = Math.max(0, Math.min(newPage, state.images.length - 1));
  updatePdfPageDisplay();
}
