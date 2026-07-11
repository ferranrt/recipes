import { L as require_react, f as require_jsx_runtime, z as __toESM } from "../server.js";
import { t as Spinner } from "./spinner-BKLrmjFo.js";
//#region src/routes/water-sources/index.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WaterSourcesPage = (0, import_react.lazy)(async () => {
	return { default: (await import("./water-sources-page-C2rrsxwF.js")).WaterSourcesPage };
});
function WaterSourcesRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-full items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, { className: "size-6 text-muted-foreground" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaterSourcesPage, {})
	});
}
//#endregion
export { WaterSourcesRoute as component };
