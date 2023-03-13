// todo save/load

import util from './util.mjs'
import kana from './kana.mjs'

let ex
let ram
let charptn
let storage

const RAM_PCG = 0x700 - 0x700
const RAM_VAR = 0x800 - 0x700
const RAM_VRAM = 0x900 - 0x700
const RAM_LIST = 0xC00 - 0x700
const RAM_KEYBUF = 0x1002 - 0x700

const EMOJI_E0 = util.decU("←→↑↓♠♥♣♦⚫⚪🔟🍙🐱👾♪🌀🚀🛸⌇🚁💥💰🧰📶🚪🕴🕺💃🏌🏃🚶🍓")
const EMOJI_80 = '　▘▝▀▖▌▞▛▗▚▐▜▄▙▟█・━┃╋┫┣┻┳┏┓┗┛◤◥◣◢' // 0x80のキャラコードは全角空白
const encodeEmoji = function(code) {
	if (code >= 0x80 && code <= 0x9f) {
		return EMOJI_80.charAt(code - 0x80)
	} else if (code >= 0xe0 && code <= 0xff) {
		return EMOJI_E0[code - 0xe0]
	}
	return null
}
/*
for (let i = 0; i < EMOJI_E0.length; i++) {
	//console.log(i, EMOJI_E0.charAt(i))
	console.log(i, EMOJI_E0[i])
}
*/
const decodeEmoji = function(c) {
	let n = EMOJI_80.indexOf(c)
	//console.log(EMOJI_80.length, 0x80, n)
	if (n >= 0)
		return n + 0x80
	n = EMOJI_E0.indexOf(c)
	//console.log(EMOJI_E0.length, 0xe0, n)
	if (n >= 0)
		return n + 0xe0
	return -1
}

/*
const s = 'IchigoJam🍓!'
const s2 = util.encU(util.decU(s))
console.log(s, util.decU(s), s2, s == s2)
*/

