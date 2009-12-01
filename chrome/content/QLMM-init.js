window.addEventListener('load', function () {
	gBrowser.addEventListener("load", function(e) {
		var d = e.originalTarget, w = d.defaultView ? d.defaultView.wrappedJSObject : undefined;
		// Root document!
		if (d instanceof HTMLDocument && w.location.href.match(/^http:\/\/?(www\.)?quakelive\.com?(\/)(?!forum.*)/i) && 
		    !d.defaultView.frameElement) {
			QLMM.init(d, w);
		}
	}, true);
}, true);
