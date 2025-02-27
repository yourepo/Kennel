import { RenderOptions, createElement, RenderableElement, setClassList, setStyles } from "../renderable";
import { buttonLinkHandler, constructView, defaultIfNotType, guardIfNotType, makeView, undefIfNotType } from "../util";
import DepictionBaseView from "./base";

export default class DepictionButtonView extends DepictionBaseView {
	text?: string;
	children?: DepictionBaseView;
	action: string;
	isLink: boolean;
	yPadding: number;
	openExternal: boolean;
	static viewName = "DepictionButtonView";

	constructor(
		dictionary: any,
		options?: Partial<RenderOptions>
	) {
		super(dictionary, options);
		this.isLink = defaultIfNotType(dictionary["isLink"], "boolean", false);
		this.yPadding = defaultIfNotType(dictionary["yPadding"], "number", 0);
		let text = undefIfNotType(dictionary["text"], "string");
		let action = undefIfNotType(dictionary["action"], "urlExtended");
		if(typeof action !== "string") {
			this.action = guardIfNotType(dictionary["backupAction"], "urlExtended");
		} else {
			this.action = action;
		}
		[this.action, text] = buttonLinkHandler(this.action, text, options);

		this.openExternal = defaultIfNotType(dictionary["openExternal"], "boolean", false);

		let dict = dictionary["view"];
		if (typeof dict === "object") {
			this.children = constructView(dict, options);
		}

		if (!this.children && text.length > 0) {
			this.text = text;
		}
	}

	async make(): Promise<RenderableElement> {
		let div = createElement("div");
		setClassList(div, ["nd-button"]);
		let el = createElement("a");
		setClassList(el, [this.isLink ? "nd-button-link" : "nd-button-not-link"]);
		let styles: any = {};
		if (this.tintColor) styles["--kennel-tint-color"] = this.tintColor;
		if (this.isLink) {
			styles.color = "var(--kennel-tint-color)";
		} else {
			styles["background-color"] = "var(--kennel-tint-color)";
			styles["color"] = "white";
		}

		el.attributes.href = this.action;
		if (this.openExternal) {
			el.attributes.target = "_blank";
		}

		if (this.children) {
			this.children;
			let child = await makeView(this.children);
			child.attributes.pointerEvents = "none";
			el.children = [child];
		} else if (this.text) {
			el.children = [createElement("span", {}, [this.text])];
		}
		setStyles(el, styles);
		div.children = [el];
		return div;
	}
}
