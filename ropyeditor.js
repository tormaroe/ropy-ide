
var nextMoveMagic = function (coordinates, callback) {
    var nextDirection = 'right';
    var prevX = undefined;
    var prevY = undefined;

    const tests = Object.entries({
        left: function (x, y) {
            return y === prevY && x === (prevX - 1);
        },
        down: function (x, y) {
            return x === prevX && y === (prevY + 1);
        },
        up: function (x, y) {
            return x === prevX && y === (prevY - 1);
        },
        downRight: function (x, y) {
            return x === (prevX + 1) && y === (prevY + 1);
        },
        downLeft: function (x, y) {
            return x === (prevX - 1) && y === (prevY + 1);
        },
        upRight: function (x, y) {
            return x === (prevX + 1) && y === (prevY - 1);
        },
        upLeft: function (x, y) {
            return x === (prevX - 1) && y === (prevY - 1);
        }
    });
 
    return function () {
        var [x, y] = coordinates();
        if (prevX !== undefined) { 
            nextDirection = 'right';
            for (const [dir, test] of tests) {
                if (test(x, y)) {
                    nextDirection = dir;
                    break;
                }
            }
        }
        prevX = x;
        prevY = y;
        callback(nextDirection);
    };
};

ropyEditor = function (containerElement, posElement, dimElement, directionElement) {
    var x = 0;
    var y = 0;
    var rowElements = [];
    var cells = [];

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
    };

    var moveRight = function () {
        if (cells[y].length > (x + 1))
            moveActiveCell(function () { x++ });
    };

    var moveLeft = function () {
        if (x > 0)
            moveActiveCell(function () { x-- });
    };

    var moveDown = function () {
        if (cells.length > (y + 1))
            moveActiveCell(function () { y++ });
    };

    var moveUp = function () {
        if (y > 0)
            moveActiveCell(function () { y-- });
    };

    var movements = {
        right: moveRight,
        left: moveLeft,
        down: moveDown,
        up: moveUp,
        downRight: function () {
            moveDown();
            moveRight();
        },
        downLeft: function () {
            moveDown();
            moveLeft();
        },
        upRight: function () {
            moveUp();
            moveRight();
        },
        upLeft: function () {
            moveUp();
            moveLeft();
        }
    };

    var nextMove = nextMoveMagic(function () {
        return [x, y];
    }, function (direction) {
        movements[direction]();
        infoDirection.innerHTML = direction;
    });

    var setCellFunc = function (rune) {
        return function () {
            cells[y][x].innerHTML = rune; //.childNodes[0].nodeValue = rune;
            nextMove();
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

    listener.simple_combo("right", movements.right);
    listener.simple_combo("left", movements.left);
    listener.simple_combo("down", movements.down);
    listener.simple_combo("up", movements.up);
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

    renderActiveCell();

    return {
        expandRight: expandRight,
        expandDown: expandDown
    };
};