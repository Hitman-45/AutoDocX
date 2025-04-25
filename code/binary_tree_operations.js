const assert = require('assert');

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function countNodes(root) {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(val) {
    const node = new TreeNode(val);
    if (!this.root) {
      this.root = node;
      return this;
    }
    let cur = this.root;
    while (true) {
      if (val < cur.val) {
        if (!cur.left) {
          cur.left = node;
          break;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = node;
          break;
        }
        cur = cur.right;
      }
    }
    return this;
  }

  search(val) {
    let cur = this.root;
    while (cur) {
      if (val === cur.val) return true;
      cur = val < cur.val ? cur.left : cur.right;
    }
    return false;
  }

  inorder() {
    const result = [];
    (function traverse(node) {
      if (!node) return;
      traverse(node.left);
      result.push(node.val);
      traverse(node.right);
    })(this.root);
    return result;
  }
}

const bst = new BinarySearchTree();
bst.insert(5).insert(3).insert(7).insert(2).insert(4).insert(9);


assert.strictEqual(countNodes(bst.root), 6);


assert.strictEqual(bst.search(5), true);
assert.strictEqual(bst.search(4), true);


assert.strictEqual(bst.search(10), false);


assert.deepStrictEqual(bst.inorder(), [2, 3, 4, 5, 7, 9]);

console.log("Binary tree standalone & class-based tests passed");