import Tree from './tree.mjs';
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
        it('Iterate twice or more.', ()=>{
            const root = {
                name: 'root',
                children:[
                    { name: 'child A'},
                    { name: 'child B'}
                ]
            };
            const foundsList = [];
            for(let i=0;i<3;i++){
                const founds = [];
                for(let node of new Tree(root)) founds.push(node);
                foundsList.push(founds);
            }
            assert.deepStrictEqual(foundsList[1], foundsList[0]);
            assert.deepStrictEqual(foundsList[2], foundsList[0]);
        });
    });
});