
"use strict";

import {LitElement, html} from './node-modules/lit-element';


export class GitDiff extends LitElement {

	diff: string;
	diffChangedEvent: CustomEvent;

	constructor() {
		super();
		document.addEventListener("git-diff-set-data", this.onDiffChanged);
	}

	render() {
		return html`
		`;
	}

	static get properties() {
		return {
			'diff': {type: String}
		}
	}

	onDiffChanged(event: CustomEvent) {
		this.diff = event.detail;
	}

}

customElements.define('git-diff', GitDiff);