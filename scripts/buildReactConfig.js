const path = require("path");
const nodeResolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");
const packageJson = require("../packages/react-components/package.json");
const dts = require("rollup-plugin-dts").default;
const fs = require("fs");

const dependencies = Object.keys(packageJson.dependencies);

// 总包 cjs & esm
const buildAll = () => {
  return [
    {
      input: path.join(__dirname, "../packages/react-components/src/index.ts"),
      output: [
        {
          file: path.join(
            __dirname,
            "../packages/react-components/lib/index.js"
          ),
          format: "cjs",
        },
        {
          file: path.join(
            __dirname,
            "../packages/react-components/es/index.js"
          ),
          format: "esm",
        },
      ],
      plugins: [nodeResolve(), typescript(), commonjs()],
      external: dependencies,
    },
  ];
};

// d.ts文件
const buildDts = () => {
  return {
    input: path.join(__dirname, "../packages/react-components/src/index.ts"),
    output: [
      {
        file: path.join(
          __dirname,
          "../packages/react-components/lib/index.d.ts"
        ),
        format: "esm",
      },
      {
        file: path.join(
          __dirname,
          "../packages/react-components/es/index.d.ts"
        ),
        format: "esm",
      },
    ],
    plugins: [dts()],
  };
};

// 分包
const buildSeperate = () => {
  const seperateBuildConfig = [];
  const generateSeperateConfig = (componentName, formatType = "esm") => {
    const config = {
      input: path.join(
        __dirname,
        `../packages/react-components/src/components/${componentName}/index.tsx`
      ),
      output: {
        file: path.join(
          __dirname,
          `../packages/react-components/${
            formatType === "esm" ? "es" : "lib"
          }/${componentName}/index.js`
        ),
        format: formatType,
      },
      plugins: [nodeResolve(), typescript(), commonjs()],
      external: dependencies,
    };
    return config;
  };
  const components = fs.readdirSync(
    path.join(__dirname, "../packages/react-components/src/components")
  );
  components.forEach((componentName) => {
    seperateBuildConfig.push(generateSeperateConfig(componentName));
    seperateBuildConfig.push(generateSeperateConfig(componentName, "cjs"));
  });
  return seperateBuildConfig;
};

module.exports = [...buildAll(), ...buildSeperate(), buildDts()];
