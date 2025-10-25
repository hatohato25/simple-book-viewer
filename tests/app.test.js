import { beforeEach, describe, expect, it } from "vitest";

// テスト用のユーティリティ関数
function isImageFile(file) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
  const fileName = file.name.toLowerCase();
  return imageExtensions.some((ext) => fileName.endsWith(ext));
}

function naturalSort(a, b) {
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function calculateTotalPages(imageCount) {
  return Math.ceil(imageCount / 2);
}

function getCurrentPageNumber(currentPage) {
  return Math.floor(currentPage / 2) + 1;
}

function canNavigatePrev(currentPage) {
  return currentPage > 0;
}

function canNavigateNext(currentPage, totalImages) {
  return currentPage + 2 < totalImages;
}

function getNewPage(currentPage, delta, totalImages) {
  const newPage = currentPage + delta;

  if (newPage < 0) {
    return 0;
  } else if (newPage >= totalImages) {
    return Math.max(0, totalImages - 2);
  } else {
    return newPage;
  }
}

describe("画像ファイルフィルタリング", () => {
  it("JPGファイルを画像として認識する", () => {
    const file = { name: "image.jpg" };
    expect(isImageFile(file)).toBe(true);
  });

  it("JPEGファイルを画像として認識する", () => {
    const file = { name: "image.jpeg" };
    expect(isImageFile(file)).toBe(true);
  });

  it("PNGファイルを画像として認識する", () => {
    const file = { name: "image.png" };
    expect(isImageFile(file)).toBe(true);
  });

  it("GIFファイルを画像として認識する", () => {
    const file = { name: "image.gif" };
    expect(isImageFile(file)).toBe(true);
  });

  it("WebPファイルを画像として認識する", () => {
    const file = { name: "image.webp" };
    expect(isImageFile(file)).toBe(true);
  });

  it("AVIFファイルを画像として認識する", () => {
    const file = { name: "image.avif" };
    expect(isImageFile(file)).toBe(true);
  });

  it("大文字拡張子のファイルも認識する", () => {
    const file = { name: "IMAGE.JPG" };
    expect(isImageFile(file)).toBe(true);
  });

  it("テキストファイルを画像として認識しない", () => {
    const file = { name: "document.txt" };
    expect(isImageFile(file)).toBe(false);
  });

  it("PDFファイルを画像として認識しない", () => {
    const file = { name: "document.pdf" };
    expect(isImageFile(file)).toBe(false);
  });

  it("ZIPファイルを画像として認識しない", () => {
    const file = { name: "archive.zip" };
    expect(isImageFile(file)).toBe(false);
  });
});

describe("ZIPファイル判定", () => {
  // ZIPファイル判定のためのisZipFile関数を定義
  function isZipFile(file) {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".zip");
  }

  it("ZIPファイルを正しく認識する", () => {
    const file = { name: "archive.zip" };
    expect(isZipFile(file)).toBe(true);
  });

  it("大文字拡張子のZIPファイルも認識する", () => {
    const file = { name: "ARCHIVE.ZIP" };
    expect(isZipFile(file)).toBe(true);
  });

  it("画像ファイルをZIPとして認識しない", () => {
    const file = { name: "image.jpg" };
    expect(isZipFile(file)).toBe(false);
  });

  it("PDFファイルをZIPとして認識しない", () => {
    const file = { name: "document.pdf" };
    expect(isZipFile(file)).toBe(false);
  });
});

describe("ファイル名の自然順ソート", () => {
  it("数字を含むファイル名を正しくソートする", () => {
    const files = [
      { name: "page10.jpg" },
      { name: "page2.jpg" },
      { name: "page1.jpg" },
      { name: "page20.jpg" },
    ];

    files.sort(naturalSort);

    expect(files[0].name).toBe("page1.jpg");
    expect(files[1].name).toBe("page2.jpg");
    expect(files[2].name).toBe("page10.jpg");
    expect(files[3].name).toBe("page20.jpg");
  });

  it("同じ名前のファイルを正しく処理する", () => {
    const files = [{ name: "image.jpg" }, { name: "image.jpg" }];

    files.sort(naturalSort);

    expect(files.length).toBe(2);
  });

  it("空のファイル名配列を処理できる", () => {
    const files = [];
    files.sort(naturalSort);
    expect(files.length).toBe(0);
  });
});

