
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

var thunk = function (f) {
    return function () {
        f();
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

    var makeCell = function (rune, rowOfCells, rowElement, atColumNumOptional) {
        var atColumNumSpecified = typeof(atColumNumOptional) === 'number';
        var insertAtIndex = atColumNumSpecified ? atColumNumOptional : rowOfCells.length;
        var cell = document.createElement("span");
        cell.className = 'ropyEditorRune';
        var node = document.createTextNode(rune !== ' ' ? rune : '\u00A0');
        cell.appendChild(node);
        rowOfCells.splice(insertAtIndex, 0, cell);
        if (atColumNumSpecified) {
            console.log(`insert before, insertAtIndex=${insertAtIndex}`);
            rowElement.insertBefore(cell, rowElement.childNodes[atColumNumOptional]);
        } else {
            rowElement.appendChild(cell);
        }
        dimElement.innerHTML = '' + cells[0].length + ' by ' + cells.length;
    };

    var makeRow = function (row, atRowNumOptional) {
        var atRowNumSpecified = typeof(atRowNumOptional) === 'number';
        var rowElement = document.createElement("div");
        rowElement.className = 'ropyEditorRow';
        var rowOfCells = [];
        var insertAtIndex = atRowNumSpecified ? atRowNumOptional : cells.length;
        cells.splice(insertAtIndex, 0, rowOfCells);
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            makeCell(row[colIndex], rowOfCells, rowElement);
        }
        if (atRowNumSpecified) {
            containerElement.insertBefore(rowElement, containerElement.childNodes[atRowNumOptional]);
        } else {
            containerElement.appendChild(rowElement);
        }
        rowElements.splice(insertAtIndex, 0, rowElement);
    };

    var expandRight = function(atColumNumOptional) {
        for (let i = 0; i < cells.length; i++) {
            const row = cells[i];
            const rowElement = rowElements[i];
            makeCell(' ', row, rowElement, atColumNumOptional);
        }
    };

    var expandDown = function (atRowNumOptional) {
        var runes = [];
        for (let i = 0; i < cells[0].length; i++) {
            runes.push(' ');
        }
        makeRow(runes, atRowNumOptional);
    };

    var cutRow = function () {
        var rowIndex = y;
        if (cells.length < 2) return;
        if (y === 0)
            movements.down();
        else
            movements.up();
        
        containerElement.removeChild(rowElements[rowIndex]);
        cells.splice(rowIndex, 1);
        rowElements.splice(rowIndex, 1);
    };

    var cutColumn = function () {
        var colIndex = x;
        if (cells[0].length < 2) return;
        if (x > 0)
            movements.left();

        for(let i = 0; i < cells.length; i++) {
            let row = cells[i];
            let cell = row[colIndex];
            row.splice(colIndex, 1);
            rowElements[i].removeChild(cell);
        }

        renderActiveCell();
    };

    var initialize = function () {
        var runesForRow = new Array(50);
        runesForRow.fill(' ');
        for (let rowIndex = 0; rowIndex <= 15; rowIndex++) {
            makeRow(runesForRow);
        }
    };

    var renderActiveCell = function () {
        cells[y][x].className = 'ropyEditorRune ropyEditorRuneActive';
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

    var getGrid = function () {
        return _.map(cells, function (row) {
            return _.map(row, function (cell) {
                let rune = cell.innerText;
                return rune == NBSP ? ' ' : rune;
            })
        });
    };

    var clear = function () {
        cells.forEach(row => {
            row.forEach(cell => {
                cell.innerHTML = NBSP;
            });
        });
    };

    var paste = function (source) {
        console.log(source);
        source = ropy.core.tokenize(source); //_.map(source.split('\n'), function (line) { return line.split(''); });
        
        var missingRowNum = Math.max(0, source.length + y - cells.length);
        _.times(missingRowNum, thunk(expandDown));

        var missingColNum = Math.max(0, _.max(_.map(source, function (x) { return x.length; })) + x - cells[0].length);
        _.times(missingColNum, thunk(expandRight));

        var xx = x;
        var yy = y;
        source.forEach(row => {
            row.forEach(rune => {
                cells[yy][xx].innerHTML = rune == ' ' ? NBSP : rune;
                xx++;
            });
            yy++;
            xx = x;
        });
    };

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
    }; // end crop

    var keysActive = true;
    var specialHandlingKeys = 'abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ0123456789!"#¤%&/()=?`,.-;:_\'\\@£$€{[]}*^~|§<>'.split('');

    window.document.body.onkeydown = function (e) {

        if(!keysActive) return;

        //console.log(`KeyDown <${e.key}> <${e.code}>`);

        if (e.ctrlKey) {
            if (e.code == 'ArrowRight') {
                expandRight();
                e.preventDefault();
            } else if (e.code == 'ArrowDown') {
                expandDown();
                e.preventDefault();
            } else if (e.altKey && e.shiftKey && e.code == 'Enter') {
                expandRight(x);
                x++;
                e.preventDefault();
            } else if (e.altKey && e.code == 'Enter') {
                expandRight(x+1);
                e.preventDefault();
            } else if (e.shiftKey && e.code == 'Enter') {
                expandDown(y);
                y++;
                e.preventDefault();
            } else if (e.code == 'Enter') {
                expandDown(y+1);
                e.preventDefault();
            } else if (e.altKey && e.key == 'x') {
                cutColumn();
                e.preventDefault();
            } else if (e.key == 'x') {
                cutRow();
                e.preventDefault();
            } else if (e.key == 'r') {
                crop();
                e.preventDefault();
            }
        } else {
            if (e.code == 'ArrowUp') {
                movements.up();
                e.preventDefault();
            } else if (e.code == 'ArrowDown') {
                movements.down();
                e.preventDefault();
            } else if (e.code == 'ArrowLeft') {
                movements.left();
                e.preventDefault();
            } else if (e.code == 'ArrowRight') {
                movements.right();
                e.preventDefault();
            } else if (e.code == 'Home') {
                moveActiveCell(function () { x = 0 });
                e.preventDefault();
            } else if (e.code == 'End') {
                moveActiveCell(function () { x = cells[y].length - 1 });
                e.preventDefault();
            } else if (e.code == 'PageUp') {
                moveActiveCell(function () { y = 0 });
                e.preventDefault();
            } else if (e.code == 'PageDown') {
                moveActiveCell(function () { y = cells.length - 1 });
                e.preventDefault();
            } else if (e.code == 'Space') {
                setCellFunc('\u00A0')();
                e.preventDefault();
            } else if (e.code == 'Backspace') {
                movements.left();
                cells[y][x].innerHTML = '\u00A0';
                e.preventDefault();
            } else if (e.code == 'Delete') {
                cells[y][x].innerHTML = '\u00A0';
                e.preventDefault();
            } else if (specialHandlingKeys.includes(e.key)) {
                setCellFunc(e.key)();
                e.preventDefault();
            }
        }
    };

    initialize();
    renderActiveCell();

    var setKeysActive = function (b) {
        keysActive = b;
    };

    return {
        expandRight: expandRight,
        expandDown: expandDown,
        crop: crop,
        paste: paste,
        clear: clear,
        setKeysActive: setKeysActive,
        getGrid: getGrid
    };
};