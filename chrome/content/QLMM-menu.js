/**
 * @file settings.js
 * @author immut4ble_r3f
 * @date 2009-11-17
 */
QLMM.openSettingsFileDialog = function() {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        Components.interfaces.nsIFilePicker);
    
    filePicker.init(window, "Select the folder containing offline maps", nsIFilePicker.modeGetFolder);
    
    var response = filePicker.show();
    
    if (response == nsIFilePicker.returnOK || response == nsIFilePicker.returnReplace) {		
		QLMM.setPrefValue("maps_path", filePicker.file.path);
    }
}