describe("ページ計算", () => {
  it("偶数枚の画像の総ページ数を計算する", () => {
    expect(calculateTotalPages(10)).toBe(5);
  });

  it("奇数枚の画像の総ページ数を計算する", () => {
    expect(calculateTotalPages(11)).toBe(6);
  });

  it("1枚の画像の総ページ数を計算する", () => {
    expect(calculateTotalPages(1)).toBe(1);
  });

  it("0枚の画像の総ページ数を計算する", () => {
    expect(calculateTotalPages(0)).toBe(0);
  });

  it("現在のページ番号を計算する（最初のページ）", () => {
    expect(getCurrentPageNumber(0)).toBe(1);
  });

  it("現在のページ番号を計算する（2ページ目）", () => {
    expect(getCurrentPageNumber(2)).toBe(2);
  });

  it("現在のページ番号を計算する（3ページ目）", () => {
    expect(getCurrentPageNumber(4)).toBe(3);
  });
});

describe("ページナビゲーション", () => {
  it("最初のページでは前のページに戻れない", () => {
    expect(canNavigatePrev(0)).toBe(false);
  });

  it("2ページ目では前のページに戻れる", () => {
    expect(canNavigatePrev(2)).toBe(true);
  });

  it("最後のページでは次のページに進めない", () => {
    expect(canNavigateNext(8, 10)).toBe(false);
  });

  it("最初のページでは次のページに進める", () => {
    expect(canNavigateNext(0, 10)).toBe(true);
  });

  it("次のページへの遷移を計算する", () => {
    expect(getNewPage(0, 2, 10)).toBe(2);
  });

  it("前のページへの遷移を計算する", () => {
    expect(getNewPage(2, -2, 10)).toBe(0);
  });

  it("最初のページより前に戻ろうとすると0になる", () => {
    expect(getNewPage(0, -2, 10)).toBe(0);
  });

  it("最後のページより先に進もうとすると最後から2番目になる", () => {
    expect(getNewPage(10, 2, 10)).toBe(8);
  });
});

