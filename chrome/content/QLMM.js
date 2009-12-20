/**
 * Quake Live Map Manager
 * @author immut4ble_r3f
 * @date 11-23-2009
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Much of this code is based on peolan's excellent Quake Live Demo Player Firefox add-on
 * https://addons.mozilla.org/en-US/firefox/addon/14318/
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


QLMM.Pk3ToMapHash = function() {
	this.length = 0;
	this.items = new Array();
	
	this.getItem = function(key) {
		return this.items[key];
	}
	
	this.insertItem = function(key, val) {
		var tmp;
		
		if (typeof(val) !== 'undefined') {
			if (typeof(this.items[key]) === 'undefined') {
				this.length++;
			}
			else {
				tmp = this.items[key];
			}
			
			this.items[key] = val;
		}
		
		return tmp;
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

	window.setTimeout(arguments.callee, 125);
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

		aPath = "id Software\\quakelive\\baseq3\\";

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
		appDataDir = "~/.quakelive/quakelive/baseq3/":
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
	
	return file;
};


QLMM.mapConfigsPath = function() {
	let file = QLMM.settingsPath();
						
	file.append('mapconfigs');
	
	return file;
}


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
	var mapsPath = QLMM.getPrefValue("maps_path");
	
	return mapsPath !== '';
};


QLMM.getMapsPath = function() {
	return QLMM.getPrefValue("maps_path");
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


QLMM.getInstalledMapLaunchNames = function() {
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);
	var path = QLMM.getMapsPath();
	var pk3list = QLMM.getMapList(path);
	var configFile = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);
	var mapLaunchNames = new Array();
	
	var pk3ToMaps = new QLMM.Pk3ToMapHash();
		
	for (var i = 0; i < pk3list.length; i++) {
		var fileName = pk3list[i].leafName.replace(/\.pk3$/i, ".maps.txt")
		if (fileName !== 'lsdm17_blue_textures.pk3.maps.txt' && fileName !== 'lvl_twctf.maps.txt')	{
			
			var contents = QLMM.getMapConfigFileContent(fileName);
	
			pk3ToMaps.insertItem(pk3list[i].leafName, new Array());
			
			if (contents !== '') {	
				var maps = QLMM.chomp(contents).split("\n");
	
				for (var j = 0; j < maps.length; j++) {
					pk3ToMaps.getItem(pk3list[i].leafName).push(maps[j]);
				}
			}
			else
			{
				// No config file for map, assume pk3 and bsp have the same name
				pk3ToMaps.getItem(pk3list[i].leafName).push(pk3list[i].leafName.replace(/\.pk3$/i, ''));
			}
		}
	}
	
	return pk3ToMaps;
}


/**
 * Find the path for the extension, e.g.
 * /home/user/.mozilla/firefox/<profile>/extensions/qlmapmngr@gmail.com or equivalent.
 */
QLMM.directory.chrome = function () {
	// Get initial path to the QLDP extension
	var path = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation("qlmapmngr@gmail.com").getItemFile("qlmapmngr@gmail.com", "chrome").path, pathSeperator;

	// Parse the file seperator (/ on unix, \ on windows)
	QLMM.directory.pathSeperator = pathSeperator = (path.search(/\\/) !== -1) ? "\\" : "/";

	// Append the last ending (chrome/content/GUI.html) to the path
	path = path + pathSeperator + "content" + pathSeperator;

	return path;
}();


QLMM.getChromeFileContent = function() {
	var path = QLMM.directory.chrome;
	
	return function(name) {
		var file, inputStream, sInputStream;

		// Create the file and instantiate it with the path built above
		file = Components.classes["@mozilla.org/file/local;1"].createInstance(
			Components.interfaces.nsILocalFile);

		file.initWithPath(path + name);

		return QLMM.readFile(file);
	}
}();


QLMM.readFile = function(file) {
	var inputStream, sInputStream;
	
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
}


QLMM.getMapConfigFileContent = function() {
	var path = QLMM.mapConfigsPath();
		
	return function(name) {
		try {
			// Create the file and instantiate it with the path built above
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(
				Components.interfaces.nsILocalFile);
	
			file.initWithPath(path.path);
			file.append(name);
	
			QLMM.debug("[QLMM] opening map config file: " + file.path);

			return QLMM.readFile(file);
		}
		catch (e) {
			QLMM.debug('[QLMM] getMapConfigFileContent exception, file: ' + name + ', exception ' + e);
			return '';
		}
	}
}();


QLMM.chomp = function(raw_text) {
    return raw_text.replace(/(\n|\r)+$/, '');
}


/**
 * setPrefValue(preference, value)
 * Try to set the preference value from the extensions branch in Firefox.
 */
QLMM.setPrefValue = function(pref, val) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
		Components.interfaces.nsIPrefService);
	var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(
		Components.interfaces.nsISupportsString);

	prefs = prefs.getBranch("extensions.qlmm.");
	str.data = val;

	try {
		prefs.setComplexValue(pref, Components.interfaces.nsISupportsString, str);
	}
	catch (e) {}
};


/**
 * getPrefValue(preference)
 * Try to get the preference value from the extensions branch in Firefox.
 * @returns the value or an empty string
 */
QLMM.getPrefValue = function(pref) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
		Components.interfaces.nsIPrefService), retVal = "";

	prefs = prefs.getBranch("extensions.qlmm.");

	try {
		retVal = prefs.getComplexValue(pref, Components.interfaces.nsISupportsString).data;
	}
	catch (e) {}

	return retVal || "";
};
