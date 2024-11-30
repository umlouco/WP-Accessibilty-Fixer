jQuery(document).ready(function ($) {
    //give names for multiple headers and footers
    $('a').each(function (index) {
        if ($(this).html().trim() == "") {
            $(this).remove();
        }


    });


    // Ensure altTagsData is defined
    if (typeof altTagsData === 'undefined') {
        var altTagsData = {
            postTitle: '',
            seoTitle: '',
            siteName: '',
            firstSentence: '',
            postCategory: '',
            postType: ''
        };
    }

    // Process images that are already in the DOM
    $('.type-post img, .single:not(.single-journal) img, .libri img').each(function (index) {
        processPostImage(this, index);
    });
    // Process images that are already in the DOM
    $('.type-page img, .page img, .single.single-journal img').each(function (index) {
        processImage(this, index);
    });

    // Observe the DOM for new images (e.g., lazy-loaded images)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                $(mutation.addedNodes).each(function () {
                    if ($(this).is('img')) {
                        processImage(this);
                    } else {
                        $(this).find('img').each(function () {
                            processImage(this);
                        });
                    }
                });
            }
        });
    });

    // Start observing the body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
    $('.carousel-prev').each(function () {
        $(this).append('<span class="sr-only">Carousel Previous</span>');
    })
    $('.carousel-next').each(function () {
        $(this).append('<span class="sr-only">Carousel Next</span>');
    })
    
    // Process empty links as before

    $('a.nv-search').each(function () {
        $(this).attr('aria-label', 'Search Button')
        $(this).find("svg").attr('aria-label', 'Search Button Icon')
    })

    $('a').not(".carousel-prev", ".carousel-next", ".nv-search").each(function () {
        var link = $(this);
        var textContent = link.text().trim();
        var hasTextContent = textContent !== '';
        var hasAriaLabel = link.attr('aria-label') && link.attr('aria-label').trim() !== '';
        var hasAriaLabelledBy = link.attr('aria-labelledby') && $('#' + link.attr('aria-labelledby')).length > 0;
        var hasTitle = link.attr('title') && link.attr('title').trim() !== '';

        if (!hasTextContent && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
            // Generate an accessible name
            var label = 'Link';

            if (link.attr('aria-haspopup') === 'true') {
                label = 'Menu';
            } else if (link.attr('target') === '_blank') {
                label = 'External Link';
            } else {
                var href = link.attr('href');
                if (href) {
                    try {
                        var url = new URL(href, window.location.origin);
                        if (url.searchParams && url.searchParams.has('page')) {
                            label = url.searchParams.get('page').replace(/[-_]/g, ' ').trim() || label;
                        } else if (url.pathname) {
                            var pathname = url.pathname;
                            var parts = pathname.split('/');
                            var lastPart = parts[parts.length - 1];
                            label = decodeURIComponent(lastPart).replace(/[-_]/g, ' ').trim() || label;
                        }
                    } catch (e) {
                        // Invalid URL, keep default label
                    }
                }
            }
            // Capitalize the label
            label = label.charAt(0).toUpperCase() + label.slice(1);
            // Add the accessible name
            if (label != "Link" && label != "") {
                link.attr('aria-label', label);
                link.append('<span class="sr-only">' + label + '</span>');
            } else {
                const closestHeading = getClosestHeading(link);
                if (closestHeading != "")
                    if ($(link).children('img').attr('alt') != closestHeading)
                        link.append('<span class="sr-only">' + closestHeading + '</span>');
                    else
                        link.append('<span class="sr-only">Link</span>');
            }

        }
    });


    // 4. Add figcaption to figure elements without figcaption
    $('figure').each(function () {
        var figure = $(this);
        if (figure.find('figcaption').length === 0) {
            var img = figure.find('img');
            var captionText = img.attr('alt') || 'Figure';
            figure.append('<figcaption  class="sr-only">' + captionText + '</figcaption>');
        }
    });

    // 5. Warn users about links that open in new window
    $('a[target="_blank"]').each(function () {
        var link = $(this);
        // Add an aria-label or notify user
        var linkText = link.text();
        link.attr('aria-label', linkText + ' (opens in a new window)');
        // Optionally, add visually hidden text
        link.append('<span class="sr-only"> (opens in a new window)</span>');
    });

    // 7. Assign unique labels to complementary landmarks
    var complementaryCount = 0;
    $('[role="complementary"]').each(function () {
        complementaryCount++;
        $(this).attr('aria-label', 'Complementary Section ' + complementaryCount);
    });
    //give names for multiple headers and footers
    $('header:not(:first)').each(function (index) {
        var header = $(this);
        header.attr('aria-label', 'Section ' + (index + 1) + ' header')

    });
    $('footer:not(:last)').each(function (index) {
        var footer = $(this);
        footer.attr('aria-label', 'Section ' + (index + 1) + ' footer')

    });
    //search button
    $('.search-form button').append('<span class="sr-only">Search</span>');
    $('.search-form button').attr('aria-label', 'Search');
    //scroll to top
    $('.scrollToTop.button').append('<span class="sr-only">Scroll to top</span>');

    //fix owl slider buttons
    var owl_interval = setInterval(function () {
        if ($('.owl-prev[role="presentation"]').length || $('.owl-next[role="presentation"]').length || $('.owl-dot[role="button"]').length) {
            $('.owl-prev').each(function () {
                $(this).removeAttr("role")
                $(this).attr('aria-label', 'Carousel Previous');
            })
            $('.owl-next').each(function () {
                $(this).removeAttr("role")
                $(this).attr('aria-label', 'Carousel Next');
            })
            $('.owl-dot').each(function () {
                $(this).removeAttr("role")
                $(this).attr('aria-label', 'Carousel Dot');
            })
        } else {
            if (owl_interval) {
                clearInterval(owl_interval);
                owl_interval = 0;
            }
        }
    }, 500)

    // fix bootstrap select
    var bootstrap_select_interval = setInterval(function () {
        if ($('button[aria-owns*="bs-select-"]').length) {
            $('button[aria-owns*="bs-select-"]').each(function () {
                var aria_owns = $(this).attr("aria-owns");
                $(this).removeAttr("aria-owns");

                $(this).attr('aria-controls', aria_owns);
            })
        } else {
            if (bootstrap_select_interval) {
                clearInterval(bootstrap_select_interval);
                bootstrap_select_interval = 0;
            }
        }
    }, 500)

    //fix toolset view search
    $('input[name="wpv_post_search"]').attr('id', 'wpv_post_search');

    //fix toolset view pagination
    $('.js-wpv-page-selector').attr('aria-label', 'Page Selector');
    
    /*Fix h tag order
    var previous_h_order = 6;
    for (var i = 2; i <= 6; i++) {
        previous_h_order = i;
        do {
            previous_h_order--;
        }
        while (previous_h_order >= 1 && $('h' + previous_h_order).length == 0)
        console.log(previous_h_order);
        if (previous_h_order != (i - 1))
            $('h' + i).each(function () {
                var el = $(this)[0];
                el.outerHTML = '<h' + (previous_h_order) + '>' + el.innerHTML + '</h' + (previous_h_order) + '>';
            })
    }
    */


    //Make form elements navigation work with tab key
    $('form :input:visible, #termes_conditions').each(function () {
        $(this).attr('tabindex', '0');
    });
    //functions
    // Helper function to validate and return non-empty strings or a fallback
    function getValidText(...texts) {
        for (const text of texts) {
            if (text && text.trim() !== '') {
                return text.trim();
            }
        }
        return null;
    }

    // Function to get the closest heading above an image
    function getClosestHeading(img) {

        let closestHeading = '';

        $(img).parents().each(function () {
            var heading_element = $(this).find('h1, h2, h3, h4, h5, h6').first()
            var heading = heading_element.text().trim();
            if (heading && !parentsCheckClass(heading_element, "sidebar")) {
                closestHeading = heading;
                return false; // Break the loop once a heading is found
            }

        });
        return closestHeading || null;
    }
    function getClosestLink(img) {

        let closestLink = '';

        $(img).parents().each(function () {
            var link_element = $(this).find('a').first()
            var link = link_element.text().trim();
            if (link) {
                closestLink = link;
                return false; // Break the loop once a heading is found
            }

        });
        return closestLink || null;
    }
    function getClosestLinkText(element) {
        let closestLinkText = '';
        $(element).parent().find('a').each(function () {
            if (this != element) {
                var link_text = $(this).text().trim();
                if (link_text) {
                    closestLinkText = link_text;
                    return false; // Break the loop once a link is found
                }
            }
        })
        return closestLinkText || null;
    }

    function parentsCheckClass(element, class_name) {
        var has_class = false;
        element.parents().each(function () {
            if ($(this).hasClass(class_name)) {
                has_class = true;
                return false;// Break the loop
            }
        });
        return has_class;
    }
    // Function to sanitize image name
    function getSanitizedImageName(img) {
        const src = $(img).attr('src');
        if (!src) {
            return 'Image';
        }
        let imgName = src.split('/').pop().replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, ' ').trim();

        // Trim imgName to 30 characters if it's longer
        if (imgName.length > 30) {
            imgName = imgName.substring(0, 30).trim();
        }

        return imgName || 'Image'; // Default to "Image" if imgName is empty
    }

    let imageIndex = 0; // Global counter for images processed


    // Function to process post images and set its alt attribute
    function processPostImage(img, index) {
        if (typeof index === 'undefined') {
            index = imageIndex++;
        }

        // Check if the current alt attribute is valid and not empty
        const currentAlt = $(img).attr('alt');
        if (currentAlt && currentAlt.trim() !== '') {
            const closestLink = getClosestLink(img);
            if (currentAlt.trim() == closestLink)
                $(img).attr('alt', '');
            return; // Skip this image since it already has a valid alt attribute
        }

        let altText = '';
        const closestHeading = getClosestHeading(img);
        const imgName = getSanitizedImageName(img);

        // Sequence of alt text options
        switch (index % 7) {
            case 0:
                // 1st image - Closest article heading
                altText = getValidText(closestHeading, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, imgName);
                break;
            case 1:
                // 2nd image - Article title
                altText = getValidText(altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, imgName);
                break;
            case 2:
                // 3rd image - Site name
                altText = getValidText(altTagsData.siteName, altTagsData.postTitle, altTagsData.seoTitle, imgName);
                break;
            case 3:
                // 4th image - First sentence of the post
                altText = getValidText(altTagsData.firstSentence, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, imgName);
                break;
            case 4:
                // 5th image - Site category/post type
                altText = getValidText(`${altTagsData.postCategory} ${altTagsData.postType}`.trim(), altTagsData.siteName, altTagsData.postTitle, altTagsData.seoTitle, imgName);
                break;
            case 5:
                // 6th image - SEO title if available
                altText = getValidText(altTagsData.seoTitle, altTagsData.postTitle, altTagsData.siteName, imgName);
                break;
            case 6:
                // 7th image - Closest heading with a variant (closest heading + article title)
                altText = getValidText(`${closestHeading} ${altTagsData.postTitle}`.trim(), altTagsData.seoTitle, altTagsData.siteName, imgName);
                break;
            default:
                // Fallback option
                if (closestHeading != "")
                    altText = getValidText(closestHeading, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, 'Image');
                else
                    altText = getValidText(imgName, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, 'Image');
                break;
        }

        // Set the alt attribute of the image if it's not already set or is empty
        const closestLink = getClosestLink(img);
        if (!$(img).attr('alt') || $(img).attr('alt').trim() === '' || altText == closestLink) {
            if (!altText || altText.trim() === '') {
                altText = 'Image';
            }
            if (altText == closestLink)
                $(img).attr('alt', '');
            else $(img).attr('alt', altText);
        }
    }
    // Function to process an image and set its alt attribute
    function processImage(img, index) {
        if (typeof index === 'undefined') {
            index = imageIndex++;
        }

        // Check if the current alt attribute is valid and not empty
        const currentAlt = $(img).attr('alt');
        if (currentAlt && currentAlt.trim() !== '') {
            const closestLink = getClosestLink(img);
            if (currentAlt.trim() == closestLink)
                $(img).attr('alt', '');
            return; // Skip this image since it already has a valid alt attribute
        }

        let altText = '';
        const closestHeading = getClosestHeading(img);
        const imgName = getSanitizedImageName(img);

        if (closestHeading != "")
            altText = getValidText(closestHeading, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, 'Image');
        else
            altText = getValidText(imgName, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, 'Image');

        // Set the alt attribute of the image if it's not already set or is empty
        const closestLink = getClosestLink(img);
        if (!$(img).attr('alt') || $(img).attr('alt').trim() === '' || altText == closestLink) {
            if (!altText || altText.trim() === '') {
                altText = 'Image';
            }
            if (altText == closestLink)
                $(img).attr('alt', '');
            else $(img).attr('alt', altText);
        }
    }
});



