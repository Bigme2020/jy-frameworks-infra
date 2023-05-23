import { App as Application } from "vue";
import TestComp from "./index.vue";

export const install = (app: Application) => {
  app.component(TestComp.name, TestComp);
};

export default TestComp;
