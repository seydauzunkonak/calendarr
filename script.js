(function($) {
	function Class(View) {
		View = View.class || View;
		var renderFn = 'render' in View.prototype ? 'render' : 'renderDates';
		var originalRender = View.prototype[renderFn];
		View.prototype[renderFn] = function() {
			originalRender.call(this);
			if (! this.el.data('fullcalendar-rightclick')) {
				this.registerRightclickListener();
				this.el.data('fullcalendar-rightclick', true);
			}
		};
		function trigger() {
			throw new Error("trigger not detected");
		}
		function oldTrigger(triggerFn) {
			return function trigger(that, jsEventName, view, dateOrEvent, jsEvent) {
				return that[triggerFn](jsEventName, view, dateOrEvent, jsEvent)
			};
		}
		if (typeof View.prototype.publiclyTrigger === 'function') {
			if (View.prototype.publiclyTrigger.toString().match(/name, thisObj/)) {
				trigger = oldTrigger('publiclyTrigger');
			}
			else {
				trigger = function (that, jsEventName, view, dateOrEvent, jsEvent) {
					return that.publiclyTrigger(jsEventName, [ dateOrEvent, jsEvent, view ]);
				};
			}
		} else {
			trigger = oldTrigger('trigger');
		}
		View.prototype.registerRightclickListener = function() {
			var that = this;
			this.el.on('contextmenu', function(ev) {
				var eventElt = $(ev.target).closest('.fc-event');
				if (eventElt.length) {
					var seg = eventElt.data('fc-seg');
					var event;
					if (typeof seg.event === 'object') {
						event = seg.event;
					} else {
						event = seg.footprint.eventDef;
					}
					return trigger(that, 'eventRightclick', this, event, ev);
				} else {
       	var fcContainer = $(ev.target).closest(
						'.fc-bg, .fc-slats, .fc-content-skeleton, ' +
						'.fc-bgevent-skeleton, .fc-highlight-skeleton'
					);
					if (fcContainer.length) {
						var cell;
						if (that.coordMap) {
              	that.coordMap.build();
							cell = that.coordMap.getCell(ev.pageX, ev.pageY);
						} else {
							that.prepareHits();
							var hit = that.queryHit(ev.pageX, ev.pageY);
							if (typeof that.getHitSpan === 'function') {
				
								cell = that.getHitSpan(hit);
							} else {
								if (hit.row) {
									cell = hit.component.getCellRange(hit.row, hit.col);
								} else {
									var componentFootprint = hit.component.getSafeHitFootprint(hit);
									if (componentFootprint) {
										cell = that.calendar.footprintToDateProfile(componentFootprint);
									}
								}
							}
						}
						if (cell)
							return trigger(that, 'dayRightclick', null, cell.start, ev);
					}
				}
			});
		};
	}
	var fc = $.fullCalendar;
	Class(fc.views.agenda);
	Class(fc.views.basic);
})(jQuery);