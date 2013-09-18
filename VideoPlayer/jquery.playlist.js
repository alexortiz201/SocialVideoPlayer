/**
 *  jquery.playlist.js
 *  alexortiz: special thanks to dan@allbutlost.com
 *
 *  Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 **/
 
String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
};

jQuery.fn.playlist = function(options) {
 
	// default settings
	var options = jQuery.extend({
		holderId: 'video',
		playerHeight: 272,
		playerWidth: 339,
		addThumbs: false,
		thumbSize: 'small',
		showInline: false,
		autoPlay: true,
		showRelated: true,
		allowFullScreen: false
	},options);
 
	return this.each(function() {
							
		var $el = jQuery(this);
		
		var autoPlay = "";
		var showRelated = "&rel=0";
		var fullScreen = "";
		if(options.autoPlay) autoPlay = "&autoplay=1";
		if(options.showRelated) showRelated = "&rel=1";
		if(options.allowFullScreen) fullScreen = "&fs=1";
		
		
		//Myspace Player
		function playOld(id) {
			var html = '';
			html += '<object height="'+options.playerHeight+'" width="'+options.playerWidth+'">';
			html += '<param name="allowfullscreen" value="true"/>';
			html += '<param name="wmode" value="transparent"/>';
			html += '<param name="movie" value="http://mediaservices.myspace.com/services/media/embed.aspx/m='+ id +',t=1,mt=video"/>';
			html += '<embed src="http://mediaservices.myspace.com/services/media/embed.aspx/m='+ id +',t=1,mt=video"';
			html += 'height="'+options.playerHeight+'" width="'+options.playerWidth+'"';
			html += ' allowfullscreen="true" ';
			html += 'type="application/x-shockwave-flash" wmode="transparent"></embed>';
			html += '</object>';
			
			return html;
		}
		
		//Youtube Player
		function playNew (id) {
			var html = '';
			html += '<iframe width="'+ options.playerWidth +'" height="'+ options.playerHeight +'"';
			html += ' src="http://www.youtube.com/embed/'+ id +'?wmode=opaque' + showRelated + '" frameborder="0"';
			html += ' allowfullscreen></iframe>';

			return html;
		}
		
		//grab a youtube id from a (clean, no querystring) url
		function youtubeid(url) {
			var ytid = url.match("[\\?&]v=([^&#]*)");
			ytid = ytid[1];
			return ytid;
		}
		
		//grabs myspace url and extracts video id
		function myspaceid(url) {
			msid = url.slice(url.lastIndexOf("/") + 1, url.length);
			return msid;
		}
		
		$el.children('li').each(function() {
			jQuery(this).find('a').each(function() {
				var thisHref = jQuery(this).attr('href');

				//old-style youtube links
				if (thisHref.startsWith('http://www.youtube.com')) {
					jQuery(this).addClass('yt-vid');
					jQuery(this).data('yt-id', youtubeid(thisHref) );
				}
				//new style youtu.be links
				else if (thisHref.startsWith('http://youtu.be')) {
					jQuery(this).addClass('yt-vid');
					var id = thisHref.substr(thisHref.lastIndexOf("/") + 1);
					jQuery(this).data('yt-id', id );
				}
				//Myspace links
				else if (thisHref.startsWith('http://www.myspace.com')) {
					//ismyspace = false;
					jQuery(this).addClass('ms-vid');
					jQuery(this).data('ms-id', myspaceid(thisHref) );
				}
				else {
					//must be an image link (naive)
					jQuery(this).addClass('img-link');
				}
			});
		});
		
		//load youtube videos on request
		$el.children("li").children("a.yt-vid").click(function() {
			if (options.showInline) {
				jQuery("li.currentvideo").removeClass("currentvideo");
				jQuery(this).parent("li").addClass("currentvideo").html(playNew(jQuery(this).data("yt-id")));
			}
			else {
				jQuery("#"+options.holderId+"").html(playNew(jQuery(this).data("yt-id")));
				jQuery(this).parent().parent("ul").find("li.currentvideo").removeClass("currentvideo");
				jQuery(this).parent("li").addClass("currentvideo");
			}
			
			return false;
		});
		
		//load myspace videos on request
		$el.children("li").children("a.ms-vid").click(function() {
			if (options.showInline) {
				jQuery("li.currentvideo").removeClass("currentvideo");
				jQuery(this).parent("li").addClass("currentvideo").html(playNew(jQuery(this).data("yt-id")));
			}
			else {
				jQuery("#"+options.holderId+"").html(playOld(jQuery(this).data("ms-id")));
				jQuery(this).parent().parent("ul").find("li.currentvideo").removeClass("currentvideo");
				jQuery(this).parent("li").addClass("currentvideo");
			}
			
			return false;
		});

		$el.find("a.img-link").click(function() {
			var $img = jQuery('<img/>');
				$img.attr({src:jQuery(this).attr('href') })
					.css({
						display: 'none',
						position: 'absolute',
						left: '0px',
						top: '50%'});

				if(options.showInline) {
					jQuery("li.currentvideo").removeClass("currentvideo");
					jQuery(this).parent("li").addClass("currentvideo").html($img);
				}
				else {
					jQuery("#"+options.holderId+"").html($img);
					jQuery(this).closest("ul").find("li.currentvideo").removeClass("currentvideo");
					jQuery(this).parent("li").addClass("currentvideo");
				}

				//wait for image to load (webkit!), then set width or height
				//based on dimensions of the image
				setTimeout(function() {
					if ( $img.height() < $img.width() ) {
						$img.width(options.playerWidth).css('margin-top',parseInt($img.height()/-2, 10)).css({
							height: 'auto'
						});
					}
					else {
						$img.css({
							height: options.playerHeight,
							width: 'auto',
							top: '0px',
							position: 'relative'
						});
					}
				
					$img.fadeIn();
				
				}, 100);

			return false;
		});
		
		//do we want thumbs with that?
		if(options.addThumbs) {
			$el.children().each(function(i){
				//replace first link
				var $link = jQuery(this).find('a:first');
				var replacedText = jQuery(this).text();
				var thumbUrl;
				if ($link.hasClass('yt-vid')) {
					if(options.thumbSize == 'small') {
						thumbUrl = "http://img.youtube.com/vi/"+$link.data("yt-id")+"/2.jpg";
					}
					else {
						thumbUrl = "http://img.youtube.com/vi/"+$link.data("yt-id")+"/0.jpg";
					}

					var thumbHtml = "<img src='"+thumbUrl+"' alt='"+replacedText+"' />";
					$link.empty().html(thumbHtml+replacedText).attr("title", replacedText);

				} else if ($link.hasClass('ms-vid')) {
					//replace myspace thumbs with same id images ms-id + .jpg
					if(options.thumbSize == 'small') {
						thumbUrl = $link.data("ms-id")+".jpg";
					}
					else {
						thumbUrl = $link.data("ms-id")+".jpg";
					}

					var thumbHtml = "<img src='"+thumbUrl+"' alt='"+replacedText+"' />";
					$link.empty().html(thumbHtml+replacedText).attr("title", replacedText);

				}
				else {
					//is an image link
					var $img = jQuery('<img/>').attr('src',$link.attr('href'));
					$link.empty().html($img).attr("title", replacedText);
				}
				
			});
			
		}
		
		//load inital video
		var firstVid = $el.children("li:first-child").addClass("currentvideo").children("a").click();

	});

};