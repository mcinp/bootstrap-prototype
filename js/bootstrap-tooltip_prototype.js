/* ===========================================================
 * bootstrap-tooltip.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
/*

Modified for use with PrototypeJS

http://github.com/jwestbrook/bootstrap-prototype


*/


  "use strict"; // jshint ;_;

if(BootStrap === undefined)
{
	var BootStrap = {};
}


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

BootStrap.Tooltip = Class.create({

	initialize : function (element, options) {
	
		this.options = {
			animation: true
			, placement: 'top'
			, selector: false
			, template: new Element('div',{'class':'tooltip'}).insert(new Element('div',{'class':'tooltip-arrow'})).insert(new Element('div',{'class':'tooltip-inner'}))
			, trigger: 'hover'
			, title: ''
			, delay: 0
			, html: false
		};
		Object.extend(this.options,options);
		if (this.options.delay && typeof this.options.delay == 'number') {
			this.options.delay = {
				show: options.delay
				, hide: options.delay
			}
		}
		this.init('tooltip', element)
	}
	, init: function (type, element) {
		var eventIn
		, eventOut
		
		this.type = type
		this.$element = $(element)
		this.enabled = true
		
		if (this.options.trigger == 'click') {
			this.$element.observe('click', this.toggle.bind(this))
		} else if (this.options.trigger != 'manual') {
			eventIn = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
			eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
			this.$element.observe(eventIn, this.enter.bind(this))
			this.$element.observe(eventOut, this.leave.bind(this))
		}
		
		if(this.options.selector){
			this._options = Object.extend({},this.options)
			Object.extend(this._options,{ trigger: 'manual', selector: '' })
		}
		else
		{
			this.fixTitle()
		}
	}
	, enter: function (e) {
		var self = this
		
		if (!self.options.delay || !self.options.delay.show) return self.show()
		
		clearTimeout(this.timeout)
		self.hoverState = 'in'
		this.timeout = setTimeout(function() {
			if (self.hoverState == 'in') self.show()
		}, self.options.delay.show)
	}
	
	, leave: function (e) {
		var self = this
		
		if (this.timeout) clearTimeout(this.timeout)
		if (!self.options.delay || !self.options.delay.hide) return self.hide()
		
		self.hoverState = 'out'
		this.timeout = setTimeout(function() {
			if (self.hoverState == 'out') self.hide()
		}, self.options.delay.hide)
	}
	
	, show: function () {
		var $tip
		, inside
		, pos
		, actualWidth
		, actualHeight
		, placement
		, tp
		, layout
		
		if (this.hasContent() && this.enabled) {
			$tip = this.tip()
			this.setContent()
			
			if (this.options.animation) {
				$tip.addClassName('fade')
			}
			
			placement = typeof this.options.placement == 'function' ?
			this.options.placement.call(this, $tip[0], this.$element[0]) :
			this.options.placement
			
			inside = /in/.test(placement)
			
			$tip.setStyle({ top: 0, left: 0, display: 'block' })

			this.$element.insert({'after':$tip})
			
			pos = this.getPosition(inside)
			
			actualWidth = $tip.offsetWidth
			actualHeight = $tip.offsetHeight
			
			switch (inside ? placement.split(' ')[1] : placement) {
				case 'bottom':
					tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
				break
				case 'top':
					tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
				break
				case 'left':
					tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
				break
				case 'right':
					tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
				break
			}
			tp.top = tp.top+'px'
			tp.left = tp.left+'px'
			
			$tip
			.setStyle(tp)
			.addClassName(placement)
			.addClassName('in')
			
		}
	}
	
	, setContent: function () {
		var $tip = this.tip()
		, title = this.getTitle()
		if(!this.options.html){
			title = title.escapeHTML()
		}
		
		$tip.select('.tooltip-inner')[0].update(title)
		$tip.removeClassName('fade in top bottom left right')
	}
	
	, hide: function () {
		var that = this
		, $tip = this.tip()
		
		if(BootStrap.handleeffects == 'css' && this.$tip.hasClassName('fade')){
			var timeout = setTimeout(function () {
				$tip.stopObserving(BootStrap.transitionendevent)
				$tip ? $tip.remove() : ''
			}, 500)
			
			$tip.observe(BootStrap.transitionendevent, function () {
				clearTimeout(timeout)
				$tip ? $tip.remove() : ''
				this.stopObserving(BootStrap.transitionendevent)
			})
			$tip.removeClassName('in')
		}else if(BootStrap.handleeffects == 'effect' && this.$tip.hasClassName('fade')){
			new Effect.Fade($tip,{duration:0.3,from:$tip.getOpacity()*1,afterFinish:function(){
				$tip.removeClassName('in')
				$tip.remove()
			}})
		} else {
			$tip.removeClassName('in')
			$tip.remove()
		}
		
		return this
	}
	
	, fixTitle: function () {
		var $e = this.$element
		if ($e.readAttribute('title') || typeof($e.readAttribute('data-original-title')) != 'string') {
			$e.writeAttribute('data-original-title', $e.readAttribute('title') || '').writeAttribute('title',null)
		}
	}
	
	, hasContent: function () {
		return this.getTitle()
	}
	
	, getPosition: function (inside) {
		var obj = {}
		if(inside){
			Object.extend(obj,{top:0,left:0})
		}else{
			Object.extend(obj,this.$element.cumulativeOffset())
		}
		return Object.extend(obj,{
			width: this.$element.offsetWidth
			, height: this.$element.offsetHeight
		})
	}
	
	, getTitle: function () {
		var title
		, $e = this.$element
		, o = this.options
		
		title = $e.readAttribute('data-original-title')
		|| (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
		
		return title
	}
	
	, tip: function () {
		return this.$tip = this.$tip || this.options.template
	}
	
	, validate: function () {
		if (!this.$element[0].parentNode) {
			this.hide()
			this.$element = null
			this.options = null
		}
	}
	, enable: function () {
		this.enabled = true
	}
	, disable: function () {
		this.enabled = false
	}
	, toggleEnabled: function () {
		this.enabled = !this.enabled
	}
	, toggle: function (e) {
		var self = $(e.currentTarget)[this.type](this._options).data(this.type)
		self[self.tip().hasClassName('in') ? 'hide' : 'show']()
	}
	, destroy: function () {
		this.hide().$element.stopObserving()
	}

});

document.observe('dom:loaded',function(){
	$$('.tooltip').each(function(el){
		new BootStrap.Tooltip(el);
	});
});