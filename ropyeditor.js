ropyEditor = function (containerElement, posElement, dimElement) {
    var x = 0;
    var y = 0;
    var rowElements = [];
    var cells = [];
    var selectionStartX = undefined;
    var selectionStartY = undefined;

    var makeCell = function (rune, rowOfCells, rowElement) {
        var cell = document.createElement("span");
        cell.className = 'ropyEditorRune';
        var node = document.createTextNode(rune !== ' ' ? rune : '\u00A0');
        cell.appendChild(node);
        rowOfCells.push(cell);
        rowElement.appendChild(cell);
        dimElement.innerHTML = '' + cells[0].length + ' by ' + cells.length;
    };

    var makeRow = function (row) {
        var rowElement = document.createElement("div");
        rowElement.className = 'ropyEditorRow';
        var rowOfCells = [];
        cells.push(rowOfCells);
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            makeCell(row[colIndex], rowOfCells, rowElement);
        }
        containerElement.appendChild(rowElement);
        rowElements.push(rowElement);
    };

    var expandRight = function() {
        for (let i = 0; i < cells.length; i++) {
            const row = cells[i];
            const rowElement = rowElements[i];
            makeCell(' ', row, rowElement);
        }
    };

    var expandDown = function () {
        var runes = [];
        for (let i = 0; i < cells[0].length; i++) {
            runes.push(' ');
        }
        makeRow(runes);
    };

    var saveToClipboard = function () {

    };

    var selectionCapture =  function () {
        if (selectionStartX === undefined) {
            selectionStartX = x;
            selectionStartY = y;
        }
    };

    var copyCommand = function () {

    };

    var cutCommand = function () {

    };

    var pasteCommand = function () {

    };

    var pasteFromClipboardCommand = function () {

    };

    var loadClipboard = function () {
        console.log("loadClipboard");
        console.log(document.execCommand('paste'));
    };

    var runesForRow = new Array(50);
    runesForRow.fill(' ');
    for (let rowIndex = 0; rowIndex <= 15; rowIndex++) {
        makeRow(runesForRow);
    }

    var renderActiveCell = function () {
        cells[y][x].className = 'ropyEditorRune ropyEditorRuneActive'
        cells[y][x].scrollIntoView(false);
        posElement.innerHTML = '' + x + ',' + y;
    };

    var moveActiveCell = function (fMove) {
        cells[y][x].className = 'ropyEditorRune';
        fMove();
        renderActiveCell();

        if (selectionStartX !== undefined) {
            // 
        }
    };

    var moveRight = function () {
        if (cells[y].length > (x + 1))
            moveActiveCell(function () { x++ });
    };

    var moveLeft = function () {
        if (x > 0)
            moveActiveCell(function () { x-- });
    };

    var setCellFunc = function (rune) {
        return function () {
            cells[y][x].innerHTML = rune; //.childNodes[0].nodeValue = rune;
            moveRight();
        };
    };

    var listener = new window.keypress.Listener();

    var normalInputRunes = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '.'
    ];
    for (let i = 0; i < normalInputRunes.length; i++) {
        const r = normalInputRunes[i];
        listener.simple_combo(r, setCellFunc(r));        
    }

    listener.simple_combo("right", moveRight);
    listener.simple_combo("left", moveLeft);
    listener.simple_combo("down", function () {
        if (cells.length > (y + 1))
            moveActiveCell(function () { y++ });
    });
    listener.simple_combo("up", function () {
        if (y > 0)
            moveActiveCell(function () { y-- });
    });
    listener.simple_combo("home", function () {
        moveActiveCell(function () { x = 0 });
    });
    listener.simple_combo("end", function () {
        moveActiveCell(function () { x = cells[y].length - 1 });
    });
    listener.simple_combo("pageup", function () {
        moveActiveCell(function () { y = 0 });
    });
    listener.simple_combo("pagedown", function () {
        moveActiveCell(function () { y = cells.length - 1 });
    });

    listener.simple_combo("delete", function () {
        cells[y][x].innerHTML = '\u00A0'; // TODO: Work with selection
    });
    listener.simple_combo("backspace", function () {
        moveLeft();
        cells[y][x].innerHTML = '\u00A0';
    });
    listener.simple_combo("space", setCellFunc('\u00A0'));

    listener.simple_combo("ctrl right", expandRight);
    listener.simple_combo("ctrl down", expandDown);

    listener.simple_combo("shift left", selectionCapture());
    listener.simple_combo("shift right", selectionCapture());
    listener.simple_combo("shift up", selectionCapture());
    listener.simple_combo("shift down", selectionCapture());

    renderActiveCell();

    return {
        saveToClipboard: saveToClipboard,
        expandRight: expandRight,
        expandDown: expandDown,
        loadClipboard: loadClipboard
    };
};