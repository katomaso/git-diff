import {LitElement, html, property} from 'lit-element';
import {Diff, Hunk, parseDiff} from './git-diff-parser';


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
				detail {display: flex;}
				detail > div {flex: 1 auto; overflow: scroll;}
				i {display: inline-block; width: 2em;}
				span {display: block;}
				.add {background-color: #cfc;}
				.del {background-color: #fcc;}
			</style>

			${this.diffs.map(diff => html`
				<input type="checkbox" name="${diff.fileA}"><label>${diff.fileA}</label>
				${diff.hunks.map(hunk => html`
					<summary>line ${hunk.startA} - ${hunk.startA + hunk.contextA}</summary>
					<detail>
						<div>${hunk.getDeletions().map(line => html`
							<span><i>${line.printNr()}</i>${line.data}</span>
							`)}
						</div>
						<div>${hunk.getAdditions().map(line => html`
							<span><i>${line.printNr()}</i>${line.data}</span>
							`)}
						</div>
					</detail>
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
