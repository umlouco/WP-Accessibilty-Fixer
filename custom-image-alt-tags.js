jQuery(document).ready(function ($) {
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
    console.log('this text');
    console.log(altTagsData);

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
            const heading = $(this).find('h1, h2, h3, h4, h5, h6').last().text().trim();
            if (heading) {
                closestHeading = heading;
                return false; // Break the loop once a heading is found
            }
        });
        return closestHeading || null;
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

    // Function to process an image and set its alt attribute
    function processImage(img, index) {
        if (typeof index === 'undefined') {
            index = imageIndex++;
        }

        // Check if the current alt attribute is valid and not empty
        const currentAlt = $(img).attr('alt');
        if (currentAlt && currentAlt.trim() !== '') {
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
                altText = getValidText(imgName, altTagsData.postTitle, altTagsData.seoTitle, altTagsData.siteName, 'Image');
                break;
        }

        // Set the alt attribute of the image if it's not already set or is empty
        if (!$(img).attr('alt') || $(img).attr('alt').trim() === '') {
            if (!altText || altText.trim() === '') {
                altText = 'Image';
            }
            $(img).attr('alt', altText);
        }
    }

    // Process images that are already in the DOM
    $('body img').each(function (index) {
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

    // Process empty links as before
    $('a').each(function () {
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
            link.attr('aria-label', label);
        }
    });


    // 4. Add figcaption to figure elements without figcaption
    $('figure').each(function () {
        var figure = $(this);
        if (figure.find('figcaption').length === 0) {
            var img = figure.find('img');
            var captionText = img.attr('alt') || 'Figure';
            figure.append('<figcaption>' + captionText + '</figcaption>');
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


});