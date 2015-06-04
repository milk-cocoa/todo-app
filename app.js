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

		getTodoDataStore(function(err, todoDataStore) {

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

		function getTodoDataStore(cb) {
		    var todoDataStore = milkcocoa.dataStore("todos");
	        milkcocoa.user(function(err, user) {
	    		if (err) {
	        		cb(err);
	    			return;
	    		}
	            if(user) {
	            	cb(null, todoDataStore.child(user.sub));
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
			            	cb(null, todoDataStore.child(user.sub));
		                });
		        	});
				}
	        });
		}
	}
}(window))