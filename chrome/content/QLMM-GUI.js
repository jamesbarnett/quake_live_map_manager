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
};


QLMM.updateDocumentBinds = function() {
	var $ = QLMM.$;
	
	QLMM.debug("[QLMM] updating document binds");
	
	$('a#qlmm-menu-link').click(function() {
		
		if (!QLMM.isMapPathSet()) {
			alert("Please select your map folder from Tools -> Quake Live Map Manager -> Settings");
			return;
		}
		
		if (!$('div.qlmm-enabled').length) {
			QLMM.debug("[QLMM] loading QLMM GUI");
		
			$('#qlv_preLogContent').prepend(QLMM.html);
		
			QLMM.showStandardForm();
			
			// Close button
			$('#qlmm .close_window').click(function() {
				QLMM.hideQLMM();
			});
		
			var mapPath = QLMM.getMapsPath();
			var pk3ToMaps = QLMM.getInstalledMapLaunchNames();
			var mapCount = 0;
			var maps = new Array();
			
			for (var key in pk3ToMaps.items) {
				for (var i = 0; i < pk3ToMaps.getItem(key).length; i++) {
					maps.push(new QLMM.map(key, pk3ToMaps.getItem(key)[i]))
					mapCount++;	
				}
			}
			
			// sort by bsp name
			maps.sort(function(m1, m2) {
				return (m1.bsp.toLowerCase() < m2.bsp.toLowerCase()) ? 
					-1 : (m1.bsp.toLowerCase() > m2.bsp.toLowerCase() ? 1 : 0);
			});
			
			var mapOptions = "";
			
			for (var j = 0; j < mapCount; j++) {
				mapOptions += '<option value="' + maps[j].pk3 + '[' + maps[j].bsp + ']">' + 
					maps[j].bsp + "</option>\n";
			}
			
			$('#qlmm-map-count').text('Maps Installed: ' + mapCount);
			
			$('#qlmm-game-limit-label').css('display', 'none');
		
			$('#qlmm-maps-select').append(mapOptions);
		
			$('#qlmm-game-type-select').change(function() {
				var gameTypeSelect = $('#qlmm-game-type-select')[0];
			
				switch (gameTypeSelect.options[gameTypeSelect.selectedIndex].text) {
					case "Single Player":
						QLMM.singlePlayerSelected();
						break;
						
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
		}
	});
};


QLMM.singlePlayerSelected = function() {
    var $ = QLMM.$;
    $('#qlmm-game-limit-label').css('display', 'none');
    $('#qlmm-game-limit-select').css('display', 'none');
	$('#qlmm-players-select')[0].selectedIndex = 1;
	$('#qlmm-players-select').attr('disable', true);
	$('#qlmm-game-limit-label').css('display', 'none');
	$('#qlmm-game-limit-select').css('display', 'none');
};


QLMM.duelSelected = function() {
	var $ = QLMM.$;
	$('#qlmm-players-select')[0].selectedIndex = 1;
	$('#qlmm-players-select').attr('disabled', true);
	QLMM.fragLimitDropdown();
};


QLMM.ffaSelected = function() {
    var $ = QLMM.$;
    $('#qlmm-players-select').attr('disabled', false);
	QLMM.fragLimitDropdown();
};


QLMM.caSelected = function() {
	QLMM.$('#qlmm-players-select').attr('disabled', false);
	QLMM.roundLimitDropdown();
};


QLMM.tdmSelected = function() {
	QLMM.$('#qlmm-players-select').attr('disabled', false);
	QLMM.fragLimitDropdown();
};


QLMM.ctfSelected = function() {
	QLMM.$('qlmm-players-select').attr('disabled', false);
	QLMM.captureLimitDropdown();
};


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
};


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
};


QLMM.roundLimitDropdown = function() {	
	var options = '<option value="0">None</option>';
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
};


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
	
	if (!QLMM.validateForm()) return false;
	
	var gameTypeSelect = $('#qlmm-game-type-select')[0];
	var cmdString = '+com_backgroundDownload 1 +sv_quitOnExitLevel 1 ';
	cmdString += '+g_gametype ' + gameTypeSelect.options[gameTypeSelect.selectedIndex].value + ' ';
    
	var mapCmd = ($('#qlmm-cheats-enabled').is(':checked')) ? '+devmap' : '+map';
    var mapSelect = $('#qlmm-maps-select')[0];
    var mapInfo = mapSelect.value;
	
	var pk3File = mapInfo.split('[')[0];
	var mapName = mapInfo.split('[')[1].replace(']', '');
	QLMM.debug("The pk3 file is " + pk3File + " The map name is " + mapName);
	
	QLMM.copyMap(pk3File);
    cmdString += mapCmd + ' ' + mapName + ' ';
	
	var timeLimit = $('#qlmm-time-limit-select').val();
	
	cmdString += '+timelimit ' + timeLimit + ' ';
	cmdString += QLMM.gameLimitCommand();
	cmdString += ' +bot_minplayers 0 ';
	
	var skill = $('#qlmm-difficulty-select').val();
	var botCount = $('#qlmm-players-select').val();
	var botCmd = QLMM.botCommand(skill, botCount);
	
	cmdString += QLMM.processAdvancedOptions();
	cmdString += botCmd;
	cmdString += ' +wait';
	
	var gameCmd = QLMM.win.BuildCmdString() + cmdString;
	
	QLMM.debug('[QLMM] launch command: ' + gameCmd);
	QLMM.win.LaunchGame(gameCmd, true);
};


