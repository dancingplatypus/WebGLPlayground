/*global console */

/*
*
* Given two increasing lists, find the intersection
*
*  A B C E F
*  C D E G
*
*  output: C E
* */

var find_intersection;

find_intersection = function (list_1, list_2) {
    "use strict";
    var p_1, p_2, result, max_count;

    p_1 = p_2 = 0;
    result = [];

    if (isNaN(list_1.length + list_2.length)) {
        return [];
    }

    // perform a merge of the two lists.  Whenever an equality is encountered,
    // that is an intersection and should be saved
    while (!(p_1 > list_1.length || p_2 > list_2.length)) {
        if (list_1[p_1] === list_2[p_2]) {
            result.push(list_1[p_1]);
            p_1 += 1;
            p_2 += 1;
        } else if (list_1[p_1] > list_2[p_2]) {
            p_2 += 1;
        } else {
            p_1 += 1;
        }
    }

    return result;
};

console.log(find_intersection(['a', 'b', 'c', 'e', 'f'], ['c', 'd', 'e', 'g']));
