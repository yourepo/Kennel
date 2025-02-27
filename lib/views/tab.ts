import { RenderOptions, createElement, RenderableElement, setStyles } from "../renderable";
import { constructView, guardIfNotType, makeView, makeViews } from "../util";
import DepictionBaseView from "./base";

class DepictionTabPageView extends DepictionBaseView {
	tabname: string;
	view: DepictionBaseView | undefined;
	isActive: boolean;
	tabContainerID: string;
	static tabControlID = 0;
	static viewName = "DepictionTabPageView";

	constructor(
		dictionary: any,
		options?: Partial<RenderOptions>
	) {
		super(dictionary, options);
		// this is set in the make method below.
		this.isActive = dictionary.isActive;
		this.tabContainerID = dictionary.tabID;
		this.tabname = guardIfNotType(dictionary["tabname"], "string");
		this.view = constructView(dictionary, options);
	}

	async make(): Promise<RenderableElement> {
		let numericControlID = DepictionTabPageView.tabControlID++;
		let id = "kennel-tab-" + numericControlID;
		const input = createElement("input", {
			type: "radio",
			id,
			name: "kennel-tab-controller-id-" + this.tabContainerID,
			checked: this.isActive,
		});
		const control = createElement("label", { class: "nd-tab-control", for: id }, [createElement("span", {}, [this.tabname])]);
		const page = createElement("div", { class: "nd-tab-page" }, [this.view && (await makeView(this.view))]);
		const el = createElement("div", { class: "nd-tab" }, [input, control, page]);
		if (this.tintColor)
			setStyles(el, {
				"--kennel-tint-color": this.tintColor,
			});
		return el;
	}
}

export default class DepictionTabView extends DepictionBaseView {
	pages: DepictionTabPageView[];
	static tabID = 0;
	static viewName = "DepictionTabView";

	constructor(
		dictionary: any,
		options?: RenderOptions
	) {
		super(dictionary);
		let tabContainerID = (++DepictionTabView.tabID).toString();
		let tabs = guardIfNotType(dictionary["tabs"], "array");
		this.pages = tabs
			.map((tab, i) => {
				tab.isActive = i === 0;
				tab.tabID = tabContainerID;
				return new DepictionTabPageView(tab, options);
			})
			.filter(Boolean) as DepictionTabPageView[];
	}

	async make() {
		const children = (await makeViews(this.pages)).map((el, i) => {
			let control = el.children.find((el) => (el as RenderableElement | undefined)?.tag === "label") as
				| RenderableElement
				| undefined;
			if (control) {
				setStyles(control, {
					"grid-column": `${i + 1} / span 1`,
				});
			}
			return el;
		});
		const tabAreas = `'${"tab ".repeat(this.pages.length).trim()}' '${"content "
			.repeat(this.pages.length)
			.trim()}'`;
		const el = createElement(
			"div",
			{
				class: "nd-tabs",
				style: `--kennel-tab-page-count: ${this.pages.length}; --kennel-tab-areas: ${tabAreas}`,
			},
			children.map((v) => v.children).flat()
		);
		return el;
	}
}
