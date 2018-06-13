<?php if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
* Register our sidebars and widgetized areas.
*
*/
function bvdb_widgets_init() {

	register_sidebar( array(
		'name'          => 'Sidebar homepage / archief',
		'id'            => 'sidebar',
		'before_widget' => '<dl class="widget">',
		'after_widget'  => '</dl>',
		'before_title'  => '<dt>',
		'after_title'   => '</dt>',
	) );

	register_sidebar( array(
		'name'          => 'Sidebar enkele pagina',
		'id'            => 'sidebar-2',
		'before_widget' => '<dl class="widget">',
		'after_widget'  => '</dl>',
		'before_title'  => '<dt>',
		'after_title'   => '</dt>',
	) );

}
//add_action( 'widgets_init', 'bvdb_widgets_init' );

// Add image sizes
add_theme_support( 'post-thumbnails' );
add_image_size( 'banner', 1920, 640 );

// block WP enum scans
if (!is_admin()) {
	// default URL format
	if (preg_match('/author=([0-9]*)/i', $_SERVER['QUERY_STRING'])) die();
	add_filter('redirect_canonical', 'bvdb_check_enum', 10, 2);
}

function bvdb_check_enum($redirect, $request) {
	// permalink URL format
	if (preg_match('/\?author=([0-9]*)(\/*)/i', $request)) die();
	else return $redirect;
}

// Enqueue styles and scripts
function bvdb_enqueue(){

	// Requeue jQuery
	wp_deregister_script( 'jquery' );
	wp_enqueue_script( 'jquery', 'https://code.jquery.com/jquery-1.12.4.min.js', array(), '1.12.4', false );

	// Enqueue scripts
	wp_enqueue_script( 'bvdb_plugins', get_template_directory_uri() . '/prod/js/plugins.js', 'jquery', THEME_VERSION, true );
	wp_enqueue_script( 'bvdb_scripts', get_template_directory_uri() . '/prod/js/scripts.js', 'jquery', THEME_VERSION, true );

	// Enqueue styles
	//wp_enqueue_style( 'bvdb_fonts', 'https://use.typekit.net/eua6hjf.css', array(), THEME_VERSION );
	wp_enqueue_style( 'bvdb_styles', get_template_directory_uri() . '/prod/css/styles.css', array(), THEME_VERSION );

}
add_action( 'wp_enqueue_scripts', 'bvdb_enqueue' );

// Remove WordPress generator tag
function bvdb_remove_version() {
	return '';
}
add_filter('the_generator', 'bvdb_remove_version');