var Hash = (function () {
    "use strict";
    function Hash(size) {
        this.size = size;
        this.deletedEntry = 'deleted';
    }

    return Hash;
}());