describe("DOM操作のテスト", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="drop-zone" class="drop-zone"></div>
      <div id="viewer" class="viewer hidden">
        <div class="page-container">
          <img id="page-right" class="page page-right" />
          <img id="page-left" class="page page-left" />
        </div>
        <div id="click-area-prev" class="click-area click-area-prev"></div>
        <div id="click-area-next" class="click-area click-area-next"></div>
        <button id="btn-reset" class="btn-reset hidden"></button>
        <div id="bottom-controls" class="bottom-controls">
          <button id="btn-offset" class="btn-offset hidden"></button>
          <div id="seekbar-container" class="seekbar-container hidden">
            <input type="range" id="seekbar" class="seekbar" min="1" max="1" value="1" />
            <div class="seekbar-label">
              <span id="seekbar-current">1</span> / <span id="seekbar-total">1</span>
            </div>
          </div>
          <button id="btn-fullscreen" class="btn-fullscreen hidden"></button>
          <button id="btn-bookmark" class="btn-bookmark hidden"></button>
        </div>
      </div>
    `;
  });

  it("DOM要素が正しく取得できる", () => {
    const dropZone = document.getElementById("drop-zone");
    const viewer = document.getElementById("viewer");

    expect(dropZone).not.toBeNull();
    expect(viewer).not.toBeNull();
  });

  it("ビューアが初期状態で非表示", () => {
    const viewer = document.getElementById("viewer");
    expect(viewer.classList.contains("hidden")).toBe(true);
  });

  it("ドロップゾーンが初期状態で表示", () => {
    const dropZone = document.getElementById("drop-zone");
    expect(dropZone.classList.contains("hidden")).toBe(false);
  });
});

describe("URL生成のテスト", () => {
  it("URL.createObjectURLが呼び出せる", () => {
    const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const url = URL.createObjectURL(mockFile);

    expect(url).toContain("blob:");
    URL.revokeObjectURL(url);
  });

  it("URL.revokeObjectURLが呼び出せる", () => {
    const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const url = URL.createObjectURL(mockFile);

    expect(() => URL.revokeObjectURL(url)).not.toThrow();
  });
});

describe("PDFファイル判定", () => {
  function isPdfFile(file) {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".pdf");
  }

  it("PDFファイルを正しく認識する", () => {
    const file = { name: "document.pdf" };
    expect(isPdfFile(file)).toBe(true);
  });

  it("大文字拡張子のPDFファイルも認識する", () => {
    const file = { name: "DOCUMENT.PDF" };
    expect(isPdfFile(file)).toBe(true);
  });

  it("画像ファイルをPDFとして認識しない", () => {
    const file = { name: "image.jpg" };
    expect(isPdfFile(file)).toBe(false);
  });
});

describe("EPUBファイル判定", () => {
  function isEpubFile(file) {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".epub");
  }

  it("EPUBファイルを正しく認識する", () => {
    const file = { name: "book.epub" };
    expect(isEpubFile(file)).toBe(true);
  });

  it("大文字拡張子のEPUBファイルも認識する", () => {
    const file = { name: "BOOK.EPUB" };
    expect(isEpubFile(file)).toBe(true);
  });

  it("ZIPファイルをEPUBとして認識しない", () => {
    const file = { name: "archive.zip" };
    expect(isEpubFile(file)).toBe(false);
  });
});

describe("ブックマーク機能のテスト", () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
  });

  function generateFileId(fileName, fileSize, lastModified) {
    const str = `${fileName}-${fileSize}-${lastModified}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `file_${Math.abs(hash)}`;
  }

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
      return true;
    } catch (error) {
      console.error("[Bookmark] 保存エラー:", error);
      return false;
    }
  }

  function loadBookmark(fileId) {
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "{}");
      return bookmarks[fileId] || null;
    } catch (error) {
      console.error("[Bookmark] 読み込みエラー:", error);
      return null;
    }
  }

  function hasBookmark(fileId) {
    return loadBookmark(fileId) !== null;
  }

  function deleteBookmark(fileId) {
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "{}");
      delete bookmarks[fileId];
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      return true;
    } catch (error) {
      console.error("[Bookmark] 削除エラー:", error);
      return false;
    }
  }

  it("ファイルIDを生成できる", () => {
    const fileId = generateFileId("test.zip", 1024, 1234567890);
    expect(fileId).toContain("file_");
    expect(typeof fileId).toBe("string");
  });

  it("同じファイル情報から同じIDが生成される", () => {
    const fileId1 = generateFileId("test.zip", 1024, 1234567890);
    const fileId2 = generateFileId("test.zip", 1024, 1234567890);
    expect(fileId1).toBe(fileId2);
  });

  it("異なるファイル情報から異なるIDが生成される", () => {
    const fileId1 = generateFileId("test1.zip", 1024, 1234567890);
    const fileId2 = generateFileId("test2.zip", 1024, 1234567890);
    expect(fileId1).not.toBe(fileId2);
  });

  it("ブックマークを保存できる", () => {
    const fileId = "file_12345";
    const result = saveBookmark(fileId, "test.zip", 10, 50, "image");
    expect(result).toBe(true);
    expect(hasBookmark(fileId)).toBe(true);
  });

  it("ブックマークを読み込める", () => {
    const fileId = "file_12345";
    saveBookmark(fileId, "test.zip", 10, 50, "image");
    const bookmark = loadBookmark(fileId);
    expect(bookmark).not.toBeNull();
    expect(bookmark.fileName).toBe("test.zip");
    expect(bookmark.currentPage).toBe(10);
    expect(bookmark.totalPages).toBe(50);
    expect(bookmark.fileType).toBe("image");
  });

  it("存在しないブックマークはnullを返す", () => {
    const bookmark = loadBookmark("nonexistent");
    expect(bookmark).toBeNull();
  });

  it("ブックマークを削除できる", () => {
    const fileId = "file_12345";
    saveBookmark(fileId, "test.zip", 10, 50, "image");
    expect(hasBookmark(fileId)).toBe(true);

    const result = deleteBookmark(fileId);
    expect(result).toBe(true);
    expect(hasBookmark(fileId)).toBe(false);
  });

  it("複数のブックマークを管理できる", () => {
    const fileId1 = "file_12345";
    const fileId2 = "file_67890";

    saveBookmark(fileId1, "test1.zip", 10, 50, "image");
    saveBookmark(fileId2, "test2.pdf", 5, 30, "pdf");

    expect(hasBookmark(fileId1)).toBe(true);
    expect(hasBookmark(fileId2)).toBe(true);

    const bookmark1 = loadBookmark(fileId1);
    const bookmark2 = loadBookmark(fileId2);

    expect(bookmark1.fileName).toBe("test1.zip");
    expect(bookmark2.fileName).toBe("test2.pdf");
  });
});

