import {walk, DepthFirstWalker, traversalState, BreathFirstWalker} from "./index";
import assert from 'assert';

function partial(props, source){
    return props
        .map(name=>[name, source[name]])
        .reduce((prev, [name, val])=>{
            prev[name] = val;
            return prev;
        }, {});
}
describe('Walk with DepthFirstWalker.', ()=>{
    it('Move to a single node.', ()=>{
        const inst = new DepthFirstWalker({ name: 'hoge' });
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.LEAF,
                current: {name: 'hoge'}
            }
        );
    });
    it('Move to a node with children.', ()=>{
        const root = { name: 'hoge', children: [{name: 'fuga'}] };
        const inst = new DepthFirstWalker(root);
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.PRE,
                current: root
            }
        );
    });
    it('Move to a node at post traversalState with children.', ()=>{
        const root = { name: 'hoge', children: [{name: 'fuga'}] };
        const inst = new DepthFirstWalker(root);
        inst.next();
        inst.next();
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.POST,
                current: root
            }
        );
    });
    it('On a child.', ()=>{
        const root = { name: 'hoge', children: [{name: 'fuga'}] };
        const inst = new DepthFirstWalker(root);
        inst.next();
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.LEAF,
                current: {name: 'fuga'},
            }
        );
    });
    it('On a parent with no children.', ()=>{
        const root = { name: 'hoge', children: [] };
        const inst = new DepthFirstWalker(root);
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.PRE,
                current: root
            }
        );
    });
    it('On a parent with no children (at POST traversalState).', ()=>{
        const root = { name: 'hoge', children: [] };
        const inst = new DepthFirstWalker(root);
        inst.next();
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.POST,
                current: root
            }
        );
    });
    it('End traversal for a single node.', ()=>{
        const inst = new DepthFirstWalker({ name: 'hoge' });
        inst.next();
        inst.next();
        assert.deepStrictEqual(
            partial(['state'],inst),
            {
                state: traversalState.END_TRAVERSAL,
            }
        );
    });
    it('Parents on a leaf.', ()=>{
        const root = { name: 'hoge', children: [{name: 'fuga'}] };
        const inst = new DepthFirstWalker(root);
        inst.next();
        inst.next();
        assert.deepStrictEqual(
            inst.getParents().map(o=>o.name),
            ['hoge']
        );
    });
});
describe('Walk with BreathFirstWalker.',()=>{
    it('Move to a single node.', ()=>{
        const inst = new BreathFirstWalker({ name: 'hoge' });
        inst.next();
        assert.deepStrictEqual(
            partial(['state', 'current'], inst),
            {
                state: traversalState.LEAF,
                current: {name: 'hoge'}
            }
        );
    });
});

[DepthFirstWalker, BreathFirstWalker]
.forEach(Walker=>{
    describe(`Walk with '${Walker.name} (common test)'.`,()=>{
        it('Walk for a single obj.',()=>{
            let res;
            walk({hoge:'fuga'}, {Walker, visit(o){ res = o.hoge }});
            assert.strictEqual(res, 'fuga');
        });
        it('Walk for a child.', ()=>{
            const founds = [];
            walk({
                    name:'hoge',
                    children: [{name:'fuga'}]
                },
                {Walker, visit(o){ founds.push(o.name) }}
            );
            assert.deepStrictEqual(founds, ['fuga']);
        });
        it('Walk for some children.', ()=>{
            const founds = [];
            walk({
                    name: 'hoge',
                    children:[
                        {name: 'fuga'},
                        {name: 'hogefuga'}
                    ]
                },
                {Walker, visit(o){ founds.push(o.name) }}
            );
            assert.deepStrictEqual(founds, ['fuga', 'hogefuga']);
        });
        it('Walk for nested obj.', ()=>{
            const founds = [];
            walk(
                {
                    name: 'hoge',
                    children:[
                        {
                            name: 'fuga',
                            children: [
                                {name:'deepfuga'},
                                {name:'deepfuga2'}
                            ]
                        }
                    ]
                },
                {Walker, visit(o){ founds.push(o.name) }}
            );
            assert.deepStrictEqual(founds, ['deepfuga', 'deepfuga2']);
        });
        it('The root parent should be an empty array.', ()=>{
            let res;
            walk(
                {},
                {Walker, visit(o,{parents}){res = parents}}
            );
            assert.deepStrictEqual(res, []);
        });
        it('The parents on the nested obj.', ()=>{
            const founds = [];
            walk(
                {
                    name: 'root',
                    children:[
                        { name: 'ch1'},
                        {
                            name: 'ch2',
                            children:[
                                {name: 'grandch'}
                            ]
                        }
                    ]
                },
                {
                    Walker,
                    visit(o,{parents}){ founds.push(parents.map(p=>p.name)); }
                }
            );
            assert.deepStrictEqual(
                founds,
                [
                    ['root'],
                    ['root', 'ch2']
                ]
            );
        });
        it('Visit PRE LEAF POST in order.', ()=>{
            const founds = [];
            walk(
                {
                    name: 'root',
                    children:[
                        { name: 'child'}
                    ]
                },
                {
                    Walker,
                    preVisit(o){ founds.push({val:o.name, type: traversalState.PRE }) },
                    visit(o){ founds.push({val:o.name, type: traversalState.LEAF })},
                    postVisit(o){ founds.push({val:o.name, type: traversalState.POST })}
                }
            );
            assert.deepStrictEqual(
                founds,
                [
                    { val:'root', type: traversalState.PRE },
                    { val:'child', type: traversalState.LEAF },
                    { val:'root', type: traversalState.POST },
                ]
            );
        });
    });
});