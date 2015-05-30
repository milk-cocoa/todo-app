(function(global){
    var milkcocoa = new MilkCocoa("vuei9dh5mu3.mlkcca.com");

    //Auth0の設定
    var lock = new Auth0Lock(
    	'z2RcQboX6E8c2yxUPZIqPaA6rdQdXQUF',
    	'milkcocoa.auth0.com'
    	);

	global.onload = onload;
	function onload() {
		var new_content = document.getElementById("new_content");
		var create_button = document.getElementById("create_btn");
		var todos = document.getElementById("todos");

		var todos_id = location.hash.substr(1);

	    var todoDataStore = milkcocoa.dataStore("todos").child(todos_id);
		getUser(function(err, user_id) {
			if(todos_id == user_id) {
				create_todos_view(user_id, todoDataStore);
			}else{
				create_request_access_view(user_id, todoDataStore);
			}
		});

		function create_request_access_view(user_id, todoDataStore) {
			requestDataStore = todoDataStore.child('requests');
			var request_button = document.getElementById("request_btn");
			request_button.addEventListener("click", function(e) {
				requestDataStore.set(user_id, {});
			});

		}

		function create_todos_view(user_id, todoDataStore) {
			//1
			todoDataStore.stream().sort('desc').size(20).next(function(err, todos) {
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
	}
}(window))