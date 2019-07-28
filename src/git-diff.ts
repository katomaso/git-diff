import {LitElement, html, property} from 'lit-element';
import {ChangeType, Diff, Hunk, parseDiff} from './git-diff-parser';


export class GitDiff extends LitElement {
	diffs: Array<Diff> = new Array<Diff>(0);
	@property( {type: String} ) data = '';

	constructor() {
		super();
		window.addEventListener("git-diff-set-data", this.onDiffChanged.bind(this));
	}

	render() {
		return html`
			<style>
			div {display: flex;}
			div > pre {flex: 1 auto;}
			</style>

			${this.diffs.map(diff => html`
				<input type="checkbox" name="${diff.fileA}"><label>${diff.fileA}</label>
				${diff.hunks.map(hunk => html`
					<strong>line ${hunk.startA} - ${hunk.startA + hunk.contextA}</strong>
					<div>
						<pre>${hunk.getLeft()}</pre>
						<pre>${hunk.getRight()}</pre>
					</div>
				`)}
			`)}
		`;
	}

	onDiffChanged(evt: Event) {
		let event = <CustomEvent> evt;
		this.diffs = parseDiff(event.detail);
		this.data = event.detail;
	}
}

customElements.define('git-diff', GitDiff);
