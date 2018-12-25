/*
 * Examples about methods for functional programming.
 */

import Tree from '../dist/tree';
import assert from 'assert';

describe('EXAMPLE-FUNCTIONAL-PROGRAMMING', ()=>{
    /*
     * You can map each node to other object by using Tree#map like Array#map().
     * It returns the Tree instance, so you can chain calls.
     */
    it('Mapping function.', ()=>{
        const res = new Tree({
            name: 'root',
            children: [
                {name: 'child A'},
                {name: 'child B'}
            ]
        }).map(node => ({
            value: `The name is ${node.name}`
        }));
        /* The `res` is a tree instance (Tree#map returns Tree instance). */
        assert.deepStrictEqual(
            /* Tree#root represents the root node of this tree. */
            res.root,
            {
                value: 'The name is root',
                children:[
                    {value: 'The name is child A' },
                    {value: 'The name is child B' }
                ]
            }
        );
    });

    /*
     * You can reduce nodes from children to parent.
     */
    it('Reduction.', ()=>{
        const res = new Tree({
            value: 100,
            children: [
                {value: 10},
                {value:  1}
            ]
        }).reduce((children, node) => {
            /* Current node value. */
            let value = node.value;
            for(let c of children){
                /* Children values. */
                value += c.value;
            }
            return {value}
        });
        assert.deepStrictEqual(res, { value: 111 });
    });

    /* If you set the initial value, the reducer is also called on the leaf node. */
    it('Reduction (with initial value).', ()=>{
        const res = new Tree({
            name: 'root',
            children: [
                {name: 'child A'},
                {name: 'child B'}
            ]
        }).reduce((children, node) => {
            let name = `${node.name} > ` + children.map(c=>c.name).join(' , ');
            return { name:`[${name}]` }
            /* Note that the initial value should be array. */
        }, [{name: 'initial-name' }]);
        assert.deepStrictEqual(
            res,
            { name: '[root > [child A > initial-name] , [child B > initial-name]]' }
        );
    });
});