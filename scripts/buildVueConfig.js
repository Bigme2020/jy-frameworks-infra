const packageJson = require("../packages/vue-components/package.json");
const vuePlugin = require("rollup-plugin-vue"); // 使rollup能够解析vue模板
const typescript2 = require("rollup-plugin-typescript2"); // 使rollup支持解析typescript，这里没用官方的@rollup/plugin-typescript是因为此插件不支持vue3Ts
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
      typescript2({
        check: false, // TODO: 这里check会报错，需检查
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
        presets: ["@babel/preset-env"],
        exclude: "node_modules/**",
        extensions: [".js", ".ts", ".vue"],
      }),
    ],
    externals: dependencies,
  };
};

// const buildDts = () => {
//   return {
//     input: path.join(rootDir, "./src/index.ts"),
//     output: [
//       {
//         file: path.join(rootDir, "./lib/index.d.ts"),
//         format: "esm",
//       },
//       {
//         file: path.join(rootDir, "./es/index.d.ts"),
//         format: "esm",
//       },
//     ],
//     plugins: [dts()],
//   };
// };

const buildSeperate = () => {
  return {};
};

module.exports = [buildAll()];
