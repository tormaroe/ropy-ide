
var makeToggler = function (elementId, callback) {
    var visible = false;
    var div = document.getElementById(elementId);
    return function () {
        if (visible) {
            div.style = 'display: none';
        } else {
            div.style = 'display: block';
        }
        callback && callback(visible);
        visible = !visible;
    };
};

var toggleDocumentation = makeToggler('documentation');

(function () {    
    var editorElement = document.getElementById('editor');
    var posElement = document.getElementById('infoCurrentPos');
    var dimElement = document.getElementById('infoDimensions');
    var directionElement = document.getElementById('infoDirection');
    var modeElement = document.getElementById('infoMode');
    var editor = ropyEditor(editorElement, posElement, dimElement, directionElement, modeElement);
    
    
    /*
     *  >>>   O P E N
     */
    var toggleOpen = makeToggler('openDialog');

    var programUrlLoader = function (url) {
        return function () {
            toggleOpen();
            ajaj.get(url, function (response) {
                editor.clear();
                editor.crop();
                editor.paste(response.body);
            });
        };
    };
    
    var examplePrograms = [
        { title: 'Hello world', url: 'https://raw.githubusercontent.com/tormaroe/ropy/master/examples/hello_world.ropy'},
        { title: 'Solution to Euler Problem #1', url: 'https://raw.githubusercontent.com/tormaroe/ropy/master/examples/euler1.ropy'},
        { title: 'FizzBuzz by Steffen Hageland', url: 'https://raw.githubusercontent.com/tormaroe/ropy/master/examples/fizzbuzz.ropy'},
        { title: 'Reverse Stack by Steffen Hageland', url: 'https://raw.githubusercontent.com/tormaroe/ropy/master/examples/reverse_stack.ropy'},
        { title: 'Birthday Cake by Stian Eikeland', url: 'https://raw.githubusercontent.com/tormaroe/ropy/master/examples/birthday_cake.ropy' }
    ];
    var exampleProgramsElm = document.getElementById('examplePrograms');
    examplePrograms.forEach(x => {
        var anchor = document.createElement("a");
        anchor.setAttribute("href", "#");
        anchor.innerText = x.title;
        anchor.onclick = programUrlLoader(x.url);
        var listItem = document.createElement("li");
        listItem.appendChild(anchor);
        exampleProgramsElm.appendChild(listItem);
    });
    
    var openButton = document.getElementById('openButton');
    openButton.onclick = toggleOpen;
    
    /*
     *  >>>   S A V E
     */
    document.getElementById('saveButton').onclick = function () { alert('Save not yet implemented'); };
    
    
    /*
     *  >>>   R U N
     */
    document.getElementById('runButton').onclick = function () { alert('Run not yet implemented'); };
    
    /*
     *  >>>   C R O P
     */
    document.getElementById('cropButton').onclick = editor.crop;
    
    /*
     *  >>>   C L E A R
     */
    document.getElementById('clearButton').onclick = function () { 
        if (confirm('Are you sure you want to clear everything?')) {
            editor.clear();
        }
    };
    
    /*
     *  >>>   P A S T E
     */
    var togglePaste = makeToggler('clipboard', function (visible) {
        editor.setKeysActive(visible);
    });

    document.getElementById('pasteButton').onclick = togglePaste;

    var clipboardText = document.getElementById('clipboardText');
    
    var pasteCancelButton = document.getElementById('pasteCancelButton');
    pasteCancelButton.onclick = togglePaste;
    
    document.getElementById('pasteOkButton').onclick = function () {
        editor.paste(clipboardText.value);
        pasteCancelButton.onclick();
    };
    
})();