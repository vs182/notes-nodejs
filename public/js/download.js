function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
var title = document.getElementById("title")
    // Start file download.
document.getElementById("dwn-btn").addEventListener("click", function() {
    var text = document.getElementById("editArea").value;
    
    if (title.value == "") {
        var filename = "untitled.txt";
    } else {
        var filename = title.value + ".txt";
    }

    download(filename, text);
}, false);



function printTextArea() {
    childWindow = window.open('','childWindow');
    childWindow.document.open();
    childWindow.document.write('<html><head></head><body>');
    childWindow.document.write(document.getElementById('editArea').value.replace(/\n/gi,'<br>'));
    childWindow.document.write('</body></html>');
    childWindow.print();
    childWindow.document.close();
    childWindow.close();
  }


  function Copy() {
    /* Get the text field */
    var copyText = document.getElementById("editArea");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);

    /* Alert the copied text */
    alert("Text Copied");
}

myFile.addEventListener("input", () => {
    var file = document.getElementById("myFile").files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var textArea = document.getElementById("editArea");
        textArea.value = e.target.result;
    };
    reader.readAsText(file);
})