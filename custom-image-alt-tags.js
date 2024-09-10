jQuery(document).ready(function ($) {
    // Retrieve data passed from PHP
    const { postTitle, siteName, postCategory, postType, seoTitle, firstSentence } = altTagsData;

    // Function to sanitize the image name
    function sanitizeImageName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    }

    // Select all images within the body of the document
    $('body img').each(function (index) {
        let altText = '';
        const imgName = sanitizeImageName($(this).attr('src').split('/').pop().split('.')[0]);

        switch (index % 6) {
            case 0:
                altText = postTitle || seoTitle || imgName; // Fallback if postTitle is unavailable
                break;
            case 1:
                altText = `${siteName} ${postCategory || postType || ''}`.trim();
                break;
            case 2:
                // Try to find the closest heading above the image
                let closestHeading = '';
                $(this).parents().each(function () {
                    const heading = $(this).find('h1, h2, h3, h4, h5, h6').last().text();
                    if (heading) {
                        closestHeading = heading;
                        return false; // Break the loop once a heading is found
                    }
                });
                altText = closestHeading || postTitle || seoTitle || imgName;
                break;
            case 3:
                altText = firstSentence || postTitle || seoTitle || imgName;
                break;
            case 4:
                altText = `${imgName} ${siteName} ${postCategory || postType || ''}`.trim();
                break;
            case 5:
                altText = `${imgName} ${postTitle || seoTitle || ''}`.trim();
                break;
            default:
                altText = imgName;
                break;
        }

        // Set the alt attribute of the image if it's not already set
        if (!$(this).attr('alt')) {
            $(this).attr('alt', altText);
        }
    });
});
