# WooCommerce Plugin Implementation Plan — KD SOLUTION IT

**Repository:** Separate coding repository (not P6). Example name: `kd-woocommerce-payment`  
**Planning Source:** P6 (`docs/planning/WOOCOMMERCE_PLUGIN_PLAN.md`)  
**Language:** English only (code, comments, strings, documentation)  
**Target Platform:** WordPress + WooCommerce  
**Integration Target:** KD Payment Platform API  
**Owner:** Payment Integrations team (Adapter STEP ownership rule: one plugin per provider)

---

## 1. Objective

Build a WooCommerce payment gateway plugin that allows a merchant to connect their WooCommerce store to the KD Payment Platform. Once connected:

- Merchants can accept payments through KD Platform on their WooCommerce checkout.
- Orders created/paid/updated in WooCommerce sync to the KD Platform.
- Webhooks from WooCommerce are received, verified with shared secret, and forwarded to the platform.
- The merchant can manage the connection from the WooCommerce admin settings page.
- No card data (PAN, expiry, CVV) ever touches the KD Platform server; use hosted fields or redirect to KD Platform payment page.

---

## 2. High-Level Architecture

```
WooCommerce Store (WordPress)
     |
     | Plugin Settings / Connect
     v
WooCommerce Plugin (PHP)  <-- Separate Repo
     | (Platform API Client)
     | HTTPS JSON
     v
KD Payment Platform API          <-- Separate Repo / Main Platform
     | (PostgreSQL, RLS, AES-256-GCM)
     v
KD Platform Database
```

---

## 3. Plugin Repository Structure (Suggested)

```
kd-woocommerce-payment/
├── kd-woocommerce-payment.php     # Main plugin file
├── uninstall.php                  # Cleanup on uninstall
├── README.md
├── composer.json                  # Optional, for PHP dependencies
├── package.json                   # Optional, for asset build
├── .env.example                   # NOT committed to WordPress; used for local dev only
├── includes/
│   ├── class-kd-payment-gateway.php   # WC_Payment_Gateway extension
│   ├── class-kd-payment-api.php       # KD Platform API client
│   ├── class-kd-payment-webhooks.php  # Webhook receiver + registration
│   └── class-kd-payment-settings.php  # Admin settings page
├── admin/
│   ├── settings.php                 # Settings form HTML
│   └── assets/
│       └── admin.css
├── public/
│   ├── partials/
│   │   └── checkout-payment.php     # Checkout payment fields
│   └── assets/
│       └── checkout.css
├── languages/
│   └── kd-woocommerce-payment.pot   # English only
└── tests/
    └── class-kd-payment-api.test.php
```

> **Note:** WordPress plugins do not typically use `.env` for production. Settings are saved in WordPress `wp_options` table. For local development only, a `.env.example` can be provided. All secrets in production must be entered through the WooCommerce admin settings page and stored encrypted in the database.

---

## 4. Tech Stack (Recommended)

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Language | PHP | 8.1+ |
| Framework | WordPress Plugin | WC_Payment_Gateway |
| E-commerce | WooCommerce | 8.0+ |
| HTTP Client | WordPress `wp_remote_post` / Guzzle | Built-in or composer |
| Encryption | `openssl_encrypt` / `openssl_decrypt` | AES-256-GCM |
| Validation | Custom + WordPress sanitization | `sanitize_text_field`, `esc_url_raw` |
| Testing | PHPUnit | Unit + integration |
| Linting | PHPCS | WordPress coding standards |

---

## 5. Main Plugin File (`kd-woocommerce-payment.php`)

