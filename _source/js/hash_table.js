/*global alert: false, console: false */

// open addressing -- no resizing -- double hash
var Hash = (function () {
    "use strict";

    var FNV_offset_basis = 2166136261,
        FNV_prime = 16777619,
        //
        // hash functions
        //
        fn_hash,
        fn_hash1,
        fn_hash2;

    // constructor
    // @param hash_func open addressing scheme will take the object
    // and an index (between 0 and length) and produce a hash code.
    function Hash(table_size) {
        this._arr = [];
        this._size = table_size;
        this._deletedEntry = 'deleted';
        this._arr = [];
    }

    // Use a double hash to avoid primary clustering
    //
    fn_hash1 = function (item) {
        var i,
            result = FNV_offset_basis;
        for (i = 0; i < item.length; i += 1) {
            result = result ^ (item.charAt(i) * FNV_prime);
        }
        return result;
    };
    fn_hash2 = function (item) {
        return fn_hash1(item);
    };
    fn_hash  = function (item, index, size) {
        var code1, code2;
        code1 = fn_hash1(item);
        code2 = index === 0 ? 0 : fn_hash2(item) * index;
        return (code1 + code2) % size;
    };


    // add
    Hash.prototype.Contains = function (item) {
        var iLoop, hc;
        for (iLoop = 0; iLoop < this._size; iLoop += 1) {
            hc = fn_hash(item, iLoop, this._size);
            if (this._arr[hc] === undefined) {
                return false;
            }
            if (this._arr[hc] === item) {
                return true;
            }
        }
        return false;
    };

    Hash.prototype.Add = function (item) {
        var iLoop, hc;
        for (iLoop = 0; iLoop < this._size; iLoop += 1) {
            hc = fn_hash(item, iLoop, this._size);
            if (this._arr[hc] === undefined || this._arr[hc] === this._deletedEntry) {
                this._arr[hc] = item;
                return;
            }
        }
        throw "Hash table is full";
    };

    Hash.prototype.Remove = function (item) {
        var iLoop, hc;
        for (iLoop = 0; iLoop < this._size; iLoop += 1) {
            hc = fn_hash(item, iLoop, this._size);
            if (this._arr[hc] === null) {
                return false;
            }
            if (this._arr[hc] === item) {
                this._arr[hc] = this._deletedEntry;
            }
        }
        return;
    };

    Hash.prototype.Items = function () {
        return this._arr;
    };

    return Hash;
}());

var h = new Hash(100);
var data = ["duck", "lipstick", "bird", "fruit", "donut"];
var iLoop = 0;

for (iLoop = 0; iLoop < data.length; iLoop += 1) {
    h.Add(data[iLoop]);
}

console.log(h.Contains("duck"));
console.log(h.Contains("goose"));
console.log(h.Contains("lipstick"));
console.log(h.Contains("spud"));

h.Remove("duck");
console.log(h.Contains("duck"));
console.log('-----');
console.log(h.Items());

