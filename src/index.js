import React from "react";
import ReactDOM from "react-dom";

import App from "./App.jsx";
import "./assets/css/globals.css";
import "antd/dist/antd.css";

let theme = localStorage.getItem("theme");
if (theme === null) {
	localStorage.setItem("theme", "dark");
	theme = "dark";
}
if (!["light", "dark"].includes(theme)) {
	localStorage.setItem("theme", "dark");
	theme = "dark";
}

const div = document.getElementById("app");
div.setAttribute("class", theme);

ReactDOM.hydrate(<App />, div);
