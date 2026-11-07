<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * KD Payment Gateway for WooCommerce.
 * Extends WC_Payment_Gateway.
 */
class KD_WC_Payment_Gateway extends WC_Payment_Gateway {

    public $api_url;
    public $api_key;
    public $secret_key;
    public $webhook_secret;
    public $test_mode;

    public function __construct() {
        $this->id                 = 'kd_payment';
        $this->icon               = false;
        $this->has_fields         = false; // We redirect to hosted payment page
        $this->method_title       = __( 'KD Payment', 'kd-woocommerce-payment' );
        $this->method_description = __( 'Pay through KD Payment Platform.', 'kd-woocommerce-payment' );

        $this->init_form_fields();
        $this->init_settings();

        $this->title        = $this->get_option( 'title' );
        $this->description  = $this->get_option( 'description' );
        $this->api_url      = $this->get_option( 'api_url' );
        $this->api_key      = $this->get_option( 'api_key' );
        $this->secret_key   = KD_WC_Payment_Settings::decrypt( $this->get_option( 'secret_key' ) );
        $this->webhook_secret = $this->get_option( 'webhook_secret' );
        $this->test_mode    = 'yes' === $this->get_option( 'test_mode' );

        // Save admin options
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    }

    /**
     * Define admin settings fields.
     */
    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title'   => __( 'Enable/Disable', 'kd-woocommerce-payment' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable KD Payment', 'kd-woocommerce-payment' ),
                'default' => 'no',
            ),
            'title' => array(
                'title'       => __( 'Title', 'kd-woocommerce-payment' ),
                'type'        => 'text',
                'description' => __( 'Payment title shown at checkout.', 'kd-woocommerce-payment' ),
                'default'     => 'KD Payment',
            ),
            'description' => array(
                'title'       => __( 'Description', 'kd-woocommerce-payment' ),
                'type'        => 'textarea',
                'description' => __( 'Description shown at checkout.', 'kd-woocommerce-payment' ),
            ),
            'api_url' => array(
                'title'       => __( 'Platform API URL', 'kd-woocommerce-payment' ),
                'type'        => 'url',
                'description' => __( 'Example: https://api.kdplatform.example', 'kd-woocommerce-payment' ),
                'required'    => true,
                'default'     => '',
            ),
            'api_key' => array(
                'title'       => __( 'Platform API Key', 'kd-woocommerce-payment' ),
                'type'        => 'text',
                'description' => __( 'API key from KD Platform dashboard.', 'kd-woocommerce-payment' ),
                'required'    => true,
                'default'     => '',
            ),
            'secret_key' => array(
                'title'       => __( 'Platform Secret Key', 'kd-woocommerce-payment' ),
                'type'        => 'password',
                'description' => __( 'Secret key for signing requests. Encrypted at rest.', 'kd-woocommerce-payment' ),
                'required'    => true,
                'default'     => '',
            ),
            'secret_key_hidden' => array(
                'type' => 'hidden',
                'default' => '',
            ),
            'webhook_secret' => array(
                'title'       => __( 'Webhook Secret', 'kd-woocommerce-payment' ),
                'type'        => 'text',
                'description' => __( 'Shared secret for webhook signature verification.', 'kd-woocommerce-payment' ),
                'required'    => true,
                'default'     => '',
            ),
            'test_mode' => array(
                'title'       => __( 'Test Mode', 'kd-woocommerce-payment' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable sandbox/test mode', 'kd-woocommerce-payment' ),
                'default'     => 'no',
            ),
        );
    }

    /**
     * Show payment fields on checkout.
     * We do NOT collect card data here. We redirect to KD Platform hosted page.
     */
    public function payment_fields() {
        if ( ! $this->api_url || ! $this->api_key ) {
            echo '<p>' . esc_html__( 'KD Payment is not configured. Please set Platform API URL and API Key in settings.', 'kd-woocommerce-payment' ) . '</p>';
            return;
        }
        echo '<p>' . wp_kses_post( $this->description ) . '</p>';
        echo '<p>' . esc_html__( 'You will be redirected to KD Payment Platform to complete your payment securely.', 'kd-woocommerce-payment' ) . '</p>';
    }

    /**
     * Process payment: create payment intent on KD Platform, then redirect.
     */
    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return array(
                'result'   => 'failure',
                'redirect' => $this->get_return_url( $order ),
            );
        }

        $api = new KD_WC_Payment_API(
            $this->api_url,
            $this->api_key,
            $this->secret_key,
            $this->test_mode
        );

        $response = $api->create_payment( array(
            'store_id'       => get_option( 'kd_wc_platform_store_id', '' ),
            'external_order_id' => (string) $order_id,
            'amount'         => $order->get_total(),
            'currency'       => $order->get_currency(),
            'customer_email' => $order->get_billing_email(),
            'return_url'     => $this->get_return_url( $order ),
            'cancel_url'     => $this->get_return_url( $order ),
            'test_mode'      => $this->test_mode,
            'idempotency_key' => 'wc_' . $order_id . '_' . uniqid( '', true ),
        ) );

        if ( is_wp_error( $response ) ) {
            wc_add_notice( sprintf( __( 'Payment could not be initiated: %s', 'kd-woocommerce-payment' ), $response->get_error_message() ), 'error' );
            return array(
                'result'   => 'failure',
                'redirect' => $this->get_return_url( $order ),
            );
        }

        // Mark order as pending payment
        $order->update_status( 'pending', __( 'Awaiting KD Payment.', 'kd-woocommerce-payment' ) );

        // Reduce stock
        WC_Helper::reduce_order_stock( $order );

        $payment_url = $response['data']['payment_url'] ?? $this->get_return_url( $order );

        return array(
            'result'   => 'success',
            'redirect' => $payment_url,
        );
    }

    public function get_return_url( $order ) {
        return $order->get_checkout_order_received_url();
    }

    /**
     * Display masked secret key in admin settings (read-only).
     */
    public function admin_options() {
        // Standard WooCommerce settings form is handled by process_admin_options hook.
        // This is included for completeness if a custom admin page is added later.
    }
}
