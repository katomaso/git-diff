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
				.header {background-color: #def; font-weight: bold; font-size: 13pt;}
				.hunk {display: flex;}
				.hunk > div {flex: 1 auto; overflow: scroll;}
				i {display: inline-block; width: 2em;}
				span {display: block; font-family: Liberation mono,monospace; font-size: 10pt;}
				.add {background-color: #dfd;}
				.del {background-color: #fdd;
			</style>

			${this.diffs.map(diff => html`
				<div class="header"><input type="checkbox" name="${diff.getFilePath()}"><label>${diff.getFilePath()}</label></div>
				${diff.hunks.map(hunk => html`
					<div class="hunk">
					${hunk.splits().map(split => html`
						<div>${split.getDeletions().map(line => html`
							${line.isContext() ?
								html`<span><i>${line.printNr()}</i>${line.data}</span>` :
								html`<span class="del"><i>${line.printNr()}</i>${line.data}</span>`
							    }
							`)}
						</div>
						<div>${split.getAdditions().map(line => html`
							${line.isContext() ?
								html`<span><i>${line.printNr()}</i>${line.data}</span>` :
								html`<span class="add"><i>${line.printNr()}</i>${line.data}</span>`
							    }
							`)}
						</div>
					</div>
					`)}
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