```php
<?php
/**
 * Plugin Name: KD Payment for WooCommerce
 * Plugin URI: https://kdplatform.example/
 * Description: Connect WooCommerce to KD Payment Platform.
 * Version: 1.0.0
 * Author: KD SOLUTION IT
 * Text Domain: kd-woocommerce-payment
 * Requires Plugins: woocommerce
 * Requires PHP: 8.1
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'KD_WC_VERSION', '1.0.0' );
define( 'KD_WC_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'KD_WC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-gateway.php';
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-api.php';
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-webhooks.php';
require_once KD_WC_PLUGIN_PATH . 'includes/class-kd-payment-settings.php';

function kd_wc_payment_init() {
    // Register settings
    KD_WC_Payment_Settings::init();

    // Register payment gateway
    add_filter( 'woocommerce_payment_gateways', function ( $gateways ) {
        $gateways[] = 'KD_WC_Payment_Gateway';
        return $gateways;
    } );

    // Register webhook endpoints
    KD_WC_Payment_Webhooks::init();

    // Activation hook
    register_activation_hook( __FILE__, 'kd_wc_payment_activate' );
    register_uninstall_hook( __FILE__, 'kd_wc_payment_uninstall' );
}
add_action( 'plugins_loaded', 'kd_wc_payment_init' );

function kd_wc_payment_activate() {
    // Ensure WooCommerce is active
    if ( ! class_exists( 'WooCommerce' ) ) {
        wp_die( 'KD Payment requires WooCommerce.' );
    }
    // Optionally create custom tables or options
}

function kd_wc_payment_uninstall() {
    delete_option( 'kd_wc_settings' );
}
```

---

## 6. Admin Settings Class (`includes/class-kd-payment-settings.php`)

Settings page: WooCommerce → Settings → Payments → KD Payment

Fields:
- **Enable/Disable** (checkbox)
- **Title** (text, default: "KD Payment")
- **Description** (textarea)
- **Platform API URL** (url, required)
- **Platform API Key** (text, required)
- **Platform Secret Key** (password, required, stored encrypted)
- **Webhook Secret** (password, required)
- **Test Mode** (checkbox)

```php
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class KD_WC_Payment_Settings {

    public static function init() {
        add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
        add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
    }

    public static function register_settings() {
        register_setting( 'kd_wc_payment_group', 'kd_wc_settings', array( __CLASS__, 'sanitize' ) );
    }

    public static function add_menu_page() {
        // Optional: separate top-level menu for KD settings
    }

    public static function sanitize( $input ) {
        $sanitized = array();
        $sanitized['enabled'] = isset( $input['enabled'] ) ? 'yes' : 'no';
        $sanitized['title'] = sanitize_text_field( $input['title'] ?? 'KD Payment' );
        $sanitized['description'] = sanitize_textarea_field( $input['description'] ?? '' );
        $sanitized['api_url'] = esc_url_raw( $input['api_url'] ?? '' );
        $sanitized['api_key'] = sanitize_text_field( $input['api_key'] ?? '' );
        // Secret key: only sanitize if changed; do not log
        if ( ! empty( $input['secret_key'] ) ) {
            $sanitized['secret_key'] = self::encrypt( $input['secret_key'] );
        } elseif ( ! empty( $input['secret_key_hidden'] ) ) {
            $sanitized['secret_key'] = $input['secret_key_hidden'];
        }
        $sanitized['webhook_secret'] = sanitize_text_field( $input['webhook_secret'] ?? '' );
        $sanitized['test_mode'] = isset( $input['test_mode'] ) ? 'yes' : 'no';
        return $sanitized;
    }

    public static function encrypt( $value ) {
        $key = hash( 'sha256', AUTH_SALT, true ); // Use WordPress salt or custom constant
        $iv = openssl_random_pseudo_bytes( 12 );
        $ciphertext = openssl_encrypt( $value, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );
        return base64_encode( $iv . $tag . $ciphertext );
    }

    public static function decrypt( $value ) {
        $key = hash( 'sha256', AUTH_SALT, true );
        $data = base64_decode( $value );
        $iv = substr( $data, 0, 12 );
        $tag = substr( $data, 12, 16 );
        $ciphertext = substr( $data, 28 );
        return openssl_decrypt( $ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );
    }

    public static function get_settings() {
        return get_option( 'kd_wc_settings', array() );
    }
}
```

---

## 7. Payment Gateway Class (`includes/class-kd-payment-gateway.php`)

Extends `WC_Payment_Gateway`.

