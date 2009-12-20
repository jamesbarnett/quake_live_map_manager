QLMM.Game = function(gametype, pk3, bsp, timelimit, players, difficulty, gamelimit,
	botThinktime, serverFps, cheatsEnabled, botChallenge, botRocketJump, allowKill) {
	this.gametype = gametype;
	this.pk3 = pk3;
	this.bsp = bsp;
	this.timelimit = timelimit;
	this.players = players;
	this.difficulty = difficulty;
	this.gamelimit = gamelimit;
	this.botThinktime = botThinktime;
	this.serverFps = serverFps;
	this.cheatsEnabled = cheatsEnabled;
	this.botChallenge = botChallenge;
	this.botRocketJump = botRocketJump;
	this.allowKill = allowKill;
	
	this.toFile = (function() {
		var file = QLMM.settingsPath();
		file.append(pk3 + '[' + bsp + '].txt');
		
		var data = this.gametype + "\n";
		data += this.pk3 + "\n";
		data += this.bsp + "\n";
		data += this.timelimit + "\n";
		data += this.players + "\n";
		data += this.difficulty + "\n";
		data += this.gamelimit + "\n";
		data += this.botThinktime + "\n";
		data += this.serverFps + "\n";
		data += this.cheatsEnabled + "\n";
		data += this.botChallenge + "\n";
		data += this.botRocketJump + "\n";
		data += this.allowKill + "\n";
		
		QLMM.writeFile(file, data);
	});
	
	return this;
};


QLMM.Game.fromFile = function(file) {
	var data = QLMM.readFile(file);
	var content = data.split("\n");
	return new QLMM.Game(content[0],
		content[1],
		content[2],
		content[3],
		content[4],
		content[5],
		content[6],
		content[7],
		content[8],
		content[9],
		content[10],
		content[11],
		content[12]);
};

