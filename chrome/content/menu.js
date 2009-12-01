/**
 * @file settings.js
 * @author immut4ble_r3f
 * @date 2009-11-17
 */
function openSettingsFileDialog() {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;

    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefBranch);
    
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        Components.interfaces.nsIFilePicker);
    
    filePicker.init(window, "Select the folder containing offline maps", nsIFilePicker.modeGetFolder);
    
    var response = filePicker.show();
    
    if (response == nsIFilePicker.returnOK || response == nsIFilePicker.returnReplace) {
		var file = QLMM.settingsPath();
		file.append("maps_path");
		QLMM.writeFile(file, filePicker.file.path);
    }
}
