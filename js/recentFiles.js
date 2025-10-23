// recentFiles.js - 最近読んだファイルのUI管理

/**
 * 履歴リストを描画
 * @returns {Promise<void>}
 */
async function renderRecentFiles() {
  const historyList = await getAllHistory();

  if (historyList.length === 0) {
    hideRecentFilesSection();
    return;
  }

  showRecentFilesSection();

  // リストをクリア
  elements.recentFilesList.innerHTML = "";

  // 各履歴カードを生成
  for (const item of historyList) {
    const card = createRecentFileCard(item);
    elements.recentFilesList.appendChild(card);
  }

  console.log(`[RecentFiles] ${historyList.length}件の履歴を表示しました`);
}

/**
 * 履歴カードを作成
 * @param {Object} item - 履歴アイテム
 * @returns {HTMLElement}
 */
function createRecentFileCard(item) {
  const card = document.createElement("div");
  card.classList.add("recent-file-card");
  card.dataset.fileId = item.fileId;

  // サムネイル画像
  const thumbnail = document.createElement("img");
  thumbnail.classList.add("recent-file-thumbnail");
  thumbnail.src = item.thumbnail;
  thumbnail.alt = item.fileName;

  // ファイル情報コンテナ
  const infoContainer = document.createElement("div");
  infoContainer.classList.add("recent-file-info");

  // ファイル名
  const fileName = document.createElement("div");
  fileName.classList.add("recent-file-name");
  fileName.textContent = item.fileName;
  fileName.title = item.fileName; // ツールチップで完全なファイル名を表示

  // 最終アクセス時刻
  const fileTime = document.createElement("div");
  fileTime.classList.add("recent-file-time");
  fileTime.textContent = formatRelativeTime(item.lastAccess);

  // 読書進捗（ブックマークがある場合）
  const fileProgress = document.createElement("div");
  fileProgress.classList.add("recent-file-progress");

  const bookmark = loadBookmark(item.fileId);
  if (bookmark) {
    const currentPageNum = Math.floor(bookmark.currentPage / 2) + 1;
    const totalPageNum = Math.floor(item.totalPages / 2);
    fileProgress.textContent = `${currentPageNum}/${totalPageNum}ページ`;
  } else {
    fileProgress.textContent = `全${Math.floor(item.totalPages / 2)}ページ`;
  }

  infoContainer.appendChild(fileName);
  infoContainer.appendChild(fileTime);
  infoContainer.appendChild(fileProgress);

  // 削除ボタン
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn-delete-history");
  deleteBtn.textContent = "×";
  deleteBtn.title = "削除";

  // イベントリスナー
  card.addEventListener("click", (e) => {
    // 削除ボタンのクリックは除外
    if (e.target === deleteBtn) return;
    handleRecentFileClick(item.fileId);
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // カードのクリックイベントを防止
    handleDeleteHistory(item.fileId);
  });

  // カードに要素を追加
  card.appendChild(thumbnail);
  card.appendChild(infoContainer);
  card.appendChild(deleteBtn);

  return card;
}

/**
 * 履歴セクションを表示
 */
function showRecentFilesSection() {
  if (elements.recentFilesSection) {
    elements.recentFilesSection.classList.remove("hidden");
  }
}

/**
 * 履歴セクションを非表示
 */
function hideRecentFilesSection() {
  if (elements.recentFilesSection) {
    elements.recentFilesSection.classList.add("hidden");
  }
}

/**
 * カードクリック処理
 * @param {string} fileId - ファイル識別子
 * @returns {Promise<void>}
 */
async function handleRecentFileClick(fileId) {
  console.log("[RecentFiles] 履歴からファイルを開きます:", fileId);

  const historyItem = await getFileHistory(fileId);

  if (!historyItem) {
    alert("履歴が見つかりませんでした。");
    await renderRecentFiles();
    return;
  }

  // ファイルを取得
  const file = await reopenFromHistory(fileId);

  if (!file) {
    alert(
      "ファイルを開けませんでした。\n履歴から削除されている可能性があります。",
    );
    // 履歴を再描画
    await renderRecentFiles();
    return;
  }

  // 注: 古い履歴は削除しない
  // 各ハンドラ内でsaveFileHistory()が呼ばれ、同じfileIdで上書き保存される
  // これにより、lastAccessが更新され、履歴の順序が正しく保たれる
  // 10件を超えた場合は、saveFileHistory()内で最も古い履歴が自動削除される

  // ファイルタイプに応じて処理を振り分け
  // 重要: existingFileId（元のfileId）を渡すことで、重複履歴を防ぐ
  switch (historyItem.fileType) {
    case "image":
      await handleImageFiles([file], file, "image", fileId);
      break;
    case "pdf":
      await handlePdfFile(file, fileId);
      break;
    case "epub":
      await handleEpubFile(file, fileId);
      break;
    case "zip":
      await handleZipFile(file, fileId);
      break;
    case "directory":
      // ディレクトリの場合、fileは配列
      await handleImageFiles(file, null, "directory", fileId);
      break;
    default:
      alert("対応していないファイル形式です。");
      break;
  }
}

/**
 * 個別削除処理
 * @param {string} fileId - ファイル識別子
 * @returns {Promise<void>}
 */
async function handleDeleteHistory(fileId) {
  await deleteFileHistory(fileId);
  await renderRecentFiles();
  console.log("[RecentFiles] 履歴を削除しました:", fileId);
}

/**
 * 全クリア処理
 * @returns {Promise<void>}
 */
async function handleClearAllHistory() {
  if (!confirm("すべての履歴を削除しますか?")) {
    return;
  }

  await clearAllHistory();
  await renderRecentFiles();
  console.log("[RecentFiles] 全履歴を削除しました");
}

/**
 * 履歴セクションのイベントリスナーを設定
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function setupRecentFilesEvents() {
  if (elements.btnClearAllHistory) {
    elements.btnClearAllHistory.addEventListener(
      "click",
      handleClearAllHistory,
    );
  }
}
