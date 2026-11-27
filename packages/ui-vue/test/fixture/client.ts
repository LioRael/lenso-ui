import { createAgent } from "@lenso/ui-vue/agent";
import { createSSRApp } from "vue";
import App from "./App.vue";
import "./styles.css";

createSSRApp(App).mount("#root");
Object.assign(window, { agent: createAgent() });
