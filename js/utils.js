// ユーティリティ関数
// このファイルで定義された関数は、グローバルスコープで他のモジュールから参照されます

// 画像ファイルかどうかチェック（app.jsから呼び出し）
// iOS/iPadOSでも正確に判定できるよう、MIMEタイプも確認する
function isImageFile(file) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // ファイル名の拡張子で判定
  if (imageExtensions.some((ext) => fileName.endsWith(ext))) {
    return true;
  }

  // MIMEタイプで判定（iOS/iPadOSでファイル名が取得できない場合に有効）
  if (mimeType.startsWith("image/")) {
    return true;
  }

  return false;
}

// PDFファイルかどうかチェック（app.jsから呼び出し）
// iOS/iPadOSでも正確に判定できるよう、MIMEタイプも確認する
function isPdfFile(file) {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // ファイル名の拡張子で判定
  if (fileName.endsWith(".pdf")) {
    return true;
  }

  // MIMEタイプで判定（iOS/iPadOSでファイル名が取得できない場合に有効）
  if (mimeType === "application/pdf") {
    return true;
  }

  return false;
}

// ZIPファイルかどうかチェック（app.jsから呼び出し）
// iOS/iPadOSでも正確に判定できるよう、MIMEタイプも確認する
function isZipFile(file) {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // ファイル名の拡張子で判定
  if (fileName.endsWith(".zip")) {
    return true;
  }

  // MIMEタイプで判定（iOS/iPadOSでファイル名が取得できない場合に有効）
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  ) {
    return true;
  }

  return false;
}

// EPUBファイルかどうかチェック（app.jsから呼び出し）
// iOS/iPadOSでも正確に判定できるよう、MIMEタイプも確認する
function isEpubFile(file) {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // ファイル名の拡張子で判定
  if (fileName.endsWith(".epub")) {
    return true;
  }

  // MIMEタイプで判定（iOS/iPadOSでファイル名が取得できない場合に有効）
  if (mimeType === "application/epub+zip") {
    return true;
  }

  return false;
}

// RARファイルかどうかチェック（app.jsから呼び出し）
// iOS/iPadOSでも正確に判定できるよう、MIMEタイプも確認する
function isRarFile(file) {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // ファイル名の拡張子で判定
  if (fileName.endsWith(".rar")) {
    return true;
  }

  // MIMEタイプで判定（iOS/iPadOSでファイル名が取得できない場合に有効）
  if (
    mimeType === "application/vnd.rar" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-rar"
  ) {
    return true;
  }

  return false;
}

// EPUBファイルから画像ファイルを展開（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function extractImagesFromEpub(epubFile) {
  try {
    const zip = await JSZip.loadAsync(epubFile);
    const imageFiles = [];

    // EPUBファイル内のすべてのファイルを走査
    for (const [filename, file] of Object.entries(zip.files)) {
      // ディレクトリはスキップ
      if (file.dir) continue;

      // 画像ファイルかチェック
      const lowerFilename = filename.toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"].some(
        (ext) => lowerFilename.endsWith(ext),
      );

      if (isImage) {
        // Blobとして取得してFileオブジェクトに変換
        const blob = await file.async("blob");
        const imageFile = new File([blob], filename, { type: blob.type });
        imageFiles.push(imageFile);
      }
    }

    console.log(`[EPUB] ${imageFiles.length}個の画像ファイルを展開しました`);
    return imageFiles;
  } catch (error) {
    console.error("[EPUB] EPUB展開エラー:", error);
    throw error;
  }
}

// ZIPファイルから画像ファイルを展開（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function extractImagesFromZip(zipFile) {
  try {
    const zip = await JSZip.loadAsync(zipFile);
    const imageFiles = [];

    // ZIPファイル内のすべてのファイルを走査
    for (const [filename, file] of Object.entries(zip.files)) {
      // ディレクトリはスキップ
      if (file.dir) continue;

      // 画像ファイルかチェック
      const lowerFilename = filename.toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"].some(
        (ext) => lowerFilename.endsWith(ext),
      );

      if (isImage) {
        // Blobとして取得してFileオブジェクトに変換
        const blob = await file.async("blob");
        const imageFile = new File([blob], filename, { type: blob.type });
        imageFiles.push(imageFile);
      }
    }

    console.log(`[ZIP] ${imageFiles.length}個の画像ファイルを展開しました`);
    return imageFiles;
  } catch (error) {
    console.error("[ZIP] ZIP展開エラー:", error);
    throw error;
  }
}

