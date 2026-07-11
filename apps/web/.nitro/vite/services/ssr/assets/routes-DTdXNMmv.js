import { f as require_jsx_runtime } from "../server.js";
import { t as Button } from "./button-CGw_wtlS.js";
//#region src/routes/index.tsx?tsr-split=component
var import_jsx_runtime = require_jsx_runtime();
function App() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-1 flex-col p-4 md:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-medium",
					children: "Project ready!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You may now add components and start building." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We've already added the button component for you." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-2",
					children: "Button"
				})
			] })
		})
	});
}
//#endregion
export { App as component };
