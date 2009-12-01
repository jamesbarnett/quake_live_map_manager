/**
 * Quake Live Map Manager
 * @author immut4ble_r3f
 * @date 11-23-2009
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
var QLMM = {

	// Cache and local variables
	$: undefined,
	doc: undefined,
	win: undefined,
	dQueue: [],
	layoutCache: '',

	directory: {
		nsIObj: undefined,
		overridePath: '',
		lastModified: 0,
		searchInterval: 5,
		pathSeperator: "\\"
	}
};

/**
 * Self-invoking function that'll output debug messages when the console is
 * activated. It'll print everything stored in the dQueue array and empty it.
 */
(function () {
	var win = QLMM.win, i;

	if (win && win.console && win.console.log) {

		for (i = 0; i < QLMM.dQueue.length; i++) {
			win.console.log.apply(win.console, QLMM.dQueue[i]);
			QLMM.dQueue.splice(i, 1);
		}
	}

	window.setTimeout(arguments.callee, 250);
})();

/**
 * fileExists(f)
 * Checks if the path/file exists
 * @param f File/path to check
 * @returns true/false if it exists or not
 */
QLMM.fileExists = function (f) {
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);

	file.initWithPath(f);

	return file.exists();
};

QLMM.debug = function () {
	QLMM.dQueue.push(arguments);
};

QLMM.quakeLiveFolder = function() {
    var appDataDir = "";
	var qlDir = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
    try {
		appDataDir = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("AppData", Components.interfaces.nsIFile)
			.path.replace(/Roaming/, ''); // Replace Vista/Win7 "Roaming" path in AppData

		aPath = "id Software\\quakelive\\home\\baseq3\\";

		// Vista/Win7
		if (navigator.userAgent.match(/NT 6\./)) {
			aPath = "LocalLow\\" + aPath;
		}
		
		qlDir.initWithPath(appDataDir);
		qlDir.appendRelativePath(aPath);
	}
	catch (e) {
		navigator.userAgent.match(/Linux/) ?
		// Linux
		appDataDir = "~/.quakelive/quakelive/home/baseq3/":
		// Mac
		appDataDir = "~/Library/Application Support/QuakeLive/quakelive/baseq3/";
		
		qlDir.initWithPath(appDataDir);
		
	}
	
	QLMM.debug("[QLMM] QL folder at " + qlDir.path + " exists? " + QLMM.fileExists(qlDir.path));
	
	return qlDir;
};

/**
 * init(d, w)
 * Initiates QLMM by running the underlying functions before triggering 'run()'.
 * It will also set the core variables.
 * @param d The document object
 * @param w The window object
 */
QLMM.init = function (d, w) {
	// Set scope vars
	QLMM.doc = d;
	QLMM.win = w;
	QLMM.$ = QLMM.win.$;
	QLMM.win.QLMM = QLMM;

	QLMM.debug("[QLMM] Website loaded");

	// possibly add checks for new maps here
	
	QLMM.run();
};

QLMM.profilePath = function() {
	return Components.classes["@mozilla.org/file/directory_service;1"].getService(
		Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);	
};

QLMM.extensionPath = function() {
	var addinID = "qlmapmngr@gmail.com";
	var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(
		Components.interfaces.nsIExtensionManager);
	
	return extensionManager.getInstallLocation(addinID).getItemFile(addinID, "/");
};

QLMM.settingsPath = function() {
	var file = QLMM.extensionPath();
	
	file.append("settings");
	
	if (!file.exists() || !file.isDirectory()) {
		file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	}
	
	return file;
};

QLMM.writeFile = function(file, data) {
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(
		Components.interfaces.nsIFileOutputStream);

	foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
	var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(
		Components.interfaces.nsIConverterOutputStream);

	converter.init(foStream, "UTF-8", 0, 0);
	converter.writeString(data);
	converter.close();
};

QLMM.isMapPathSet = function() {
	var mapPath = QLMM.settingsPath();
	mapPath.append("maps_path");
	return QLMM.fileExists(mapPath.path);
};

QLMM.getMapsPath = function() {
	var mapPath = QLMM.settingsPath();
	mapPath.append("maps_path");
	
	// |file| is nsIFile
	var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(
		Components.interfaces.nsIFileInputStream);
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(
		Components.interfaces.nsIConverterInputStream);
	
	fstream.init(mapPath, -1, 0, 0);
	cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish

	let (str = {}) {
	  cstream.readString(-1, str); // read the whole file and put it in str.value
	  data = str.value;
	}
	
	cstream.close(); // this closes fstream
	
	return data;
};

QLMM.getMapList = function(path) {
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);
	
	file.initWithPath(path);
	var entries = file.directoryEntries;
	var array = [];
	while (entries.hasMoreElements()) {
		var entry = entries.getNext();
        entry.QueryInterface(Components.interfaces.nsIFile);
		
		if (entry.leafName.match(/[\.\w\d_-]+.pk3/i)) {
		    array.push(entry);
		}
	}
	
	return array;
};

/**
 * Find the path for the extension, e.g.
 * /home/user/.mozilla/firefox/<profile>/extensions/qlmapmngr@gmail.com or equivalent.
 */
QLMM.directory.chrome = (function () {
	// Get initial path to the QLDP extension
	var path = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation("qlmapmngr@gmail.com").getItemFile("qlmapmngr@gmail.com", "chrome").path, pathSeperator;

	// Parse the file seperator (/ on unix, \ on windows)
	QLMM.directory.pathSeperator = pathSeperator = (path.search(/\\/) !== -1) ? "\\" : "/";

	// Append the last ending (chrome/content/GUI.html) to the path
	path = path + pathSeperator + "content" + pathSeperator;

	return path;
})();

QLMM.getFileContent = function(name) {
	var path = QLMM.directory.chrome, file, inputStream, sInputStream;

	// Create the file and instantiate it with the path built above
	file = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);

	file.initWithPath(path + name);

	// Try to open up a file stream for the file
	inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(
		Components.interfaces.nsIFileInputStream);

	// Append the file to the input stream
	inputStream.init(file, 0x01, 00004, null);

	// Finally *phew*, read the contents
	sInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(
		Components.interfaces.nsIScriptableInputStream);

	sInputStream.init(inputStream);

	return sInputStream.read(sInputStream.available()) || "";
};

