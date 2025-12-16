// メインコントローラー

// 初期化
document.addEventListener("DOMContentLoaded", async () => {
  initElements();
  initDropZone();
  initImageViewer();
  initPdfViewer();
  initTouchGestures();
  setupRecentFilesEvents();
  await renderRecentFiles();

  // Unarchiver.jsの初期化（RAR対応）
  // 注: libunrar.js.memファイルのパスを正しく設定するため、事前にロードする
  try {
    await Unarchiver.load(["rar"]);
    console.log("[Init] RAR形式のサポートを初期化しました");
  } catch (error) {
    console.warn("[Init] RAR形式の初期化に失敗しました:", error);
  }
});

// ドロップゾーンの初期化
function initDropZone() {
  // ドラッグ&ドロップ
  elements.dropZone.addEventListener("dragover", handleDragOver);
  elements.dropZone.addEventListener("dragleave", handleDragLeave);
  elements.dropZone.addEventListener("drop", handleDrop);

  // クリックでモーダル表示
  const dropZoneContent = document.querySelector(".drop-zone-content");
  const fileSelectModal = document.getElementById("file-select-modal");
  const modalBtnSelectFiles = document.getElementById("modal-btn-select-files");
  const modalBtnSelectFolder = document.getElementById(
    "modal-btn-select-folder",
  );
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const fileInput = document.getElementById("file-input");
  const folderInput = document.getElementById("folder-input");

  // ドロップゾーンクリックでモーダル表示
  if (dropZoneContent && fileSelectModal) {
    dropZoneContent.addEventListener("click", () => {
      fileSelectModal.classList.remove("hidden");
    });
  }

  // モーダル内のファイル選択ボタン
  if (modalBtnSelectFiles && fileInput) {
    modalBtnSelectFiles.addEventListener("click", () => {
      fileInput.click();
    });
    fileInput.addEventListener("change", (e) => {
      fileSelectModal.classList.add("hidden");
      handleFileInputChange(e);
    });
  }

  // モーダル内のフォルダ選択ボタン
  if (modalBtnSelectFolder && folderInput) {
    modalBtnSelectFolder.addEventListener("click", () => {
      folderInput.click();
    });
    folderInput.addEventListener("change", (e) => {
      fileSelectModal.classList.add("hidden");
      handleFolderInputChange(e);
    });
  }

  // モーダルのキャンセルボタン
  if (modalCloseBtn && fileSelectModal) {
    modalCloseBtn.addEventListener("click", () => {
      fileSelectModal.classList.add("hidden");
    });
  }

  // モーダル背景クリックで閉じる
  if (fileSelectModal) {
    fileSelectModal.addEventListener("click", (e) => {
      if (e.target === fileSelectModal) {
        fileSelectModal.classList.add("hidden");
      }
    });
  }
}

// ドラッグオーバー
function handleDragOver(e) {
  e.preventDefault();
  elements.dropZone.classList.add("dragover");
}

// ドラッグリーブ
function handleDragLeave(e) {
  e.preventDefault();
  elements.dropZone.classList.remove("dragover");
}

// ファイル種別に応じて処理を振り分ける共通関数
async function processFiles(files) {
  if (files.length === 0) {
    alert("ファイルが見つかりませんでした。");
    return;
  }

  // ファイル種別を判定
  const fileType = detectFileType(files);

  // ファイル種別に応じて処理を振り分け
  switch (fileType) {
    case "image":
      await handleImageFiles(files);
      break;
    case "pdf":
      await handlePdfFile(files[0]);
      break;
    case "epub":
      await handleEpubFile(files[0]);
      break;
    case "zip":
      await handleZipFile(files[0]);
      break;
    case "rar":
      await handleRarFile(files[0]);
      break;
    default:
      alert(
        "対応していないファイル形式です。\n\n対応形式: 画像ファイル (JPG, PNG, GIF, WebP, AVIF), PDFファイル, EPUBファイル, ZIP/RARファイル",
      );
      break;
  }
}

// ドロップ
async function handleDrop(e) {
  e.preventDefault();
  elements.dropZone.classList.remove("dragover");

  const items = e.dataTransfer.items;
  if (!items || items.length === 0) {
    return;
  }

  // ファイルを収集して処理
  const files = await collectDroppedFiles(items);
  await processFiles(files);
}

// ファイル選択（input type="file"）
async function handleFileInputChange(e) {
  const files = Array.from(e.target.files);

  // ファイルを処理
  await processFiles(files);

  // inputをリセット（同じファイルを再選択できるように）
  e.target.value = "";
}

// フォルダ選択（input webkitdirectory）
async function handleFolderInputChange(e) {
  const files = Array.from(e.target.files);

  if (files.length === 0) {
    return;
  }

  // フォルダ内のファイルは画像ファイルとして処理
  await handleImageFiles(files);

  // inputをリセット（同じフォルダを再選択できるように）
  e.target.value = "";
}

