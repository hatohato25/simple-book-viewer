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
