// メインコントローラー

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  initElements();
  initDropZone();
  initImageViewer();
  initPdfViewer();
});

// ドロップゾーンの初期化
function initDropZone() {
  // ドラッグ&ドロップ
  elements.dropZone.addEventListener("dragover", handleDragOver);
  elements.dropZone.addEventListener("dragleave", handleDragLeave);
  elements.dropZone.addEventListener("drop", handleDrop);
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

// ドロップ
async function handleDrop(e) {
  e.preventDefault();
  elements.dropZone.classList.remove("dragover");

  const items = e.dataTransfer.items;
  if (!items || items.length === 0) {
    return;
  }

  // ファイルを収集
  const files = await collectDroppedFiles(items);

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
    case "zip":
      await handleZipFile(files[0]);
      break;
    default:
      alert(
        "対応していないファイル形式です。\n\n対応形式: 画像ファイル (JPG, PNG, GIF, WebP, AVIF), PDFファイル, ZIPファイル",
      );
      break;
  }
}

// 画像ファイルの処理
async function handleImageFiles(files) {
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
  await loadImages(imageFiles);

  // 画像ビューアーのイベントリスナーを登録
  setupImageViewerEvents();
}

// PDFファイルの処理
async function handlePdfFile(file) {
  // 画像ビューアーのイベントリスナーを削除
  removeImageViewerEvents();

  // PDFビューアーで読み込んで表示
  await loadPdf(file);

  // PDFビューアーのイベントリスナーを登録
  setupPdfViewerEvents();
}

// ZIPファイルの処理
async function handleZipFile(file) {
  try {
    // ZIPファイルから画像を展開
    const imageFiles = await extractImagesFromZip(file);

    if (imageFiles.length === 0) {
      alert(
        "ZIPファイル内に画像ファイルが見つかりませんでした。\n\n対応形式: JPG, PNG, GIF, WebP, AVIF",
      );
      return;
    }

    // 展開した画像を画像ビューアーで表示
    await handleImageFiles(imageFiles);
  } catch (error) {
    console.error("[ZIP] ZIP処理エラー:", error);
    alert("ZIPファイルの処理に失敗しました。");
  }
}
