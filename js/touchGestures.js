// タッチジェスチャーモジュール
// スワイプ、ピンチズーム、パンなどのタッチ操作を実装

// タッチ状態の管理
const touchState = {
  startX: 0,
  startY: 0,
  startTime: 0,
  isSwiping: false,
  isPinching: false,
  initialDistance: 0,
  currentScale: 1,
  translateX: 0,
  translateY: 0,
};

// スワイプの閾値
const SWIPE_THRESHOLD = 50; // 最小移動距離（px）
const SWIPE_VELOCITY = 0.3; // 最小速度（px/ms）

// ズームの範囲
const MIN_SCALE = 1;
const MAX_SCALE = 3;

/**
 * タッチジェスチャーの初期化（画像ビューアー用）
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function initTouchGestures() {
  // .viewer-containerに登録することで、.click-area要素でもタッチイベントを受け取れる
  const viewerContainer = document.querySelector(".viewer-container");
  if (!viewerContainer) {
    return;
  }

  viewerContainer.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });
  viewerContainer.addEventListener("touchmove", handleTouchMove, {
    passive: false,
  });
  viewerContainer.addEventListener("touchend", handleTouchEnd, {
    passive: false,
  });
}

/**
 * タッチ開始
 */
function handleTouchStart(e) {
  // ビューアが非表示の場合は何もしない
  if (elements.viewer.classList.contains("hidden")) {
    return;
  }

  const touches = e.touches;

  if (touches.length === 1) {
    // シングルタッチ：スワイプ開始
    touchState.startX = touches[0].clientX;
    touchState.startY = touches[0].clientY;
    touchState.startTime = Date.now();
    touchState.isSwiping = true;
    touchState.isPinching = false;
  } else if (touches.length === 2) {
    // マルチタッチ：ピンチ開始
    touchState.isPinching = true;
    touchState.isSwiping = false;
    touchState.initialDistance = getDistance(
      touches[0].clientX,
      touches[0].clientY,
      touches[1].clientX,
      touches[1].clientY,
    );
  }
}

/**
 * タッチ移動
 */
function handleTouchMove(e) {
  // ビューアが非表示の場合は何もしない
  if (elements.viewer.classList.contains("hidden")) return;

  const touches = e.touches;

  if (touchState.isPinching && touches.length === 2) {
    // ピンチ操作中
    e.preventDefault(); // デフォルトのズームを防止

    const currentDistance = getDistance(
      touches[0].clientX,
      touches[0].clientY,
      touches[1].clientX,
      touches[1].clientY,
    );

    const scale = currentDistance / touchState.initialDistance;
    const newScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, touchState.currentScale * scale),
    );

    applyZoom(newScale);
  } else if (touchState.isSwiping && touches.length === 1) {
    // スワイプ操作中
    const deltaX = touches[0].clientX - touchState.startX;
    const deltaY = touches[0].clientY - touchState.startY;

    // 縦スワイプの方が大きい場合はスワイプをキャンセル（スクロール優先）
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchState.isSwiping = false;
    }
  }
}

/**
 * タッチ終了
 */
function handleTouchEnd(e) {
  // ビューアが非表示の場合は何もしない
  if (elements.viewer.classList.contains("hidden")) {
    return;
  }

  if (touchState.isPinching) {
    // ピンチ終了：現在のスケールを記憶
    touchState.currentScale = getCurrentScale();
    touchState.isPinching = false;
  } else if (touchState.isSwiping) {
    // スワイプ終了：方向を判定してページ遷移
    const deltaX = e.changedTouches[0].clientX - touchState.startX;
    const deltaY = e.changedTouches[0].clientY - touchState.startY;
    const deltaTime = Date.now() - touchState.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;

    // 横スワイプかつ閾値を超えた場合
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      velocity > SWIPE_VELOCITY
    ) {
      if (deltaX > 0) {
        // 右スワイプ：次のページ（右にページをめくる）
        handleSwipeRight();
      } else {
        // 左スワイプ：前のページ（左にページをめくる）
        handleSwipeLeft();
      }
    }

    touchState.isSwiping = false;
  }
}

/**
 * 左スワイプ
 * 画像（RTL）: 次のページへ進む
 * PDF（LTR）: 前のページに戻る
 */
function handleSwipeLeft() {
  // 画像ビューアーとPDFビューアーで処理を分ける
  if (state.currentFileType === "pdf") {
    // PDFは左→右読みなので、左スワイプで前へ
    navigatePdfPage(-2);
  } else {
    // 画像は右→左読みなので、左スワイプで次へ
    navigatePage(2);
  }
}

/**
 * 右スワイプ
 * 画像（RTL）: 前のページに戻る
 * PDF（LTR）: 次のページへ進む
 */
function handleSwipeRight() {
  // 画像ビューアーとPDFビューアーで処理を分ける
  if (state.currentFileType === "pdf") {
    // PDFは左→右読みなので、右スワイプで次へ
    navigatePdfPage(2);
  } else {
    // 画像は右→左読みなので、右スワイプで前へ
    navigatePage(-2);
  }
}

/**
 * 2点間の距離を計算
 */
function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * ズームを適用
 */
function applyZoom(scale) {
  const pageContainer = document.querySelector(".page-container");
  if (!pageContainer) return;

  pageContainer.style.transform = `scale(${scale})`;
  pageContainer.style.transformOrigin = "center center";
}

/**
 * 現在のズームスケールを取得
 */
function getCurrentScale() {
  const pageContainer = document.querySelector(".page-container");
  if (!pageContainer) return 1;

  const transform = pageContainer.style.transform;
  const match = transform.match(/scale\(([^)]+)\)/);
  return match ? Number.parseFloat(match[1]) : 1;
}

/**
 * ズームをリセット
 */
// biome-ignore lint/correctness/noUnusedVariables: グローバル関数として他のモジュールから使用
function resetZoom() {
  touchState.currentScale = 1;
  applyZoom(1);
}
