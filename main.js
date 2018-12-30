var ropy = ropy || {};

ropy.makeToggler = function (elementId, callback) {
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

ropy.toggleDocumentation = ropy.makeToggler('documentation');

(function () {    
    var screenEditor = document.getElementById('screenEditor');
    var screenDebugger = document.getElementById('screenDebugger');
    var editorElement = document.getElementById('editor');
    var posElement = document.getElementById('infoCurrentPos');
    var dimElement = document.getElementById('infoDimensions');
    var directionElement = document.getElementById('infoDirection');
    var tokenElement = document.getElementById('infoToken');
    
    var editor = ropy.editor(editorElement, posElement, dimElement, directionElement, tokenElement);
    
    var dbg = ropy.debugger({
        grid: document.getElementById('debuggerGrid'),
        iterationCount: document.getElementById('iterationCount'),
        sleepLength: document.getElementById('sleepLength'),
        currentToken: document.getElementById('currentToken'),
        instructionPointer: document.getElementById('instructionPointer'),
        currentDirection: document.getElementById('currentDirection'),
        isDone: document.getElementById('isDone'),
        dataStack: document.getElementById('dataStack'),
        memory: document.getElementById('memory')
    });
    
    /*
    *  >>>   O P E N
    */
    
    var programStorageLoader = function (key) {
        return function () {
            toggleOpen();
            var source = ropy.storage.getProgram(key);
            currentProgramKey = key;
            editor.clear();
            editor.crop();
            editor.paste(source);
        }
    };
    
    var toggleOpen = ropy.makeToggler('openDialog', function (visible) {
        if (!visible) { 
            var storedProgramsElm = document.getElementById('storedPrograms');
     
            while (storedProgramsElm.firstChild) {
                storedProgramsElm.removeChild(storedProgramsElm.firstChild);
            }
            
            var storedPrograms = ropy.storage.listPrograms();
            storedPrograms.forEach(x => {
                var anchor = document.createElement("a");
                anchor.setAttribute("href", "#");
                anchor.innerText = x;
                anchor.onclick = programStorageLoader(x);
                var listItem = document.createElement("li");
                listItem.appendChild(anchor);
                storedProgramsElm.appendChild(listItem);
            });
        }
    });
    
    
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
    var currentProgramKey = undefined;
    document.getElementById('saveButton').onclick = function () { 
        var saveKey = prompt('Please name your program', currentProgramKey || '');
        if (saveKey != null) {
            ropy.storage.saveProgram(saveKey, editor.getSource());
        } 
    };
    
    
    /*
    *  >>>   R U N   &   D E B U G G E R
    */
    document.getElementById('runButton').onclick = function () { 
        screenEditor.style = 'display: none';
        screenDebugger.style = 'display: block';
        dbg.loadGrid(editor.getGrid())
    };
    document.getElementById('closeDebuggerButton').onclick = function () {
        dbg.pause();
        screenEditor.style = 'display: block';
        screenDebugger.style = 'display: none';
    }
    document.getElementById('runDebuggerButton').onclick = dbg.start;
    document.getElementById('pauseDebuggerButton').onclick = dbg.pause;
    document.getElementById('rewindDebuggerButton').onclick = dbg.rewind;
    document.getElementById('stepDebuggerButton').onclick = dbg.step;
    document.getElementById('speedUpButton').onclick = dbg.incSpeed;
    document.getElementById('speedDownButton').onclick = dbg.decSpeed;
    
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
    var togglePaste = ropy.makeToggler('clipboard', function (visible) {
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