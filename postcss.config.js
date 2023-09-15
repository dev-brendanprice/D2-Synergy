module.exports = {
    syntax: 'postcss-scss',
    plugins: [
        require('@csstools/postcss-sass')({
            includePaths: ['./node_modules']
        }),
    ]
}