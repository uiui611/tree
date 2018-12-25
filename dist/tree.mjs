/**
 * @file Available to walk trees.
 * @author mizu-mizu
 */

/**/
function EMPTY(){}
const privates = new WeakMap();

/**
 * Tree walker for objects.
 *
 * @class ObjectTreeWalker
 * @param {Object} [options={}] Optional values.
 * @param {function} [options.getChildren=o=>o.children] Override it's getChildren method.
 * @abstract
 * @property {object} [current] Current node (=Last value to visit).
 * @property {traversalState} state Type of the current node.<br>
 *     Initial value is depends on the implementation.
 *     This is s readonly property.
 */
class ObjectTreeWalker{
    constructor({getChildren}={}) {
        if(getChildren) this.getChildren = getChildren;
    }

    /**
     * Get the children of the node.
     *
     * Returns falsy value if and only if the node is a leaf node.
     * When the result is an empty array,
     *     it means target node is not a leaf node but no children are found.
     * @param {object} node Target node to get children.
     * @returns {object[]} The children or falsy value.
     */
    getChildren(node){ return node.children; }

    /**
     * Move to the next node and return it.
     * @abstract
     * @return {object|traversalState.END_TRAVERSAL} The next node value or
     *     {@link traversalState.END_TRAVERSAL} if the traversal have been completed.
     */
    next(){ throw new Error('Must be implemented by the subclass. ') }

    /**
     * Get the parent node list.
     *
     * The first element is the root node.
     *     The last element is the parent node of the current node.
     * @abstract
     * @return {object[]} The parents list.
     */
    getParents(){ throw new Error('Must be implemented by the subclass. ') }
}

/**
 * Represents the type of the current node for walkers.
 * @readonly
 * @enum traversalState
 * @property PRE The current value has children, before visiting them.
 * @property LEAF The current value don't have a property 'children'.
 * @property POST The current value has children, after visiting them.
 * @property END_TRAVERSAL The traversal have been finished.
 */
const traversalState = Object.freeze({
    PRE: { toString:()=>'PRE'},
    LEAF: { toString: ()=>'LEAF' },
    POST: { toString: ()=>'POST' },
    END_TRAVERSAL: null
});
function depthFirstWalker_enter(node){
    const children = node.value && this.getChildren(node.value);
    Object.assign(privates.get(this), {
        currentNode: node,
        state: children ? traversalState.PRE : traversalState.LEAF
    });
    return node.value;
}

/**
 * A tree walker for depth-first traversal.
 * @class DepthFirstWalker
 * @extends ObjectTreeWalker
 */
class DepthFirstWalker extends ObjectTreeWalker{
    constructor(root, options){
        super(options);
        privates.set(this, {
            currentNode:{value: null, next: {value:root}},
            state: traversalState.LEAF,
            stack: []
        });
    }
    get current(){ return privates.get(this).currentNode.value }
    get state(){ return privates.get(this).state }
    getParents() {
        return privates.get(this).stack.map(o=>o.value);
    }
    next(){
        const {state, currentNode, stack} = privates.get(this);
        switch (state) {
            case traversalState.LEAF:
            case traversalState.POST: {
                if (!currentNode.next) {
                    if (stack.length === 0) {
                        return privates.get(this).state = traversalState.END_TRAVERSAL;
                    }
                    privates.get(this).state = traversalState.POST;
                    return (privates.get(this).currentNode = stack.pop()).value;
                }
                return depthFirstWalker_enter.call(this, currentNode.next);
            }
            case traversalState.PRE: {
                const children = this.getChildren(currentNode.value);
                // Recompute children (it's children can be changed).
                if (!(children && children.length)) {
                    privates.get(this).state = traversalState.POST;
                    return currentNode.value;
                }
                stack.push(currentNode);
                return depthFirstWalker_enter.call(
                    this,
                    children
                        .map(value => ({value}))
                        .reduceRight((prev, current) => {
                            current.next = prev;
                            return current;
                        })
                );
            }
            case traversalState.END_TRAVERSAL:
                return traversalState.END_TRAVERSAL;
        }
    }
}
/**
 * A tree walker for breath-first traversal.
 * @class BreathFirstWalker
 * @extends ObjectTreeWalker
 */
