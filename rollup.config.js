export default {
    input: 'src/index.mjs',
    output:[
        {
            file: 'dist/tree.mjs',
            format: 'esm'
        },
        {
            file: 'dist/tree.js',
            format: 'cjs'
        }
    ]
}