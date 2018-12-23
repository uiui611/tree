import {Tree} from './tree.mjs';
import assert from 'assert';

describe('Check Tree Container', ()=>{
    describe('Iterable feature', ()=>{
        it('Iterate once.', ()=>{
            const root = {
                name: 'root',
                children:[
                    { name: 'child A'},
                    { name: 'child B'}
                ]
            };
            const founds = [];
            for(let node of new Tree(root)) founds.push(node.name);
            assert.deepStrictEqual(
                founds,
                [ 'child A', 'child B' ]
            );
        });
    })
});