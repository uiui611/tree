import {walk} from '../dist/tree';
import assert from 'assert';

describe('Walk a tree.', ()=> {
    it('Walk throw a tree.', ()=>{
        const res = [];
        walk({
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
        }, o=>res.push(o.name));
        assert.deepStrictEqual(
            res,
            [ 'child A', 'grandson A', 'grandson B', 'grandson C', 'child C']
        );
    })
});