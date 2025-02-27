import { RenderOptions, createElement, setClassList, setStyles } from "../renderable";
import { defaultIfNotType, textAlignment } from "../util";
import DepictionBaseView from "./base";

export default class DepictionHeaderView extends DepictionBaseView {
	title?: string;
	useMargins: boolean;
	useBottomMargin: boolean;
	bold: boolean;
	textColor?: string;
	alignment: string;
	static viewName = "DepictionHeaderView";

	constructor(
		dictionary: any,
		options?: Partial<RenderOptions>
	) {
		super(dictionary, options);
		if (typeof dictionary["title"] === "string") {
			this.title = dictionary.title;
		}
		this.useMargins = defaultIfNotType(dictionary["useMargins"], "boolean", true);
		this.useBottomMargin = defaultIfNotType(dictionary["useBottomMargin"], "boolean", true);
		this.bold = defaultIfNotType(dictionary["useBoldText"], "boolean", true);
		if (!this.bold) {
			this.textColor = "rgb(175, 175, 175)";
		}

		this.alignment = textAlignment(dictionary["alignment"]);
	}

	async make() {
		const el = createElement("p", {}, [this.title]);
		setClassList(el, [
			"nd-header",
			this.bold && "nd-header-bold",
			this.useMargins && "nd-header-margins",
			this.useBottomMargin && "nd-header-bottom-margin",
		]);
		let styles: any = { "text-align": this.alignment };
		if (this.textColor) styles["color"] = this.textColor;
		setStyles(el, styles);
		return el;
	}
}
