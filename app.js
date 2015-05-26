(function(global){
    var milkcocoa = new MilkCocoa("vuei9dh5mu3.mlkcca.com");
    var todoDataStore = milkcocoa.dataStore("todos");

	global.onload = onload;
	function onload() {
		var new_content = document.getElementById("new_content");
		var create_button = document.getElementById("create_btn");
		var todos = document.getElementById("todos");

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

		function render_todo(todo) {
			var element = document.createElement("div");
			element.textContent = todo.content
			todos.appendChild(element);
		}
	}
}(window))