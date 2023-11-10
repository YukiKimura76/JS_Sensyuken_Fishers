// auth.js

// DOMの取得
const loginPanel = document.getElementById('loginPanel');
const signUpPanel = document.getElementById('signUpPanel');
const linkSignUp = document.getElementById('linkSignUp');
const linkLogin = document.getElementById('linkLogin');
// 必要な他のDOM要素を取得する

// ページ読み込み時の処理
window.onload = function() {
  // ログインフォームを表示、新規登録フォームを非表示にする
  loginPanel.style.display = 'block';
  signUpPanel.style.display = 'none';
};

// 新規登録リンクのイベントハンドラ
linkSignUp.addEventListener('click', function() {
  loginPanel.style.display = 'none';
  signUpPanel.style.display = 'block';
});

// ログインリンクのイベントハンドラ
linkLogin.addEventListener('click', function() {
  loginPanel.style.display = 'block';
  signUpPanel.style.display = 'none';
});

// 新規登録処理
const signUpButton = document.getElementById('submitS');
const emailInput = document.getElementById('emailS');
const passwordInput = document.getElementById('passwordS');
const confirmPasswordInput = document.getElementById('cPasswordS');

signUpButton.addEventListener('click', function() {
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // パスワードと確認用パスワードが一致するかチェック
  if(password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  // Firebaseの新規登録処理
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // 新規登録成功
      const user = userCredential.user;
      console.log('Registered as:', user.email);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // 登録失敗時のエラーメッセージ表示
      alert('Error registering: ' + errorMessage);
    });
});


// ユーザーログイン処理
function loginUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // ログイン成功
        alert("ログインしました:", userCredential.user.email);
        window.location.href = 'index.html'; 
    
        // ローディングパネルを非表示にする
        hideLoadingPanel();
      })
      .catch((error) => {
        // ログイン失敗
        console.error("Login failed:", error);
        // エラーメッセージを表示
        errorHandlerL.textContent = "ログインに失敗しました: " + error.message;
        // ローディングパネルを非表示にする
        hideLoadingPanel();
      });
  }
  
  // 認証状態のリスナー
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // ユーザーがログインしている状態
      console.log("User is signed in:", user.email);
      // ユーザーのメールアドレスを画面に表示するための要素を取得
      const userDisplayElement = document.getElementById('userDisplay');
  
      // ユーザー情報が表示される要素があるかチェック
      if (userDisplayElement) {
        // ユーザーのメールアドレスを表示
        userDisplayElement.textContent = 'Logged in as: ' + user.email;
      }
  
      // ログインしている場合の処理をここに追加
    } else {
      // ユーザーがログアウトしている状態
      console.log("User is signed out.");
      // ユーザーがログアウトしている場合の処理をここに追加
    }
  });
  
  // ローディングパネルの表示切り替え関数
  function showLoadingPanel() {
    // ローディングパネルを表示
    document.getElementById('loading-panel').style.display = 'block';
  }
  
  function hideLoadingPanel() {
    // ローディングパネルを非表示
    document.getElementById('loading-panel').style.display = 'none';
  }
  
  // ログインボタンクリックイベント
  document.getElementById('submitL').addEventListener('click', function() {
    const email = document.getElementById('emailL').value;
    const password = document.getElementById('passwordL').value;
    showLoadingPanel(); // ローディングパネルを表示
    loginUser(email, password); // ログイン処理を実行
  });
  

