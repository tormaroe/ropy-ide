var ropy = ropy || {};

ropy.debugger = function (elements) {
    const NBSP = String.fromCharCode(160);
    var program = undefined;
    var cells = [];
    var intervalId = undefined;
    var sleepLength = 100;
    var intervalCount = 0;
    var iPrev = 0;
    var jPrev = 0;

    var clearGrid = function () {
        while (elements.grid.firstChild) {
            elements.grid.removeChild(elements.grid.firstChild);
        }
    };

    var expandGrid = function () {
        let rowCount = program.tokens.length;
        let colCount = program.tokens[0].length;

        cells = [];
        _.times(rowCount, function (rowIdx) {
            var rowElement = document.createElement("div");
            rowElement.className = 'ropyEditorRow';
            elements.grid.appendChild(rowElement);
            cells.push([]);
            _.times(colCount, function (colIdx) {
                var cell = document.createElement("span");
                cell.className = 'ropyEditorRune';
                var node = document.createTextNode('\u00A0');
                cell.appendChild(node);
                cells[rowIdx].push(cell);
                rowElement.appendChild(cell);
            })
        });
    };

    var loadTokens = function () {
        _.forEach(program.tokens, function (row, y) {
            _.forEach(row, function (rune, x) {
                cells[y][x].innerHTML = rune == ' ' ? NBSP : rune;
            })
        })
    };

    var loadGrid = function (grid) {
        program = ropy.core.make_program_object(grid);
        program.print = printProgramOutput;
        ropy.core.setInputHandler(function () {
            return window.prompt("Input requested");
        });
        clearProgramOutput();
        clearGrid();
        expandGrid();
        loadTokens();
        renderState();
    };

    var clearProgramOutput = function () {
        elements.output.innerText = "";
    };

    var printProgramOutput = function (data) {
        elements.output.innerText += data;
    };

    var renderState = function () {
        if (iPrev != undefined) {
            cells[iPrev][jPrev].className = 'ropyEditorRune ropyEditorRuneActive';    
        }
        cells[program.i][program.j].className = 'ropyEditorRune ropyEditorInstructionPointer';
        elements.iterationCount.innerText = intervalCount;
        elements.currentToken.innerText = ropy.tokenShortDescription(ropy.core.current(program));
        elements.sleepLength.innerText = sleepLength + 'ms';
        elements.instructionPointer.innerText = `${program.j}, ${program.i}`;
        elements.currentDirection.innerText = program.prev_direction;
        elements.isDone.innerText = program.done;
        
        var stack = elements.dataStack;
        while (stack.firstChild) {
            stack.removeChild(stack.firstChild);
        }
        program.stack.forEach(x => {
            var elm = document.createElement("span");
            elm.className = 'stackElement';
            elm.innerText = x;
            stack.appendChild(elm);
            stack.appendChild(document.createTextNode(' '));
        });

        var returnStack = elements.returnStack;
        while (returnStack.firstChild) {
            returnStack.removeChild(returnStack.firstChild);
        }
        program.return_stack.forEach(x => {
            var elm = document.createElement("span");
            elm.className = 'stackElement';
            elm.innerText = x.join("-");
            returnStack.appendChild(elm);
            returnStack.appendChild(document.createTextNode(' '));
        });

        var memory = elements.memory;
        while (memory.firstChild) {
            memory.removeChild(memory.firstChild);
        }
        _.forOwn(program.memory, function(value, key) {
            var elmKey = document.createElement("span");
            elmKey.className = 'memoryKey';
            elmKey.innerText = key;
            memory.appendChild(elmKey);
            var elmValue = document.createElement("span");
            elmValue.className = 'memoryValue';
            elmValue.innerText = value;
            memory.appendChild(elmValue);
            memory.appendChild(document.createTextNode(' '));
        });
    };

    var start = function () {
        if (intervalId) return;

        intervalId = setInterval(function () {
            step();
            if (program.done) {
                pause();
            }
        }, sleepLength);
    };

    var pause = function () {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
    };

    var step = function () {
        intervalCount++;
        ropy.core.evaluate(program);
        renderState();
        iPrev = program.i;
        jPrev = program.j;
    };

    var setSleepLength = function (value) {
        var running = intervalId;        
        sleepLength = value;
        elements.sleepLength.innerText = sleepLength + 'ms';
        if (running) {
            pause();
            start();
        }
    };

    return {
        loadGrid: loadGrid,
        start: start,
        rewind: function () {
            pause();
            intervalCount = 0;
            loadGrid(program.tokens);
        },
        pause: pause,
        step: step,
        incSpeed: function () {
            setSleepLength(Math.round(sleepLength / 2));
        },
        decSpeed: function () {
            setSleepLength(sleepLength * 2);
        },
    }
};