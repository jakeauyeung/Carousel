/*
     * jQuery Carousel plugin
     *
     * 图片滚动插件
     *
     * 参数：
     * 参数1  autoplay: true 是否开启自动播放功能 {true | false}
     * 参数2  autoplaySpeed: 3000 自动播放速度 {int}
     * 参数3  Points: true 是否开启记数状态游标 {true | false}
     * 参数4  arrows: true 是否开启翻页箭头  {true | false}
     * 参数5  reroll: true 是否开启循环播放  {true | false}
     * 参数6  speed: 300  // 播放速度 {int}
     * 参数7  maction: 'mouseover' // 选择鼠标行为方式 {'click' | 'mouseover'}
     * 测试代码在../../html/demo.marquee.html
     * 使用方法：
     * `$(element).carousel({autoplay: true, autoplaySpeed: 3000, Points: true, speed: 500});`
     */
     
// 全局定义

$.b5m = $.b5m || {};
// 绑定函数器
var b5mBinder = function(fn, me) {
    return function () {
        return fn.apply(me, arguments);
    };
};
$.b5m.carousel = function(element,options) {
    var base = this;
    var defaults = { // 定义默认值
            autoplay: false, // 是否开启自动播放功能 {true | false}
            autoplaySpeed: 3000, // 自动播放速度 {int}
            Points: false, // 是否开启记数状态游标 {true | false}
            arrows: true, // 是否开启翻页箭头  {true | false}
            reroll: true, // 是否开启循环播放  {true | false}
            speed: 300, // 播放速度 {int}
            maction: 'mouseover' // 选择鼠标行为方式 {'click' | 'mouseover'}
        };
        base.animType = null;
        base.autoPlayTimer = null;
        base.currentSlide = 0;
        base.currentLeft = null;
        base.direction = 1;
        base.Points = null;
        base.loadIndex = 0;
        base.nextArrow = null;
        base.prevArrow = null;
        base.slideCount = null;
        base.sliderWidth = null;
        base.slideTrack = null;
        base.slides = null;
        base.sliding = false;
        base.slideOffset = 0;
        base.slider = $(element);
        base.swipeLeft = null;
        base.list = null;
        base.touchObject = {};
        base.transformsEnabled = false;
        base.options = $.extend({}, defaults, options);
        base.changeSlide = b5mBinder(base.changeSlide, this);
        base.setPosition = b5mBinder(base.setPosition, this);
        base.autoPlayIterator = b5mBinder(base.autoPlayIterator, this);

        base.init = function() {

            if (!$(base.slider).hasClass('sliderInitialized')) {
                $(base.slider).addClass('sliderInitialized');
                base.setValues();
                base.buildOut();
                base.getAnimType();
                base.setPosition();
                base.intializeEvents();
                base.startLoad();
            }
        };

        base.getAnimType = function() {
        if (document.body.style.MozTransform !== undefined) {
            base.animType = 'MozTransform';
        } else if (document.body.style.webkitTransform !== undefined) {
            base.animType = "webkitTransform";
        } else if (document.body.style.msTransform !== undefined) {
            base.animType = "msTransform";
        }
        if (base.animType !== null) {
            base.transformsEnabled = true;
        }
    };

    base.autoPlay = function() { 
        if(base.currentSlide != base.slideCount){
        if(!!base.autoPlayTimer){  //fix
            base.autoPlayTimer = clearInterval(base.autoPlayTimer);
        }
        base.autoPlayTimer = setInterval(base.autoPlayIterator, base.options.autoplaySpeed);
        }

    };

    base.autoPlayIterator = function() {
        if (base.options.reroll === false) {
            if (base.direction === 1) {
                if ((base.currentSlide + 1) === base.slideCount - 1) {
                    base.direction = 0;
                }
                base.slideHandler(base.currentSlide + 1);
            } else {
                if ((base.currentSlide - 1 === 0)) {
                    base.direction = 1;
                }
                base.slideHandler(base.currentSlide - 1);
            }
        } else {
            base.slideHandler(base.currentSlide + 1);
        }

    };

    base.startLoad = function() {
        base.list.find('img').css('opacity', 0);
        if (base.options.arrows === true) {
            base.prevArrow.hide();
            base.nextArrow.hide();
        }
        if (base.options.Points === true) {
            base.Points.hide();
        }
        base.slider.addClass('bt-loading');
    };

    base.checkLoad = function() {
        var self = this, totalImages = null;
        if (base.options.reroll === true) {
            totalImages = self.slideCount + 2;
        } else {
            totalImages = self.slideCount;
        }
        if (self.loadIndex === totalImages) {
            self.list.find('img').animate({ opacity: 1 }, base.options.speed, function() {
                self.setPosition();
            });
            if (self.options.arrows === true) {
                self.prevArrow.show();
                self.nextArrow.show();
            }

            if (self.options.Points === true) {
                self.Points.show();
            }
            self.slider.removeClass('bt-loading');
            if (self.options.autoplay === true) {
                self.autoPlay();
            }
        }
    };

    base.stopLoad = function() {
        base.loadIndex += 1;
        base.checkLoad();
    };

    base.setValues = function() {
        base.list = base.slider.find('ul:first').addClass('bt-list');
        base.sliderWidth = base.list.width();
        base.slides = $('li:not(.cloned)', base.list).addClass('slide');
        base.slideCount = base.slides.length;
    };

    base.buildOut = function() {
        var i;
        base.slider.addClass("bt-slider");
        base.slideTrack = base.slides.wrapAll('<div class="bt-track"/>').parent();

        if (base.options.arrows === true) {
            base.prevArrow = $('<a href="javascript:void(0)">上一页</a>').appendTo(base.slider).addClass('bt-prev');
            base.nextArrow = $('<a href="javascript:void(0)">下一页</a>').appendTo(base.slider).addClass('bt-next');
            if (base.options.reroll !== true) {
                base.prevArrow.addClass('disabled');
            }
        }

        if (base.options.Points === true) {
            base.Points = $('<ul class="bt-dots"></ul>').appendTo(base.slider);
            for (i = 1; i <= base.slideCount; i += 1) {
                $('<li><a href="javascript:void(0)">' + i + '</a></li>').appendTo(base.Points);
            }
            base.Points.find('li').first().addClass('active');
        }

        if (base.options.reroll === true) {
            base.slides.first().clone().appendTo(base.slideTrack).addClass('cloned');
            base.slides.last().clone().prependTo(base.slideTrack).addClass('cloned');
        }

    };

    base.setDimensions = function() {
        base.list.find('li').width(base.sliderWidth);
        base.slideTrack.width(base.sliderWidth * base.slider.find('li').length);
    };

    base.setPosition = function() {
        var animProps = {}, targetLeft = ((base.currentSlide * base.sliderWidth) * -1) + base.slideOffset;
        base.setValues();
        base.setDimensions();
        if (base.options.reroll === true) {
            base.slideOffset = base.sliderWidth * -1;
        }
        if (base.transformsEnabled === false) {
            base.slideTrack.css('left', targetLeft);
        } else {
            animProps[base.animType] = "translate(" + targetLeft + "px, 0px)";
            base.slideTrack.css(animProps);
        }
    };

    base.intializeEvents = function() {
        var self = this;
        if (base.options.arrows === true) {
            base.prevArrow.on('click', {message: 'previous'}, base.changeSlide);
            base.nextArrow.on('click', {message: 'next'}, base.changeSlide);
        }
        if (base.options.Points === true) {
            $('li a', base.Points).on(base.options.maction, {message: 'index'}, base.changeSlide);
        }
        $(window).on('resize', base.setPosition);
        base.list.find('img').load(function() { self.stopLoad(); });
    };

    base.changeSlide = function(event) {
        switch (event.data.message) {
        case 'previous':
            base.slideHandler(base.currentSlide - 1);
            break;
        case 'next':
            base.slideHandler(base.currentSlide + 1);
            break;
        case 'index':
            base.slideHandler($(event.target).parent().index());
            break;
        default:
            return false;
        }
    };

    base.updatePoints = function() {
        base.Points.find('li').removeClass('active');
        $(base.Points.find('li').get(base.currentSlide)).addClass('active');

    };

    base.slideHandler = function(index) {
        var animProps = {}, targetSlide, slideLeft, targetLeft = null, self = this;
        targetSlide = index;
        targetLeft = ((targetSlide * base.sliderWidth) * -1) + base.slideOffset;
        slideLeft = ((base.currentSlide * base.sliderWidth) * -1) + base.slideOffset;
        if (self.options.autoplay === true) {
            clearInterval(base.autoPlayTimer);
        }
        if (base.swipeLeft === null) {
            base.currentLeft = slideLeft;
        } else {
            base.currentLeft = base.swipeLeft;
        }
        if (targetSlide < 0) {
            if (base.options.reroll === true) {
                if (base.transformsEnabled === false) {
                    base.slideTrack.animate({
                        left: targetLeft
                    }, self.options.speed, function() {
                        self.currentSlide = self.slideCount - 1;
                        self.setPosition();
                        if (self.options.Points) {
                            self.updatePoints();
                        }
                        if (self.options.autoplay === true) {
                            self.autoPlay();
                        }
                    });
                } else {
                    $({animStart: base.currentLeft}).animate({
                        animStart: targetLeft
                    }, {
                        duration:  self.options.speed,
                        step: function(now) {
                            animProps[self.animType] = "translate(" + now + "px, 0px)";
                            self.slideTrack.css(animProps);
                        },
                        complete: function() {
                            self.currentSlide = self.slideCount - 1;
                            self.setPosition();
                            if (self.swipeLeft !== null) {
                                self.swipeLeft = null;
                            }
                            if (self.options.Points) {
                                self.updatePoints();
                            }
                            if (self.options.autoplay === true) {
                                self.autoPlay();
                            }
                        }
                    });
                }
            } else {
                return false;
            }
        } else if (targetSlide > (base.slideCount - 1)) {
            if (base.options.reroll === true) {
                if (base.transformsEnabled === false) {
                    base.slideTrack.animate({
                        left: targetLeft
                    }, self.options.speed, function() {
                        self.currentSlide = 0;
                        self.setPosition();
                        if (self.options.Points) {
                            self.updatePoints();
                        }
                        if (self.options.autoplay === true) {
                            self.autoPlay();
                        }
                    });
                } else {
                    $({animStart: base.currentLeft}).animate({
                        animStart: targetLeft
                    }, {
                        duration:  self.options.speed,
                        step: function(now) {
                            animProps[self.animType] = "translate(" + now + "px, 0px)";
                            self.slideTrack.css(animProps);
                        },
                        complete: function() {
                            self.currentSlide = 0;
                            self.setPosition();
                            if (self.swipeLeft !== null) {
                                self.swipeLeft = null;
                            }
                            if (self.options.Points) {
                                self.updatePoints();
                            }
                            if (self.options.autoplay === true) {
                                self.autoPlay();
                            }
                        }
                    });
                }
            } else {
                return false;
            }
        } else {
            if (base.transformsEnabled === false) {
                base.slideTrack.animate({
                    left: targetLeft
                }, self.options.speed, function() {
                    self.currentSlide = targetSlide;
                    if (self.options.Points) {
                        self.updatePoints();
                    }
                    if (self.options.autoplay === true) {
                        self.autoPlay();
                    }
                    if (self.options.arrows === true && self.options.reroll !== true) {
                        if (self.currentSlide === 0) {
                            self.prevArrow.addClass('disabled');
                        } else if (self.currentSlide === self.slideCount - 1) {
                            self.nextArrow.addClass('disabled');
                        } else {
                            self.prevArrow.removeClass('disabled');
                            self.nextArrow.removeClass('disabled');
                        }
                    }
                });
            } else {
                $({animStart: base.currentLeft}).animate({
                    animStart: targetLeft
                }, {
                    duration:  self.options.speed,
                    step: function(now) {
                        animProps[self.animType] = "translate(" + now + "px, 0px)";
                        self.slideTrack.css(animProps);
                    },
                    complete: function() {
                        self.currentSlide = targetSlide;
                        if (self.swipeLeft !== null) {
                            self.swipeLeft = null;
                        }
                        if (self.options.Points) {
                            self.updatePoints();
                        }
                        if (self.options.autoplay === true) {
                            self.autoPlay();
                        }
                        if (self.options.arrows === true && self.options.reroll !== true) {
                            if (self.currentSlide === 0) {
                                self.prevArrow.addClass('disabled');
                            } else if (self.currentSlide === self.slideCount - 1) {
                                self.nextArrow.addClass('disabled');
                            } else {
                                self.prevArrow.removeClass('disabled');
                                self.nextArrow.removeClass('disabled');
                            }
                        }
                    }
                });
            }
        }
    };
    return this;
};

$.fn.b5mCarousel = function (options) {
    var carousels = [];
    return this.each(function (index) {
        carousels[index] = $.b5m.carousel(this,options).init();
    });
};
