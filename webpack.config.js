const webpack = require( 'webpack' );

const production = process.env.NODE_ENV === "production";

const plugins = (production ? 
	[
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.DefinePlugin({
		    'process.env': {
		        'NODE_ENV': JSON.stringify( 'production' )
		    }
        })
	] :
	[]).concat([]);

const typescriptLoader = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }, {
            loader: 'ts-loader'
        }
    ]
};

const jsonLoader = {
    test: /\.json$/,
    use: 'json-loader'
};

const glslifyLoader = {
    test: /\.(glsl|vs|fs|vert|frag)$/,
    exclude: /node_modules/,
    use: [
        'raw-loader',
        'glslify-loader'
    ]
};

const rules = [
    typescriptLoader,
    jsonLoader,
    glslifyLoader,
];

const getExternals = (target = 'cjs') => {
    const baseExternals = [];
    if (target === 'cjs') {
        baseExternals.push(/gl-matrix/);
    }
    return baseExternals;
};

const getLibraryTarget = (target = 'cjs') => {
    let libraryTarget = '';
    switch (target) {
        case 'umd':
            libraryTarget = 'umd';
            break;
        case 'cjs':
            libraryTarget = 'commonjs';
            break;
        default:
            libraryTarget = target;
    }
    return libraryTarget;
}

const getOutput = (target = 'cjs') => {
    const baseOutput = {
        path: __dirname + `/dist/${target}`,
        filename: "index.js",
        libraryTarget: getLibraryTarget(target)
    };

    if (target === 'umd') {
        baseOutput.library = 'Particles';
        baseOutput.globalObject = 'this';
    }

    return baseOutput;
}

const getConfig = (target = 'cjs') => {
    return {
        mode: production ? 'production' : 'development',
        context: __dirname,
        devtool: production ? false : "source-map-loader",
        resolve: {
            extensions: [ ".ts", ".tsx", ".js", ".glsl", ".vs", ".fs", ".vert", ".frag" ]
        },
        entry: "./src/main.ts",
        output: getOutput(target),
        target: 'web',
        module: {
            rules
        },
        externals: getExternals(target),
        plugins
    }
};

module.exports = [getConfig('cjs'), getConfig('umd')];