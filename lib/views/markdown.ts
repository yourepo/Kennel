import { marked } from "marked";
import markdownStyles from "../markdown.css?raw";
import { RenderOptions, createElement, createRawNode, createShadowedElement, renderElementString, setStyles } from "../renderable";
import { defaultIfNotType, escapeHTML, guardIfNotType, makeView } from "../util";
import DepictionBaseView from "./base";
import DepictionSeparatorView from "./separator";

function callMarked(str: string, opt?: any): Promise<string> {
	return new Promise((resolve, reject) =>
		marked(str, opt, (err: any, html: string) => {
			if (err) reject(err);
			else resolve(html);
		})
	);
}

export default class DepictionMarkdownView extends DepictionBaseView {
	markdown: Promise<string>;
	useSpacing: boolean;
	useMargins: boolean;
	useRawFormat: boolean;
	static viewName = "DepictionMarkdownView";

	constructor(
		dictionary: any,
		options?: Partial<RenderOptions>
	) {
		super(dictionary, options);
		let md = guardIfNotType(dictionary["markdown"], "string");
		this.useMargins = defaultIfNotType(dictionary["useMargins"], "boolean", true);
		this.useSpacing = defaultIfNotType(dictionary["useSpacing"], "boolean", true);
		this.useRawFormat = defaultIfNotType(dictionary["useRawFormat"], "boolean", false);
		if (this.useRawFormat) {
			this.markdown = callMarked(md, { gfm: false }).then(async (rendered) => {
				let didWarnXSS = false;
				let xssWarn = `<p style="opacity:0.3">[Warning: This depiction may be trying to maliciously run code in your browser.]</p><br>`;
				rendered = rendered.replace(
					/<hr>/gi,
					await renderElementString(await makeView(new DepictionSeparatorView(undefined, undefined)))
				);
				if (
					rendered.toLowerCase().indexOf("<script>") !== -1 ||
					rendered.toLowerCase().indexOf("</script>") !== -1
				) {
					rendered = rendered
						.replace(/<script>/im, "&lt;script&gt;")
						.replace(/<\/script>/im, "&lt;/script&gt;");

					didWarnXSS = true;
					rendered = `${xssWarn}${rendered}`;
				}
				if (/on([^\s]+?)=/im.test(rendered)) {
					if (!didWarnXSS) {
						rendered = `${xssWarn}${rendered}`;
						didWarnXSS = true;
					}
					rendered = rendered.replace(/on([^\s]+?)=/gi, "onXSSAttempt=");
				}

				return rendered;
			});
		} else {
			this.markdown = callMarked(escapeHTML(md), { xhtml: true, gfm: true });
		}
	}

	async make() {
		const resp = await this.markdown;
		let margins = this.useMargins ? 16 : 0;
		let spacing = this.useSpacing ? 13 : 0;
		let bottomSpacing = this.useSpacing ? 13 : 0;
		let el = createShadowedElement({ class: "nd-markdown" }, [
			createElement("style", {}, [markdownStyles]),
			await createRawNode(resp),
		]);
		let styles: any = {
			margin: "0 " + margins + "px",
			"padding-top": spacing + "px",
			"padding-bottom": (bottomSpacing ? bottomSpacing : spacing) + "px",
		};
		// TODO: none of the links actually use this; we need to mutate the markdown rendering to use this.
		if (this.tintColor) styles["--kennel-tint-color"] = this.tintColor;
		setStyles(el, styles);
		return el;
	}
}
