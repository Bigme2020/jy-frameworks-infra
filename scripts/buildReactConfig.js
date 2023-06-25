const packageJson = require("../packages/react-components/package.json");
const path = require("path");
const fs = require("fs");
// rollup插件
const nodeResolve = require("@rollup/plugin-node-resolve"); // 定位第三方包（当需要将第三方包打包进bundle时才需要用到，目前所有第三方包都视为external，所以不需要此插件）
const typescript = require("@rollup/plugin-typescript"); // 使rollup支持解析typescript
// const typescript2 = require("rollup-plugin-typescript2"); // 使rollup支持解析typescript
const commonjs = require("@rollup/plugin-commonjs"); // 使rollup支持解析commonjs
const dts = require("rollup-plugin-dts").default; // 生成dts文件
const postcss = require("rollup-plugin-postcss"); // （已安装postcss）用于无缝衔接rollup与postcss
const postcssPresetEnv = require("postcss-preset-env");
const babel = require("@rollup/plugin-babel").default; // （已安装@babel/core @babel/preset-env）用于无缝衔接rollup与babel

const rootDir = path.join(__dirname, "../packages/react-components");
const dependencies = Object.keys(packageJson.dependencies);

const commonConfig = {
  plugins: [
    postcss({
      modules: true,
      plugins: [postcssPresetEnv()],
    }),
    typescript({
      tsconfig: path.join(rootDir, "./tsconfig.json"),
    }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react", "@babel/preset-env"],
      exclude: "node_modules/**",
      extensions: [".js", ".jsx", ".ts", ".tsx"], // 必须手动配置ts、tsx，默认不支持
    }),
  ],
  external: dependencies,
};

// 总包 cjs & esm
const buildAll = () => {
  return [
    {
      ...commonConfig,
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
    },
  ];
};

// d.ts文件
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
    plugins: [dts()],
  };
};

// TODO: hooks和components待区分打包，并且hooks待分包
// 分包
const buildSeperate = () => {
  const seperateBuildConfig = [];
  const generateSeperateConfig = (componentName, formatType = "esm") => {
    const config = {
      ...commonConfig,
      input: path.join(rootDir, `./src/components/${componentName}/index.tsx`),
      output: {
        file: path.join(
          rootDir,
          `./${formatType === "esm" ? "es" : "lib"}/${componentName}/index.js`
        ),
        format: formatType,
      },
    };
    return config;
  };
  const components = fs.readdirSync(path.join(rootDir, "./src/components"));
  components.forEach((componentName) => {
    seperateBuildConfig.push(generateSeperateConfig(componentName));
    seperateBuildConfig.push(generateSeperateConfig(componentName, "cjs"));
  });
  return seperateBuildConfig;
};

module.exports = [...buildAll(), ...buildSeperate(), buildDts()];
