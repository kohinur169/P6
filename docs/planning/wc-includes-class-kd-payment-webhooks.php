<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * WooCommerce webhook registration and incoming platform webhook receiver.
 */
class KD_WC_Payment_Webhooks {

    private static $webhook_secret = '';

    public static function init() {
        self::$webhook_secret = self::get_webhook_secret();

        // Sync order when status changes in WooCommerce
        add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_order_status_changed' ), 10, 3 );

        // REST endpoint for platform to notify WooCommerce of payment updates
        add_action( 'rest_api_init', function () {
            register_rest_route( 'kd-wc/v1', '/webhook/payment-updated', array(
                'methods'             => 'POST',
                'callback'            => array( __CLASS__, 'receive_platform_webhook' ),
                'permission_callback' => '__return_true',
            ) );
        } );
    }

    /**
     * Get webhook secret from settings.
     */
    public static function get_webhook_secret() {
        $settings = KD_WC_Payment_Settings::get_settings();
        return $settings['webhook_secret'] ?? '';
    }

    /**
     * Register webhooks on WooCommerce side when store connects.
     * Called after successful platform store connection.
     */
    public static function register_store_webhooks( $platform_store_id ) {
        $api_url = KD_WC_Payment_Settings::get_settings()['api_url'] ?? '';
        if ( empty( $api_url ) ) {
            return;
        }

        $webhooks = array(
            array(
                'topic'          => 'order.created',
                'delivery_url'   => rtrim( $api_url, '/' ) . '/api/v1/webhooks/woocommerce/order/created',
                'secret'         => self::$webhook_secret,
            ),
            array(
                'topic'          => 'order.updated',
                'delivery_url'   => rtrim( $api_url, '/' ) . '/api/v1/webhooks/woocommerce/order/updated',
                'secret'         => self::$webhook_secret,
            ),
            array(
                'topic'          => 'order.deleted',
                'delivery_url'   => rtrim( $api_url, '/' ) . '/api/v1/webhooks/woocommerce/order/deleted',
                'secret'         => self::$webhook_secret,
            ),
        );

        foreach ( $webhooks as $wh ) {
            // Check if webhook already exists
            $existing = array_filter(
                wc_get_webhooks(),
                fn( $hook ) => $hook->get_delivery_url() === $wh['delivery_url']
            );

            if ( empty( $existing ) ) {
                $webhook = new WC_Webhook( array(
                    'topic'           => $wh['topic'],
                    'delivery_url'    => $wh['delivery_url'],
                    'secret'          => $wh['secret'],
                    'status'          => 'active',
                ) );
                $webhook->save();
            }
        }
    }

    /**
     * When WooCommerce order status changes, sync to platform.
     */
    public static function on_order_status_changed( $order_id, $from, $to ) {
        $settings = KD_WC_Payment_Settings::get_settings();
        if ( 'yes' !== ( $settings['enabled'] ?? 'no' ) ) {
            return;
        }

        $store_id = get_option( 'kd_wc_platform_store_id', '' );
        if ( empty( $store_id ) ) {
            return;
        }

        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        $api = new KD_WC_Payment_API(
            $settings['api_url'] ?? '',
            $settings['api_key'] ?? '',
            KD_WC_Payment_Settings::decrypt( $settings['secret_key'] ?? '' ),
            'yes' === ( $settings['test_mode'] ?? 'no' )
        );

        $api->sync_orders( $store_id, array(
            array(
                'external_order_id' => (string) $order_id,
                'customer_email'    => $order->get_billing_email(),
                'total_amount'      => $order->get_total(),
                'currency'          => $order->get_currency(),
                'status'            => $to,
                'order_date'        => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : gmdate( 'Y-m-d\TH:i:s\Z' ),
            ),
        ) );
    }

    /**
     * Receive webhook from KD Platform about payment status.
     * Validates signature and updates WooCommerce order.
     */
    public static function receive_platform_webhook( $request ) {
        $signature = $request->get_header( 'X-KD-Signature' );
        $body      = $request->get_body();

        if ( ! self::verify_signature( $body, $signature ?? '', self::$webhook_secret ) ) {
            return new WP_Error( 'invalid_signature', 'Invalid webhook signature', array( 'status' => 401 ) );
        }

        $data = $request->get_json_params();

        if ( empty( $data['external_order_id'] ) || empty( $data['status'] ) ) {
            return new WP_Error( 'invalid_payload', 'Missing external_order_id or status', array( 'status' => 400 ) );
        }

        $order = wc_get_order( (int) $data['external_order_id'] );
        if ( ! $order ) {
            return new WP_Error( 'order_not_found', 'Order not found', array( 'status' => 404 ) );
        }

        // Map platform status to WooCommerce status
        $wc_status = self::map_platform_status_to_wc( $data['status'] );
        if ( $wc_status ) {
            $order->update_status( $wc_status, __( 'Updated by KD Payment Platform webhook.', 'kd-woocommerce-payment' ) );
        }

        return array( 'received' => true );
    }

    /**
     * Verify HMAC-SHA256 signature.
     */
    private static function verify_signature( string $body, string $signature, string $secret ): bool {
        if ( empty( $signature ) || empty( $secret ) ) {
            return false;
        }
        $expected = hash_hmac( 'sha256', $body, $secret );
        return hash_equals( $expected, $signature );
    }

    /**
     * Map platform payment status to WooCommerce order status.
     */
    private static function map_platform_status_to_wc( string $status ): ?string {
        $map = array(
            'pending'  => 'pending',
            'paid'     => 'processing',
            'failed'   => 'failed',
            'refunded' => 'refunded',
            'voided'   => 'cancelled',
        );
        return $map[$status] ?? null;
    }
}
