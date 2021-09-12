const path = require('path');

module.exports = {
    lintOnSave: false,
    outputDir: "./dist/client",
    configureWebpack: {
        entry: {
            app: './client/src/main.ts'
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'client'),
                '@shared': path.resolve(__dirname, 'shared')
            }
        }
    },
    chainWebpack: (config) => {
        config
            .plugin('fork-ts-checker')
            .tap(args => {
                args[0].tsconfig = './client/tsconfig.json';
                return args;
            });
    }

}