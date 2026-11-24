import { hydrate } from "@solidjs/web";
import { createAgent } from "@ui-sdk/solid/agent";
import { App } from "./app";
import "./styles.css";

hydrate(() => <App />, document.getElementById("root")!);
const agent = createAgent();
Object.assign(window, { agent });
