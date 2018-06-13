<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// Get the theme settings
$active_theme = wp_get_theme();
define( 'THEME_NAMESPACE', $active_theme->get('TextDomain') );
define( 'THEME_VERSION', $active_theme->get('Version') );

// Theme includes
require_once( 'inc/_auto-update.php' );
require_once( 'inc/_wp-backend.php' );
require_once( 'inc/_wp-posttypes.php' );
require_once( 'inc/_wp-functions.php' );