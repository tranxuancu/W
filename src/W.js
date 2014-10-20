/*
	Width management tool for responsive designs

	Author
		Aurélien Delogu (dev@dreamysource.fr)

	Some readings
		http://www.alistapart.com/articles/fontresizing/
		http://tripleodeon.com/2011/12/first-understand-your-screen/

	Notes
		Thanks to Lawrence Carvalho (carvalho@uk.yahoo-inc.com) for his useful TextResizeDetector script :)
*/

;(function(context,name,definition){
	if(typeof module!='undefined' && module.exports){
		module.exports=definition();
	}
	else if(typeof define=='function' && define.amd){
		define(definition);
	}
	else{
		context[name]=definition();
	}
}(this,'W',function(){

	// Prepare
	var win=window,
		doc=document,
		html=doc.documentElement,
		a,b,
		textElement,
		textHeight,
		listeners=[],
		trigger=false,
		unit,
		absolute_mode=false,
		refreshUnit=function(){
			a=doc.createElement('div');
			a.style.width='1em';
			html.appendChild(a);
			unit=a.offsetWidth;
			unit=unit?unit:16;
			html.removeChild(a);
		};
	refreshUnit();

	// Catch window resize event
	if(win.addEventListener){
		win.addEventListener('resize',function(){
			trigger=true;
		},false);
	}
	else{
		win.attachEvent('onresize',function(){
			trigger=true;
		});
	}

	// Initialize the text element to catch text resizes
	textElement=doc.createElement('b');
	textElement.style.position='absolute';
	textElement.style.top='-99em';
	textElement.innerHTML='W';
	html.appendChild(textElement);
	textHeight=textElement.offsetHeight;

	// Verify resizes every 250ms
	setInterval(function(){
		// Verify text element state
		a=textElement.offsetHeight;
		if(a!=textHeight){
			trigger=true;
		}
		textHeight=a;
		// Text has been resized
		if(trigger && html.clientWidth){
			refreshUnit();
			for(var i=0,j=listeners.length;i<j;++i){
				listeners[i]();
			}
			trigger=false;
		}
	},250);

	// Viewport resolution detection
	function detectViewport(){
		// Prepare
		var screen_width,
			screen_height,
			values=[
				{width:screen.availWidth,height:screen.availHeight},
				{width:window.outerWidth,height:window.outerHeight},
				{width:window.innerWidth,height:window.innerHeight}
			],
			notes=[],
			i,j;
		// Detect right screen resolution (since iOS does not flip values between portrait and landscape)
		if(screen.width==screen.availWidth || screen.height==screen.availHeight){
			screen_width=screen.width;
			screen_height=screen.height;
		}
		else{
			screen_width=screen.height;
			screen_height=screen.width;
		}
		// Absolute mode
		if(absolute_mode){
			return {
				width: screen_width,
				height: screen_height
			};
		}
		// Relative mode
		else{
			// Apply rules
			for(i=0,j=values.length;i<j;++i){
				if(values[i].width>screen_width || values[i].height>screen_height){
					values[i].note=0;
				}
				else if(values[i].width<screen_width || values[i].height<screen_height){
					values[i].note=2+(screen_width-values[i].width)+(screen_height-values[i].height);
				}
				else{
					values[i].note=1;
				}
			}
			// Sort notes
			values.sort(function(a,b){
				return b.note-a.note;
			});
			// Return the better value
			return {
				width: values[0].width,
				height: values[0].height
			};
		}
	}

	// Define W object
	return {
		px2em: function(px){
			return px/unit;
		},
		getViewportWidth: function(){
			return detectViewport().width;
		},
		getViewportHeight: function(){
			return detectViewport().height;
		},
		addListener: function(func){
			listeners.push(func);
			return func;
		},
		setAbsoluteMode: function(flag){
			absolute_mode=!!flag;
		}
	};

}));