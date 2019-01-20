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
     * Returns falsy value or empty array if and only if the node is a leaf node.
     * When the result is an empty array.
     * @param {any} node Target node to get children.
     * @returns {any[]|false} The children or falsy value.
     */
    getChildren(node){ return node.children; }

    /**
     * Move to the next node and return it.
     * @abstract
     * @return {any|traversalState.END_TRAVERSAL} The next node value or
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
 * @property LEAF The current value don't have any children.
 * @property POST The current value has children, after visiting them.
 * @property END_TRAVERSAL The traversal have been finished.
 */
export const traversalState = Object.freeze({
    PRE: Symbol('PRE'),
    LEAF: Symbol('LEAF'),
    POST: Symbol('POST'),
    END_TRAVERSAL: null
});
function depthFirstWalker_enter(node){
    const children = node.value && getValidChildren(this.getChildren(node.value));
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
export class DepthFirstWalker extends ObjectTreeWalker{
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
                const children = getValidChildren(this.getChildren(currentNode.value));
                // Recompute children (it's children can be changed).
                if (!children) {
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
function getValidChildren(children){
    if(children && children.length) return children;
}
/**
 * A tree walker for breath-first traversal.
 * @class BreathFirstWalker
 * @extends ObjectTreeWalker
 */
export class BreathFirstWalker extends ObjectTreeWalker{
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
            && getValidChildren(this.getChildren(currentNode.value));
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
        const nextChildren = getValidChildren(this.getChildren(next.value));
        privates.get(this).state =
            next.post    ? traversalState.POST :
            nextChildren ? traversalState.PRE  :
                           traversalState.LEAF;
        return (privates.get(this).currentNode = currentNode.next).value;
    }
}

/**
 * The callback for visit tree node.
 * @callback visitor
 * @param {any} node The current node.
 * @param {object} option The optional information container.
 * @param {Array.<any>} option.parents The array for the current node from the root.
 * @param {boolean} option.isOnLeaf True if and only if the walker is on a leaf node.
 */

/**
 * Traversal for tree object.
 * @param {any} root The root object to traversal.
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
export function walk(root, option){
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