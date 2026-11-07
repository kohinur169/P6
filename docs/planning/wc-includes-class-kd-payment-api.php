<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * KD Platform API client for WooCommerce plugin.
 * All requests are signed with HMAC-SHA256 using the platform secret key.
 */
class KD_WC_Payment_API {

    private $base_url;
    private $api_key;
    private $secret_key;
    private $test_mode;

    public function __construct( $base_url, $api_key, $secret_key, $test_mode = false ) {
        $this->base_url   = rtrim( $base_url, '/' );
        $this->api_key    = $api_key;
        $this->secret_key = $secret_key;
        $this->test_mode  = (bool) $test_mode;
    }

    /**
     * Connect store to platform.
     */
    public function connect_store( array $data ) {
        return $this->request( 'POST', '/api/v1/stores/connect', $data );
    }

    /**
     * List stores.
     */
    public function list_stores() {
        return $this->request( 'GET', '/api/v1/stores' );
    }

    /**
     * Get single store.
     */
    public function get_store( $store_id ) {
        return $this->request( 'GET', '/api/v1/stores/' . rawurlencode( $store_id ) );
    }

    /**
     * Disconnect store.
     */
    public function disconnect_store( $store_id ) {
        return $this->request( 'DELETE', '/api/v1/stores/' . rawurlencode( $store_id ) );
    }

    /**
     * Sync orders to platform.
     */
    public function sync_orders( $store_id, array $orders ) {
        return $this->request( 'POST', '/api/v1/stores/' . rawurlencode( $store_id ) . '/sync', array( 'orders' => $orders ) );
    }

    /**
     * Create payment.
     */
    public function create_payment( array $data ) {
        return $this->request( 'POST', '/api/v1/payments', $data );
    }

    /**
     * Get payment status.
     */
    public function get_payment( $payment_id ) {
        return $this->request( 'GET', '/api/v1/payments/' . rawurlencode( $payment_id ) );
    }

    /**
     * Generic request method with HMAC signing.
     */
    private function request( $method, $path, array $body = null ) {
        $url = $this->base_url . $path;

        $headers = array(
            'Authorization' => 'Bearer ' . $this->api_key,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        );

        $raw_body = null;
        if ( $body !== null ) {
            $raw_body = wp_json_encode( $body );
            $headers['X-KD-Signature'] = $this->sign( $raw_body );
        }

        $response = wp_remote_request( $url, array(
            'method'  => $method,
            'headers' => $headers,
            'body'    => $raw_body,
            'timeout' => 30,
            'redirection' => 5,
        ) );

        return $this->parse_response( $response );
    }

    /**
     * Sign payload with HMAC-SHA256.
     */
    private function sign( string $payload ): string {
        return hash_hmac( 'sha256', $payload, $this->secret_key );
    }

    /**
     * Parse WP HTTP response into structured array or WP_Error.
     */
    private function parse_response( $response ) {
        if ( is_wp_error( $response ) ) {
            return new WP_Error(
                'platform_api_error',
                $response->get_error_message(),
                array( 'status' => 0 )
            );
        }

        $code    = wp_remote_retrieve_response_code( $response );
        $body    = wp_remote_retrieve_body( $response );
        $decoded = json_decode( $body, true );

        if ( $code >= 200 && $code < 300 ) {
            return $decoded ?: array( 'success' => true, 'data' => new stdClass() );
        }

        $error_message = $decoded['error']['message'] ?? 'Unknown platform error';
        $error_code    = $decoded['error']['code'] ?? 'platform_api_error';

        return new WP_Error(
            $error_code,
            $error_message,
            array( 'status' => $code, 'response' => $decoded )
        );
    }
}
