var ropy = ropy || {};

ropy.storage = (function (storage) {

    const PROGRAM_KEY_PREFIX = 'program:';

    var isProgramKey = function (key) {
        return key.startsWith(PROGRAM_KEY_PREFIX)
    };

    var programKey = function (key) {
        return PROGRAM_KEY_PREFIX + key;
    };

    var stripProgramKeyPrefix = function (key) {
        return key.substring(PROGRAM_KEY_PREFIX.length, key.length);
    }

    var getProgram = function (key) {
        return storage.getItem(programKey(key));
    };
    
    var listPrograms = function () {
        return Object.keys(storage).filter(isProgramKey).map(stripProgramKeyPrefix);
    };
    
    var deleteProgram = function (key) {
        storage.removeItem(programKey(key));
    };

    var saveProgram = function (key, source) {
        storage.setItem(programKey(key), source);
    };

    return {
        getProgram: getProgram,
        listPrograms: listPrograms,
        deleteProgram: deleteProgram,
        saveProgram: saveProgram
    };
})(localStorage);