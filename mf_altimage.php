<?php
/*
Plugin Name: Custom Image Alt Tags
Description: Automatically populates image alt tags in posts based on specified rules.
Version: 1.0
Author: Mario Flores
*/
function custom_enqueue_image_alt_script()
{

    wp_enqueue_script('custom-image-alt-tags', plugin_dir_url(__FILE__) . 'custom-image-alt-tags.js', array('jquery'), null, true);

    // Pass necessary data to the JavaScript file
    $site_name = get_bloginfo('name');

    wp_localize_script('custom-image-alt-tags', 'altTagsData', array(
        'postTitle'      => get_the_title() ?: $site_name,
        'siteName'       => $site_name,
        'postCategory'   => (!empty(get_the_category()) && !empty(get_the_category()[0]->name)) ? get_the_category()[0]->name : $site_name,
        'postType'       => get_post_type() ?: $site_name,
        'seoTitle'       => get_post_meta(get_the_ID(), '_yoast_wpseo_title', true) ?: $site_name,
        'firstSentence'  => get_first_sentence_of_post() ?: $site_name,
    ));
}

add_action('wp_enqueue_scripts', 'custom_enqueue_image_alt_script');
add_action('admin_enqueue_scripts', 'custom_enqueue_image_alt_script');
// Function to get the first sentence of the post
function get_first_sentence_of_post()
{
    global $post;
    $sentences = preg_split('/(\.|\?|!)(\s)/', wp_strip_all_tags($post->post_content), -1, PREG_SPLIT_DELIM_CAPTURE);
    return !empty($sentences) ? trim($sentences[0] . ($sentences[1] ?? '')) : '';
}
