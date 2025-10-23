// サムネイル表示機能
// このファイルで定義された関数は、グローバルスコープで他のモジュールから参照されます

// サムネイルオーバーレイの表示/非表示を切り替え
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function toggleThumbnailOverlay() {
  if (elements.thumbnailOverlay.classList.contains("hidden")) {
    // オーバーレイを表示
    generateThumbnails();
    elements.thumbnailOverlay.classList.remove("hidden");
    updateThumbnailHighlight();

    // オーバーレイ内でのホイールイベントを登録（キャプチャフェーズで捕捉）
    elements.thumbnailOverlay.addEventListener("wheel", handleThumbnailWheel, {
      capture: true,
    });
  } else {
    // オーバーレイを非表示
    closeThumbnailOverlay();
  }
}

// サムネイルオーバーレイを閉じる
function closeThumbnailOverlay() {
  elements.thumbnailOverlay.classList.add("hidden");

  // ホイールイベントリスナーを解除
  elements.thumbnailOverlay.removeEventListener("wheel", handleThumbnailWheel, {
    capture: true,
  });
}

// サムネイル一覧を生成
function generateThumbnails() {
  // グリッドをクリア
  elements.thumbnailGrid.innerHTML = "";

  // 全ページのサムネイルを生成
  for (let i = 0; i < state.images.length; i++) {
    const imageUrl = state.images[i];

    // nullの場合（見開き調整の空要素）はスキップ
    if (imageUrl === null) {
      continue;
    }

    // サムネイルアイテムを作成
    const thumbnailItem = document.createElement("div");
    thumbnailItem.classList.add("thumbnail-item");
    thumbnailItem.dataset.page = i;

    // サムネイル画像を作成
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `ページ ${Math.floor(i / 2) + 1}`;

    // ページ番号を作成
    const pageNumber = document.createElement("span");
    pageNumber.classList.add("thumbnail-page-number");
    pageNumber.textContent = `ページ ${Math.floor(i / 2) + 1}`;

    // クリックイベント
    thumbnailItem.addEventListener("click", () => {
      jumpToPageFromThumbnail(i);
    });

    // アイテムに追加
    thumbnailItem.appendChild(img);
    thumbnailItem.appendChild(pageNumber);

    // グリッドに追加
    elements.thumbnailGrid.appendChild(thumbnailItem);
  }
}

// サムネイルクリックでページジャンプ
function jumpToPageFromThumbnail(pageIndex) {
  // 見開き表示なので、偶数インデックスに調整
  const adjustedPage = Math.floor(pageIndex / 2) * 2;
  state.currentPage = adjustedPage;

  // ページ表示を更新（imageViewerまたはpdfViewerの関数を呼び出す）
  if (state.currentFileType === "pdf") {
    updatePdfPageDisplay();
  } else {
    updatePageDisplay();
  }

  // ハイライトを更新
  updateThumbnailHighlight();

  // オーバーレイを閉じる
  closeThumbnailOverlay();
}

// 現在ページのサムネイルをハイライト
function updateThumbnailHighlight() {
  // すべてのアイテムからactiveクラスを削除
  const allItems = elements.thumbnailGrid.querySelectorAll(".thumbnail-item");
  for (const item of allItems) {
    item.classList.remove("active");
  }

  // 現在のページに対応するアイテムにactiveクラスを追加
  // 見開きなので、currentPageとcurrentPage+1の両方をハイライト
  const currentItem1 = elements.thumbnailGrid.querySelector(
    `[data-page="${state.currentPage}"]`,
  );
  const currentItem2 = elements.thumbnailGrid.querySelector(
    `[data-page="${state.currentPage + 1}"]`,
  );

  if (currentItem1) {
    currentItem1.classList.add("active");
    // 現在のページにスクロール
    currentItem1.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (currentItem2) {
    currentItem2.classList.add("active");
  }
}

// ESCキーでサムネイルオーバーレイを閉じる
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function handleThumbnailEscape(event) {
  if (
    event.key === "Escape" &&
    !elements.thumbnailOverlay.classList.contains("hidden")
  ) {
    closeThumbnailOverlay();
  }
}

// オーバーレイ背景クリックで閉じる
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function handleThumbnailOverlayClick(event) {
  // オーバーレイ自体をクリックした場合のみ閉じる（コンテナ内のクリックは無視）
  if (event.target === elements.thumbnailOverlay) {
    closeThumbnailOverlay();
  }
}

// サムネイルオーバーレイ内でのホイールイベントを処理
// ビューアのホイールイベントへの伝播を防ぐ
function handleThumbnailWheel(event) {
  // オーバーレイが表示されている場合のみ処理
  if (!elements.thumbnailOverlay.classList.contains("hidden")) {
    // イベントの伝播を停止（ビューアのホイールイベントが発火しないようにする）
    event.stopPropagation();
    // デフォルト動作は許可（オーバーレイ内のスクロールは機能させる）
  }
}
