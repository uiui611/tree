/*
 * Examples about tree-traversal.
 */

import Tree, {BreathFirstWalker} from '../dist/tree';
import assert from 'assert';

describe('EXAMPLE-TRAVERSAL', ()=> {
    /*
     * You can walk tree by calling Tree#walk(callback).
     */
    it('Depth first walk.', ()=>{
        const res = [];
        new Tree({
            name: 'root',
            children :[
                { name: 'child A'},
                {
                    name: 'child B',
                    children: [
                        { name: 'grandson A'},
                        { name: 'grandson B'},
                        { name: 'grandson C'}
                    ]
                },
                { name: 'child C'}
            ]
        }).walk(node=>res.push(node.name));
        assert.deepStrictEqual(
            res,
            [ 'child A', 'grandson A', 'grandson B', 'grandson C', 'child C']
        );
    });

    /*
     * You can decide more detail feature,
     *   by setting the option object at the second parameter
     *   instead of set visitor.
     */
    it('Visit non-leaf node, too.', ()=>{
        const res = [];
        new Tree({
            name: 'root',
            children :[
                { name: 'child A'},
                {
                    name: 'child B',
                    children: [
                        { name: 'grandson A'},
                        { name: 'grandson B'},
                        { name: 'grandson C'}
                    ]
                },
                { name: 'child C'}
            ]
        }).walk({
            /* Called on leaf nodes. */
            visit: node=>res.push(node.name),
            /* Called on non-leaf nodes, before visits it's children. */
            preVisit: node=>res.push(node.name)
        });
        assert.deepStrictEqual(
            res,
            [ 'root', 'child A', 'child B', 'grandson A', 'grandson B', 'grandson C', 'child C']
        );
    });

    /*
     * Set option.Walker to specify the traversal mode.
     * The default mode is Depth-First mode.
     */
    it('Breath-First traversal.', ()=>{
        const res = [];
        new Tree({
            name: 'root',
            children :[
                { name: 'child A'},
                {
                    name: 'child B',
                    children: [
                        { name: 'grandson A'},
                        { name: 'grandson B'},
                        { name: 'grandson C'}
                    ]
                },
                { name: 'child C'}
            ]
        }).walk({
            /* Set the constructor of the ObjectTreeWalker. */
            Walker: BreathFirstWalker,
            visit: node=>res.push(node.name),
            preVisit: node=>res.push(node.name)
        });
        assert.deepStrictEqual(
            res,
            [ 'root', 'child A', 'child B', 'child C', 'grandson A', 'grandson B', 'grandson C']
        );
    });

    /*
     * Tree instances are iterator object to visit all leaf node.
     */
    it('Tree is an iterator object.', ()=>{
        const res = [];
        const tree = new Tree({
            name: 'root',
            children:[
                { name: 'child A' },
                { name: 'child B' }
            ]
        });
        for(let node of tree) res.push(node.name);
        assert.deepStrictEqual(res, ['child A', 'child B']);
    });
});