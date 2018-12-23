/**
 * @file Define a tree container.
 * @author mizu-mizu
 */

import {DepthFirstWalker} from "./traversal.mjs";
import {traversalState} from "./traversal";

/**
 * Container for a tree structure.
 * @class
 * @param {object} root The root node for tree object.
 * @param {object} [option={}] The option object.
 * @param {function} [getChildren=o=>o.children] The function to get node's children.
 *
 *   This function returns an array of children or a falsy value (if it is a leaf node).
 */
export class Tree{
    constructor(root, { getChildren=o=>o.children }={}){
        this.node = root;
        Object.assign(this, {getChildren});
    }
    [Symbol.iterator](){
        const walker = new DepthFirstWalker(this.node, {getChildren: this.getChildren });
        return {
            next: ()=>{
                let res;
                while((res = walker.next())){
                    if(walker.state===traversalState.LEAF){
                        return { value: res }
                    }
                }
                return { done: true }
            }
        };
    }
}