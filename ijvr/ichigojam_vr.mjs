// todo save/load

import util from './util.mjs'
import kana from './kana.mjs'

let ex
let ram
let charptn
let storage
let oculus = navigator.userAgent.indexOf("Oculus") !== -1;

const RAM_PCG = 0x700 - 0x700
const RAM_VAR = 0x800 - 0x700
const RAM_VRAM = 0x900 - 0x700
const RAM_LIST = 0xC00 - 0x700
const RAM_KEYBUF = 0x1002 - 0x700

const EMOJI_E0 = util.decU("←→↑↓♠♥♣♦⚫⚪🔟🍙🐱👾♪🌀🚀🛸⌇🚁💥💰🧰📶🚪🕴🕺💃🏌🏃🚶🍓")
const EMOJI_80 = '　▘▝▀▖▌▞▛▗▚▐▜▄▙▟█・━┃╋┫┣┻┳┏┓┗┛◤◥◣◢' // 0x80のキャラコードは全角空白

const decodeEmoji = function(c) {
	let n = EMOJI_80.indexOf(c)
	if (n >= 0)
		return n + 0x80
	n = EMOJI_E0.indexOf(c)
	if (n >= 0)
		return n + 0xe0
	return -1
}

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
	var outport;
	var cx, cy, cursoron, cursorinsert;
	var screeninvert = 0;
	var screenbig = 0;
	canvas.width = 544;
	canvas.height = 416;

	g.draw = function() {
		let sw = canvas.width;
		let sh = canvas.height;

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

		let s = "";
		for (let i = 1; i < 12; i++) {
			const n = (i + 6) % 11
			if ((outport & (1 << n))) {
				s += i + ",";
			}
		}
		let speed = 0.05;
		if (s === "5,10,") {
			// まえ OUT 33
			if (oculus) {
				environment.object3D.position.z += speed;
			} else {
				camera.object3D.position.z -= speed;
				plane.object3D.position.z -= speed;
			}
		} else if (s === "6,9,") {
			// うしろ OUT 18
			if (oculus) {
				environment.object3D.position.z -= speed;
			} else {
				camera.object3D.position.z += speed;
				plane.object3D.position.z += speed;
			}
		} else if (s === "5,9,") {
			// みぎ OUT 17
			if (oculus) {
				environment.object3D.position.x -= speed;
			} else {
				camera.object3D.position.x += speed;
				plane.object3D.position.x += speed;
			}
		} else if (s === "6,10,") {
			// ひだり OUT 34
			if (oculus) {
				environment.object3D.position.x += speed;
			} else {
				camera.object3D.position.x -= speed;
				plane.object3D.position.x -= speed;
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
		if (e.metaKey) {
			return;
		}
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
		} else if (oculus && (e.key.length == 1 || e.code === "IntlYen" || e.code === "IntlRo")) {
			// Oculusは日本語キーボードをつなげても英語配列になるのに対応
			if (e.code === "Equal" && !e.shiftKey) 				{ key = 94; }				// ^
			else if (e.code === "Equal" && e.shiftKey)		{ key = 126; }			// ~
			else if (e.code === "IntlYen" && !e.shiftKey)	{ key = 92; }				// \
			else if (e.code === "IntlYen" && e.shiftKey)	{ key = 124; }			// |
			else if (e.code === "BracketLeft" && !e.shiftKey)	{ key = 64; }		// @
			else if (e.code === "BracketLeft" && e.shiftKey)	{ key = 96;	}		// `
			else if (e.code === "BracketRight" && !e.shiftKey)	{ key = 91;	}	// [
			else if (e.code === "BracketRight" && e.shiftKey)	{ key = 123;}		// {
			else if (e.code === "Backslash" && !e.shiftKey)	{ key = 93;	}			// ]
			else if (e.code === "Backslash" && e.shiftKey)	{ key = 125;}			// }
			else if (e.code === "Semicolon" && e.shiftKey)	{ key = 43;	}			// +
			else if (e.code === "Quote" && !e.shiftKey)	{ key = 58;	}					// :
			else if (e.code === "Quote" && e.shiftKey)	{ key = 42;	}					// *
			else if (e.code === "IntlRo" && !e.shiftKey)	{ key = 92; }				// \
			else if (e.code === "IntlRo" && e.shiftKey)	{ key = 95; }					// _
			else if (e.code === "Digit2" && e.shiftKey)	{ key = 34; }					// "
			else if (e.code === "Digit6" && e.shiftKey)	{ key = 38; }					// &
			else if (e.code === "Digit7" && e.shiftKey)	{ key = 39; }					// '
			else if (e.code === "Digit8" && e.shiftKey)	{ key = 40; }					// (
			else if (e.code === "Digit9" && e.shiftKey)	{ key = 41; }					// )
			else if (e.code === "Digit0" && e.shiftKey)	{ key = 48; }					//
			else if (e.code === "Minus" && e.shiftKey)	{ key = 61; }					// =
			else {
				key = e.key.codePointAt(0) // charCodeAt(0);
			}
			
			if (key >= 97 && key < 97 + 26) {
				key -= 97 - 65;
			} else if (key >= 65 && key < 65 + 26) {
				key += 97 - 65;
			}
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
