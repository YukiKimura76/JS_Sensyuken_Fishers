// カートにログインしているユーザーの情報がない場合の表示
function buildLoginBtn(root, href) {
    let h3 = document.createElement('h3');
    let h3TextNode = document.createTextNode('ログインされていません');
    h3.appendChild(h3TextNode);
    let aBtn = document.createElement('a');
    aBtn.classList.add('btn', 'btn-primary');
    let btnTextNode = document.createTextNode('ログイン');
    aBtn.appendChild(btnTextNode);
    aBtn.href = href;
  
    root.appendChild(h3);
    root.appendChild(aBtn);
}

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


  

let totalAmount = 0; // 合計金額を格納する変数


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

  element.appendChild(productElement);

  // 商品の価格を合計に加算
  totalAmount += parseFloat(product.price); // product.priceを数値に変換して加算
}

function updateTotalAmountDisplay() {
    const totalAmountDisplay = document.getElementById('total-amount'); // 合計金額を表示する要素のID
    totalAmountDisplay.textContent = `合計金額: ¥${Math.floor(totalAmount)}`; // Math.floorで小数点以下を切り捨て
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


// ページロード時に全商品を表示し、産地ごとの件数も表示
document.addEventListener('DOMContentLoaded', function () {
  showAllProducts(databaseRef);

  // `origins-container`が存在する場合のみ実行
  if (document.getElementById('origins-container')) {
    displayFishCountByOrigin(databaseRef);
  }
  // 商品がすべて表示された後に合計金額を更新
  updateTotalAmountDisplay();
});

// 全商品を取得して表示する関数
function showAllProducts(databaseRef) {
    const productsRef = databaseRef.child('products');
  
    productsRef.once('value', (snapshot) => {
      const productsContainer = document.getElementById('all-products'); // 全商品を表示するコンテナのID
      productsContainer.innerHTML = ''; // 既存の商品をクリア
  
      if (!snapshot.exists()) {
        productsContainer.innerHTML = '<p>商品が見つかりません。</p>';
        updateTotalAmountDisplay(); // 商品がない場合でも合計金額を更新
      } else {
        snapshot.forEach((childSnapshot) => {
          const product = childSnapshot.val();
          product.id = childSnapshot.key;
          displayProduct(product, productsContainer);
        });
        updateTotalAmountDisplay(); // 全商品を表示した後に合計金額を更新
      }
    });
}

// ポップアップウィンドウを表示する関数
function showPaymentDialog() {
    // バックドロップとダイアログの要素を作成
    var backdrop = document.createElement('div');
    backdrop.id = 'payment-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = 0;
    backdrop.style.bottom = 0;
    backdrop.style.left = 0;
    backdrop.style.right = 0;
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    backdrop.style.display = 'flex';
    backdrop.style.justifyContent = 'center';
    backdrop.style.alignItems = 'center';
    backdrop.style.zIndex = '1000';
  
    var dialog = document.createElement('div');
    dialog.id = 'payment-dialog';
    dialog.style.width = '300px';
    dialog.style.padding = '20px';
    dialog.style.background = '#fff';
    dialog.style.borderRadius = '5px';
    dialog.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
    dialog.innerHTML = `
      <h2>支払い情報</h2>
      <p>クレジットカード情報を入力してください。</p>
      <form id="payment-form">
        <input type="text" placeholder="カード番号" required>
        <input type="text" placeholder="有効期限 MM/YY" required>
        <input type="text" placeholder="CVC" required>
        <button type="submit" class="btn btn-confirm">確定</button>
      </form>
      <div style="text-align: right; margin-top: 20px;">
        <button id="close-payment-dialog" class="btn">閉じる</button>
      </div>
    `;
  
    // フォームの送信イベントを設定
    dialog.querySelector('#payment-form').addEventListener('submit', function(event) {
      event.preventDefault(); // フォームのデフォルトの送信を防止
      document.getElementById('payment-dialog').innerHTML = '<p style="font-size: 80px; text-align: center;">Thank You!</p>'; // 支払いが完了したことをユーザーに通知
});
  
    // ダイアログ内の閉じるボタンにイベントを設定
    dialog.querySelector('#close-payment-dialog').addEventListener('click', function() {
      document.body.removeChild(backdrop);
    });
  
    // バックドロップとダイアログをページに追加
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  
  // 支払いに進むボタンにクリックイベントを設定
  document.getElementById('proceed-to-payment-btn').addEventListener('click', function() {
    showPaymentDialog(); // ポップアップウィンドウを表示する関数を呼び出す
  });
  
  