window.onload = async function () {
	const buf = await (await fetch('ichigojam.wasm')).arrayBuffer()
	const res = await WebAssembly.instantiate(new Uint8Array(buf))
	ex = res.instance.exports
	ram = new Uint8Array(ex.memory.buffer, ex.getRAM(), ex.getSizeRAM())
	charptn = new Uint8Array(ex.memory.buffer, ex.getCharPattern(), ex.getCharPatternSize())
	storage = new Uint8Array(ex.memory.buffer, ex.getStorage(), ex.getStorageSize())
	init()
}
const init = function() {
	var tick = function() {
		ex.tick()
	}
	var draw = function() {
		drawfunc({
				ram: ram,
				charptn: charptn,
				outport: ex.getOutPort(),
				cx: ex.getCursorX(),
				cy: ex.getCursorY(),
				cursoron: ex.getCursorFlag(),
				cursorinsert: ex.getCursorInsert(),
				screeninvert: ex.getScreenInvert(),
				screenbig: ex.getScreenBig(),
				freq: ex.getFreq()
		})
	}
	
	var snd = null; // = getSound(); // for autoplay polity
	var initSound = function() {
		if (!snd) {
			snd = getSound();
		}
	};
	initSound();
	
	// storage
	// const uintarray2hex = ar => ar.map(v => util.fix0(v.toString(16), 2)).join('')
	const hex2uintarray = s => new Uint8Array(s.match(/.{1,2}/g).map(v => parseInt(v, 16)))
	const storageName2 = "ichigojam-web-1"
	const saveStorage = function (n) {
		const s = []
		for (let i = 0; i < 1024; i++) {
			const m = storage[1024 * n + i].toString(16)
			s.push(m.length == 1 ? '0' + m : m)
		}
		localStorage[storageName2 + '-' + n] = s.join('')
	}
	const loadStorage = function () {
		for (let i = 0; i < 228; i++) {
			const s = localStorage[storageName2 + '-' + i]
			if (s) {
				const ar = hex2uintarray(s)
				for (let j = 0; j < ar.length; j++) {
					storage[i * 1024 + j] = ar[j]
				}
			}
		}
	}

	var framecnt = 0
	setInterval(function () {
		handleGamePad()
		if ((framecnt & 3) === 0) {
			draw()
		} else {
			tick()
			const n = ex.checkFileUpdate()
			if (n >= 0) {
				saveStorage(n)
				console.log('save storage', n)
			}
		}
		framecnt++
	}, 1000 / (60 * 4))

	loadStorage()
	
	var g = util.getContext(canvas)
	g.init()

	var t = 0;
	
	var dw = 32;
	var dh = 24;
	
	var drawChar = function(g, c, x, y, w, h, cursor) {
		if (t & 0x10)
			cursor = 0;
		var ptn = charptn;
		var ptnoff = c * 8;
		if (c >= 224) {
			ptn = ram;
			ptnoff = (c - 224) * 8;
		}
		var r = w / 8;
		if (screeninvert)
			g.setColor(0, 0, 0);
		else
			g.setColor(255, 255, 255);
		if (cursor == 1) {
			for (var i = 0; i < 8; i++) {
				var n = ptn[ptnoff + i];
				for (var j = 0; j < 8; j++) {
					if ((n & (1 << (7 - j))) == 0) {
						g.fillRect(x + j * r, y + i * r, r, r);
					}
				}
			}
		} else if (cursor == 2) {
			for (var i = 0; i < 8; i++) {
				var n = ptn[ptnoff + i];
				for (var j = 0; j < 4; j++) {
					if ((n & (1 << (7 - j))) == 0) {
						g.fillRect(x + j * r, y + i * r, r, r);
					}
				}
				for (var j = 4; j < 8; j++) {
					if (n & (1 << (7 - j))) {
						g.fillRect(x + j * r, y + i * r, r, r);
					}
				}
			}
		} else {
			for (var i = 0; i < 8; i++) {
				var n = ptn[ptnoff + i];
				for (var j = 0; j < 8; j++) {
					if (n & (1 << (7 - j))) {
						g.fillRect(x + j * r, y + i * r, r, r);
					}
				}
			}
		}
	};
	//var ram;
	//var charptn;
	var outport;
	var cx, cy, cursoron, cursorinsert;
	var screeninvert = 0;
	var screenbig = 0;
	canvas.width = 544;
	canvas.height = 416;
	
//	alert(canvas.width);
//	alert(g.cw);
	g.draw = function() {
		var sw = g.cw;
		var sh = g.ch;
		sw = canvas.width;
		sh = canvas.height;
		
		//var tw = sw < 480 ? 8 : 8 * 2;
		const off = 2
		const tw = Math.min(sw / (dw + 2), sh / (dh + 2)) >> 0
		var ox = (sw - tw * dw) / 2;
		var oy = (sh - tw * dh) / 2;

		g.setColor(0, 0, 0);
		var led = outport & (1 << 6);
		if (led) {
			//g.setColor(255, 255, 255);
			g.setColor(220, 55, 55);
		} else {
			g.setColor(0, 0, 0);
		}
		g.fillRect(0, 0, sw, sh);

		if (window.drawOutport) {
			window.drawOutport(g, outport)
		} else {
			sseg.setSegments(outport)
		}
		if (outflg.length > 0) {
			for (let i = 1; i < 12; i++) {
				const n = (i + 6) % 11
				outflg[i].style.backgroundColor = (outport & (1 << n)) ? "red" : "black"
			}
		}
		
		if (screeninvert)
			g.setColor(255, 255, 255);
		else
			g.setColor(0, 0, 0);
		g.fillRect(ox - tw / 8, oy - tw / 8, dw * tw + tw / 8 * 2, dh * tw + tw / 8 * 2);
		
		var dw2 = dw >> screenbig;
		var dh2 = dh >> screenbig;
		var tw2 = tw << screenbig;
		
		for (var i = 0; i < dh2; i++) {
			for (var j = 0; j < dw2; j++) {
				var c = ram[RAM_VRAM + j + i * dw2];
				var x = ox + j * tw2;
				var y = oy + i * tw2;
				drawChar(g, c, x, y, tw2, tw2, cursoron && cx == j && cy == i && (cnt & 16) ? 2 - cursorinsert : 0);
			}
		}
		cnt++;
	};
	var cnt = 0;
	
	var initfunc = null;
	var freq = 0;
	
	const drawfunc = function(data) {
		ram = data.ram;
		charptn = data.charptn;
		outport = data.outport;
		
		cx = data.cx;
		cy = data.cy;
		cursoron = data.cursoron;
		cursorinsert = data.cursorinsert;
		screeninvert = data.screeninvert;
		screenbig = data.screenbig;
		freq = data.freq;
		
//		program.value = "cursor: " + cx + ", " + cy;
		
//		for (var i = 0; i < 256; i++)
//			ram[RAM_VRAM + i] = i;
		
		g.draw();
		if (initfunc) {
			initfunc();
			initfunc = null;
		}
		if (snd) {
			snd.freq = freq;
		}
	}
	
	var putc = function(key) {
		ex.key_putc(key)
	}
	var puts = function(s) {
		const sa = util.decU(s)
		for (var i = 0; i < sa.length; i++) {
			let c = sa[i] // s.charAt(i)
			const cemoji = decodeEmoji(c)
			if (cemoji >= 0) {
				putc(cemoji)
				tick()
				continue
			}
			if (c == "‘") { // for Mac
				c = "'"
			} else if (c == "’") {
				c = "'"
			} else if (c == "“") {
				c = '"'
			} else if (c == '”') {
				c = '"'
			}
			const code = c.codePointAt(0) // c.charCodeAt(0)
			var cc = null
			if (code >= 256 && code < 512) {
				cc = [ code - 256 ]
			} else {
				cc = kana.toHankaku(c);
			}
			for (var j = 0; j < cc.length; j++) {
				const c2 = cc[j];
				if (c2) {
					putc(c2);
					tick();
				}
			}
		}
	};
	var keyUp = function(key) {
		if (key == 88)
			key = 33
		ram[RAM_KEYBUF] &= ~(1 << (key - 28));
	};
	var keyDown = function(key) {
		if (key == 88)
			key = 33
		ram[RAM_KEYBUF] |= 1 << (key - 28);
	};
	document.body.onkeydown = function(e) {
		if (document.activeElement.tagName.toLowerCase() == "textarea") {
			return;
		}
//		console.log(document.activeElement.tagName);
		if (e.metaKey) { // command
			return;
		}
//				console.log(e.key);
		var key = -1;
		if (e.altKey) {
			if (e.key.length == 1) {
				var key = e.keyCode; // deprecated...
				if (key >= 48 && key <= 57) {
					key = 224 + (key - 48);
				} else if (key >= 65 && key <= 86) {
					key = 224 + (key - 65) + 10;
				} else if (key >= 87 && key <= 90) { // ver 1.2.4b50
					key = 224 + (key - 87);
				}
				if (e.shiftKey) {
					key -= 32 * 3;
				}
			} else if (e.ctrlKey) {
				key = 0x11; // 17
			}
		} else if (e.ctrlKey) {
			//alert(e.key)
			if (e.key == "c") {
				key = 27;
			} else if (e.key == "a") {
				key = 0x12; // home
			} else if (e.key == "e") {
				key = 0x17; // end
			} else if (e.key == "k") {
				key = 0x0c; // 0.9.9 = カーソル以降削除
			} else if (e.key == "l") {
				puts("\x13\x0c"); // puts("CLS");
				key = 0;
			} else if (e.key == "Shift" || e.key == " ") { // Mac: OSのCtrl+Spaceと競合して使えない
				key = 0xf; // カナうち
			}
		} else if (e.key == "Escape") { // esc
			key = 27;
		} else if (e.key == "Backspace") { // backspace
			key = 8;
		} else if (e.key == "Enter") {
			key = e.shiftKey ? 0x10 : 0x0a;
		} else if (e.key == "Delete") { // delete
			key = 127;
		} else if (e.key == "ArrowLeft") { // cursor left
			key = 28;
		} else if (e.key == "ArrowRight") { // cursor right
			key = 29;
		} else if (e.key == "ArrowUp") { // cursor up
			key = 30;
		} else if (e.key == "ArrowDown") { // cursor down
			key = 31;
		} else if (e.key == " ") {
			key = e.shiftKey ? 0x0e : 32;
		} else if (e.key == "End") {
			key = 0x17;
		} else if (e.key == "Home") {
			key = 0x12;
		} else if (e.key == "PageUp") {
			key = 0x13;
		} else if (e.key == "PageDown") {
			key = 0x14;
		} else if (e.key == "Tab") { // esc
			puts("  ");
			key = 0;
		} else if (e.key == "F1") { // F1
			puts("\x13\x0c"); // puts("CLS");
			key = 0;
		} else if (e.key == "F2") { // F2
			puts("\x18LOAD");
			key = 0;
		} else if (e.key == "F3") { // F3
			puts("\x18SAVE");
			key = 0;
		} else if (e.key == "F4") { // F4
			puts("\x18\x0cLIST");
			key = 10;
		} else if (e.key == "F5") { // F5
			puts("\x18RUN");
			key = 10;
		} else if (e.key == "F5") { // F5
			puts("\x18RUN");
			key = 10;
		} else if (e.key == "F6") { // F6
			puts("\x18?FREE()");
			key = 10;
		} else if (e.key == "F7") { // F7
			puts("\x18OUT0");
			key = 10;
		} else if (e.key == "F8") { // F8
			puts("\x18VIDEO1");
			key = 10;
		} else if (e.key == "F9") { // F9
			puts("\x18\x0cFILES");
			key = 10;
		} else if (e.key == "F10") { // F10
			puts("\x18SWITCH");
			key = 10;
		} else if (e.key.length == 1) {
			key = e.key.codePointAt(0) // charCodeAt(0);
			if (key >= 97 && key < 97 + 26) {
				key -= 97 - 65;
			} else if (key >= 65 && key < 65 + 26) {
				key += 97 - 65;
			}
		}
		if (key >= 0) {
			if (key > 0)
				putc(key);
		}
		if (key >= 28 && key <= 32 || key == 88) {
			keyDown(key);
		}
		e.preventDefault();
	};
	document.body.onkeyup = function(e) {
		if (document.activeElement.tagName.toLowerCase() == "textarea") {
			return;
		}
		var key = -1;
		if (e.key == "ArrowLeft") { // cursor left
			key = 28;
		} else if (e.key == "ArrowRight") { // cursor right
			key = 29;
		} else if (e.key == "ArrowUp") { // cursor up
			key = 30;
		} else if (e.key == "ArrowDown") { // cursor down
			key = 31;
		} else if (e.key == " ") {
			key = 32;
		} else if (e.key == "x") {
			key = 88;
		}
		if (key >= 28 && key <= 32 || key == 88) {
			keyUp(key);
		}
		e.preventDefault();
	};
	
	btn_esc.onclick = function() {
		putc(27);
	};
	sseg = new Sseg(seg);

	// keyboards
	if (window.btn_keys === undefined) {
		window.btn_keys = {};
	}
	btn_keys.onclick = function() {
		if (keyspanel.style.display == "block") {
			keyspanel.style.display = 'none'
			return
		}
		keyspanel.style.display = 'block'
		if (keyspanel.children.length) {
			return
		}
		const KEYBOARD =
`ESC F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 BS
! " # $ % & ' ( ) \` = ~
1 2 3 4 5 6 7 8 9 0 - ^
Q W E R T Y U I O P @ {
A S D F G H J K L ; : [
Z X C V B N M , . + * }
CAP ALT CTL INS KAN | ? < > ↑ _ ]
⇧ TAB  SPC  \\ /  ← ↓ → ⏎`
		const keys = util.makeGrids(KEYBOARD)
		keyspanel.appendChild(keys)
		const map = { '⏎': 10, '←': 28, '→': 29, '↑': 30, '↓': 31, 'X': 88, 'ESC': 27, 'TAB': 9, 'SPC': 32, 'BS': 8, 'KAN': 15, 'ALT': -1, 'CTL': -1, 'DEL': 127, 'INS': 17 }
		const func = [ "\x13\x0c", "\x18LOAD", "\x18SAVE", "\x18\x0cLIST\n", "\x18RUN\n",  "\x18?FREE()\n", "\x18OUT0\n", "\x18VIDEO1\n", "\x18\x0cFILES\n", "\x18SWITCH\n" ]
		
		const hasTapEvent = (function(){
			const div = document.createElement('div')
			div.setAttribute('ontouchstart', 'return')
			return typeof div.ontouchstart === 'function'
		})()
		const ondown = hasTapEvent ? 'ontouchstart' : 'onmousedown'
		const onup = hasTapEvent ? 'ontouchend' : 'onmouseup'
		

		// make backup key's content
		for (let i = 0; i < keys.children.length; i++) {
			const k = keys.children[i]
			k.bkc = k.textContent
		}
		const setShiftMode = function(shiftmode) {
			for (let i = 0; i < keys.children.length; i++) {
				const k = keys.children[i]
				if (k.textContent.length == 1) {
					k.textContent = shiftmode ? k.textContent.toLowerCase() : k.textContent.toUpperCase()
				}
			}
		}
		const setAltMode = function(altmode, shiftmode) {
			for (let i = 0; i < keys.children.length; i++) {
				const k = keys.children[i]
				if (altmode) {
					if (k.bkc.length == 1) {
						let c = k.bkc.charCodeAt(0)
						if (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) {
							c = c - '0'.charCodeAt(0) + (shiftmode ? 0x80 : 0xe0)
						} else if (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) {
							c = ((c - 'A'.charCodeAt(0) + 10) & 0x1f) + (shiftmode ? 0x80 : 0xe0)
						} else {
							c = 0
						}
						if (c) {
							k.textContent = encodeEmoji(c)
							k.emoji = true
						}
					}
				} else {
					k.textContent = k.bkc
					k.emoji = false
				}
			}
		}
		const resetOnetimeShiftMode = function() {
			if (keys.shiftmodeOnetime) {
				if (keys.altmode) {
					setAltMode(true, false)
				} else {
					setShiftMode(false)
				}
				keys.shiftmode = false
			}
		}

 		for (let i = 0; i < keys.children.length; i++) {
			const key = keys.children[i]
			key[ondown] = function(e) {
				//e.preventDefault()
				const c = this.textContent
				if (c == 'CAP' || c == '⇧') {
					keys.shiftmode = !keys.shiftmode
					keys.shiftmodeOnetime = keys.shiftmode && c == '⇧'
					if (keys.altmode) {
						setAltMode(true, keys.shiftmode)
					} else {
						setShiftMode(keys.shiftmode)
					}
					return
				}
				if (c == 'ALT') {
					keys.altmode = !keys.altmode
					setAltMode(keys.altmode, keys.shiftmode)
				}
				if (this.emoji) {
					puts(c)
					return
				}
				const c2 = map[c]
				if (c2) {
					if (c2 >= 0) {
						putc(c2)
						if (c2 >= 28 && c2 <= 32 || c2 == 88) {
							keyDown(c2)
						}
					}
					resetOnetimeShiftMode()
					return
				}
				if (c.length > 1 && c.charAt(0) == 'F') {
					const c3 = func[parseInt(c.substring(1)) - 1]
					if (c3)
						puts(c3)
					return
				}
				puts(c)
				resetOnetimeShiftMode()
			}
			key[onup] = function(e) {
				//if (e.cancelable)
				e.preventDefault()
				const c = this.textContent
				const c2 = map[c]
				if (c2 >= 28 && c2 <= 32 || c2 == 88) {
					keyUp(c2)
					return
				}
			}
		}
	}
	const ua = window.navigator.userAgent
	if (ua.indexOf('iP') >= 0 || ua.indexOf('Android') >= 0) {
		btn_keys.onclick()
	}

	const create = tag => document.createElement(tag)
	// I/O
	let outflg = new Array()
	if (window.btn_io === undefined) {
		window.btn_io = {};
	}
	if (btn_io) {
		btn_io.onclick = function() {
			if (iopanel.style.display == "none") {
				const pins = [ "BTN/IN9", "IN1/OUT8", "IN2/OUT9", "IN3/OUT10", "IN4/OUT11", "OUT1/IN5", "OUT2/IN6", "OUT3/IN7", "OUT4/IN8", "OUT5/IN10", "OUT6/IN11", "LED/OUT7" ]
				if (iopanel.childNodes.length == 0) {
					const tbl = create("table")
					iopanel.appendChild(tbl)
					let tr = create("tr")
					tbl.appendChild(tr)
					const th1 = create("th")
					tr.appendChild(th1)
//					for (let i = 11; i >= 0; i--) {
					for (let i = 0; i < 12; i++) {
						const th = create("th")
						th.innerHTML = pins[i].replace(/\//g, "<br>") // i
						tr.appendChild(th)
					}
					tr = create("tr")
					tbl.appendChild(tr)
					const th2 = create("th")
					th2.textContent = "IN"
					tr.appendChild(th2)
//					for (let i = 11; i >= 0; i--) {
					for (let i = 0; i < 11; i++) {
						const td = create("td")
						const check = create("input")
						check.type = "checkbox"
						check.name = i < 9 ? i : i + 1
						td.appendChild(check)
						tr.appendChild(td)
						check.onchange = function() {
							ex.setStateIN(this.name, this.checked ? 1023 : 0)
						}
					}
					tr = create("tr")
					tbl.appendChild(tr)
					const th3 = create("th")
					th3.textContent = "OUT"
					tr.appendChild(th3)
//					for (let i = 11; i >= 0; i--) {
					for (let i = 0; i < 12; i++) {
						const td = create("td")
						if (i > 0) {
							const span = create("span")
							span.style.display = "inline-block"
							span.style.width = "1em"
							span.style.height = "1em"
							span.style.border = "1 border black"
							span.style.backgroundColor = "black"
							outflg[i] = span
							td.appendChild(span)
						}
						tr.appendChild(td)
					}
					tbl.style.display = "inline-block"
				}
				iopanel.style.display = "block"
				iopanel.style.textAlign = "center"
			} else {
				iopanel.style.display = "none"
			}
		}
	}
	
	// save/load
	/*
	var storageName = "ichigojam-web-0";
	var save = function(s) {
		localStorage[storageName] = s;
	};
	var load = function() {
		return localStorage[storageName];
	};
	*/
	// program
	btn_export.onclick = function() {
		var s = "";
		var n = RAM_LIST;
		for (;;) {
			var line = (ram[n + 1] << 8) | ram[n];
			if (line == 0)
				break;
			s += line + " ";
			var len = ram[n + 2];
			for (var i = 0; i < len; i++) {
				var c = ram[n + 3 + i];
				if (c) {
					const ch = encodeEmoji(c)
					if (ch) {
						s += ch
					} else {
						c = kana.fromHankaku(c)
						s += String.fromCodePoint(c) //String.fromCharCode(c)
					}
				}
			}
			s += '\n';
			if ((len & 1))
				len++;
			n += 4 + len;
		}
		
		program.value = s;
		resizeInput(program);
		document.location.hash = "#" + encodeURIComponent(s);
		
		// save(s);
	};
	btn_import.onclick = function() {
		const s = program.value
		puts(s)
		document.location.hash = "#" + encodeURIComponent(s)
	}
	btn_full.onclick = function() {
		//const usefullscreen = false
		const usefullscreen = true
		if (usefullscreen && requestFullscreen(canvas))
			return
		
		this.flg = !this.flg
		if (this.flg) {
			const dw = document.body.clientWidth
			const dh = document.body.clientHeight
			const cw = canvas.clientWidth
			const ch = canvas.clientHeight
			canvas.bkwidth = canvas.style.width
			canvas.bkheight = canvas.style.height
			if (dw / dh < cw / ch) {
				canvas.style.width = dw + 'px'
				canvas.style.height = Math.floor(ch / cw * dw) + "px"
			} else {
				canvas.style.width = Math.floor(cw / ch * dh) + "px"
				canvas.style.height = dh + 'px'
				scrollTo(0, window.pageYOffset + canvas.getBoundingClientRect().top)
			}
		} else {
			canvas.style.width = canvas.bkwidth
			canvas.style.height = canvas.bkheight
		}
	}
	window.onorientationchange = function() {
		if (btn_full.flg) {
			btn_full.onclick()
		}
	}
	btn_audio.onclick = function() {
		if (btn_audio.textContent == 'AUDIO ON') {
			if (snd) {
				snd.audio.resume()
			}
			btn_audio.textContent = 'AUDIO OFF'
		} else {
			snd.audio.suspend()
			btn_audio.textContent = 'AUDIO ON'
		}
	}
	
	program.style.lineHeight = "14px";
	program.style.height = "30px";
	program.addEventListener("input", function(e) {
		resizeInput(e.target);
		var el = e.target;
	});
	var resizeInput = function(el) {
		if (el.scrollHeight > el.offsetHeight) {
			el.style.height = el.scrollHeight + "px";
		} else {
			for (;;) {
				var h = Number(el.style.height.split("px")[0]);
				var lh = Number(el.style.lineHeight.split("px")[0]);
				el.style.height = (h - lh) + "px"; 
				if (el.scrollHeight > el.offsetHeight) {
					el.style.height = el.scrollHeight + "px";
					break;
				}
			}
		}
	};
	
	initfunc = function() {
		var hash = document.location.hash;
		if (hash.length > 1) {
			var s = decodeURIComponent(hash.substring(1));
			putc(27); // esc before import
			puts("NEW\n"); // new before import
			puts(s);
			program.value = s;
			resizeInput(program);
		} else {
			/*
			var s = load();
			if (s != null && s.length > 0) {
				puts(s);
				program.value = s;
				resizeInput(program);
			}
			*/
		}
	};

	// canvas touch
	if (canvas.ontouchstart === null) {
		canvas.ontouchstart = function() {
			ex.setButtonState(1)
		}
		canvas.ontouchend = function() {
			ex.setButtonState(0)
		}
	} else {
		canvas.onmousedown = function() {
			ex.setButtonState(1)
		}
		canvas.onmouseup = function() {
			ex.setButtonState(0)
		}
	}
	// gamepad
	let pads = null
  const gamepadEvent = 'ongamepadconnected' in window
  const getGamePad = function() {
		//if (!gamepadEvent || !pads) {
			if (!navigator.getGamepads || navigator.getGamepads().length == 0)
				return null
			pads = navigator.getGamepads()
		//}
		const pad = pads[0]
    return pad
	}
	/*
	window.ongamepadconnected = function(e) {
		console.log(e.evt.gamepad, "connected")
	}
	*/
	const CTRLS = {
		// Megadrive-mini XYZ spc enter btn
		"6B controller (Vendor: 0ca3 Product: 0024)": { spc: 2, enter: 1, btn: 5, updown: 101, leftright: 100, run: 9, esc: 8, x: 3, y: 0, z: 4 }, // Chrome leftright 効かない!
		"ca3-24-6B controller": { updown: 104, leftright: 103, run: 9, esc: 8, x: 3, y: 0, z: 4, spc: 2, enter: 1, btn: 5 }, // space:5 Safari idこないことがある
		// XBOX XY Z(L) spc enter btn(R)
		"Xbox 360 Wired Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)": { spc: 0, enter: 1, btn: 5, run: 9, esc: 8, x: 2, y: 3, z: 4, up: 12, down: 13, left: 14, right: 15 }, // Chrome
		"45e-28e-Xbox 360 Wired Controller": { spc: 0, enter: 1, btn: 5, run: 8, esc: 9, x: 2, y: 3, z: 4, up: 11, down: 12, left: 13, right: 14 }, // Safari
		// PS4 controller run:pad, esc:psbtn
		"Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)": { spc: 0, enter: 1, btn: 5, x: 2, y: 3, z: 4, run: 17, esc: 16, up: 12, down: 13, left: 14, right: 15, ana0: 101, ana2: 100, ana5: 103, ana6: 102, ana7: -7, ana8: -6 }, // Chrome
		"54c-5c4-Wireless Controller": { spc: 1, enter: 2, btn: 5, x: 0, y: 3, z: 4, run: 13, esc: 12, up: 14, down: 15, left: 16, right: 17, ana0: 101, ana2: 100, ana5: 103, ana6: 102, ana7: 105, ana8: 104 }, // Safari
		"DUALSHOCK 4 Wireless Controller Extended Gamepad": { spc: 0, enter: 1, btn: 5, x: 2, y: 3, z: 4, run: 7, esc: 6, updown: -105, leftright: 104, ana0: -101, ana2: 100, ana5: -103, ana6: 102, ana7: -6, ana8: -7 }, // Safari on iOS
	}
	const DEFAULT_CTRL = CTRLS["54c-5c4-Wireless Controller"] // PS4をデフォルトにする

	const getGamePadValue = function(pad, id) {
		if (id <= -100)
			return -pad.axes[-id - 100]
		if (id < 0) {
			const btn = pad.buttons[-id]
			if (!btn)
				return 0
			return btn.value * 2 - 1
		}
		if (id < 100) {
			const btn = pad.buttons[id]
			if (!btn)
				return 0
			return btn.value
		}
		return pad.axes[id - 100]
	}
	let bkupdown = 0
	let bkleftright = 0
	const bkbtn = {}
	const padkeys = [ "x", "y", "z", "spc", "run", "esc", "enter", "up", "down", "left", "right" ]
	const anas = [ 0, 2, 5, 6, 7, 8 ]
	//const padkeys = [ "x", "spc" ]
	const handleGamePad = function() {
		const pad = getGamePad()
		if (!pad)
			return
		const ctrl = CTRLS[pad.id] || DEFAULT_CTRL
		if (ctrl.btn !== undefined)
			ex.setButtonState(getGamePadValue(pad, ctrl.btn))

		if (ctrl.updown !== undefined) {
			const updown = getGamePadValue(pad, ctrl.updown)
			if (updown != bkupdown) {
				if (bkupdown == 1) {
					keyUp(31)
				} else if (bkupdown == -1) {
					keyUp(30)
				}
				if (updown == 1) {
					keyDown(31)
					putc(31)
				} else if (updown == -1) {
					keyDown(30)
					putc(30)
				}
				bkupdown = updown
			}
		}
		if (ctrl.leftright !== undefined) {
			const leftright = getGamePadValue(pad, ctrl.leftright)
			if (leftright != bkleftright) {
				if (bkleftright == 1) {
					keyUp(29)
				} else if (bkleftright == -1) {
					keyUp(28)
				}
				if (leftright == 1) {
					keyDown(29)
					putc(29)
				} else if (leftright == -1) {
					keyDown(28)
					putc(28)
				}
				bkleftright = leftright
			}
		}

		for (const key of padkeys) {
			if (ctrl[key] === undefined)
				continue
			const k = getGamePadValue(pad, ctrl[key]) ? 1 : 0
			const bk = bkbtn[key] ? 1 : 0
			if (bk != k) {
				if (bk == 1) {
					if (key == 'spc') {
						keyUp(32)
					} else if (key == 'enter') {
						keyUp(10)
					} else if (key == 'x') {
						keyUp(88)
					} else if (key == 'y') {
						keyUp(89)
					} else if (key == 'z') {
						keyUp(90)
					} else if (key == 'up') {
						keyUp(30)
					} else if (key == 'down') {
						keyUp(31)
					} else if (key == 'left') {
						keyUp(28)
					} else if (key == 'right') {
						keyUp(29)
					}
				} else {
					if (key == 'esc') {
						putc(27)
					} else if (key == 'run') {
						puts("\x18RUN\n")
					} else if (key == 'spc') {
						keyDown(32)
						putc(32)
					} else if (key == 'enter') {
						keyDown(10)
						putc(10)
					} else if (key == 'x') {
						keyDown(88)
						putc(88)
					} else if (key == 'y') {
						keyDown(89)
						putc(89)
					} else if (key == 'z') {
						keyDown(90)
						putc(90)
					} else if (key == 'up') {
						keyDown(30)
						putc(30)
					} else if (key == 'down') {
						keyDown(31)
						putc(31)
					} else if (key == 'left') {
						keyDown(28)
						putc(28)
					} else if (key == 'right') {
						keyDown(29)
						putc(29)
					}
				}
				bkbtn[key] = k
			}
		}
		for (const ana of anas) {
			const a = 'ana' + ana
			if (ctrl[a] == undefined)
				continue
			const k = getGamePadValue(pad, ctrl[a])
			const n = Math.floor((k + 1) / 2 * 1023)
			ex.setStateIN(ana, n)
		}

	}

	// test
//	initfunc = null;
};

// fullscreen
var requestFullscreen = function(target) {
	if (target.webkitRequestFullscreen) {
		target.webkitRequestFullscreen(); //Chrome15+, Safari5.1+, Opera15+
	} else if (target.mozRequestFullScreen) {
		target.mozRequestFullScreen(); //FF10+
	} else if (target.msRequestFullscreen) {
		target.msRequestFullscreen(); //IE11+
	} else if (target.requestFullscreen) {
		target.requestFullscreen(); // HTML5 Fullscreen API
	} else {
		return false
	}
	return true
}
var exitFullscreen = function() {
	if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen(); //Chrome15+, Safari5.1+, Opera15+
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen(); //FF10+
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen(); //IE11+
	} else if(document.cancelFullScreen) {
		document.cancelFullScreen(); //Gecko:FullScreenAPI仕様
	} else if(document.exitFullscreen) {
		document.exitFullscreen(); // HTML5 Fullscreen API仕様
	}
};