```php
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class KD_WC_Payment_Gateway extends WC_Payment_Gateway {

    public function __construct() {
        $this->id                 = 'kd_payment';
        $this->icon               = false;
        $this->has_fields         = false; // We redirect or use hosted fields
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

        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
        add_action( 'woocommerce_api_kd_wc_payment_webhook', array( KD_WC_Payment_Webhooks::class, 'receive' ) );
    }

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
            ),
            'api_key' => array(
                'title'       => __( 'Platform API Key', 'kd-woocommerce-payment' ),
                'type'        => 'text',
                'description' => __( 'API key from KD Platform dashboard.', 'kd-woocommerce-payment' ),
                'required'    => true,
            ),
            'secret_key' => array(
                'title'       => __( 'Platform Secret Key', 'kd-woocommerce-payment' ),
                'type'        => 'password',
                'description' => __( 'Secret key for signing requests.', 'kd-woocommerce-payment' ),
                'required'    => true,
            ),
            'secret_key_hidden' => array(
                'type' => 'hidden',
            ),
            'webhook_secret' => array(
                'title'       => __( 'Webhook Secret', 'kd-woocommerce-payment' ),
                'type'        => 'text',
                'description' => __( 'Shared secret for webhook verification.', 'kd-woocommerce-payment' ),
                'required'    => true,
            ),
            'test_mode' => array(
                'title'       => __( 'Test Mode', 'kd-woocommerce-payment' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable sandbox/test mode', 'kd-woocommerce-payment' ),
                'default'     => 'no',
            ),
        );
    }

    public function payment_fields() {
        // If using hosted fields, enqueue JS and render container
        // If redirecting, show description and proceed button
        echo '<p>' . esc_html( $this->description ) . '</p>';
    }

    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );

        // Call KD Platform to create payment intent
        $api = new KD_WC_Payment_API(
            $this->api_url,
            $this->api_key,
            $this->secret_key,
            $this->test_mode
        );

        $response = $api->createPayment( array(
            'orderId'   => $order_id,
            'amount'    => $order->get_total(),
            'currency'  => $order->get_currency(),
            'customerEmail' => $order->get_billing_email(),
            'returnUrl' => $this->get_return_url( $order ),
        ) );

        if ( is_wp_error( $response ) ) {
            wc_add_notice( $response->get_error_message(), 'error' );
            return array( 'result' => 'failure', 'redirect' => $this->get_return_url( $order ) );
        }

        // Mark order as pending payment
        $order->update_status( 'pending', __( 'Awaiting KD Payment payment.', 'kd-woocommerce-payment' ) );

        // Reduce stock
        WC_Helper::reduce_order_stock( $order );

        return array(
            'result'   => 'success',
            'redirect' => $response['paymentUrl'], // Redirect to KD Platform hosted payment page
        );
    }

    public function get_return_url( $order ) {
        return $order->get_checkout_order_received_url();
    }
}
```

---

## 8. Platform API Client (`includes/class-kd-payment-api.php`)

```php
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class KD_WC_Payment_API {

    private $base_url;
    private $api_key;
    private $secret_key;
    private $test_mode;

    public function __construct( $base_url, $api_key, $secret_key, $test_mode = false ) {
        $this->base_url   = rtrim( $base_url, '/' );
        $this->api_key    = $api_key;
        $this->secret_key = $secret_key;
        $this->test_mode  = $test_mode;
    }

    public function createPayment( array $data ) {
        $body = wp_json_encode( array_merge( $data, array(
            'provider' => 'woocommerce',
            'testMode' => $this->test_mode,
        ) ) );

        $response = wp_remote_post(
            $this->base_url . '/api/v1/payments',
            array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'X-KD-Signature' => $this->sign( $body ),
                ),
                'body'    => $body,
                'timeout' => 30,
            )
        );

        return $this->handleResponse( $response );
    }

    public function connectStore( array $data ) {
        $body = wp_json_encode( $data );
        $response = wp_remote_post(
            $this->base_url . '/api/v1/stores/connect',
            array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'X-KD-Signature' => $this->sign( $body ),
                ),
                'body'    => $body,
                'timeout' => 30,
            )
        );
        return $this->handleResponse( $response );
    }

    public function syncOrder( $storeId, array $orderData ) {
        $body = wp_json_encode( $orderData );
        $response = wp_remote_post(
            $this->base_url . '/api/v1/stores/' . $storeId . '/sync',
            array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'X-KD-Signature' => $this->sign( $body ),
                ),
                'body'    => $body,
                'timeout' => 30,
            )
        );
        return $this->handleResponse( $response );
    }

    private function sign( string $payload ): string {
        return hash_hmac( 'sha256', $payload, $this->secret_key );
    }

    private function handleResponse( $response ) {
        if ( is_wp_error( $response ) ) {
            return $response;
        }
        $code = wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( $code >= 200 && $code < 300 ) {
            return $body;
        }
        return new WP_Error( 'platform_api_error', $body['error'] ?? 'Unknown platform error', array( 'status' => $code ) );
    }
}
```

