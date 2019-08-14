/**
* Diff parser will take a raw output from git diff and return a Diff class that
* has "left" and "right" parts containing Hunks. Those hunks have already empty
* lines in place so they are ready to be printed on the screen - optimized for
* human readibility.
*
*/
export enum ChangeType {
	ADD, DEL, MOD, NADA
}

export class Line {
	type: ChangeType;
	data: string;
	nr: number;

	constructor(data: string, nr: number) {
		if(!data || data.charAt(0) == " ") this.type = ChangeType.NADA;
		else if(data.charAt(0) == "-") this.type = ChangeType.DEL;
		else if(data.charAt(0) == "+") this.type = ChangeType.ADD;
		this.data = data;
		this.nr = nr;
	}
	isContext(): boolean {return this.type == ChangeType.NADA;}
}

export class Hunk {
	startA: number;
	startB: number;
	contextA: number;
	contextB: number;
	indexA: number;  // current index in linesA array (linesA.length returns size)
	indexB: number;
	linesA: Array<Line>;
	linesB: Array<Line>;

	constructor(startA: number, contextA: number, startB: number, contextB: number) {
		this.startA = startA;
		this.contextA = contextA;
		this.startB = startB;
		this.contextB = contextB;
		this.indexA = startA; // line index in the file (paddings don't count)
		this.indexB = startB; // line index in the file (paddings don't count)
		this.linesA = new Array<Line>();
		this.linesB = new Array<Line>();
	}

	addLine(state: ChangeType, content: string) {
		if(state == ChangeType.DEL) {
			this.addLineA(content);
		} else if(state == ChangeType.ADD) {
			this.addLineB(content);
		} else {
			// push the context line to both and pad empty space
			let maxLen =  Math.max(this.linesA.length, this.linesA.length);
			while(this.linesA.length < maxLen) this.addLineA(null); // pad left with empty lines
			while(this.linesB.length < maxLen) this.addLineB(null); // pad right with empty lines
			this.addLineA(content);
			this.addLineB(content);
		}
	}
	addLineA(value : string|null){
		if(value === null) {
			this.linesA.push(new Line("", NaN));
		} else {
			this.linesA.push(new Line(value, this.startA + this.indexA));
			this.indexA++;
		}
	}
	addLineB(value : string|null){
		if(value === null) {
			this.linesB.push(new Line("", NaN));
		} else {
			this.linesB.push(new Line(value, this.startB + this.indexB));
			this.indexB++;
		}
	}
	// clusters(lines: Array<string>) {
	// 	let clusters = new Array<Cluster>();
	// 	let cluster;
	// 	let lastSign = " ", curSign = " ";
	// 	for (let line of lines) {
	// 		if(line === undefined || line === null) continue;
	// 		if(line.length == 0) curSign = " ";
	// 		else curSign = line.charAt(0);
	// 		if(cluster == null) {cluster = new Cluster(curSign, line);}
	// 		if(curSign != lastSign) {
	// 			clusters.push(cluster);
	// 			cluster = new Cluster(curSign, line);
	// 		} else {
	// 			cluster.addLine(line);
	// 		}
	// 	}
	// 	return clusters;
	// }
	getDeletions() {return this.linesA;}
	getAdditions() {return this.linesB;}
}

export class Diff {
	fileA : string = "";
	fileB : string = "";
	state: ChangeType;
	hunks : Array<Hunk>;

	constructor(fileA: string, fileB: string) {
		this.fileA = fileA
		this.fileB = fileB;
		this.state = ChangeType.NADA;
		this.hunks = new Array<Hunk>();
	}

	setState(state: ChangeType) { this.state = state; }
	startHunk(startA: number, contextA: number, startB: number, contextB: number) {
		this.hunks.push(new Hunk(startA, contextA, startB, contextB));
	}
	addLine(state: ChangeType, content: string) {
		let curHunk = this.hunks[this.hunks.length-1];
		curHunk.addLine(state, content);
	}
}


export function parseDiff(diff: string) : Array<Diff> {
	const diffStartRe = /diff --git a\/([\w0-9\-_\./]+) b\/([\w0-9_\-\./]+)/;
	const fileChangeRe = /(\w+) file mode \d+/;
	const gitMetaRe = /index (.+)/;
	const realFileARe = /--- a\/([\w0-9\-_\./]+)/; // /+++ a/FILENAME
	const realFileBRe = /\+\+\+ b\/([\w0-9\-_\./]+)/; // /+++ b/FILENAME
	const hunkStartRe = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@/; // /@@ START,MOD +START,MOD

	var diffs = new Array<Diff>();
	var curDiff: Diff | null = null;

	for (let line of diff.split("\n")) {
		// start a new diff
		if(diffStartRe.test(line)) {
			let match = diffStartRe.exec(line);
			if(curDiff != null) { diffs.push(curDiff); }
			curDiff = new Diff(match[1], match[2]);
		}
		else if(fileChangeRe.test(line)) {
			let match = fileChangeRe.exec(line);
			if(match[1] == "deleted") curDiff.setState(ChangeType.DEL);
			else if(match[1] == "new") curDiff.setState(ChangeType.ADD);
			else if(match[1] == "modified") curDiff.setState(ChangeType.MOD);
		}
		else if(gitMetaRe.test(line)) { continue; }
		else if(realFileARe.test(line) || realFileBRe.test(line)) { continue; }
		else if(curDiff.state != ChangeType.DEL && hunkStartRe.test(line)) {
			let match = hunkStartRe.exec(line);
			curDiff.startHunk(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
		}
		else { // it is a line
			if(curDiff.state == ChangeType.DEL) continue; // do not show the content of deleted files
			if(curDiff.state == ChangeType.ADD) continue; // do not show the content of added files

			let lineState = ChangeType.NADA;
			if(line.startsWith("-")) lineState = ChangeType.DEL;
			if(line.startsWith("+")) lineState = ChangeType.ADD;
			curDiff.addLine(lineState, line);
		}
	}
	if(curDiff != null) { diffs.push(curDiff); }
	return diffs;
}


/**
Example output that needs to be parsed correctly

git add .
git status --porcelain
D  git-diff.js
D  git-diff.ts
M  package-lock.json
M  package.json
A  src/git-diff.js

git diff --no-color --staged
diff --git a/git-diff.js b/git-diff.js
deleted file mode 100644
index 6a9d36f..0000000
--- a/git-diff.js
+++ /dev/null
@@ -1,47 +0,0 @@
-"use strict";
-var __extends = (this && this.__extends) || (function () {
-    var extendStatics = function (d, b) {}}
-customElements.define('git-diff', GitDiff);
\ No newline at end of file
diff --git a/package-lock.json b/package-lock.json
index d9b3de9..becb6be 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -4,18 +4,3530 @@
   "lockfileVersion": 1,
   "requires": true,
   "dependencies": {
+      "requires": {
+        "@webassemblyjs/helper-module-context": "1.8.5",
+        "@webassemblyjs/helper-wasm-bytecode": "1.8.5",
+        "@webassemblyjs/wast-parser": "1.8.5"
+      }
+    },
diff --git a/src/git-diff.ts b/src/git-diff.ts
new file mode 100644
index 0000000..02f5874
--- /dev/null
+++ b/src/git-diff.ts
@@ -0,0 +1,145 @@
+import {LitElement, html} from 'lit-element';
+
+enum DiffState {
+       START, END, FILE, FILE_DEL, FILE_ADD, FILE_MOD, HUNK_START, HUNK_END, LINE,
+}
+
*/