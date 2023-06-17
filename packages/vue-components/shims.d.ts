declare module "*.vue" {
  import { Component } from "vue";

  const a: Component;

  export default a;
}

declare module "vue" {
  import Vue from "vue";

  export default Vue;
}
