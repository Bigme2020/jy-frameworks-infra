// 定义这个类型的目的是为了让rollup打包时ts不报“找不到*.module.css的类型”的错误（该错误只会在打包时报错，开发时类型检查并不会报错）
declare module '*.css' {
  const style: any
  export default style
}