---

## 9. Webhooks Class (`includes/class-kd-payment-webhooks.php`)

WooCommerce sends webhooks to the KD Platform. This class registers WooCommerce webhooks and can also receive platform callbacks if needed.

```php
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class KD_WC_Payment_Webhooks {

    private static $webhook_secret = '';

    public static function init() {
        self::$webhook_secret = self::get_webhook_secret();

        // Register webhooks when plugin activated or settings saved
        add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_order_status_changed' ), 10, 3 );

        // Custom endpoint for platform to notify WooCommerce (optional)
        add_action( 'rest_api_init', function () {
            register_rest_route( 'kd-wc/v1', '/webhook/order-updated', array(
                'methods'  => 'POST',
                'callback' => array( __CLASS__, 'receive_platform_webhook' ),
                'permission_callback' => '__return_true',
            ) );
        } );
    }

    public static function get_webhook_secret() {
        $settings = KD_WC_Payment_Settings::get_settings();
        return $settings['webhook_secret'] ?? '';
    }

    public static function register_webhooks( $store_id ) {
        $webhooks = array(
            array(
                'topic'     => 'order.created',
                'delivery_url' => self::get_platform_webhook_url( 'order/created' ),
                'secret'    => self::$webhook_secret,
            ),
            array(
                'topic'     => 'order.updated',
                'delivery_url' => self::get_platform_webhook_url( 'order/updated' ),
                'secret'    => self::$webhook_secret,
            ),
            array(
                'topic'     => 'order.deleted',
                'delivery_url' => self::get_platform_webhook_url( 'order/deleted' ),
                'secret'    => self::$webhook_secret,
            ),
        );

        foreach ( $webhooks as $wh ) {
            // Use WooCommerce's webhook registration or custom CPT
            // Example: wc()->webhook_registry() or custom implementation
            $webhook = new WC_Webhook( array(
                'topic'           => $wh['topic'],
                'delivery_url'    => $wh['delivery_url'],
                'secret'          => $wh['secret'],
                'status'          => 'active',
            ) );
            $webhook->save();
        }
    }

    public static function get_platform_webhook_url( $topic ) {
        $settings = KD_WC_Payment_Settings::get_settings();
        $base = rtrim( $settings['api_url'] ?? '', '/' );
        return $base . '/api/v1/webhooks/woocommerce/' . $topic;
    }

    public static function on_order_status_changed( $order_id, $from, $to ) {
        if ( 'yes' !== ( KD_WC_Payment_Settings::get_settings()['enabled'] ?? 'no' ) ) {
            return;
        }
        $order = wc_get_order( $order_id );
        if ( ! $order ) return;

        $api = new KD_WC_Payment_API(
            KD_WC_Payment_Settings::get_settings()['api_url'] ?? '',
            KD_WC_Payment_Settings::get_settings()['api_key'] ?? '',
            KD_WC_Payment_Settings::decrypt( KD_WC_Payment_Settings::get_settings()['secret_key'] ?? '' ),
            'yes' === ( KD_WC_Payment_Settings::get_settings()['test_mode'] ?? 'no' )
        );

        $storeId = self::get_connected_store_id(); // Implement lookup from options
        if ( ! $storeId ) return;

        $api->syncOrder( $storeId, array(
            'externalOrderId' => $order_id,
            'customerEmail'   => $order->get_billing_email(),
            'totalAmount'     => $order->get_total(),
            'currency'        => $order->get_currency(),
            'status'          => $to,
        ) );
    }

    private static function get_connected_store_id() {
        // Retrieve stored platform store ID from options after connect
        return get_option( 'kd_wc_platform_store_id' );
    }

    public static function receive_platform_webhook( $request ) {
        // Verify signature from platform
        $signature = $request->get_header( 'X-KD-Signature' );
        $body = $request->get_body();
        if ( ! hash_equals( hash_hmac( 'sha256', $body, self::$webhook_secret ), $signature ?? '' ) ) {
            return new WP_Error( 'invalid_signature', 'Invalid webhook signature', array( 'status' => 401 ) );
        }
        $data = $request->get_json_params();
        // Update order status based on platform notification
        if ( isset( $data['orderId'], $data['status'] ) ) {
            $order = wc_get_order( $data['orderId'] );
            if ( $order ) {
                $order->update_status( sanitize_text_field( $data['status'] ), __( 'Updated by KD Platform.', 'kd-woocommerce-payment' ) );
            }
        }
        return array( 'received' => true );
    }
}
```

