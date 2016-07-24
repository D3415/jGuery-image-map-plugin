;(function(jQuery) {
	// global vars
	var context = false;
	var mousedown = 0;
	var cursor_coords = {};
	var drawing = 0;
	var drawing_object = false;
	var markers = [];
	var canvas;
	//
	var options = {
		mode : 'display',
		zoom : false,
		border_color : 'marker',
		border_width: 2,
		border_radius: 0
	};

	function imageMarker (el,opt) {
		options.element = el;
		$.extend(options,opt);
		if (options.mode == 'display') {
			this.init_display();
		}
		if (options.mode == 'admin') {
			this.init_admin();
		}
		
	}
	imageMarker.prototype.draw = function() {
		
		function check_collision (for_drwaing) {
			if (drawing_object === false && for_drwaing == true) return {
				status: true
			};
			var ret = {
				status: true
			};
			if (for_drwaing) {
				var item = markers[drawing_object];
				var item_coords = item.coords;
				for (var i = 0; i < item_coords.length; i++) {
					
					var XY = item_coords[i];		

					if (  
						XY.x + 4 >= cursor_coords.x &&
						XY.x - 4 <= cursor_coords.x &&
						XY.y + 4 >= cursor_coords.y &&
						XY.y - 4 <= cursor_coords.y
					) {
						console.log('collision detected!');
						ret = {
							status: false
						};
						break;
					}
				}
			} else {
				
				dance:
				for (var a = 0; a < markers.length; a++) {
					var item = markers[a];
					for (var i = 0; i < item.coords.length; i++) {
						var XY = item.coords[i];
						if (  
							XY.x + 4 >= cursor_coords.x &&
							XY.x - 4 <= cursor_coords.x &&
							XY.y + 4 >= cursor_coords.y &&
							XY.y - 4 <= cursor_coords.y
						) {	
							//alert(1323);
							

							ret = {
								status: false,
								result: {
									marker: a,
									part: i
								} 
							};
							break dance;
							
						}
					}
				}

			}

			
			return ret;
		}


		///////////
		var checkin = check_collision();
		if (checkin.status == false) {
			console.log(checkin.result);
		}


		context.clearRect(0, 0, canvas.width, canvas.height);
		var previous = false;
		for (var a = 0; a < markers.length; a++) {
			var marker = markers[a];

			for (var i = 0; i < marker.coords.length; i++) {
				var coords = marker.coords[i];
				context.strokeStyle="#FF0000";
				context.beginPath();
				context.arc(coords.x,coords.y,4,0,2*Math.PI);
				context.stroke();
				if (previous !== false) {
					context.beginPath();
					context.moveTo(previous.x,previous.y);
					context.lineTo(coords.x,coords.y);
					context.stroke();
				}
				if (previous !== false && marker.status == 'finished' && (i+1) == marker.coords.length) {
					var start = marker.coords[0];
					context.beginPath();
					context.moveTo(coords.x,coords.y);
					context.lineTo(start.x,start.y);
					context.stroke();

				}
				previous = coords;
			}
			previous = false;
		}
		//console.log(markers);
		if (options.mode == 'admin') {
			//console.log(mousedown);
			if (mousedown) {
				if (!drawing) {
					drawing = 1;
					var new_mark = {
						type : 'rect',
						status : 'drawing',
						coords : [
							{
								x : cursor_coords.x,
								y : cursor_coords.y
							}
						]
					};
					markers.push(new_mark);
					drawing_object = markers.length - 1;
					
				}	
				
				if (drawing_object !== false && drawing) {
					var current = markers[drawing_object];
					current_item = current.coords;
					//console.log(current.length);
					if (current_item.length >= 3) {
						//console.log('here');
						var first_coord = markers[drawing_object];
						first_coord = first_coord.coords[0];
						//console.log(first_coord.x,first_coord.y);
						//console.log(cursor_coords.x,cursor_coords.y);
						if (  
							first_coord.x + 4 >= cursor_coords.x &&
							first_coord.x - 4 <= cursor_coords.x &&
							first_coord.y + 4 >= cursor_coords.y &&
							first_coord.y - 4 <= cursor_coords.y
						) {
							current.status = 'finished';
							markers[drawing_object] = current;
							console.log('end reached!');
							//alert('end reached!');
							drawing_object = false;
							drawing = 0;
						}
					}
				}

				if (drawing_object !== false && drawing) {
					var check = check_collision(true)
					if (check.status) {
						var marker = markers[drawing_object];
					
						marker.coords.push({
							x : cursor_coords.x,
							y : cursor_coords.y
						});
						markers[drawing_object] = marker;
					}
					
				}	



			}
		}
	}
	imageMarker.prototype.bind_events = function(canvas) {

		$(canvas).on('mousedown',function(e){
			cursor_coords.x = e.pageX - $(canvas).offset().left;
			cursor_coords.y = e.pageY - $(canvas).offset().top;
			mousedown = 1;
			
		});
		$('body').on('mouseup',function(){

			mousedown = 0;
		});
		$(canvas).on('mousemove',function(e){
			if (mousedown) {
				cursor_coords.x = e.pageX - $(canvas).offset().left;
				cursor_coords.y = e.pageY - $(canvas).offset().top;
				
			}
		});
	}
	imageMarker.prototype.create_canvas = function() {

		canvas = document.createElement("canvas"); 
		$(canvas).attr('width',options.element.width());
		$(canvas).attr('height',options.element.height());
		$(canvas).css({
			'position' : 'absolute',
			'top' : 0,
			'left' : 0,
			'cursor' : 'crosshair'
		});
		context = canvas.getContext('2d');
		this.bind_events(canvas);
		options.element.append(canvas);

	}
	imageMarker.prototype.init_admin = function() {
		this.create_canvas();
		var interval = setInterval(this.draw,200);



		console.log(options);
	}
	imageMarker.prototype.init_display = function() {
		console.log(options);
	}

	jQuery.fn.imageMarker = function (options) {
		new imageMarker(this, options);
		return this;
	}

}(jQuery));