var sseg;

// 7seg


var Sseg = function(div) {
	this.div1 = div.childNodes[0];
	this.div2 = div.childNodes[1];
};
Sseg.prototype.setSegments = function(n) {
	var on = "#ed2020";
	var off = "#eee";
	this.div1.style.borderTopColor = n & 1 ? on : off;
	this.div1.style.borderRightColor = n & 2 ? on : off;
	this.div2.style.borderRightColor = n & 4 ? on : off;
	this.div2.style.borderBottomColor = n & 8 ? on : off;
	this.div2.style.borderLeftColor = n & 16 ? on : off;
	this.div1.style.borderLeftColor = n & 32 ? on : off;
	this.div2.style.borderTopColor = n & 64 ? on : off;
};

// sound

var getSound = function() {
	try {
		window.AudioContext = window.webkitAudioContext || window.AudioContext;
		var audio = new AudioContext();
		if (!audio)
			return null;
		var node = audio.createScriptProcessor(1024, 2, 2);
		var gain = audio.createGain();
		var sampleRate = audio.sampleRate;
	
		var src = audio.createBufferSource();
		src.buffer = audio.createBuffer(2, 1024, audio.sampleRate);
		src.connect(node);
		node.connect(gain);
		gain.connect(audio.destination);
	
		var counter = 0;
		var snd = { freq: 0 };
		node.onaudioprocess = function(data) {
			var period = snd.freq / sampleRate;
			var outl = data.outputBuffer.getChannelData(0);
			var outr = data.outputBuffer.getChannelData(1);
			var procsize = data.inputBuffer.length;
			for (var i = 0; i < procsize; i++){
				outl[i] = outr[i] = counter > 0 ? 1 : -1;
	//			data[i] = counter; // triangle
				counter += period;
				if (counter >= 1.0)
					counter -= 2.0;
			}
		};
		gain.gain.value = 0.2;
		snd.gain = gain.gain;
		snd.audio = audio;
		return snd;
	} catch (e) {
		console.log(e);
	}
	return null;
}