---

## 10. Checkout Integration (`public/partials/checkout-payment.php`)

If using hosted fields instead of redirect:

```php
<?php
if ( ! defined( 'ABSPATH' ) ) exit;
// Render KD Platform hosted payment iframe or redirect notice
?>
<div id="kd-payment-container"></div>
<script src="https://js.kdplatform.example/kd-payment.js"></script>
<script>
  KD.payment.init({
    container: '#kd-payment-container',
    publicKey: '<?php echo esc_attr( $this->api_key ); ?>',
    orderId: '<?php echo esc_attr( $order_id ); ?>',
    amount: '<?php echo esc_attr( $order->get_total() ); ?>',
    currency: 'USD',
  });
</script>
```

> **Card data rule:** Never render `<input>` fields for card number, expiry, or CVV in this plugin. Use KD Platform's hosted payment page redirect or iframe.

---

## 11. Security Requirements

| Requirement | Implementation |
|-------------|--------------|
| Secret key storage | AES-256-GCM encrypted in `wp_options`; decrypted only at runtime |
| Webhook verification | HMAC-SHA256 with shared `webhook_secret` |
| API signing | `X-KD-Signature` header on every platform request |
| SQL injection | Use `$wpdb->prepare()` or WC API methods |
| XSS | `esc_html()`, `esc_url_raw()`, `sanitize_text_field()` on all output/input |
| CSRF | WordPress nonces on admin settings |
| Card data | Never collect PAN/CVV in plugin PHP or JS |
| RLS / Tenant | Platform side enforces `company_id`; plugin sends `storeId` |
| Masked display | Secret key shown masked after save |

---

## 12. Testing Requirements

### Unit Tests (`tests/class-kd-payment-api.test.php`)
- `createPayment()` returns success on 200
- `createPayment()` returns `WP_Error` on 4xx/5xx
- `sign()` produces correct HMAC
- `encrypt()`/`decrypt()` roundtrip

### Integration Tests
- Plugin activates without fatal error when WooCommerce active
- Settings page saves and retrieves options
- `process_payment()` redirects to KD Platform URL
- Webhook signature verification rejects tampered body
- Duplicate webhook/order sync is idempotent

### Definition of Done (DoD)
- [ ] PHP CodeSniffer (WordPress standards) passes
- [ ] PHPUnit tests pass
- [ ] Plugin activates and deactivates cleanly
- [ ] Checkout shows "KD Payment" gateway
- [ ] Redirect to KD Platform payment page works in sandbox
- [ ] WooCommerce order status updates when platform webhook received
- [ ] Secret key stored encrypted; plaintext never in `debug.log`
- [ ] `.env.example` committed with placeholders only (if local dev uses it)
- [ ] Handoff file `docs/handoffs/WOOCOMMERCE_PLUGIN_COMPLETED.md` created with sandbox test evidence

---

## 13. Dependencies on Platform STEPs

| Platform STEP | Purpose |
|---------------|---------|
| Store Connection API STEP | `POST /api/v1/stores/connect`, `GET /api/v1/stores`, `POST /api/v1/stores/:id/sync` |
| Platform Webhook STEP | `POST /api/v1/webhooks/woocommerce/*` receivers |
| Database Migration STEP | Platform-side `stores`, `store_orders`, `store_sync_logs` tables |
| RLS / Auth STEP | API key authentication and `company_id` isolation |

> Do not begin WooCommerce plugin coding until Platform STEPs above are complete and the API contract is published.

---

## 14. Deployment Checklist

1. Install WooCommerce on WordPress site
2. Upload `kd-woocommerce-payment` plugin to `/wp-content/plugins/`
3. Activate plugin
4. Go to WooCommerce → Settings → Payments → KD Payment
5. Enter Platform API URL, API Key, Secret Key, Webhook Secret
6. Enable Test Mode for sandbox testing
7. Click "Connect Store" to register with platform
8. Place test order; verify order appears in KD Platform dashboard
9. Switch to production keys; disable Test Mode
10. HTTPS enforced on WordPress site

---

**End of Plan.**  
An AI agent can use this document to generate the complete WooCommerce plugin codebase without contacting the platform team for clarification.