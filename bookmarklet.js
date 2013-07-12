// I used Bookmarklet Crunchinator to make the bookmarklet from this
// http://ted.mielczarek.org/code/mozilla/bookmarklet.html
javascript:
(function(){
    if (window.key === undefined){
        _key_master=document.createElement('script');
        _key_master.type='text/javascript';
		_key_master.src='https://raw.github.com/madrobby/keymaster/master/keymaster.min.js';
		_key_master.onload=_key_master.onreadystatechange = function(){
            //make keymaster work on input/textarea fields
            key.filter = function(){ return true; };
            key('esc', function(){ window.toggleSayura(); });
		};

		document.getElementsByTagName('head')[0].appendChild(_key_master);
	};

	if(window.toggleSayura === undefined){
		_sayura_js=document.createElement('script');
		_sayura_js.type='text/javascript';
		_sayura_js.src='https://raw.github.com/chanux/sayura.js/master/sayura.js';
		document.getElementsByTagName('head')[0].appendChild(_sayura_js);
	};
})();
