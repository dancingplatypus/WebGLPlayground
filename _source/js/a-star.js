/*global console */

/*
    Use the A* algorithm to find the shortest path between two points in a grid.

    I'm going to make a few assumptions.  The grid goes from 0,0 to width,height.
    We'll let the user specify a starting point and an ending point and we'll let
    them place barriers that are impenetrable anywhere in the grid.  We will
    use a Manhattan path to create our optimal path weight and for simple calculations,
    horizontal/vertical weight will be assumed to be 10, while diagonal weight is 14.
*/

var astar;

function MinHeap(array, comparator) {

    /**
     * Storage for heap.
     * @private
     */
    "use strict";
	this.heap = array || [];

    /**
     * Default comparator used if an override is not provided.
     * @private
     */
	this.compare = comparator || function (item1, item2) {
		return item1 === item2 ? 0 : item1 < item2 ? -1 : 1;
	};

    /**
     * Retrieve the index of the left child of the node at index i.
     * @private
     */
	this.left = function (i) {
		return 2 * i + 1;
	};
    /**
     * Retrieve the index of the right child of the node at index i.
     * @private
     */
	this.right = function (i) {
		return 2 * i + 2;
	};
    /**
     * Retrieve the index of the parent of the node at index i.
     * @private
     */
	this.parent = function (i) {
		return Math.ceil(i / 2) - 1;
	};

    /**
     * Ensure that the contents of the heap don't violate the
     * constraint.
     * @private
     */
	this.heapify = function (i) {
        var lIdx, rIdx, smallest, temp;

        lIdx = this.left(i);
		rIdx = this.right(i);

		if (lIdx < this.heap.length
				&& this.compare(this.heap[lIdx], this.heap[i]) < 0) {
			smallest = lIdx;
		} else {
			smallest = i;
		}
		if (rIdx < this.heap.length
				&& this.compare(this.heap[rIdx], this.heap[smallest]) < 0) {
			smallest = rIdx;
		}
		if (i !== smallest) {
			temp = this.heap[smallest];
			this.heap[smallest] = this.heap[i];
			this.heap[i] = temp;
			this.heapify(smallest);
		}
	};

    /**
     * Starting with the node at index i, move up the heap until parent value
     * is less than the node.
     * @private
     */
	this.siftUp = function (i) {
        var p, temp;

        p = this.parent(i);
		if (p >= 0 && this.compare(this.heap[p], this.heap[i]) > 0) {
			temp = this.heap[p];
			this.heap[p] = this.heap[i];
			this.heap[i] = temp;
			this.siftUp(p);
		}
	};

    /**
     * Heapify the contents of an array.
     * This function is called when an array is provided.
     * @private
     */
	this.heapifyArray = function () {
		// for loop starting from floor size/2 going up and heapify each.
		var i;

		for (i = Math.floor(this.heap.length / 2) - 1; i >= 0; i -= 1) {
		//	jstestdriver.console.log("i: ", i);
			this.heapify(i);
		}
	};

	// If an initial array was provided, then heapify the array.
	if (array !== null) {
		this.heapifyArray();
	}
}

/**
 * Place an item in the heap.
 * @param item
 * @function
 */
MinHeap.prototype.push = function (item) {
    "use strict";
	this.heap.push(item);
	this.siftUp(this.heap.length - 1);
};

/**
 * Insert an item into the heap.
 * @param item
 * @function
 */
MinHeap.prototype.insert = function (item) {
    "use strict";
    this.push(item);
};

/**
 * Pop the minimum valued item off of the heap. The heap is then updated
 * to float the next smallest item to the top of the heap.
 * @returns the minimum value contained within the heap.
 * @function
 */
MinHeap.prototype.pop = function () {
    "use strict";
	var value;
	if (this.heap.length > 1) {
		value = this.heap[0];
		// Put the bottom element at the top and let it drift down.
		this.heap[0] = this.heap.pop();
		this.heapify(0);
	} else {
		value = this.heap.pop();
	}
	return value;
};

/**
 * Remove the minimum item from the heap.
 * @returns the minimum value contained within the heap.
 * @function
 */
MinHeap.prototype.remove = function () {
    "use strict";
    return this.pop();
};

/**
 * Returns the minimum value contained within the heap.  This will
 * not remove the value from the heap.
 * @returns the minimum value within the heap.
 * @function
 */
MinHeap.prototype.getMin = function () {
    "use strict";
	return this.heap[0];
};

/**
 * Return the current number of elements within the heap.
 * @returns size of the heap.
 * @function
 */
MinHeap.prototype.size = function () {
    "use strict";
	return this.heap.length;
};

function setArray(arr, x, y, value) {
    "use strict";
    if (arr[x] === undefined) {
        arr[x] = [];
    }
    arr[x][y] = value;
}

function getArray(arr, x, y) {
    "use strict";
    if (arr[x] === undefined) {
        return null;
    }
    if (arr[x][y] === undefined) {
        return null;
    }
    return arr[x][y];
}


