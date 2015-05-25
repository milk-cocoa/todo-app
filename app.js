(function(global){
	global.onload = onload;
	function onload() {
		var new_content = document.getElementById("new_content");
		var create_button = document.getElementById("create_btn");
		var todos = document.getElementById("todos");
		create_button.addEventListener("click", function(e) {
			var element = document.createElement("div");
			element.textContent = new_content.value;
			todos.appendChild(element);
			new_content.value = "";
		});
	}
}(window))