// 画像ファイルの処理
async function handleImageFiles(
  files,
  originalFile = null,
  fileType = "image",
  existingFileId = null,
) {
  // 画像ファイルのみフィルタリング
  const imageFiles = files.filter(isImageFile);

  if (imageFiles.length === 0) {
    alert(
      "画像ファイルが見つかりませんでした。\n\n対応形式: JPG, PNG, GIF, WebP, AVIF",
    );
    return;
  }

  // ファイル名でソート（自然順）
  sortFilesNaturally(imageFiles);

  // PDFビューアーのイベントリスナーを削除
  removePdfViewerEvents();

  // 画像ビューアーで読み込んで表示
  // ファイル情報を渡す（ブックマーク用）
  if (originalFile) {
    await loadImages(
      imageFiles,
      originalFile.name,
      originalFile.size,
      originalFile.lastModified,
      originalFile, // Blobとして保存
      fileType, // ファイルタイプ（zip/epub/imageなど）
      existingFileId, // 履歴から開いた場合のfileId
    );
  } else if (imageFiles.length > 0) {
    // 元ファイルがない場合（ディレクトリドロップ）は全ファイルを保存
    // ディレクトリ名として最初のファイルのパスから推測
    const dirName = imageFiles[0].webkitRelativePath
      ? imageFiles[0].webkitRelativePath.split("/")[0]
      : "images";

    // ディレクトリの一意性確保のため、専用のID生成関数を使用
    // existingFileIdがあればそれを優先（履歴から開いた場合）
    const directoryId =
      existingFileId || generateDirectoryId(dirName, imageFiles);

    // ダミーの値を渡す（loadImages内でdirectoryIdを直接使用）
    await loadImages(
      imageFiles,
      dirName,
      imageFiles.length, // サイズの代わりにファイル数を渡す
      0, // lastModifiedは使用しない
      imageFiles, // 全ファイルを配列として保存
      "directory",
      directoryId, // ディレクトリIDを渡す
    );
  } else {
    await loadImages(imageFiles);
  }

  // 画像ビューアーのイベントリスナーを登録
  setupImageViewerEvents();
}

// PDFファイルの処理
async function handlePdfFile(file, existingFileId = null) {
  // 画像ビューアーのイベントリスナーを削除
  removeImageViewerEvents();

  // PDFビューアーで読み込んで表示
  await loadPdf(file, existingFileId);

  // PDFビューアーのイベントリスナーを登録
  setupPdfViewerEvents();
}

// EPUBファイルの処理
async function handleEpubFile(file, existingFileId = null) {
  try {
    // EPUBファイルから画像を展開
    const imageFiles = await extractImagesFromEpub(file);

    if (imageFiles.length === 0) {
      alert(
        "EPUBファイル内に画像ファイルが見つかりませんでした。\n\n対応形式: JPG, PNG, GIF, WebP, AVIF",
      );
      return;
    }

    // 展開した画像を画像ビューアーで表示（元のEPUBファイル情報を渡す）
    await handleImageFiles(imageFiles, file, "epub", existingFileId);
  } catch (error) {
    console.error("[EPUB] EPUB処理エラー:", error);
    alert("EPUBファイルの処理に失敗しました。");
  }
}

// ZIPファイルの処理
async function handleZipFile(file, existingFileId = null) {
  try {
    // ZIPファイルから画像を展開
    const imageFiles = await extractImagesFromZip(file);

    if (imageFiles.length === 0) {
      alert(
        "ZIPファイル内に画像ファイルが見つかりませんでした。\n\n対応形式: JPG, PNG, GIF, WebP, AVIF",
      );
      return;
    }

    // 展開した画像を画像ビューアーで表示（元のZIPファイル情報を渡す）
    await handleImageFiles(imageFiles, file, "zip", existingFileId);
  } catch (error) {
    console.error("[ZIP] ZIP処理エラー:", error);
    alert("ZIPファイルの処理に失敗しました。");
  }
}

// RARファイルの処理
async function handleRarFile(file, existingFileId = null) {
  try {
    // RARファイルから画像を展開
    const imageFiles = await extractImagesFromRar(file);

    if (imageFiles.length === 0) {
      alert(
        "RARファイル内に画像ファイルが見つかりませんでした。\n\n対応形式: JPG, PNG, GIF, WebP, AVIF",
      );
      return;
    }

    // 展開した画像を画像ビューアーで表示（元のRARファイル情報を渡す）
    await handleImageFiles(imageFiles, file, "rar", existingFileId);
  } catch (error) {
    console.error("[RAR] RAR処理エラー:", error);

    // エラーの種類に応じて適切なメッセージを表示
    if (error.name === "RarNotSupportedError") {
      alert(error.message);
    } else {
      alert(
        "RARファイルの処理に失敗しました。\n\nZIP形式での再試行をお勧めします。",
      );
    }
  }
}
