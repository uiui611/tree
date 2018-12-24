# @mizu-mizu/tree
The utility for tree structure in JavaScript.

This script works in modern browsers and in Node.JS.

## Installation
In a browser:
```html
<script type="module">
    import Tree from './tree.mjs';
    // Write code here.
</script>
```
(Required ES Modules support and 'tree.mjs' should be on the same directory.)

## Usage
- Traverse a tree structure.

### Examples to simple use
```javascript
import Tree from './tree.mjs';
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
new Tree(root).walk(o=>console.log(o.name));
    // => child A
    // => grandson A
    // => grandson B
    // => grandson C
    // => child C
```
(The callback is called on the all **leaf** node.)

Breath-First mode:
```javascript
new Tree(root).walk({ Walker: BreathFirstWalker, visit: o=>console.log(o.name) });
    // => child A
    // => child C
    // => grandson A
    // => grandson B
    // => grandson C
```

Traverse as an iterator:
```javascript
for(let node of new Tree(root)) console.log(node.name);
```

### Detail documents
Clone this repository and run command below.
```cmd
npm run jsdoc
```
Then you can see the detail documents at the '{This project}/jsdoc/index.html'.