<?php
/**
 * Plugin Name: KD Payment for WooCommerce
 * Plugin URI: https://kdplatform.example/
 * Description: Connect WooCommerce to KD Payment Platform. Accept payments, sync orders, receive webhooks.
 * Version: 1.0.0
 * Author: KD SOLUTION IT
 * Text Domain: kd-woocommerce-payment
 * Requires Plugins: woocommerce
 * Requires PHP: 8.1
 * Requires at least: 6.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

define( 'KD_WC_VERSION', '1.0.0' );
define( 'KD_WC_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'KD_WC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include classes
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-settings.php';
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-api.php';
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-gateway.php';
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-webhooks.php';

/**
 * Initialize plugin.
 */
function kd_wc_payment_init() {

    // Require WooCommerce
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="error"><p>' . esc_html__( 'KD Payment for WooCommerce requires WooCommerce to be installed and active.', 'kd-woocommerce-payment' ) . '</p></div>';
        } );
        return;
    }

    // Register settings
    KD_WC_Payment_Settings::init();

    // Register payment gateway
    add_filter( 'woocommerce_payment_gateways', function ( $gateways ) {
        $gateways[] = 'KD_WC_Payment_Gateway';
        return $gateways;
    } );

    // Register webhooks
    KD_WC_Payment_Webhooks::init();

    // Activation / uninstall hooks
    register_activation_hook( __FILE__, 'kd_wc_payment_activate' );
    register_uninstall_hook( __FILE__, 'kd_wc_payment_uninstall' );
}
add_action( 'plugins_loaded', 'kd_wc_payment_init' );

/**
 * Activation hook.
 */
function kd_wc_payment_activate() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        wp_die( esc_html__( 'KD Payment requires WooCommerce.', 'kd-woocommerce-payment' ) );
    }

    // Ensure default options exist
    $defaults = array(
        'enabled'             => 'no',
        'title'               => 'KD Payment',
        'description'         => '',
        'api_url'             => '',
        'api_key'             => '',
        'secret_key'          => '',
        'secret_key_hidden'   => '',
        'webhook_secret'      => '',
        'test_mode'           => 'no',
        'platform_store_id'   => '',
    );
    $existing = get_option( 'kd_wc_settings', array() );
    $merged   = array_merge( $defaults, $existing );
    update_option( 'kd_wc_settings', $merged );
}

/**
 * Uninstall hook.
 */
function kd_wc_payment_uninstall() {
    if ( ! current_user_can( 'activate_plugins' ) ) {
        return;
    }
    delete_option( 'kd_wc_settings' );
    delete_option( 'kd_wc_platform_store_id' );
}
