(function(global){
    // ひやさん
    // var milkcocoa = new MilkCocoa("vuei9dh5mu3.mlkcca.com");

    // へいま
    var milkcocoa = new MilkCocoa("blueiagdnu1z.mlkcca.com");

    //Auth0の設定
    // ひやさん
    // var lock = new Auth0Lock(
    // 	'z2RcQboX6E8c2yxUPZIqPaA6rdQdXQUF',
    // 	'milkcocoa.auth0.com'
    // 	);

		// へいま
		var lock = new Auth0Lock(
	    'ZHzhPjbBvzYj0dOhY1EVoA1KB4oRnFUC',
	    'kiyopikko.auth0.com'
	  );

	global.onload = onload;
	function onload() {
		var new_content = document.getElementById("new_content");
		var create_button = document.getElementById("create_btn");
		var todos = document.getElementById("todos");
		var requests = document.getElementById("requests");

		var todos_id = escapeHTML(location.hash.substr(1));

	    var todoDataStore = milkcocoa.dataStore("todos").child(todos_id);
		getUser(function(err, user_id) {
			if(err) {

			}else{
				if(todos_id == '') location.hash = user_id;
				create_todos_view(user_id, todoDataStore, function() {
					create_request_access_view(user_id, todoDataStore);
				});
				if(todos_id == user_id) {
					create_admin_view(user_id, todoDataStore);
				}
			}
		});

		function create_request_access_view(user_id, todoDataStore) {
			var make_request_view = document.getElementById('make_request_view');
			make_request_view.style.display = 'block';
			var todos_view = document.getElementById('todos_view');
			todos_view.style.display = 'none';

			document.getElementById('make_request_view').style = 'display:block;';
			var requestDataStore = todoDataStore.child('requests');
			var request_button = document.getElementById("request_btn");
			requestDataStore.on('set', function(setted) {
				window.alert("参加をリクエストしました。");
			});
			request_button.addEventListener("click", function(e) {
				var username = window.localStorage.getItem('todoapp-username');
				requestDataStore.set(user_id, {
					username : username
				});
			});

		}
		function create_admin_view(user_id, todoDataStore) {
			var requests_view = document.getElementById('requests_view');
			requests_view.style.display = 'block';
			var allow_button = document.getElementById("allow_btn");

			var requestDataStore = todoDataStore.child('requests');
			var allowDataStore = todoDataStore.child('allows');
			requestDataStore.stream().sort('desc').size(20).next(function(err, todos) {
				todos.forEach(function(todo) {
					render_request(todo.id, todo.value);
				});
			});
			allowDataStore.on('set', function(setted) {
				window.alert("リクエストを許可しました。");
			});
			allow_button.addEventListener("click", function(e) {
				var target_user_id = requests.options[requests.selectedIndex].dataset['user_id'];
				allowDataStore.set(target_user_id, {});
			});

		}
		function create_todos_view(user_id, todoDataStore, cb) {
			var todos_view = document.getElementById('todos_view');
			todos_view.style.display = 'block';
			//1
			todoDataStore.stream().sort('desc').size(20).next(function(err, todos) {
				if(err) {
					cb();
					return;
				}
				todos.forEach(function(todo) {
					render_todo(todo.value);
				});
			});
			//2
			todoDataStore.on('push', function(pushed) {
				render_todo(pushed.value);
			});
			//3
			create_button.addEventListener("click", function(e) {
				todoDataStore.push({
					content : new_content.value
				});
				new_content.value = "";
			});

		}


		function render_todo(todo) {
			var element = document.createElement("div");
			element.textContent = todo.content
			todos.appendChild(element);
		}

		function render_request(user_id, request) {
			var element = document.createElement("option");
			element.dataset['user_id'] = user_id;
			element.textContent = request.username;
			requests.appendChild(element);
		}

		function getUser(cb) {
	        milkcocoa.user(function(err, user) {
	    		if (err) {
	        		cb(err);
	    			return;
	    		}
	            if(user) {
	            	cb(null, user.sub);
				}else{
		        	lock.show(function(err, profile, token) {
		        		if (err) {
	                		cb(err);
		        			return;
		        		}
		        		console.log(err, profile, token);
		        		window.localStorage.setItem('todoapp-username', profile.username);
		                milkcocoa.authWithToken(token, function(err, user) {
		                	if(err) {
		                		cb(err);
		                		return;
		                	}
			            	cb(null, user.sub);
		                });
		        	});
				}
	        });
		}

		function escapeHTML(str) {
			return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
	}
}(window))