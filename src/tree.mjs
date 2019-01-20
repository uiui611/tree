/**
 * @file Define a tree container.
 * @author mizu-mizu
 */

import {DepthFirstWalker} from "./traversal.mjs";
import {traversalState, walk} from "./traversal";
import {querySelector} from "@mizu-mizu/array-matcher";

function extend(target, ...sources){
    sources.forEach(s=>{
        Object.entries(s).forEach(([k, v])=>{
            if(typeof v !== "undefined") target[k] = v;
        })
    })
}

function tree_getOptions({childrenGetter=null, childrenSetter=null}={}){
    if((childrenGetter || childrenSetter) && !(childrenGetter && childrenSetter)){
        throw new Error('You should specify childrenGetter and childrenSetter both or neither.');
    }
    return {
        childrenGetter: childrenGetter || this.childrenGetter,
        childrenSetter: childrenSetter || this.childrenSetter
    };
}
/**
 * Container for a tree structure.
 * @class Tree
 * @param {object} root The root node for tree object.
 * @param {object} [option={}] The option object.
 * @param {function} [option.childrenGetter]
 *   Override {@link Tree#childrenGetter this#childrenGetter}.
 * @param {function} [option.childrenSetter]
 *   Override {@link Tree#childrenSetter this#childrenSetter}.
 * @see Tree#childrenGetter
 * @see Tree#childrenSetter
 */
class Tree{
    constructor(root, {
        childrenGetter=undefined,
        childrenSetter=undefined
    }={}){
        /**
         * The root object of this tree.
         * @member {*}
         */
        this.root = root;
        extend(this, {
            childrenGetter,
            childrenSetter
        });
    }
    /**
     * The way to get children from a node.
     *
     * You can overwrite this method to change the way.
     * It is recommended to overwrite with {@link Tree#childrenSetter childrenSetter()} .
     *
     * You can set this parameter on the constructor, too.
     * @method Tree#childrenGetter
     * @param {*} node The target node.
     * @return {Array|null} The children of the target node or null if this is a leaf node.
     */
    childrenGetter(node){ return node.children; }
    /**
     * The way to set children of the node.
     *
     * You can overwrite this method to change the way.
     * It is recommended to overwrite with {@link Tree#childrenGetter childrenGetter()} .
     * @method Tree#childrenSetter
     * @param {*} node The node.
     * @param {Array} children The node list to set as children.
     */
    childrenSetter(node, children){ node.children = children; }

    /**
     * Create a new tree with the result of the specified callback.
     *
     * This method keep the structure of this tree, and map values of each node.
     * @param {function} mappingFunction Callback to create new node.
     * @param {object} [option={}] The option of this method.
     * @param {function} [option.childrenGetter=this.childrenGetter] The way to get children on the new tree.
     * @param {function} [option.childrenSetter=this.childrenSetter] The way to set children for the new tree.<br>
     *   If you set this option, then you should set `option.childrenGetter` too.
     * @returns {Tree} The generated tree.
     */
    map(mappingFunction, option){
        const override=tree_getOptions.call(this, option);
        const root = this.reduce(
            (children, node, {isOnLeaf})=>{
                const newNode = mappingFunction(node);
                if(!isOnLeaf) override.childrenSetter(newNode, children);
                return newNode;
            },
            null
        );
        return new Tree(root, override);
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
     * If you set the initial value, then the reducer is called on the leaf node too,
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
     * @return {*|null} First match to the query or null(not found).
     */
    getNode(query){
        const matcher = querySelector(query);
        const walker = new DepthFirstWalker(this.root, {childrenGetter: this.childrenGetter });
        while(walker.next()!==traversalState.END_TRAVERSAL){
            if(matcher([...walker.getParents(), walker.current])) return walker.current;
        }
        return null;
    }

    /**
     * Get the children node as an instance of the Tree.
     * @param {string} query The query to find a node like css pattern.
     * @return {Tree|null} First match to the query or null (not found).
     */
    getNodeAsTree(query){
        const node = this.getNode(query);
        if(node === null) return node;
        return new Tree(node, tree_getOptions.call(this, {}));
    }

    /**
     * Walk through the current node.
     * @param {object|function} options The option object for the second argument of {@link walk walk(root, option)}.
     * @see walk
     */
    walk(options){ return walk(this.root, options); }

    [Symbol.iterator](){
        const walker = new DepthFirstWalker(this.root, {getChildren: this.childrenGetter });
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