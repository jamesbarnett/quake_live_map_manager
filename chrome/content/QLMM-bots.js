QLMM.bots = [
	'anarki',
	'angel',
	'biker',
	'bitterman',
	'bones',
	'cadavre',
	'crash',
	'daemia',
	'doom',
	'gorre',
	'grunt',
	'hossman',
	'hunter',
	'id',
	'keel',
	'klesk',
	'lucy',
	'major',
	'mynx',
	'orbb',
	'patriot',
	'phobos',
	'ranger',
	'razor',
	'sarge',
	'slash',
	'sorlag',
	'stripe',
	'tankjr',
	'uriel',
	'visor',
	'wrack',
	'xaero'
];

function bot(name, skill, team) {
	this.name = name;
	this.skill = skill;
	this.team = team;
}

QLMM.botCommand = function(skill, botCount) {
	var gameBots = [];
	var botPool = QLMM.bots.slice();
	var teams = ["red", "blue"];
	
	for (var i = botCount; i > 0; i--) {
		var index = Math.floor(Math.random() * (botPool.length - 1));
		var b = new bot(botPool[index], skill, teams[i % 2]);
		gameBots.push(b);
		botPool.splice(index, 1);
	}
	
	var cmd = "";
	
	for (var i = 0; i < gameBots.length; ++i) {
		cmd += '+addbot ' + gameBots[i].name + ' ' + skill + ' ' + gameBots[i].team +
		    ' +wait '
	}
	
	return cmd;
}
