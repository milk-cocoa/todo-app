(function(global){

  var milkcocoa = new MilkCocoa("{your-app-id}.mlkcca.com");

  // Auth0の設定
  var lock = new Auth0Lock(
    '{Auth0アプリで固有のClient ID}',
    '{Auth0のアカウント名}.auth0.com'
  );

  global.onload = onload;

  // URLの#以下が変わってもリロードするようにする
  window.onhashchange = function(e){
      window.location.reload();
  };

  function onload() {

    var new_content = document.getElementById("new_content");
    var create_button = document.getElementById("create_btn");
    var logout_button = document.getElementById("logout_btn");
    var todos = document.getElementById("todos");
    var requests = document.getElementById("requests");
    var owner = document.getElementById("owner");
    var you = document.getElementById("you");

    // URLの#以下がToDoボードの所有者になる
    var todos_id = escapeHTML(location.hash.substr(1));
    var todoDataStore = milkcocoa.dataStore("todos").child(todos_id);



    /*
     *
     * ログイン後の処理
     *
     */

    getUser(function(err, user_id) {

      // ここは、ログイン後に実行される処理

      if(err) {

      }else{
        // URLの#以下が空だったら
        if(todos_id == '') location.hash = user_id; // hashchangedでリロードするようにしているので、リロードされる

        owner.innerHTML = todos_id;
        you.innerHTML = user_id;

        // ToDo画面の表示。
        create_todos_view(user_id, todoDataStore, function() {
          // ここは、権限がなければ呼び出される
          create_request_access_view(user_id, todoDataStore);
        });

        // オーナーであれば、リクエストを承認する画面を表示
        if(todos_id == user_id) create_admin_view(user_id, todoDataStore);
      }
    });



    /*
     *
     * ログイン処理
     *
     */

    function getUser(callback) {

      // 現在ユーザーがログインしていたら'user'にユーザー情報を渡す
      milkcocoa.user(function(err, user) {

        // エラーが出たらストップ
        if (err) {
          callback(err);
          return;
        }

        // ログインしていたら
        if(user) {
          // ユーザーIDを渡してログイン後処理
          callback(null, user.sub);
        }else{
          // showはログイン画面を表示する関数。コールバックはユーザーがログインを行ったときに実行するもので、ユーザー情報を'profile（生データ）'と'token（トークン化されたもの）'に渡す。
          lock.show(function(err, profile, token) {
            if (err) {
              callback(err);
              return;
            }

            // デバッグ用
            console.log(err, profile, token);
            // リクエスト送信のときに表示される名前をローカルストレージに保存しておく。
            window.localStorage.setItem('todoapp-username', profile.name);

            // tokenを使ってMilkcocoaでログイン
            milkcocoa.authWithToken(token, function(err, user) {
              if(err) {
                callback(err);
                return;
              }
              // ログインが成功したらリロード
              setTimeout(function(){
                window.location.reload();
              },200);

            });
          });
        }
      });
    }



    /*
     *
     * リクエスト画面
     *
     */

    function create_request_access_view(user_id, todoDataStore) {
      var request_access_view = document.getElementById('request_access_view');
      request_access_view.style.display = 'block';
      var todos_view = document.getElementById('todos_view');
      todos_view.style.display = 'none';
      var request_button = document.getElementById("request_btn");

      var requestDataStore = todoDataStore.child('requests');

      requestDataStore.on('set', function(setted) {
        window.alert("参加をリクエストしました。");
      });

      request_button.addEventListener("click", function(e) {
        // ログインの際に保存したユーザーの名前を取得
        var username = window.localStorage.getItem('todoapp-username');
        // リクエストデータストアに登録
        requestDataStore.set(user_id, {
          username : username
        });
      });
    }



    /*
     *
     * 承認画面
     *
     */

    function create_admin_view(user_id, todoDataStore) {
      var admin_view = document.getElementById('admin_view');
      admin_view.style.display = 'block';
      var allow_button = document.getElementById("allow_btn");

      var requestDataStore = todoDataStore.child('requests');
      var allowDataStore = todoDataStore.child('allows');

      // リクエスト一覧の表示
      requestDataStore.stream().sort('desc').size(20).next(function(err, reqs) {
        reqs.forEach(function(req) {
          render_request(req.id, req.value);
        });
      });

      allowDataStore.on('set', function(setted) {
        window.alert("リクエストを許可しました。");
      });
      allow_button.addEventListener("click", function(e) {
        // select要素で選択しているIDを、承認用のデータストアに登録
        var target_user_id = requests.options[requests.selectedIndex].dataset['user_id'];
        allowDataStore.set(target_user_id, {});
      });
    }



    /*
     *
     * ToDo表示画面
     *
     */

    function create_todos_view(user_id, todoDataStore, callback) {
      var todos_view = document.getElementById('todos_view');
      todos_view.style.display = 'block';

      todoDataStore.stream().sort('desc').size(20).next(function(err, todos) {

       /* 権限がなければ第一引数(err)にエラー内容を返す
          err: 'permission denied' */

        if(err) {
          // 権限がなければリクエスト画面だけを表示
          callback();
          return;
        }
        // 権限があれば、ToDoを表示
        todos.forEach(function(todo) {
          render_todo(todo.value);
        });
      });

      todoDataStore.on('push', function(pushed) {
        render_todo(pushed.value);
      });

      create_button.addEventListener("click", function(e) {
        todoDataStore.push({
          content : new_content.value
        });
        new_content.value = "";
      });
    }



    /*
     *
     * 描画の関数
     *
     */

    function render_todo(todo) {
      var element = document.createElement("div");
      element.textContent = todo.content
      todos.appendChild(element);
    }

    function render_request(user_id, request) {
      var element = document.createElement("option");
      // data属性にユーザーIDを
      element.dataset['user_id'] = user_id;
      element.textContent = request.username;
      requests.appendChild(element);
    }



    /*
     *
     * ログアウトもできるように
     *
     */

    logout_button.addEventListener("click", function(e) {
      milkcocoa.logout(function(){
        window.location.href = '/';
      });
    });

    function escapeHTML(str) {
      return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }
}(window))