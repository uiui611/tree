/**
 * @file Define a tree container.
 * @author mizu-mizu
 */

import {DepthFirstWalker} from "./traversal.mjs";
import {traversalState, walk} from "./traversal";

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
        this.node = root;
        Object.assign(this, {getChildren, setChildren });
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
        const stack = [{node: null, children:[]}];
        const {newSetChildren, newGetChildren}=tree_getOptions.call(this, options);
        this.walk({
            getChildren: this.getChildren,
            preVisit(node){
                stack.push({node, children:[]});
            },
            visit(node){
                stack[stack.length-1].children.push(
                    mappingFunction(node)
                );
            },
            postVisit(node){
                const top = stack.pop();
                const mapped = mappingFunction(node);
                newSetChildren(mapped, top.children);
                stack[stack.length-1].children.push(mapped);
            }
        });
        return new Tree(
            stack[0].children[0],
            { getChildren: newGetChildren, setChildren: newSetChildren }
        );
    }

    /**
     * Walk throw the current node.
     * @param {object|function} options The option object for the second argument of {@link walk walk(root, option)}.
     * @see walk
     */
    walk(options){ return walk(this.node, options); }

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

export default Tree;