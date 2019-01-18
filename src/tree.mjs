/**
 * @file Define a tree container.
 * @author mizu-mizu
 */

import {DepthFirstWalker} from "./traversal.mjs";
import {traversalState, walk} from "./traversal";
import {querySelector} from "@mizu-mizu/array-matcher";

function tree_getOptions({getChildren=null, setChildren=null}={}){
    if((getChildren || setChildren) && !(getChildren && setChildren)){
        throw new Error('You should specify getChildren and setChildren both or neither.');
    }
    return {
        newGetChildren: getChildren || this.getChildren,
        newSetChildren: setChildren || this.setChildren
    };
}
/**
 * Container for a tree structure.
 * @class Tree
 * @param {object} root The root node for tree object.
 * @param {object} [option={}] The option object.
 * @param {function} [option.getChildren=o=>o.children]
 *   The function to get node's children.<br>
 *   This function returns an array of children or a falsy value (if it is a leaf node).
 * @param {function} [option.setChildren=(node, children)=>node.children=children]
 *   The function to set node's children.<br>
 *   This function is used to create new tree by default.
 */
class Tree{
    constructor(root, {
        getChildren=o=>o.children,
        setChildren=(node, children)=>node.children = children
    }={}){
        /**
         * The root object of this tree.
         * @member {*}
         */
        this.root = root;
        Object.assign(this, {
            /**
             * The way to get children from a node.
             *
             * You can overwrite this method to change the way.
             * It is recommended to overwrite with {@link Tree#setChildren setChildren()} .
             *
             * You can set this parameter on the constructor, too.
             * @method Tree#getChildren
             * @param {*} node The target node.
             * @return {Array} The children of the target node.
             */
            getChildren,
            /**
             * The way to set children of the node.
             *
             * You can overwrite this method to change the way.
             * It is recommended to overwrite with {@link Tree#getChildren getChildren()} .
             * @method Tree#setChildren
             * @param {*} node The node.
             * @param {Array} children The children list to set.
             */
            setChildren
        });
    }

    getNode(target){

    }

    /**
     * Create a new tree with the result of the specified callback.
     *
     * This method keep the structure of this tree, and map values of each node.
     * @param {function} mappingFunction Callback to create new node.
     * @param {object} [options={}] The option of this method.
     * @param {function} [options.getChildren=this.getChildren] The way to get children on the new tree.
     * @param {function} [options.setChildren=this.setChildren] The way to set children for the new tree.<br>
     *   If you set this option, then you should set `option.getChildren` too.
     * @returns {Tree} The generated tree.
     */
    map(mappingFunction, options){
        const {newSetChildren, newGetChildren}=tree_getOptions.call(this, options);
        const root = this.reduce(
            (children, node, {isOnLeaf})=>{
                const newNode = mappingFunction(node);
                if(!isOnLeaf) newSetChildren(newNode, children);
                return newNode;
            },
            null
        );
        return new Tree(root, {getChildren: newGetChildren, setChildren: newSetChildren });
    }

    /**
     * Compute a single object from a node and an object from it's children.
     * @callback Tree~reducer
     * @param {Array} accumulators The accumulators computed from it children.
     * @param {*} currentValue The current node value.
     * @param {object} options The tree-traversal option equals to
     *   {@link visitor visitor(node, option)} applied at the second argument.
     */
    /**
     * Compute a single value from this tree.
     *
     * The reducer apply children array, and the current node.
     * If you set the initial value, then the reducer is called on the laef node too,
     *   but you have not, then it is called on the non-leaf node only.
     * @param {Tree~reducer} reducer The reducer to combine node and it's children.
     * @param {*} [initial] The initial value to provide leaf node's children.
     * @returns {*} The result.
     */
    reduce(reducer, initial){
        const stack = [[]];
        const hasInitial = initial !== undefined;
        this.walk({
            visit(node, option){
                stack[stack.length-1].push(
                    hasInitial ? reducer(initial, node, option)
                               : node
                );
            },
            preVisit(){
                stack.push([]);
            },
            postVisit(node, option){
                const top = stack.pop();
                stack[stack.length-1].push(reducer(top, node, option));
            }
        });
        return stack[0][0];
    }

    /**
     * Get the first match to the query.
     *
     * The query matching is depends on the feature of '@mizu-mizu/array-matcher#querySelector' which supports
     * - id selector (#id-name for {id:'id-name'})
     * - class selector (.class-name for {classList:['class-name]}
     * - space separator (matches any number of node)
     * - '>' separator (matches whose children only)
     * @param {string} query The query to find a node like css pattern.
     * @return {object|null} first match to the query or null(not found).
     */
    getNode(query){
        const matcher = querySelector(query);
        const walker = new DepthFirstWalker(this.root, {getChildren: this.getChildren });
        while(walker.next()!==traversalState.END_TRAVERSAL){
            if(matcher([...walker.getParents(), walker.current])) return walker.current;
        }
        return null;
    }

    /**
     * Walk throw the current node.
     * @param {object|function} options The option object for the second argument of {@link walk walk(root, option)}.
     * @see walk
     */
    walk(options){ return walk(this.root, options); }

    [Symbol.iterator](){
        const walker = new DepthFirstWalker(this.root, {getChildren: this.getChildren });
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

export default Tree;