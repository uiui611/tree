# @mizu-mizu/tree
The utility for tree structure in JavaScript.

This script works in modern browsers and in Node.JS.

## Installation
In a browser:
```html
<script type="module">
    import * as tree from './tree.mjs';
</script>
```
(Required ES Modules support and 'tree.mjs' should be on the same directory.)

## Features
Available to traverse tree.
```javascript
import {walk} from 'tree';
const root = {
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
};
walk(root, o=>console.log(o.name));
    // => child A
    // => grandson A
    // => grandson B
    // => grandson C
    // => child C
```
(The callback is called on the all **leaf** node.)

Traverse as an iterator:
```javascript
import {Tree} from 'tree';
/* ... */
for(let node of new Tree(root)) console.log(node.name);
```

Breath-First mode:
```javascript
walk(root, { Walker: BreathFirstWalker, visit: o=>console.log(o.name) });
    // => child A
    // => child C
    // => grandson A
    // => grandson B
    // => grandson C
```