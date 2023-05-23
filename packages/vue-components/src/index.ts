// 这是全局注册，一般不用全局注册，因为vue无法进行tree-shaking
import { App as Application } from "vue";
import VueComponents from "./components";

const components = Object.values(VueComponents);

const installComponents = (app: Application) => {
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

export default {
  install(app: Application) {
    installComponents(app);
  },
};

export const __VueComponents = VueComponents;
