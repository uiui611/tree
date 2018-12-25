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
                }).map(node=>({value:node.name})).root,
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
                }).map(node=>({value:node.name})).root,
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
                }).map(node=>({value:node.name})).root,
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
                ).root,
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
    describe('Tree#reduce feature.', ()=>{
        it('Not convert a single node.', ()=>{
            assert.deepStrictEqual(
                new Tree({ name: 'root' }).reduce(()=>'hoge'),
                { name: 'root' }
            );
        });
        it('Convert a single node when the initial provided.', ()=>{
            assert.deepStrictEqual(
                new Tree({ name: 'root'}).reduce((p,c)=>p+c.name, 'fuga'),
                'fugaroot'
            );
        });
        it('Reduce with children with initial value.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    value: 100,
                    children:[
                        {value: 1 },
                        {value: 10}
                    ]
                }).reduce((arr,c)=>[c.value, ...arr].reduce((v0,v1)=>v0+v1), [0]),
                111
            );
        });
        it('Reduce with children without initial value.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    value: 100,
                    children:[
                        {value: 1 },
                        {value: 10}
                    ]
                }).reduce((arr,c)=>[c, ...arr].reduce((o0, o1)=>({value:o0.value+o1.value }))),
                {value:111}
            );
        });
    });
});