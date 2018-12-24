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
    describe('Tree#map feature.', ()=>{
        it('Map single node.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    name: 'root',
                }).map(node=>({value:node.name})).node,
                { value: 'root' }
            );
        });
        it('Map node with children.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    name: 'root',
                    children:[
                        { name: 'child A' },
                        { name: 'child B' }
                    ]
                }).map(node=>({value:node.name})).node,
                {
                    value: 'root',
                    children:[
                        { value: 'child A'},
                        { value: 'child B'}
                    ]
                }
            );
        });
        it('Map complex node.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    name: 'root',
                    children:[
                        { name: 'child A' },
                        {
                            name: 'child B',
                            children: [
                                { name: 'grandson A' },
                                { name: 'grandson B' },
                            ]
                        },
                        { name: 'child C' }
                    ]
                }).map(node=>({value:node.name})).node,
                {
                    value: 'root',
                    children:[
                        { value: 'child A'},
                        {
                            value: 'child B',
                            children:[
                                { value: 'grandson A' },
                                { value: 'grandson B' }
                            ]
                        },
                        { value: 'child C'},
                    ]
                }
            );
        });
        it('Map node with new children setter and getter.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    name: 'root',
                    children:[
                        { name: 'child A' },
                        { name: 'child B' }
                    ]
                }).map(
                    node=>({value:node.name}),
                    {
                        getChildren(node){ return node.chs; },
                        setChildren(node, children){ node.chs = children; }
                    }
                ).node,
                {
                    value: 'root',
                    chs: [
                        { value: 'child A' },
                        { value: 'child B' }
                    ]
                }
            )
        });
    });
});