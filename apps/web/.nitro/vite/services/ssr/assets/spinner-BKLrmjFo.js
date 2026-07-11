import { f as require_jsx_runtime } from "../server.js";
import { t as createReactComponent } from "./createReactComponent-DaV1qi9p.js";
import { t as cn } from "./utils-Dj4xS1KQ.js";
/**
* @license @tabler/icons-react v3.44.0 - MIT
*
* This source code is licensed under the MIT license.
* See the LICENSE file in the root directory of this source tree.
*/
var IconLoader = createReactComponent("outline", "loader", "Loader", [
	["path", {
		"d": "M12 6l0 -3",
		"key": "svg-0"
	}],
	["path", {
		"d": "M16.25 7.75l2.15 -2.15",
		"key": "svg-1"
	}],
	["path", {
		"d": "M18 12l3 0",
		"key": "svg-2"
	}],
	["path", {
		"d": "M16.25 16.25l2.15 2.15",
		"key": "svg-3"
	}],
	["path", {
		"d": "M12 18l0 3",
		"key": "svg-4"
	}],
	["path", {
		"d": "M7.75 16.25l-2.15 2.15",
		"key": "svg-5"
	}],
	["path", {
		"d": "M6 12l-3 0",
		"key": "svg-6"
	}],
	["path", {
		"d": "M7.75 7.75l-2.15 -2.15",
		"key": "svg-7"
	}]
]);
//#endregion
//#region ../../packages/ui/src/components/spinner.tsx
var import_jsx_runtime = require_jsx_runtime();
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconLoader, {
		"data-slot": "spinner",
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
//#endregion
export { Spinner as t };
