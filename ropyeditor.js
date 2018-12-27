
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

ropyEditor = function (containerElement, posElement, dimElement, directionElement, modeElement) {
    const NBSP = String.fromCharCode(160);
    //var selectionMode = false;
    //var selectionStartX = undefined;
    //var selectionStartY = undefined;
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

    //var renderSelection = function () {
    //    if (selectionMode) {
    //        console.log("Render selection");
    //        for (var i = selectionStartY; i<=y; i++) {
    //            for (var j = selectionStartX; j<=x; j++) {
    //                cells[i][j].className = 'ropyEitorRune ropyEditorRuneSelected'
    //                //selectionStartX > x ? j-- : j++;
    //            }
    //            //selectionStartY > y ? i-- : i++;
    //        }
    //    }
    //};

    //var startSelection = function () {
    //    selectionMode = true;
    //    selectionStartX = x;
    //    selectionStartY = y;
    //    modeElement.innerHTML = "select";
    //};
//
    //var editorEscape = function () {
    //    selectionMode = false;
    //    selectionStartX = undefined;
    //    selectionStartY = undefined;
    //    modeElement.innerHTML = "normal";
    //};

    var moveActiveCell = function (fMove) {
        cells[y][x].className = 'ropyEditorRune';
        fMove();
        //renderSelection();
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
            console.log("Set cell " + rune);
            cells[y][x].innerHTML = rune; //.childNodes[0].nodeValue = rune;
            nextMove();
        };
    };

    var cellIsEmpty = function (cell) {
        return cell.innerText == NBSP;
    }

    var crop = function () {
        cells[y][x].className = 'ropyEditorRune';
        
        var removeTopRowsCount = _
            .takeWhile(cells, function (rowCells) {
                return _.every(rowCells, cellIsEmpty);
            })
            .length;
        removeTopRowsCount = Math.min(removeTopRowsCount, cells.length - 1);
        for(var idx=0; idx<removeTopRowsCount; idx++) {
            var rowElm = rowElements.shift();
            rowElm.parentNode.removeChild(rowElm);
        }
        cells = _.drop(cells, removeTopRowsCount);

        var removeBottomRowsCount = _
            .takeRightWhile(cells, function (rowCells) {
                return _.every(rowCells, cellIsEmpty);
            })
            .length;
        removeBottomRowsCount = Math.min(removeBottomRowsCount, cells.length - 1);
        for(var idx=cells.length-1; idx>=cells.length-removeBottomRowsCount; idx--) {
            var rowElm = rowElements.pop();
            rowElm.parentNode.removeChild(rowElm);
        }
        cells = _.take(cells, cells.length - removeBottomRowsCount);

        var removeLeftColsCount = _
            .chain(cells)
            .map(function (rowCells) {
                return _.takeWhile(rowCells, cellIsEmpty).length;
            })
            .min()
            .value();
        removeLeftColsCount = Math.min(removeLeftColsCount, cells[0].length - 1);
        rowElements.forEach(row => {
            for (let idx = 0; idx < removeLeftColsCount; idx++) {
                row.removeChild(row.childNodes[0]);
            }
        });
        cells = _.map(cells, function (rowCells) {
            return _.drop(rowCells, removeLeftColsCount);
        });

        var removeRightColsCount = _
            .chain(cells)
            .map(function (rowCells) {
                return _.takeRightWhile(rowCells, cellIsEmpty).length;
            })
            .min()
            .value();
        removeRightColsCount = Math.min(removeRightColsCount, cells[0].length - 1);
        rowElements.forEach(row => {
            for (let idx = 0; idx < removeRightColsCount; idx++) {
                row.removeChild(row.lastChild);
            }
        });
        cells = _.map(cells, function (rowCells) {
            return _.take(rowCells, rowCells.length - removeRightColsCount);
        });

        x = 0;
        y = 0;
        renderActiveCell();
    };


    var specialHandlingKeys = 'abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ0123456789!"#¤%&/()=?`,.-;:_\'\\@£$€{[]}*^~|§<>'.split('');

    window.document.body.onkeydown = function (e) {
        console.log(`KeyDown ${e.key} ${e.code}`);
        if (e.code == 'Space') {
            setCellFunc('\u00A0')();
            e.preventDefault();
        } else if (e.code == 'Backspace') {
            moveLeft();
            cells[y][x].innerHTML = '\u00A0';
            e.preventDefault();
        } else if (e.code == 'Delete') {
            cells[y][x].innerHTML = '\u00A0';
            e.preventDefault();
        } else if (specialHandlingKeys.includes(e.key)) {
            setCellFunc(e.key)();
            e.preventDefault();
        }
    };

    var listener = new window.keypress.Listener();

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

    listener.simple_combo("ctrl right", expandRight);
    listener.simple_combo("ctrl down", expandDown);

    renderActiveCell();

    return {
        expandRight: expandRight,
        expandDown: expandDown,
        crop: crop
    };
};