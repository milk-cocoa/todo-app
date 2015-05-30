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

		getUser(function(err, user_id) {
			var todoDataStore = milkcocoa.dataStore('todos').child(user_id);

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

		})


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