import { createAgent } from "@ui-sdk/svelte/agent";
import { hydrate, mount } from "svelte";
import App from "./app.svelte";
import "./styles.css";

const target = document.querySelector("#app")!;
if (target.firstElementChild) hydrate(App, { target });
else mount(App, { target });

Object.assign(window, { agent: createAgent() });