describe("サムネイル機能のテスト", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="thumbnail-overlay" class="thumbnail-overlay hidden">
        <div class="thumbnail-container">
          <div class="thumbnail-header">
            <h2>ページ一覧</h2>
            <button id="thumbnail-close-btn" class="thumbnail-close-btn">×</button>
          </div>
          <div id="thumbnail-grid" class="thumbnail-grid"></div>
        </div>
      </div>
      <button id="btn-thumbnail" class="btn-thumbnail hidden"></button>
    `;
  });

  it("サムネイルオーバーレイのDOM要素が存在する", () => {
    const overlay = document.getElementById("thumbnail-overlay");
    const grid = document.getElementById("thumbnail-grid");
    const button = document.getElementById("btn-thumbnail");

    expect(overlay).not.toBeNull();
    expect(grid).not.toBeNull();
    expect(button).not.toBeNull();
  });

  it("サムネイルオーバーレイが初期状態で非表示", () => {
    const overlay = document.getElementById("thumbnail-overlay");
    expect(overlay.classList.contains("hidden")).toBe(true);
  });

  it("サムネイルアイテムを生成できる", () => {
    const grid = document.getElementById("thumbnail-grid");
    const thumbnailItem = document.createElement("div");
    thumbnailItem.classList.add("thumbnail-item");
    thumbnailItem.dataset.page = "0";

    const img = document.createElement("img");
    img.src = "blob:test";
    img.alt = "ページ 1";

    const pageNumber = document.createElement("span");
    pageNumber.classList.add("thumbnail-page-number");
    pageNumber.textContent = "ページ 1";

    thumbnailItem.appendChild(img);
    thumbnailItem.appendChild(pageNumber);
    grid.appendChild(thumbnailItem);

    expect(grid.children.length).toBe(1);
    expect(grid.children[0].dataset.page).toBe("0");
  });

  it("複数のサムネイルアイテムを生成できる", () => {
    const grid = document.getElementById("thumbnail-grid");

    for (let i = 0; i < 10; i++) {
      const thumbnailItem = document.createElement("div");
      thumbnailItem.classList.add("thumbnail-item");
      thumbnailItem.dataset.page = i.toString();
      grid.appendChild(thumbnailItem);
    }

    expect(grid.children.length).toBe(10);
  });

  it("サムネイルアイテムにactiveクラスを追加できる", () => {
    const grid = document.getElementById("thumbnail-grid");
    const thumbnailItem = document.createElement("div");
    thumbnailItem.classList.add("thumbnail-item");
    thumbnailItem.dataset.page = "0";
    grid.appendChild(thumbnailItem);

    thumbnailItem.classList.add("active");
    expect(thumbnailItem.classList.contains("active")).toBe(true);
  });
});

describe("ファイル選択モーダル機能のテスト", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="drop-zone-content">
        <p>画像フォルダ、PDF、EPUB、またはZIPファイルをここにドロップ</p>
      </div>
      <div id="file-select-modal" class="file-select-modal hidden">
        <div class="file-select-modal-content">
          <h3>読み込み方法を選択</h3>
          <div class="file-select-buttons">
            <button id="modal-btn-select-files" class="modal-btn-select">
              <div class="modal-btn-icon">📄</div>
              <div class="modal-btn-text">ファイルを選択</div>
              <div class="modal-btn-hint">PDF、EPUB、ZIP、画像ファイル</div>
            </button>
            <button id="modal-btn-select-folder" class="modal-btn-select">
              <div class="modal-btn-icon">📁</div>
              <div class="modal-btn-text">フォルダを選択</div>
              <div class="modal-btn-hint">画像が入ったフォルダ</div>
            </button>
          </div>
          <button id="modal-close-btn" class="modal-close-btn">キャンセル</button>
        </div>
      </div>
      <input type="file" id="file-input" multiple accept="image/*,.pdf,.epub,.zip" style="display: none;">
      <input type="file" id="folder-input" webkitdirectory style="display: none;">
    `;
  });

  it("モーダルのDOM要素が存在する", () => {
    const modal = document.getElementById("file-select-modal");
    const btnSelectFiles = document.getElementById("modal-btn-select-files");
    const btnSelectFolder = document.getElementById("modal-btn-select-folder");
    const btnClose = document.getElementById("modal-close-btn");
    const fileInput = document.getElementById("file-input");
    const folderInput = document.getElementById("folder-input");

    expect(modal).not.toBeNull();
    expect(btnSelectFiles).not.toBeNull();
    expect(btnSelectFolder).not.toBeNull();
    expect(btnClose).not.toBeNull();
    expect(fileInput).not.toBeNull();
    expect(folderInput).not.toBeNull();
  });

  it("モーダルが初期状態で非表示", () => {
    const modal = document.getElementById("file-select-modal");
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  it("モーダルを表示できる", () => {
    const modal = document.getElementById("file-select-modal");
    modal.classList.remove("hidden");
    expect(modal.classList.contains("hidden")).toBe(false);
  });

  it("モーダルを非表示にできる", () => {
    const modal = document.getElementById("file-select-modal");
    modal.classList.remove("hidden");
    modal.classList.add("hidden");
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  it("file inputがmultiple属性を持つ", () => {
    const fileInput = document.getElementById("file-input");
    expect(fileInput.hasAttribute("multiple")).toBe(true);
  });

  it("file inputが正しいaccept属性を持つ", () => {
    const fileInput = document.getElementById("file-input");
    expect(fileInput.getAttribute("accept")).toBe("image/*,.pdf,.epub,.zip");
  });

  it("folder inputがwebkitdirectory属性を持つ", () => {
    const folderInput = document.getElementById("folder-input");
    expect(folderInput.hasAttribute("webkitdirectory")).toBe(true);
  });

  it("モーダルの選択ボタンが2つ存在する", () => {
    const btnSelectFiles = document.getElementById("modal-btn-select-files");
    const btnSelectFolder = document.getElementById("modal-btn-select-folder");
    expect(btnSelectFiles).not.toBeNull();
    expect(btnSelectFolder).not.toBeNull();
  });

  it("モーダルのキャンセルボタンが存在する", () => {
    const btnClose = document.getElementById("modal-close-btn");
    expect(btnClose).not.toBeNull();
    expect(btnClose.textContent).toBe("キャンセル");
  });
});

describe("タッチジェスチャー機能のテスト", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="viewer" class="viewer">
        <div class="page-container">
          <img id="page-right" class="page page-right" />
          <img id="page-left" class="page page-left" />
        </div>
      </div>
    `;
  });

  function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function calculateScale(initialDistance, currentDistance, currentScale) {
    const MIN_SCALE = 1;
    const MAX_SCALE = 3;
    const scale = currentDistance / initialDistance;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale * scale));
  }

  it("ページコンテナのDOM要素が存在する", () => {
    const pageContainer = document.querySelector(".page-container");
    expect(pageContainer).not.toBeNull();
  });

  it("2点間の距離を正しく計算できる", () => {
    const distance = getDistance(0, 0, 3, 4);
    expect(distance).toBe(5);
  });

  it("ピンチズームのスケールを正しく計算できる（拡大）", () => {
    const initialDistance = 100;
    const currentDistance = 200;
    const currentScale = 1;
    const newScale = calculateScale(
      initialDistance,
      currentDistance,
      currentScale,
    );
    expect(newScale).toBe(2);
  });

  it("ピンチズームのスケールを正しく計算できる（縮小）", () => {
    const initialDistance = 200;
    const currentDistance = 100;
    const currentScale = 2;
    const newScale = calculateScale(
      initialDistance,
      currentDistance,
      currentScale,
    );
    expect(newScale).toBe(1);
  });

  it("ピンチズームのスケールが最小値（1倍）を下回らない", () => {
    const initialDistance = 200;
    const currentDistance = 10;
    const currentScale = 1;
    const newScale = calculateScale(
      initialDistance,
      currentDistance,
      currentScale,
    );
    expect(newScale).toBe(1);
  });

  it("ピンチズームのスケールが最大値（3倍）を超えない", () => {
    const initialDistance = 100;
    const currentDistance = 1000;
    const currentScale = 1;
    const newScale = calculateScale(
      initialDistance,
      currentDistance,
      currentScale,
    );
    expect(newScale).toBe(3);
  });

  it("スワイプの閾値判定が正しく動作する", () => {
    const SWIPE_THRESHOLD = 50;
    const deltaX = 60;
    const deltaY = 10;
    const isHorizontalSwipe =
      Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY);
    expect(isHorizontalSwipe).toBe(true);
  });

  it("縦スワイプは水平スワイプとして認識されない", () => {
    const SWIPE_THRESHOLD = 50;
    const deltaX = 10;
    const deltaY = 60;
    const isHorizontalSwipe =
      Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY);
    expect(isHorizontalSwipe).toBe(false);
  });

  it("スワイプ速度が閾値を超えているか判定できる", () => {
    const SWIPE_VELOCITY = 0.3;
    const deltaX = 100;
    const deltaTime = 200;
    const velocity = Math.abs(deltaX) / deltaTime;
    expect(velocity).toBeGreaterThan(SWIPE_VELOCITY);
  });

  it("低速スワイプは閾値を下回る", () => {
    const SWIPE_VELOCITY = 0.3;
    const deltaX = 50;
    const deltaTime = 500;
    const velocity = Math.abs(deltaX) / deltaTime;
    expect(velocity).toBeLessThan(SWIPE_VELOCITY);
  });
});
