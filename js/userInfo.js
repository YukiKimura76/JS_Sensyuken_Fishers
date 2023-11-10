// DOM要素の取得
const user_info = document.getElementById('user_info');
const logout = document.getElementById('logout');
const login = document.getElementById('login');
const signUp = document.getElementById('signUp');


// ログアウトイベント
logout.addEventListener('click', e => {
  firebase.auth().signOut();
});
