(function (document, window, index) {
    var inputs = document.querySelectorAll(".inputfile");
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener("change", function (e) {
            var file = "";
            if (this.files && this.files.length > 1)
                file = (
                    this.getAttribute("data-multiple-caption") || ""
                ).replace("{count}", this.files.length);
            else file = e.target.value.split("\\").pop();

            if (file) label.querySelector("span").innerHTML = file;
            else label.innerHTML = labelVal;
            document.getElementById("file").value = "";
        });

        // Firefox bug fix
        input.addEventListener("focus", function () {
            input.classList.add("has-focus");
        });
        input.addEventListener("blur", function () {
            input.classList.remove("has-focus");
        });
    });
})(document, window, 0);
