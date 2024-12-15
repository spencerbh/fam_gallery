/*
   Multiverse by HTML5 UP
   html5up.net | @ajlkn
   Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
console.log('Script loaded');

// Modify the getSignedUrl function to log more details
// Add error logging to getSignedUrl
async function getSignedUrl(url) {
    console.log('Attempting to sign URL:', url);
    const workerUrl = 'https://c8132eab-image-signer.spencerbh.workers.dev/?url=' + encodeURIComponent(url);
    try {
        const response = await fetch(workerUrl);
        if (!response.ok) {
            console.error('Worker responded with:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response body:', text);
            return url;
        }
        const signedUrl = await response.text();
        console.log('Signed URL:', signedUrl);
        return signedUrl;
    } catch (error) {
        console.error('URL signing failed:', error);
        return url;
    }
}

// Function to sign all imagedelivery.net URLs on the page
async function signAllImageUrls() {
    // Define delay function within scope
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Sign image src attributes
    const imagesToSign = document.querySelectorAll('img[src*="imagedelivery.net"]');
    for (const img of imagesToSign) {
        try {
            const signedUrl = await getSignedUrl(img.src);
            img.src = signedUrl;
            await delay(100); // Add 100ms delay between requests
        } catch (error) {
            console.error('Error signing image URL:', error);
        }
    }

    // Sign anchor href attributes with image links
    const anchorsToSign = document.querySelectorAll('a.image[href*="imagedelivery.net"]');
    for (const anchor of anchorsToSign) {
        try {
            const signedUrl = await getSignedUrl(anchor.href);
            anchor.href = signedUrl;
            await delay(100); // Add 100ms delay between requests
        } catch (error) {
            console.error('Error signing anchor URL:', error);
        }
    }
}

// Enhanced image loading monitoring
(function() {
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        
        if (tagName.toLowerCase() === 'img') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = async function(name, value) {
                if (name === 'src' && value.includes('imagedelivery.net')) {
                    try {
                        const signedUrl = await getSignedUrl(value);
                        originalSetAttribute.call(this, name, signedUrl);
                    } catch (error) {
                        console.error('URL signing error:', error);
                        originalSetAttribute.call(this, name, value);
                    }
                } else {
                    originalSetAttribute.call(this, name, value);
                }
            };
        }
        
        return element;
    };

    const originalImage = window.Image;
    window.Image = class extends originalImage {
        constructor() {
            super();
            const originalDescriptor = Object.getOwnPropertyDescriptor(originalImage.prototype, 'src');
            const originalSet = originalDescriptor.set;

            Object.defineProperty(this, 'src', {
                configurable: true,
                enumerable: true,
                set: async function(url) {
                    if (url.includes('imagedelivery.net')) {
                        try {
                            const signedUrl = await getSignedUrl(url);
                            originalSet.call(this, signedUrl);
                        } catch (error) {
                            console.error('URL signing error:', error);
                            originalSet.call(this, url);
                        }
                    } else {
                        originalSet.call(this, url);
                    }
                }
            });
        }
    };
})();

// Main script initialization
(function($) {
 
    var	$window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper');
 
    // Breakpoints.
    breakpoints({
        xlarge:  [ '1281px',  '1680px' ],
        large:   [ '981px',   '1280px' ],
        medium:  [ '737px',   '980px'  ],
        small:   [ '481px',   '736px'  ],
        xsmall:  [ null,      '480px'  ]
    });
 
    // Hack: Enable IE workarounds.
    if (browser.name == 'ie')
        $body.addClass('ie');
 
    // Touch?
    if (browser.mobile)
        $body.addClass('touch');
 
    // Transitions supported?
    if (browser.canUse('transition')) {
 
        // Play initial animations on page load.
        $window.on('load', function() {
            window.setTimeout(function() {
                $body.removeClass('is-preload');
            }, 100);
        });
 
        // Prevent transitions/animations on resize.
        var resizeTimeout;
 
        $window.on('resize', function() {
 
            window.clearTimeout(resizeTimeout);
 
            $body.addClass('is-resizing');
 
            resizeTimeout = window.setTimeout(function() {
                $body.removeClass('is-resizing');
            }, 100);
 
        });
 
    }
 
    // Scroll back to top.
    $window.scrollTop(0);
 
    // Panels.
    var $panels = $('.panel');
 
    $panels.each(function() {
 
        var $this = $(this),
            $toggles = $('[href="#' + $this.attr('id') + '"]'),
            $closer = $('<div class="closer" />').appendTo($this);
 
        // Closer.
        $closer
            .on('click', function(event) {
                $this.trigger('---hide');
            });
 
        // Events.
        $this
            .on('click', function(event) {
                event.stopPropagation();
            })
            .on('---toggle', function() {
 
                if ($this.hasClass('active'))
                    $this.triggerHandler('---hide');
                else
                    $this.triggerHandler('---show');
 
            })
            .on('---show', function() {
 
                // Hide other content.
                if ($body.hasClass('content-active'))
                    $panels.trigger('---hide');
 
                // Activate content, toggles.
                $this.addClass('active');
                $toggles.addClass('active');
 
                // Activate body.
                $body.addClass('content-active');
 
            })
            .on('---hide', function() {
 
                // Deactivate content, toggles.
                $this.removeClass('active');
                $toggles.removeClass('active');
 
                // Deactivate body.
                $body.removeClass('content-active');
 
            });
 
        // Toggles.
        $toggles
            .removeAttr('href')
            .css('cursor', 'pointer')
            .on('click', function(event) {
 
                event.preventDefault();
                event.stopPropagation();
 
                $this.trigger('---toggle');
 
            });
 
    });
 
    // Global events.
    $body
        .on('click', function(event) {
 
            if ($body.hasClass('content-active')) {
 
                event.preventDefault();
                event.stopPropagation();
 
                $panels.trigger('---hide');
 
            }
 
        });
 
    $window
        .on('keyup', function(event) {
 
            if (event.keyCode == 27
            &&	$body.hasClass('content-active')) {
 
                event.preventDefault();
                event.stopPropagation();
 
                $panels.trigger('---hide');
 
            }
 
        });
 
    // Header.
    var $header = $('#header');
 
    // Links.
    $header.find('a').each(function() {
 
        var $this = $(this),
            href = $this.attr('href');
 
        // Internal link? Skip.
        if (!href
        ||	href.charAt(0) == '#')
            return;
 
        // Redirect on click.
        $this
            .removeAttr('href')
            .css('cursor', 'pointer')
            .on('click', function(event) {
 
                event.preventDefault();
                event.stopPropagation();
 
                window.location.href = href;
 
            });
 
    });
 
    // Footer.
    var $footer = $('#footer');
 
    // Copyright.
    // This basically just moves the copyright line to the end of the *last* sibling of its current parent
    // when the "medium" breakpoint activates, and moves it back when it deactivates.
    $footer.find('.copyright').each(function() {
 
        var $this = $(this),
            $parent = $this.parent(),
            $lastParent = $parent.parent().children().last();
 
        breakpoints.on('<=medium', function() {
            $this.appendTo($lastParent);
        });
 
        breakpoints.on('>medium', function() {
            $this.appendTo($parent);
        });
 
    });
 
    // Main.
    var $main = $('#main');
 
    // Sign all image URLs when DOM is ready
    $(document).ready(signAllImageUrls);
 
    // Enhanced poptrox initialization with URL signing
    async function initializeSignedUrls() {
        const articles = $main.children('.thumb');
        for (const article of articles) {
            const $link = $(article).find('a');
            const $img = $(article).find('img');
            
            const originalFullImageUrl = $link.attr('href');
            const originalThumbnailUrl = $img.attr('src');
            
            try {
                const signedFullUrl = originalFullImageUrl.includes('imagedelivery.net') 
                    ? await getSignedUrl(originalFullImageUrl) 
                    : originalFullImageUrl;
                
                const signedThumbUrl = originalThumbnailUrl.includes('imagedelivery.net') 
                    ? await getSignedUrl(originalThumbnailUrl) 
                    : originalThumbnailUrl;
                
                $link.attr('href', signedFullUrl);
                $img.attr('src', signedThumbUrl);
                
                const $image = $(article).find('.image');
                if ($image.length > 0) {
                    $image.css('background-image', 'url(' + signedThumbUrl + ')');
                    if ($img.data('position')) {
                        $image.css('background-position', $img.data('position'));
                    }
                    $img.hide();
                }
            } catch (error) {
                console.error('Error signing URLs:', error);
            }
        }
    }
 
    // Initialize poptrox after signing URLs
    initializeSignedUrls().then(() => {
        $main.poptrox({
            baseZIndex: 20000,
            caption: function($a) {
                var s = '';
                $a.nextAll().each(function() {
                    s += this.outerHTML;
                });
                return s;
            },
            fadeSpeed: 300,
            onPopupClose: function() { $body.removeClass('modal-active'); },
            onPopupOpen: function() { $body.addClass('modal-active'); },
            overlayOpacity: 0,
            popupCloserText: '',
            popupHeight: 150,
            popupLoaderText: '',
            popupSpeed: 300,
            popupWidth: 150,
            selector: '.thumb > a.image',
            usepopupCaption: true,
            usePopupCloser: true,
            usePopupDefaultStyling: false,
            usePopupForceClose: true,
            usePopupLoader: true,
            usePopupNav: true,
            windowMargin: 50
        });
 
        // Hack: Set margins to 0 when 'xsmall' activates.
        breakpoints.on('<=xsmall', function() {
            $main[0]._poptrox.windowMargin = 0;
        });
 
        breakpoints.on('>xsmall', function() {
            $main[0]._poptrox.windowMargin = 50;
        });
    });
 
})(jQuery);