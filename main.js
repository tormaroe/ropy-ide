
var toggleDocumentation = (function() {
    var visible = false;
    var div = document.getElementById('documentation');
    return function () {
        if (visible) {
            div.style = 'display: none';
        } else {
            div.style = 'display: block';
        }
        visible = !visible;
    };
})();

var togglePaste = (function(editor) {
    var visible = false;
    var div = document.getElementById('clipboard');
    return function () {
        if (visible) {
            div.style = 'display: none';
        } else {
            div.style = 'display: block';
        }
        editor.setKeysActive(visible);
        visible = !visible;
    };
});

(function () {    
    var editorElement = document.getElementById('editor');
    var posElement = document.getElementById('infoCurrentPos');
    var dimElement = document.getElementById('infoDimensions');
    var directionElement = document.getElementById('infoDirection');
    var modeElement = document.getElementById('infoMode');
    var editor = ropyEditor(editorElement, posElement, dimElement, directionElement, modeElement);

    var openButton = document.getElementById('openButton');
    openButton.onclick = function () { alert('Open not yet implemented'); };

    var saveButton = document.getElementById('saveButton');
    saveButton.onclick = function () { alert('Save not yet implemented'); };

    var pasteButton = document.getElementById('pasteButton');
    pasteButton.onclick = togglePaste(editor);

    var runButton = document.getElementById('runButton');
    runButton.onclick = function () { alert('Run not yet implemented'); };

    var cropButton = document.getElementById('cropButton');
    cropButton.onclick = editor.crop;

    var clearButton = document.getElementById('clearButton');
    clearButton.onclick = function () { alert('Clear not yet implemented'); };

    var clipboardText = document.getElementById('clipboardText');

    var pasteCancelButton = document.getElementById('pasteCancelButton');
    pasteCancelButton.onclick = pasteButton.onclick;

    var pasteOkButton = document.getElementById('pasteOkButton');
    pasteOkButton.onclick = function () {
        editor.paste(clipboardText.value);
        pasteCancelButton.onclick();
    };

})();