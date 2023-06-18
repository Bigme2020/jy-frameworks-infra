const packageJson = require("../packages/vue-components/package.json");
const vuePlugin = require("rollup-plugin-vue"); // 使rollup能够解析vue模板
const typescript = require("@rollup/plugin-typescript"); // 使rollup支持解析typescript
const commonjs = require("@rollup/plugin-commonjs"); // 使rollup支持解析commonjs
const postcss = require("rollup-plugin-postcss"); // （已安装postcss）用于无缝衔接rollup与postcss
const postcssPresetEnv = require("postcss-preset-env");
const babel = require("@rollup/plugin-babel").default; // （已安装@babel/core @babel/preset-env）用于无缝衔接rollup与babel
const dts = require("rollup-plugin-dts").default; // 生成dts文件
const path = require("path");

const rootDir = path.join(__dirname, "../packages/vue-components");
const dependencies = Object.keys(packageJson.dependencies);

const buildAll = () => {
  return {
    input: path.join(rootDir, "./src/index.ts"),
    output: [
      {
        file: path.join(rootDir, "./lib/index.js"),
        format: "cjs",
      },
      {
        file: path.join(rootDir, "./es/index.js"),
        format: "esm",
      },
    ],
    plugins: [
      commonjs(),
      typescript({
        tsconfig: path.join(rootDir, "./tsconfig.json"),
      }),
      vuePlugin({
        target: "browser",
      }),
      postcss({
        plugins: [postcssPresetEnv()],
      }),
      babel({
        babelHelpers: "bundled",
        presets: ["@babel/preset-env", "@babel/preset-typescript"],
        exclude: "node_modules/**",
        extensions: [".js", ".ts", ".vue"],
      }),
    ],
    externals: dependencies,
  };
};

const buildDts = () => {
  return {
    input: path.join(rootDir, "./src/index.ts"),
    output: [
      {
        file: path.join(rootDir, "./lib/index.d.ts"),
        format: "esm",
      },
      {
        file: path.join(rootDir, "./es/index.d.ts"),
        format: "esm",
      },
    ],
    // TODO: packages/vue-components/src/index.ts(2,10): error TS2305: Module '"vue"' has no exported member 'App'.
    plugins: [
      dts({
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
    ],
  };
};

const buildSeperate = () => {
  return {};
};

module.exports = [buildAll(), buildDts()];
