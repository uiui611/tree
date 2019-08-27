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
                        childrenGetter(node){ return node.chs; },
                        childrenSetter(node, children){ node.chs = children; }
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
    describe('Tree#getNode feature.', ()=>{
        it('Get leaf node.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    value: 100,
                    children:[
                        {value: 1, id: 'search-for' },
                        {value: 10}
                    ]
                }).getNode('#search-for'),
                {value:1, id: 'search-for' }
            );
        });
        it('Get not a leaf node.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    value: 100,
                    children:[
                        {
                            value: 1,
                            id: 'search-for',
                            children:[{value: 10}]
                        },
                    ]
                }).getNode('#search-for'),
                {
                    value:1,
                    id: 'search-for',
                    children:[{value:10}]
                }
            );
        })
    });
    describe('Tree#getNodeAsTree feature.', ()=>{
        it('Not found case.', ()=>{
            assert.deepStrictEqual(
                new Tree({ value: 100 })
                    .getNodeAsTree('#no-id'),
                null
            );
        });
        it('Simple case.', ()=>{
            assert.deepStrictEqual(
                new Tree({ value: 100 , id: 'target-id'})
                    .getNodeAsTree('#target-id')
                    .root,
                {value: 100, id: 'target-id' }
            );
        });
    });
    describe('Tree#filter feature.', ()=>{
        it('Simple use.', ()=>{
            assert.deepStrictEqual(
                new Tree({
                    value: 101,
                    children:[
                        { value: 10},
                        { value: 11}
                    ]
                })
                .filter(node=>node.value%10===1)
                .root,
                {
                    value: 101,
                    children:[
                        { value:11 }
                    ]
                }
            );
        });
        it('Remove on parent.', ()=>{
            assert.ok(!
                new Tree({
                    value: 100,
                    children:[
                        { value: 10},
                        { value: 11}
                    ]
                })
                .filter(node=>node.value%10===1)
                .root
            );
        });
    });
});