QLMM.processAdvancedOptions = function() {
	var $ = QLMM.$;
	var options = ' ';
	
	if ($('#qlmm-advanced-view').css('display') === 'block') {
		if ($('#qlmm-bot-thinktime').val() !== '') {
			options += '+bot_thinktime ' + $('#qlmm-bot-thinktime').val() + ' ';
		}
		
		if ($('#qlmm-sv-fps').val() !== '') {
			// min 10, max 125
			options += '+sv_fps ' + $('#qlmm-sv-fps').val() + ' ';
		}
		
		if ($('#qlmm-bot-challenge').is(':checked')) {
			options += '+bot_challenge 1 ';
		}
		
		if ($('#qlmm-bot-rocketjump').is(':checked')) {
			options += '+bot_rocketjump 1 ';
		}
		
		if ($('#qlmm-allow-kill').is(':checked')) {
			options += '+g_allowkill 1 ';
		}
	}
	
	return options;
};


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
};


QLMM.showStandardForm = function() {
	var $ = QLMM.$;
	$('#qlmm-standard-link').html('Standard');
	$('#qlmm-advanced-link').html('<a href="javascript:;" onclick="QLMM.showAdvancedForm()">Advanced</a>');	
	$('#qlmm-advanced-view').css('display', 'none');
};


QLMM.showAdvancedForm = function() {
	var $ = QLMM.$;
	$('#qlmm-advanced-link').html('Advanced');
	$('#qlmm-standard-link').html('<a href="javascript:;" onclick="QLMM.showStandardForm()">Standard</a>');
	$('#qlmm-advanced-view').css('display', 'block');
};


QLMM.validateForm = function() {
	var $ = QLMM.$;
	
	var errorMessage = '';
	var thinktime = parseInt($('#qlmm-bot-thinktime').val());
	var serverFps = parseInt($('#qlmm-sv-fps').val());
	
	if (thinktime > 200 || thinktime < 1) {
		errorMessage += "Bot Thinktime must be between 1 and 200.\n";
	}
	
	if (serverFps > 125 || serverFps < 10) {
		errorMessage += "Server FPS must be between 10 and 125.\n";
	}
	
	var isValid = errorMessage === '';
	
	if (!isValid) {
		alert(errorMessage);
	}
	
	return isValid;
};


QLMM.copyMap = function(map) {
	var qlDir = QLMM.quakeLiveFolder();
	var mapFile = Components.classes["@mozilla.org/file/local;1"].createInstance(
		Components.interfaces.nsILocalFile);
	mapFile.initWithPath(QLMM.getMapsPath());
	mapFile.append(map);
	mapFile.copyTo(qlDir, map);	
};

