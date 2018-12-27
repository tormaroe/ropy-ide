
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

    var runButton = document.getElementById('runButton');
    runButton.onclick = function () { alert('Run not yet implemented'); };

    var cropButton = document.getElementById('cropButton');
    cropButton.onclick = editor.crop;

    var clearButton = document.getElementById('clearButton');
    clearButton.onclick = function () { alert('Clear not yet implemented'); };

})();