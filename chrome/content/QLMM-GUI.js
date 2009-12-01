/**
 *
 */
QLMM.style = "<style type=\"text/css\">" + QLMM.getFileContent("QLMM.css") + '</style>';
QLMM.html = QLMM.getFileContent("QLMM.html");

/**
 * run()
 * Will initiate the injection of the actual GUI, position the elements and so
 * forth.
 */
QLMM.run = function () {
	var $ = QLMM.$, win = QLMM.win, $qlmm = $('#qlmm-menu-link');

	if (!QLMM.isStarted) {
		QLMM.isStarted = true;
		window.setInterval(QLMM.run, 250);
	}
	else if ($('#qlv_userInfo .WelcomeText').get(0) && !$qlmm.length) {
		QLMM.debug("[QLMM] Content seems loaded, we can add the QLMM GUI");
		$(QLMM.style).appendTo('head');

		$('#qlv_topLinks').prepend('<a id="qlmm-menu-link" href="javascript:;">Map Manager</a> | ');

		QLMM.updateDocumentBinds();
	}
}

QLMM.updateDocumentBinds = function() {
	var $ = QLMM.$;
	
	QLMM.debug("[QLMM] updating document binds");
	
	$('a#qlmm-menu-link').click(function() {
		
		if (!QLMM.isMapPathSet()) {
			alert("Please select your map folder from Tools -> Quake Live Map Manager -> Settings");
			return;
		}
		
		QLMM.debug("[QLMM] loading QLMM GUI");
		
		$('#qlv_preLogContent').prepend(QLMM.html);
		
		// Close button
		$('#qlmm .close_window').click(function() {
			QLMM.hideQLMM();
		});
		
		var mapPath = QLMM.getMapsPath();
		var maps = QLMM.getMapList(mapPath);
		
		var mapOptions = "";
		
		for (var i = 0; i < maps.length; ++i) {
		    mapOptions += '<option value="' + maps[i].path + '">' + maps[i].leafName + "</option>\n";	
		}
		
		$('#qlmm-game-limit-label').css('display', 'none');
		
		$('#qlmm-maps-select').append(mapOptions);
		
		$('#qlmm-game-type-select').change(function() {
			var gameTypeSelect = $('#qlmm-game-type-select')[0];
			
			switch (gameTypeSelect.options[gameTypeSelect.selectedIndex].text) {
				case "Duel":
					QLMM.duelSelected();
					break;
					
				case "Free For All":
					QLMM.ffaSelected();
					break;
					
				case "Team Death Match":
					QLMM.tdmSelected();
					break;
				
				case "Clan Arena":
					QLMM.caSelected();
					break;
					
				case "Capture The Flag":
					QLMM.ctfSelected();
					break;
			}
		});
		
		$('#qlmm-start').click(QLMM.startOfflineMap);
	});
}

QLMM.noGameTypeSelected = function() {
    var $ = QLMM.$;
    $('#qlmm-game-limit-label').css('display', 'none');
    $('#qlmm-game-limit-select').css('display', 'none');	
}

QLMM.duelSelected = function() {
	var $ = QLMM.$;
	$('#qlmm-players-select')[0].selectedIndex = 1;
	$('#qlmm-players-select').attr('disabled', true);
	QLMM.fragLimitDropdown();
}

QLMM.ffaSelected = function() {
    var $ = QLMM.$;
    $('#qlmm-players-select').attr('disabled', false);
	QLMM.fragLimitDropdown();
}

QLMM.caSelected = function() {
	QLMM.$('#qlmm-players-select').attr('disabled', false);
	QLMM.roundLimitDropdown();
}

QLMM.tdmSelected = function() {
	QLMM.$('#qlmm-players-select').attr('disabled', false);
	QLMM.fragLimitDropdown();
}

QLMM.ctfSelected = function() {
	QLMM.$('qlmm-players-select').attr('disabled', false);
	QLMM.captureLimitDropdown();
}

QLMM.fragLimitDropdown = function() {
	var options = '<option value="0">None</option>';
	for (var i = 1; i <= 5; ++i) {
		options += '<option value="' + i * 10 + '">' + i * 10 + ' Frags</option>';
	}
	
	var limitSelect = QLMM.$('#qlmm-game-limit-select').clone();
	limitSelect.empty();
	limitSelect.append(options);
	QLMM.$('#qlmm-game-limit-label').text('Frag Limit');
	QLMM.$('#qlmm-game-limit-label').append(limitSelect);
	QLMM.$('#qlmm-game-limit-label').css('display', 'block');
	limitSelect.css('display', 'inline');
}

