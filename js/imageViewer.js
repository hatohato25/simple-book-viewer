// 画像ビューアーモジュール
// このファイルで定義された関数は、グローバルスコープで他のモジュールから参照されます

// 先読み用の画像オブジェクトを保持
let preloadedImages = [];

// 画像ビューアーの初期化（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function initImageViewer() {
  // 初期化時は何もしない（画像読み込み時にイベントを設定）
}

// 次と前のページを先読みする
function preloadAdjacentPages() {
  // 既存の先読み画像をクリア
  preloadedImages = [];

  // 次の見開き（右→左読みなので -2, -1）
  const nextRightIndex = state.currentPage - 2;
  const nextLeftIndex = state.currentPage - 1;

  // 前の見開き（右→左読みなので +2, +3）
  const prevRightIndex = state.currentPage + 2;
  const prevLeftIndex = state.currentPage + 3;

  // 次のページを先読み
  if (nextRightIndex >= 0 && nextRightIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[nextRightIndex];
    preloadedImages.push(img);
  }

  if (nextLeftIndex >= 0 && nextLeftIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[nextLeftIndex];
    preloadedImages.push(img);
  }

  // 前のページを先読み
  if (prevRightIndex >= 0 && prevRightIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[prevRightIndex];
    preloadedImages.push(img);
  }

  if (prevLeftIndex >= 0 && prevLeftIndex < state.images.length) {
    const img = new Image();
    img.src = state.images[prevLeftIndex];
    preloadedImages.push(img);
  }
}

// クリック領域のハンドラー（画像用）
function handleImageClickPrev() {
  navigatePage(-2);
}

function handleImageClickNext() {
  navigatePage(2);
}

// マウスホイールのハンドラー（画像用：右→左読み）
function handleImageWheel(e) {
  // ビューアが非表示の場合は何もしない
  if (elements.viewer.classList.contains("hidden")) return;

  e.preventDefault();

  // deltaY > 0: ホイール下 → 次のページ（左へ進む）
  // deltaY < 0: ホイール上 → 前のページ（右へ戻る）
  if (e.deltaY > 0) {
    navigatePage(2); // 次のページ
  } else if (e.deltaY < 0) {
    navigatePage(-2); // 前のページ
  }
}

// フルスクリーンハンドラー
function handleFullscreenClick() {
  toggleFullscreen();
}

