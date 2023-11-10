const databaseRef = firebase.database().ref();

// ナビゲーションバーのログイン/ログアウトリンクを更新するためのコード
firebase.auth().onAuthStateChanged(function (user) {
  var loginLink = document.getElementById('login-link');

  if (user) {
    // ユーザーがログインしている場合
    if (loginLink) {
      loginLink.textContent = 'ログアウト';
      loginLink.href = '#'; // hrefはJavaScriptで制御するため、ダミーの値にしています。
      loginLink.addEventListener('click', function (e) {
        e.preventDefault();
        // アラートでログアウト確認
        if (window.confirm('本当にログアウトしますか？')) {
          firebase.auth().signOut().then(() => {
            // ログアウト成功時の処理
            alert('ログアウトしました。');
            window.location.href = 'index.html'; // TOPページに遷移
          }).catch((error) => {
            // ログアウト失敗時の処理
            alert('ログアウトに失敗しました。' + error);
          });
        }
      });
    }
  } else {
    // ユーザーがログアウトしている場合
    if (loginLink) {
      loginLink.textContent = 'ログイン';
      loginLink.href = 'auth.html';
    }
  }
});

// 全商品を取得して表示する関数
function showAllProducts(databaseRef) {
  const productsRef = databaseRef.child('products');

  productsRef.once('value', (snapshot) => {
    const productsContainer = document.getElementById('all-products'); // 全商品を表示するコンテナのID
    productsContainer.innerHTML = ''; // 既存の商品をクリア

    if (!snapshot.exists()) {
      productsContainer.innerHTML = '<p>商品が見つかりません。</p>';
    } else {
      snapshot.forEach((childSnapshot) => {
        const product = childSnapshot.val();
        product.id = childSnapshot.key;
        displayProduct(product, productsContainer);
      });
    }
  });
}


// 商品データを取得し、HTMLに表示する関数
function displayProduct(product, element) {
  let productHtml = document.getElementById('product-card-template').innerHTML;

  // 各プロパティを置換
  productHtml = productHtml.replace('%PHOTO%', product.photo) // 写真のURLを置換
                            .replace('%PRICE%', product.price)
                            .replace('%CATEGORY%', product.category)
                            .replace('%RATING%', product.rating)
                            .replace('%SIZE%', product.size)
                            .replace('%WEIGHT%', product.weight)
                            .replace('%ORIGIN%', product.origin);

  const productElement = document.createElement('div');
  productElement.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'mb-3'); // 4列レイアウトに対応するBootstrapクラス
  productElement.innerHTML = productHtml;
    // クリックイベントリスナーを追加
    productElement.addEventListener('click', function() {
      this.classList.toggle('product-card-expanded');
    });
  element.appendChild(productElement);
}

// HTMLに産地ごとの件数を表示する関数
function updateOriginCountsDisplay(originCounts) {
  // 表示するHTML要素を取得
  const originsContainer = document.getElementById('origins-container');

  // origins-containerが存在する場合のみ以下の処理を行う
  if (originsContainer) {
    originsContainer.innerHTML = ''; // 内容をリセット

    // 産地ごとの件数をリストとして表示
    for (const [origin, count] of Object.entries(originCounts)) {
      const listItem = document.createElement('li');
      listItem.textContent = `${origin}: ${count}件`;
      originsContainer.appendChild(listItem);
    }
  }
}


// Firebase Databaseからproductsのデータを取得し、それらを産地ごとに集計
function displayFishCountByOrigin(databaseRef) {
  // 'products'ノードから魚のデータを取得
  const productsRef = databaseRef.child('products');

  // 産地ごとのカウントを保持するオブジェクト
  let originCounts = {};

  productsRef.once('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      const origin = product.origin; // 'origin'は産地を示すプロパティ名を想定しています

      // 産地ごとにカウント
      if (originCounts[origin]) {
        originCounts[origin] += 1;
      } else {
        originCounts[origin] = 1;
      }
    });

    // HTMLに産地ごとの件数を表示
    updateOriginCountsDisplay(originCounts);
  });
}

// 産地ごとの件数を表示する関数を実行
displayFishCountByOrigin(databaseRef);


// DOMが完全に読み込まれた後にコードを実行します。
document.addEventListener('DOMContentLoaded', function() {
  // 'addToCartButton' 要素を取得して存在を確認します。
  var addToCartButton = document.getElementById('addToCartButton');
  if (addToCartButton) {
    // 要素が存在する場合は、イベントリスナーを追加します。
    addToCartButton.addEventListener('click', function() {
      // フィードバックメッセージを表示
      showFeedback('カートに追加しました。カートページへ移動します。');

      // フィードバックメッセージを表示してからカートページへ遷移
      setTimeout(function() {
        window.location.href = 'cart.html'; // カートページのURLに置き換えてください
      }, 3000); // 3秒後に遷移
    });
  } else {
    // 要素が存在しない場合は、エラーメッセージをコンソールに出力します。
    console.error('addToCartButtonが見つかりません。');
  }
});

// フィードバックメッセージを表示する関数
function showFeedback(message) {
  const feedbackElement = document.getElementById('cart-feedback');
  if (feedbackElement) {
    feedbackElement.textContent = message;
    feedbackElement.style.display = 'block';

    // 数秒後にメッセージを隠す
    setTimeout(function() {
      feedbackElement.style.display = 'none';
    }, 3000);
  } else {
    console.error('cart-feedbackが見つかりません。');
  }
}


// ページロード時に全商品を表示し、産地ごとの件数も表示
document.addEventListener('DOMContentLoaded', function () {
  showAllProducts(databaseRef);

  // `origins-container`が存在する場合のみ実行
  if (document.getElementById('origins-container')) {
    displayFishCountByOrigin(databaseRef);
  }
});