QLMM.captureLimitDropdown = function() {	
	var options = '<option value="0">None</option>';
	for (var i = 4; i <= 12; i += 2) {
		options += '<option value="' + i + '">' + i + ' Captures</option>';
	}
	
	var limitSelect = QLMM.$('#qlmm-game-limit-select').clone();
	limitSelect.empty();
	limitSelect.append(options);
	QLMM.$('#qlmm-game-limit-label').text('Capture Limit');
	QLMM.$('#qlmm-game-limit-label').append(limitSelect);
	QLMM.$('#qlmm-game-limit-label').css('display', 'block');
	limitSelect.css('display', 'inline');
}

QLMM.roundLimitDropdown = function() {	
	var options = '<options value="0">None</option>';
	for (var i = 6; i <= 12; i += 2) {
		options += '<option value="' + i + '">' + i + ' Rounds</option>';
	}
	
	var limitSelect = QLMM.$('#qlmm-game-limit-select').clone();
	limitSelect.empty();
	limitSelect.append(options);
	QLMM.$('#qlmm-game-limit-label').text('Round Limit');
	QLMM.$('#qlmm-game-limit-label').append(limitSelect);
	QLMM.$('#qlmm-game-limit-label').css('display', 'block');
	limitSelect.css('display', 'inline');
}

/**
 * hideQLMM()
 * Hides the overlay.
 */
QLMM.hideQLMM = function () {
	QLMM.debug("[QLMM] closing launch map dialog");
	QLMM.$('#qlv_prefsoverlay').remove();
};

QLMM.startOfflineMap = function(e) {
	var $ = QLMM.$;
	var gameTypeSelect = $('#qlmm-game-type-select')[0];
	var cmdString = '+com_backgroundDownload 1 +sv_quitOnExitLevel 1 ';
	cmdString += '+g_gametype ' + gameTypeSelect.options[gameTypeSelect.selectedIndex].value + ' ';
    
	var mapCmd = ($('#qlmm-cheats-enabled').is(':checked')) ? '+devmap' : '+map'
    var mapSelect = $('#qlmm-maps-select')[0];
    var mapName = mapSelect.options[mapSelect.selectedIndex].text.replace('.pk3', '');
	
	QLMM.copyMap(mapSelect.options[mapSelect.selectedIndex].text);
    cmdString += mapCmd + ' ' + mapName + ' ';
	
	var timeLimit = $('#qlmm-time-limit-select').val();
	
	cmdString += '+timelimit ' + timeLimit + ' ';
	cmdString += QLMM.gameLimitCommand();
	cmdString += ' +bot_minplayers 0 ';
	
	var skill = $('#qlmm-difficulty-select').val();
	var botCount = $('#qlmm-players-select').val();
	var botCmd = QLMM.botCommand(skill, botCount);
	
	cmdString += botCmd;
	cmdString += ' +wait +readyup +wait';
	
	var gameCmd = QLMM.win.BuildCmdString() + cmdString;
	
	QLMM.debug('[QLMM] launch command: ' + gameCmd);
	QLMM.win.LaunchGame(gameCmd, true);
}

QLMM.gameLimitCommand = function() {
	var $ = QLMM.$;
	var labelText = $('#qlmm-game-limit-label').text();
	var limit = $('#qlmm-game-limit-select').val();
	var cmd = "";
	if (labelText.indexOf('Frag') === 0) {
		cmd = '+fraglimit ' + limit;
	}
	else if (labelText.indexOf('Capture') === 0) {
		cmd = '+capturelimit ' + limit;
	}
	else if (labelText.indexOf('Round') === 0) {
		cmd = '+roundlimit ' + limit;
	}
	
	return cmd;
}

QLMM.copyMap = function(map) {
	var qlDir = QLMM.quakeLiveFolder();
	var mapFile = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);
	mapFile.initWithPath(QLMM.getMapsPath());
	mapFile.append(map);
	mapFile.copyTo(qlDir, map);	
}