astar = function (rows, cols, barriers) {
    "use strict";
    var grid,
        getAdjacentNodes,
        createNode,
        findPath,
        defineGrid,
        isNodeValid;

    createNode = function (row, col, parent, target) {
        var cost, dist;

        cost = parent.g + ((row === parent.row || col === parent.col) ? 10 : 14);
        dist = (Math.abs(target.row - row) + Math.abs(target.col - col)) * 10;

        return {
            parent: parent,
            row: row,
            col: col,
            g : cost,
            h : dist,
            f : cost + dist
        };
    };

    defineGrid = function (rows, cols, barriers) {
        var result, loop;

        barriers = barriers || [];
        result = {
            rows : rows,
            cols : cols,
            barriers : []
        };

        for (loop = 0; loop < barriers.length; loop += 1) {
            setArray(result.barriers, barriers[loop][0], barriers[loop][1], true);
        }

        return result;
    };


    getAdjacentNodes = function (from, target) {
        var results = [];
        results.push(createNode(from.row - 1, from.col - 1, from, target));
        results.push(createNode(from.row - 1, from.col, from, target));
        results.push(createNode(from.row - 1, from.col + 1, from, target));
        results.push(createNode(from.row, from.col - 1, from, target));
        results.push(createNode(from.row, from.col + 1, from, target));
        results.push(createNode(from.row + 1, from.col - 1, from, target));
        results.push(createNode(from.row + 1, from.col, from, target));
        results.push(createNode(from.row + 1, from.col + 1, from, target));
        return results;
    };

    /*
        fromLocation and toLocation are objects with col and row set to integers.

        A* is really just a directed, bread first tree search.  So we'll
        use a queue
     */
    findPath = function (fromLocation, target) {

        var open_heap, open_nodes, closed_nodes, current_node, success, anodes, anode, loop, ref, result, swap, stop;

        // we swap here so that the result gets to the user in the correct order

        swap = fromLocation;
        fromLocation = target;
        target = swap;

        open_heap = new MinHeap([], function (first, second) {
            var item1, item2;
            item1 = first.f;
            item2 = second.f;
            return item1 === item2 ? 0 : item1 < item2 ? -1 : 1;
        });

        open_heap.push({
            row: fromLocation.row,
            col: fromLocation.col,
            parent: null,
            f: 0,
            g: 0,
            h: 0
        });

        open_nodes = [];
        closed_nodes = [];

        /*
            while
                push current node onto closed list
                if current node is target node then break
                newNodes = get-adjacent-nodes (current)
                for each node in newNodes
                    if node is not in range, continue
                    if node is impenetrable, continue
                    if node is in the closed list, continue
                    if node is in the open list
                        is cost of node cheaper?
                            yes -- change its parent to us, pop and then push with new weight
                            no -- continue
                    else push node
         */
        success = false;
        while (open_heap.size() !== 0) {
            current_node = open_heap.pop();

            setArray(closed_nodes, current_node.row, current_node.col, current_node);
            if (current_node.row === target.row && current_node.col === target.col) {
                success = true;
                break;
            }
            anodes = getAdjacentNodes(current_node, target);
            for (loop = anodes.length - 1; loop >= 0; loop -= 1) {
                anode = anodes[loop];
                // make sure we are in range
                if (!(anode.row < 0 || anode.row >= grid.rows || anode.col < 0 || anode.col >= grid.cols)) {
                    // make sure we aren't impenetrable
                    ref = getArray(grid.barriers, anode.row, anode.col);
                    if (ref === null) {
                        // make sure we aren't in the closed list
                        ref = getArray(closed_nodes, anode.row, anode.col);
                        if (ref === null) {
                            ref = getArray(open_nodes, anode.row, anode.col);
                            if (ref !== null) {
                                if (ref.g > anode.g) {
                                    ref.f = anode.f;
                                    ref.g = anode.g;
                                    ref.parent = anode.parent;
                                    // O(n) every time we encounter a dupe.
                                    // Possible improvement available
                                    open_heap.heapifyArray();
                                }
                            } else {
                                setArray(open_nodes, anode.row, anode.col, anode);
                                open_heap.push(anode);
                            }
                        }
                    }
                }
            }
        }
        
        result = [];
        if (success) {
            while (current_node !== null) {
                stop = { row: current_node.row, col: current_node.col };
                result.push(stop);
                current_node = current_node.parent;
            }
        }

        return result;
    };

    grid = defineGrid(rows, cols, barriers);
    return {
        grid: grid,
        findPath : findPath
    };
};

function writeIt(path) {
    "use strict";
    var loop, bound;
    bound = path.length - 1;


    if (bound === -1) {
        console.log("No path found");
    } else {
        console.log("--- Travelling from " + path[0].row + "," + path[0].col + " to " + path[bound].row + "," + path[bound].col);
        for (loop = 0; loop < path.length; loop += 1) {
            console.log("-> move to " + path[loop].row + "," + path[loop].col);
        }
    }
}

// a little maze
var test1 = astar(6, 7, [ [1, 0], [1, 1], [1, 2], [1, 3], [3, 6], [3, 5], [3, 4], [3, 3], [3, 2] ]);
writeIt(test1.findPath({row: 0, col: 0}, {row: 5, col: 5}));