// RARファイルから画像ファイルを展開（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function extractImagesFromRar(rarFile) {
  try {
    // libarchive.jsを使用してRARファイルを開く
    const archive = await Archive.open(rarFile);
    const imageFiles = [];

    // ファイル一覧を取得
    const filesObj = await archive.getFilesObject();

    // 再帰的にファイルを探索
    async function processFiles(obj, basePath = "") {
      for (const [name, entry] of Object.entries(obj)) {
        const fullPath = basePath ? `${basePath}/${name}` : name;

        if (entry.extract) {
          // ファイルの場合
          const lowerFilename = fullPath.toLowerCase();
          const isImage = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
            ".avif",
          ].some((ext) => lowerFilename.endsWith(ext));

          if (isImage) {
            const file = await entry.extract();
            imageFiles.push(file);
          }
        } else {
          // ディレクトリの場合、再帰的に処理
          await processFiles(entry, fullPath);
        }
      }
    }

    await processFiles(filesObj);

    console.log(`[RAR] ${imageFiles.length}個の画像ファイルを展開しました`);
    return imageFiles;
  } catch (error) {
    console.error("[RAR] RAR展開エラー:", error);
    throw new Error(
      "RARファイルの処理に失敗しました。\n\nZIP形式での再試行をお勧めします。",
    );
  }
}

// ファイル名の自然順ソート（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function sortFilesNaturally(files) {
  return files.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

// File System Access API: ディレクトリ/ファイルからファイルを収集（モダン）
async function collectFilesFromHandle(handle, files) {
  if (handle.kind === "file") {
    // ファイルの場合
    const file = await handle.getFile();
    files.push(file);
  } else if (handle.kind === "directory") {
    // ディレクトリの場合
    for await (const entry of handle.values()) {
      await collectFilesFromHandle(entry, files);
    }
  }
}

// webkitGetAsEntry: ディレクトリ/ファイルからファイルを収集（従来）
function collectFilesFromEntry(entry, files) {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file(
        (file) => {
          files.push(file);
          resolve();
        },
        (error) => {
          console.error(
            `[Collect] ファイル読み込みエラー: ${entry.name}`,
            error,
          );
          resolve(); // エラーでも続行
        },
      );
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();

      // readEntriesは一度に100個程度しか返さないため、繰り返し呼び出す
      const readAllEntries = async () => {
        const allEntries = [];

        const readBatch = () => {
          return new Promise((resolveBatch, rejectBatch) => {
            dirReader.readEntries(
              (entries) => {
                resolveBatch(entries);
              },
              (error) => {
                console.error(
                  `[Collect] readEntriesエラー: ${entry.name}`,
                  error,
                );
                rejectBatch(error);
              },
            );
          });
        };

        try {
          // entries.lengthが0になるまで繰り返す
          while (true) {
            const entries = await readBatch();
            if (entries.length === 0) {
              break;
            }
            allEntries.push(...entries);
          }

          // すべてのエントリーを再帰的に処理
          for (const subEntry of allEntries) {
            await collectFilesFromEntry(subEntry, files);
          }

          resolve();
        } catch (error) {
          console.error(
            `[Collect] ディレクトリ読み込みエラー: ${entry.name}`,
            error,
          );
          resolve(); // エラーでも続行
        }
      };

      readAllEntries();
    } else {
      resolve();
    }
  });
}

// ドロップされたファイルを収集（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function collectDroppedFiles(dataTransferItems) {
  const files = [];

  // 機能検出
  const supportsFileSystemAccessAPI =
    "getAsFileSystemHandle" in DataTransferItem.prototype;
  const supportsWebkitGetAsEntry =
    "webkitGetAsEntry" in DataTransferItem.prototype;

  // DataTransferItemsから処理（ディレクトリ対応）
  for (let i = 0; i < dataTransferItems.length; i++) {
    const item = dataTransferItems[i];
    if (item.kind === "file") {
      try {
        if (supportsFileSystemAccessAPI) {
          // モダンAPI: File System Access API
          const handle = await item.getAsFileSystemHandle();
          await collectFilesFromHandle(handle, files);
        } else if (supportsWebkitGetAsEntry) {
          // 従来のAPI: webkitGetAsEntry
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await collectFilesFromEntry(entry, files);
          }
        } else {
          // フォールバック: getAsFile
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      } catch (error) {
        console.error("[Drop] ファイル収集エラー:", error);
      }
    }
  }

  return files;
}

// ファイル種別を判定（app.jsから呼び出し）
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function detectFileType(files) {
  if (files.length === 0) {
    return "unknown";
  }

  // EPUBファイルかチェック（単一ファイル）
  const epubFiles = files.filter(isEpubFile);
  if (epubFiles.length === 1 && files.length === 1) {
    return "epub";
  }

  // RARファイルかチェック（単一ファイル）
  const rarFiles = files.filter(isRarFile);
  if (rarFiles.length === 1 && files.length === 1) {
    return "rar";
  }

  // ZIPファイルかチェック（単一ファイル）
  const zipFiles = files.filter(isZipFile);
  if (zipFiles.length === 1 && files.length === 1) {
    return "zip";
  }

  // PDFファイルかチェック（単一ファイル）
  const pdfFiles = files.filter(isPdfFile);
  if (pdfFiles.length === 1 && files.length === 1) {
    return "pdf";
  }

  // すべて画像ファイルかチェック
  const imageFiles = files.filter(isImageFile);
  if (imageFiles.length > 0) {
    return "image";
  }

  // 他のファイル形式を判定する場合はここに追加

  return "unknown";
}