class BreathFirstWalker extends ObjectTreeWalker{
    constructor(root, options){
        super(options);
        const currentNode = {value: null, next: {value:root}};
        privates.set(this, {
            currentNode,
            lastNode: currentNode.next,
            state: traversalState.LEAF
        });
    }
    get current(){ return privates.get(this).currentNode.value }
    get state(){ return privates.get(this).state }
    getParents() {
        let {currentNode} = privates.get(this);
        if(!currentNode) return [];
        const res = [];
        while(currentNode.parent) res.push(currentNode = currentNode.parent);
        return res.reverse().map(n=>n.value);
    }
    next(){
        const {currentNode, lastNode} = privates.get(this);
        const children = currentNode.value
            && !currentNode.post
            && this.getChildren(currentNode.value);
        if(children){
            const lastChild =
                children.map(value=>({
                    value,
                    parent: currentNode,
                })).reduce(
                    (prev, current)=> prev.next = current,
                    lastNode
                );
            privates.get(this).lastNode
                = lastChild.next
                = { value: currentNode.value, post: true };
        }
        if(!currentNode.next){
            privates.get(this).state = traversalState.END_TRAVERSAL;
            return privates.get(this).currentNode = traversalState.END_TRAVERSAL;
        }
        const next = currentNode.next;
        privates.get(this).state =
            next.post ? traversalState.POST :
            this.getChildren(currentNode.next.value) ? traversalState.PRE :
            traversalState.LEAF;
        return (privates.get(this).currentNode = currentNode.next).value;
    }
}

/**
 * The callback for visit tree node.
 * @callback visitor
 * @param {object} node The current node.
 * @param {object} option The optional information container.
 * @param {Array.<object>} option.parents The array for the current node from the root.
 * @param {boolean} option.isOnLeaf True if and only if the walker is on a leaf node.
 */

/**
 * Traversal for tree object.
 * @param {Object} root The root object to traversal.
 * @param {Object|function} option Option object or callback to visit.
 * @param {function} [option.Walker=DepthFirstWalker] The constructor to traversal tree implements {@link ObjectTreeWalker}.
 * @param {function} [option.getChildren=o=>o.children] The getter for tree-node's children.
 * @param {visitor} [option.preVisit=()=>{}] The callback called before visiting nodes.
 *
 *  This callback is called **only** for non-leaf nodes.
 * @param {visitor} [option.postVisit=()=>{}] The callback called after visiting nodes.
 *
 *  This callback is called **only** for non-leaf nodes.
 * @param {visitor} [option.visit=()=>{}] The callback function to visit.
 *
 *  This callback is called **only** at leaf nodes.
 */
function walk(root, option){
    if(typeof option === 'function') option = {visit: option};
    const {
        getChildren=undefined,
        preVisit=EMPTY,
        postVisit=EMPTY,
        visit=EMPTY,
        Walker=DepthFirstWalker
    } = option;
    const walker = new Walker(root, {getChildren});
    while(walker.state!==traversalState.END_TRAVERSAL){
        const val = walker.next();
        const args = [
            val,
            {
                parents: walker.getParents(),
                isOnLeaf: walker.state===traversalState.LEAF
            }
        ];
        switch (walker.state) {
            case traversalState.LEAF: visit(...args); break;
            case traversalState.PRE : preVisit(...args); break;
            case traversalState.POST : postVisit(...args); break;
        }
    }
}

/**
 * @file Define a tree container.
 * @author mizu-mizu
 */

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

/*
 * @file
 *  Publish all methods and classes from this file.
 */

export default Tree;
export { traversalState, DepthFirstWalker, BreathFirstWalker, walk };
