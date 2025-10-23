// fileHistory.js - 最近読んだファイルの履歴管理（IndexedDB + FileSystemHandle）

const DB_NAME = "BookViewerDB";
const STORE_NAME = "recentFiles";
const DB_VERSION = 1;
const MAX_HISTORY_COUNT = 10;

/**
 * IndexedDBを開く
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error(
        "[FileHistory] IndexedDBを開けませんでした:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "fileId" });
        console.log("[FileHistory] オブジェクトストアを作成しました");
      }
    };
  });
}

/**
 * ファイル履歴を保存（上限10件管理）
 * @param {Object} fileData - ファイル情報
 * @param {string} fileData.fileId - ファイル識別子
 * @param {string} fileData.fileName - ファイル名
 * @param {string} fileData.fileType - ファイルタイプ（image/pdf/epub/zip）
 * @param {Blob} fileData.fileBlob - ファイルのBlobデータ
 * @param {string} fileData.thumbnail - サムネイル画像（Base64）
 * @param {number} fileData.totalPages - 総ページ数
 * @returns {Promise<void>}
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function saveFileHistory(fileData) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // 最終アクセス時刻を更新
    const historyItem = {
      ...fileData,
      lastAccess: Date.now(),
    };

    // 既存データを上書き保存
    store.put(historyItem);

    // 同一トランザクション内で上限チェック: 10件を超えたら古いものを削除
    const allItems = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (allItems.length > MAX_HISTORY_COUNT) {
      // lastAccessが古い順にソート
      allItems.sort((a, b) => a.lastAccess - b.lastAccess);

      // 超過分を削除
      const itemsToDelete = allItems.slice(
        0,
        allItems.length - MAX_HISTORY_COUNT,
      );
      for (const item of itemsToDelete) {
        store.delete(item.fileId);
        console.log("[FileHistory] 古い履歴を削除しました:", item.fileName);
      }
    }

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });

    console.log("[FileHistory] 履歴を保存しました:", fileData.fileName);
  } catch (error) {
    console.error("[FileHistory] 履歴の保存に失敗しました:", error);
  }
}

/**
 * 全履歴を取得（最終アクセス順）
 * @returns {Promise<Array>}
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function getAllHistory() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const allItems = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // 最新アクセス順にソート
    allItems.sort((a, b) => b.lastAccess - a.lastAccess);

    return allItems;
  } catch (error) {
    console.error("[FileHistory] 履歴の取得に失敗しました:", error);
    return [];
  }
}

/**
 * 特定ファイルの履歴を取得
 * @param {string} fileId - ファイル識別子
 * @returns {Promise<Object|null>}
 */
async function getFileHistory(fileId) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const item = await new Promise((resolve, reject) => {
      const request = store.get(fileId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return item || null;
  } catch (error) {
    console.error("[FileHistory] 履歴の取得に失敗しました:", error);
    return null;
  }
}

/**
 * 特定ファイルの履歴を削除
 * @param {string} fileId - ファイル識別子
 * @returns {Promise<void>}
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function deleteFileHistory(fileId) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.delete(fileId);

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });

    console.log("[FileHistory] 履歴を削除しました:", fileId);
  } catch (error) {
    console.error("[FileHistory] 履歴の削除に失敗しました:", error);
  }
}

/**
 * 全履歴を削除
 * @returns {Promise<void>}
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function clearAllHistory() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });

    console.log("[FileHistory] 全履歴を削除しました");
  } catch (error) {
    console.error("[FileHistory] 全履歴の削除に失敗しました:", error);
  }
}

/**
 * 履歴からファイルを再度開く
 * @param {string} fileId - ファイル識別子
 * @returns {Promise<File|File[]|null>}
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function reopenFromHistory(fileId) {
  try {
    const historyItem = await getFileHistory(fileId);

    if (!historyItem || !historyItem.fileBlob) {
      console.error("[FileHistory] 履歴が見つかりません:", fileId);
      return null;
    }

    // ディレクトリの場合（配列）とファイルの場合（単一Blob）を判定
    if (Array.isArray(historyItem.fileBlob)) {
      // ディレクトリの場合：配列のまま返す
      console.log(
        "[FileHistory] ディレクトリを再度開きました:",
        historyItem.fileName,
        `(${historyItem.fileBlob.length}ファイル)`,
      );
      return historyItem.fileBlob;
    }

    // 単一ファイルの場合：BlobからFileオブジェクトを生成
    const file = new File([historyItem.fileBlob], historyItem.fileName, {
      type: historyItem.fileBlob.type,
    });

    console.log(
      "[FileHistory] ファイルを再度開きました:",
      historyItem.fileName,
    );
    return file;
  } catch (error) {
    console.error("[FileHistory] ファイルの再読み込みに失敗しました:", error);
    return null;
  }
}

/**
 * サムネイル画像を生成（Base64化）
 * @param {string} imageUrl - 画像のBlob URL
 * @returns {Promise<string>} - Base64エンコードされた画像
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
async function generateThumbnail(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Canvasに描画してBase64化
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // サムネイルサイズ（幅100px）
      const maxWidth = 100;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Base64に変換
      const base64 = canvas.toDataURL("image/jpeg", 0.7);
      resolve(base64);
    };

    img.onerror = () => {
      console.error("[FileHistory] サムネイル生成に失敗しました");
      reject(new Error("サムネイル生成失敗"));
    };

    img.src = imageUrl;
  });
}

/**
 * 相対時刻を生成（「2時間前」「昨日」など）
 * @param {number} timestamp - タイムスタンプ（ミリ秒）
 * @returns {string}
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "たった今";
  }
  if (minutes < 60) {
    return `${minutes}分前`;
  }
  if (hours < 24) {
    return `${hours}時間前`;
  }
  if (days === 1) {
    return "昨日";
  }
  if (days < 7) {
    return `${days}日前`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}週間前`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}ヶ月前`;
  }
  const years = Math.floor(days / 365);
  return `${years}年前`;
}
