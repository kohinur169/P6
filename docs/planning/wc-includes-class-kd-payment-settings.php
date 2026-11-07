<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Admin settings for KD Payment WooCommerce plugin.
 */
class KD_WC_Payment_Settings {

    public static function init() {
        add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
    }

    public static function register_settings() {
        register_setting( 'kd_wc_payment_group', 'kd_wc_settings', array( __CLASS__, 'sanitize' ) );
    }

    /**
     * Sanitize and encrypt secret fields before saving.
     */
    public static function sanitize( $input ) {
        $sanitized = array();

        $sanitized['enabled']             = isset( $input['enabled'] ) ? 'yes' : 'no';
        $sanitized['title']               = sanitize_text_field( $input['title'] ?? 'KD Payment' );
        $sanitized['description']         = sanitize_textarea_field( $input['description'] ?? '' );
        $sanitized['api_url']             = esc_url_raw( $input['api_url'] ?? '' );
        $sanitized['api_key']             = sanitize_text_field( $input['api_key'] ?? '' );
        $sanitized['webhook_secret']      = sanitize_text_field( $input['webhook_secret'] ?? '' );
        $sanitized['test_mode']           = isset( $input['test_mode'] ) ? 'yes' : 'no';

        // Secret key: only re-encrypt if a new value was provided
        if ( ! empty( $input['secret_key'] ) ) {
            $sanitized['secret_key'] = self::encrypt( $input['secret_key'] );
        } elseif ( ! empty( $input['secret_key_hidden'] ) ) {
            // Keep existing encrypted value
            $sanitized['secret_key'] = $input['secret_key_hidden'];
        } else {
            $sanitized['secret_key'] = '';
        }

        return $sanitized;
    }

    /**
     * Encrypt a value using AES-256-GCM.
     * Returns base64(iv + tag + ciphertext).
     */
    public static function encrypt( $plaintext ) {
        $key = hash( 'sha256', AUTH_SALT . 'KD_WC_ENCRYPTION', true ); // 32 bytes
        $iv  = openssl_random_pseudo_bytes( 12 );
        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        if ( $ciphertext === false ) {
            return '';
        }
        return base64_encode( $iv . $tag . $ciphertext );
    }

    /**
     * Decrypt a value previously encrypted with self::encrypt().
     */
    public static function decrypt( $ciphertext_base64 ) {
        if ( empty( $ciphertext_base64 ) ) {
            return '';
        }
        $key = hash( 'sha256', AUTH_SALT . 'KD_WC_ENCRYPTION', true );
        $data = base64_decode( $ciphertext_base64, true );
        if ( $data === false || strlen( $data ) < 29 ) {
            return '';
        }
        $iv         = substr( $data, 0, 12 );
        $tag        = substr( $data, 12, 16 );
        $ciphertext = substr( $data, 28 );
        return openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
    }

    /**
     * Get all settings.
     */
    public static function get_settings() {
        return get_option( 'kd_wc_settings', array() );
    }

    /**
     * Get masked secret key (last 4 chars only) for display.
     */
    public static function get_masked_secret() {
        $settings = self::get_settings();
        $decrypted = self::decrypt( $settings['secret_key'] ?? '' );
        if ( empty( $decrypted ) ) {
            return '';
        }
        $last4 = substr( $decrypted, -4 );
        return str_repeat( '*', max( 0, strlen( $decrypted ) - 4 ) ) . $last4;
    }
}
