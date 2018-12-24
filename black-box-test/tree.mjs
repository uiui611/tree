import Tree from '../dist/tree.mjs';
import assert from 'assert';

describe('Tree feature test.', ()=>{
    it('Can access the node as property.', ()=>{
        const root = { name: 'root' };
        assert.deepStrictEqual(
            new Tree(root).node,
            root
        );
    })
});