function toggleFullscreen() {
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

function handleFullscreenChange() {
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

// ブックマークハンドラー
function handleBookmarkClick() {
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

// ブックマークボタンの表示を更新
function updateBookmarkButton() {
  if (!state.currentFileId) {
    elements.btnBookmark.classList.remove("active");
    elements.btnBookmark.title = "このページをブックマーク";
    return;
  }

  // ブックマークが存在するかチェック
  const bookmark = loadBookmark(state.currentFileId);

  if (bookmark && bookmark.currentPage === state.currentPage) {
    // 保存されたページと現在のページが一致する場合のみアクティブ表示（塗りつぶし）
    elements.btnBookmark.classList.add("active");
    elements.btnBookmark.title = "ブックマークを削除";
  } else {
    // 一致しない場合は非アクティブ表示（枠線のみ）
    elements.btnBookmark.classList.remove("active");
    if (bookmark) {
      elements.btnBookmark.title = `このページをブックマーク（現在: ${Math.floor(bookmark.currentPage / 2) + 1}ページ目に保存済み）`;
    } else {
      elements.btnBookmark.title = "このページをブックマーク";
    }
  }
}

// イベントリスナーの初期化
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function setupImageViewerEvents() {
  // クリック領域のイベントリスナーを登録
  elements.clickAreaPrev.addEventListener("click", handleImageClickPrev);
  elements.clickAreaNext.addEventListener("click", handleImageClickNext);

  // リセットボタン
  elements.btnReset.addEventListener("click", resetViewer);

  // 見開き調整ボタン
  elements.btnOffset.addEventListener("click", toggleOffset);

  // 最大化ボタン
  elements.btnFullscreen.addEventListener("click", handleFullscreenClick);

  // ブックマークボタン
  elements.btnBookmark.addEventListener("click", handleBookmarkClick);

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
  document.addEventListener("fullscreenchange", handleFullscreenChange);

  // キーボード操作
  document.addEventListener("keydown", handleKeydown);

  // ESCキーでサムネイルを閉じる
  document.addEventListener("keydown", handleThumbnailEscape);

  // マウスホイール操作
  document.addEventListener("wheel", handleImageWheel, { passive: false });

  // ページコンテナクリックで表示
  const pageContainer = document.querySelector(".page-container");
  pageContainer.addEventListener("click", showControls);

  // コントロール領域での操作時はタイマーをリセット
  elements.bottomControls.addEventListener("mouseenter", keepControlsVisible);
  elements.bottomControls.addEventListener("mousemove", keepControlsVisible);
  elements.btnReset.addEventListener("mouseenter", keepControlsVisible);
  elements.btnOffset.addEventListener("mouseenter", keepControlsVisible);

  // シークバー操作
  elements.seekbar.addEventListener("input", handleSeekbarInput);
  elements.seekbar.addEventListener("change", handleSeekbarChange);

  // ドキュメント全体でクリックを監視
  document.addEventListener("click", handleDocumentClick);
}

// イベントリスナーの削除
function removeImageViewerEvents() {
  // クリック領域のイベントリスナーを削除
  elements.clickAreaPrev.removeEventListener("click", handleImageClickPrev);
  elements.clickAreaNext.removeEventListener("click", handleImageClickNext);

  // リセットボタン
  elements.btnReset.removeEventListener("click", resetViewer);

  // 見開き調整ボタン
  elements.btnOffset.removeEventListener("click", toggleOffset);

  // 最大化ボタン
  elements.btnFullscreen.removeEventListener("click", handleFullscreenClick);

  // ブックマークボタン
  elements.btnBookmark.removeEventListener("click", handleBookmarkClick);

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
  document.removeEventListener("fullscreenchange", handleFullscreenChange);

  // キーボード操作
  document.removeEventListener("keydown", handleKeydown);

  // ESCキーでサムネイルを閉じる
  document.removeEventListener("keydown", handleThumbnailEscape);

  // マウスホイール操作
  document.removeEventListener("wheel", handleImageWheel);

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
  elements.seekbar.removeEventListener("input", handleSeekbarInput);
  elements.seekbar.removeEventListener("change", handleSeekbarChange);

  // ドキュメント全体
  document.removeEventListener("click", handleDocumentClick);
}

// 画像を読み込む（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function loadImages(
  files,
  fileName = null,
  fileSize = null,
  lastModified = null,
  originalFileBlob = null,
  fileType = "image",
  existingFileId = null,
) {
  // ローディング表示
  showLoading();

  // 既存の画像URLを解放
  state.images.forEach((url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  state.images = [];

  for (const file of files) {
    const url = URL.createObjectURL(file);
    state.images.push(url);
  }

  state.currentPage = 0;
  state.offsetEnabled = false; // 見開き調整をリセット
  state.totalPages = Math.ceil(state.images.length / 2);

  // ファイル情報を保存（ブックマーク用）
  if (fileName) {
    // 既存のfileIdがあればそれを使用（履歴から開いた場合やディレクトリの場合）
    if (existingFileId) {
      state.currentFileId = existingFileId;
    } else if (fileSize && lastModified) {
      // 通常のファイルの場合
      state.currentFileId = generateFileId(fileName, fileSize, lastModified);
    }

    state.currentFileName = fileName;
    state.currentFileType = "image";

    // ブックマークが存在する場合は復元
    if (state.currentFileId) {
      const bookmark = loadBookmark(state.currentFileId);
      if (bookmark) {
        state.currentPage = bookmark.currentPage;
        console.log(
          `[Bookmark] 前回の位置から再開: ページ ${bookmark.currentPage}/${bookmark.totalPages}`,
        );
      }
    }
  }

  // シークバーを初期化
  elements.seekbar.max = state.totalPages;
  elements.seekbar.value = 1;
  elements.seekbarTotal.textContent = state.totalPages;

  // 見開き調整ボタンの状態をリセット
  elements.btnOffset.classList.remove("active");

  // シークバーを右から左（RTL）に設定
  elements.seekbar.style.direction = "rtl";
  // 画像ビューア用のプログレス表示（右側が既読、左側が未読）
  elements.seekbar.classList.add("rtl-progress");

  // ページコンテナを右から左（row-reverse）に設定
  const pageContainer = document.querySelector(".page-container");
  pageContainer.style.flexDirection = "row-reverse";

  // UIを更新
  elements.dropZone.classList.add("hidden");
  elements.viewer.classList.remove("hidden");

  updatePageDisplay();

  // ブックマークボタンの状態を更新
  updateBookmarkButton();

  // ローディング非表示
  hideLoading();

  // 履歴に保存（ファイル情報がある場合）
  if (fileName && state.images.length > 0 && originalFileBlob) {
    try {
      const thumbnail = await generateThumbnail(state.images[0]);

      // ファイルIDの決定:
      // existingFileIdまたはstate.currentFileIdを使用
      // どちらもない場合はエラー
      const fileIdToSave = existingFileId || state.currentFileId;

      if (!fileIdToSave) {
        console.error(
          "[History] fileIdが設定されていません。履歴を保存できません。",
        );
        return;
      }

      await saveFileHistory({
        fileId: fileIdToSave,
        fileName: fileName,
        fileType: fileType, // 渡されたファイルタイプを使用（image/zip/epub/directory）
        fileBlob: originalFileBlob, // 単一ファイルまたはファイル配列
        thumbnail: thumbnail,
        totalPages: state.images.length,
      });
      await renderRecentFiles();
    } catch (error) {
      console.error("[History] 履歴の保存に失敗しました:", error);
    }
  }
}

// 見開き調整を切り替える
function toggleOffset() {
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
  updatePageDisplay();
}

// 画像を確実に読み込んで表示する
function loadAndDisplayImage(imgElement, url) {
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
      console.error("[Display] 画像読み込みエラー:", url);
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

// ページ表示を更新
async function updatePageDisplay() {
  const rightIndex = state.currentPage;
  const leftIndex = state.currentPage + 1;

  // 右ページの読み込みと表示
  if (rightIndex < state.images.length) {
    const rightImage = state.images[rightIndex];
    if (rightImage === null) {
      // 空要素の場合は非表示
      elements.pageRight.classList.add("hidden");
      elements.pageRight.src = "";
    } else {
      try {
        await loadAndDisplayImage(elements.pageRight, rightImage);
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

  // 左ページの読み込みと表示
  if (leftIndex < state.images.length) {
    const leftImage = state.images[leftIndex];
    if (leftImage === null) {
      // 空要素の場合は非表示
      elements.pageLeft.classList.add("hidden");
      elements.pageLeft.src = "";
    } else {
      try {
        await loadAndDisplayImage(elements.pageLeft, leftImage);
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
  updateSeekbarProgress();

  // ブックマークボタンの状態を更新（ページ遷移時）
  updateBookmarkButton();

  // クリック領域の表示/非表示を更新
  // 最初のページ：前のページ領域を非表示
  if (state.currentPage <= 0) {
    elements.clickAreaPrev.classList.add("hidden");
  } else {
    elements.clickAreaPrev.classList.remove("hidden");
  }

  // 最後のページ：次のページ領域を非表示
  if (state.currentPage + 2 >= state.images.length) {
    elements.clickAreaNext.classList.add("hidden");
  } else {
    elements.clickAreaNext.classList.remove("hidden");
  }

  // 前後のページを先読み（ページ遷移を高速化）
  preloadAdjacentPages();
}

// ページ遷移
function navigatePage(delta) {
  const newPage = state.currentPage + delta;

  if (newPage < 0) {
    state.currentPage = 0;
  } else if (newPage >= state.images.length) {
    state.currentPage = Math.max(0, state.images.length - 2);
  } else {
    state.currentPage = newPage;
  }

  updatePageDisplay();
}

// キーボード操作
function handleKeydown(e) {
  if (elements.viewer.classList.contains("hidden")) return;

  switch (e.key) {
    case "ArrowLeft":
      navigatePage(2); // 次のページ（右から左に読むため）
      break;
    case "ArrowRight":
      navigatePage(-2); // 前のページ
      break;
  }
}

// ビューアをリセット
function resetViewer() {
  // イベントリスナーを削除
  removeImageViewerEvents();

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

  // シークバーとリセットボタンを非表示
  elements.seekbarContainer.classList.add("hidden");
  elements.btnOffset.classList.add("hidden");
  elements.btnReset.classList.add("hidden");
  elements.bottomControls.classList.remove("visible");
  // シークバーのRTLプログレスクラスを削除
  elements.seekbar.classList.remove("rtl-progress");
}

// コントロール（シークバーとリセットボタン）を表示
function showControls() {
  // タイマーをクリア
  if (seekbarHideTimer) {
    clearTimeout(seekbarHideTimer);
    seekbarHideTimer = null;
  }

  // コントロールを表示
  elements.bottomControls.classList.add("visible");
  elements.seekbarContainer.classList.remove("hidden");
  elements.btnOffset.classList.remove("hidden");
  elements.btnFullscreen.classList.remove("hidden");
  elements.btnBookmark.classList.remove("hidden");
  elements.btnThumbnail.classList.remove("hidden");
  elements.btnReset.classList.remove("hidden");

  // 3秒後に自動非表示
  startHideTimer();
}

// コントロールを表示状態に保つ
function keepControlsVisible() {
  // タイマーをリセット
  if (seekbarHideTimer) {
    clearTimeout(seekbarHideTimer);
  }
  startHideTimer();
}

// 非表示タイマーを開始
function startHideTimer() {
  seekbarHideTimer = setTimeout(() => {
    hideControls();
  }, 3000);
}

// コントロールを非表示
function hideControls() {
  elements.bottomControls.classList.remove("visible");
  elements.seekbarContainer.classList.add("hidden");
  elements.btnOffset.classList.add("hidden");
  elements.btnFullscreen.classList.add("hidden");
  elements.btnBookmark.classList.add("hidden");
  elements.btnReset.classList.add("hidden");
}

// ドキュメントクリック処理
function handleDocumentClick(e) {
  // コントロール領域、ページコンテナ、クリック領域以外をクリックした場合は非表示
  if (
    !elements.bottomControls.contains(e.target) &&
    !elements.btnReset.contains(e.target) &&
    !e.target.closest(".page-container") &&
    !e.target.closest(".click-area")
  ) {
    hideControls();
  }
}

// シークバーのプログレス表示を更新
function updateSeekbarProgress() {
  const seekbar = elements.seekbar;
  const value =
    ((seekbar.value - seekbar.min) / (seekbar.max - seekbar.min)) * 100;
  // imageViewerはRTL（右から左）読みなので、既読部分は右側
  // CSSのlinear-gradientは左から右方向なので、100%から引いて反転
  seekbar.style.setProperty("--seekbar-value", `${100 - value}%`);
}

// シークバーの入力処理（リアルタイム更新）
function handleSeekbarInput(e) {
  const pageNumber = Number.parseInt(e.target.value, 10);
  elements.seekbarCurrent.textContent = pageNumber;
  updateSeekbarProgress();
}

// シークバーの変更処理（ページ遷移）
function handleSeekbarChange(e) {
  const pageNumber = Number.parseInt(e.target.value, 10);
  const newPage = (pageNumber - 1) * 2; // ページ番号からインデックスに変換
  state.currentPage = Math.max(0, Math.min(newPage, state.images.length - 1));
  updatePageDisplay();
}
