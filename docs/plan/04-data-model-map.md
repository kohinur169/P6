// path: docs/plan/04-data-model-map.md

# 04 - DATA MODEL MAP

Global column contract applies to every table: `id uuid` (UUID v7), `company_id`
(nullable only for platform tables), `created_at`, `updated_at`, `deleted_at`,
plus `version integer` on editable records. Every table has RLS default-deny,
an audit trigger, an index on `company_id` and `created_at`, and a partial unique
index that ignores soft-deleted rows.

Money: `numeric(18,4)`. Rates: `numeric(18,8)`. Percentages: `numeric(9,6)`.
Timestamps: `timestamptz` UTC.

## STEP 02 - Tenancy, audit, integrity primitives (0001 - 0099)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `companies` | Tenant root | legal_name, display_name, slug, country, base_currency, timezone, status, storage_mode, kyc_status |
| `users` | Platform identity mirror | auth_user_id, email_normalized, display_name, status, locale, last_login_at, security_stamp |
| `memberships` | User to company link | user_id, role, admin_staff_role, status, invited_by, joined_at |
| `staff_permissions` | Per-staff grants | membership_id, permission_key, granted_by, expires_at |
| `audit_logs` | Append-only audit | sequence_number, actor_user_id, action, resource_type, resource_id, ip, user_agent, device_id, metadata, previous_hash, current_hash, signature, correlation_id |
| `audit_anchors` | Daily integrity anchor | anchor_date, merkle_root, entry_count, storage_file_id, verified_at |
| `security_events` | Security timeline | event_type, severity, user_id, ip, device_id, decision, details |
| `idempotency_keys` | Mutation dedupe | key, scope, request_hash, response_snapshot, status, expires_at |
| `request_log` | Request trace | correlation_id, route, method, status, duration_ms, ip |
| `outbox_events` | Domain events | event_type, aggregate_type, aggregate_id, payload, status, published_at |
| `job_queue` | Durable jobs | job_type, payload, priority, run_at, attempts, locked_by, locked_at, status |
| `job_runs` | Job history | job_id, started_at, finished_at, outcome, error_code, duration_ms |
| `rate_limits` | Counter storage | bucket_key, window_start, counter, limit_value |
| `duplicate_fingerprints` | Dedupe registry | entity_type, fingerprint, entity_id, first_seen_at |
| `app_settings` | Platform settings | key, value, scope, is_secret |
| `feature_flags` | Flags | key, description, enabled, rollout, tenant_overrides |
| `tenant_security_policies` | Per-tenant policy | mfa_required, session_idle_minutes, session_max_hours, ip_allowlist, vpn_policy |
| `number_sequences` | Gapless counters | scope_type, scope_id, sequence_key, prefix, next_value, padding |
| `platform_admins` | Bootstrap platform authority | user_id, level, granted_by |

## STEP 03 - Identity and access (0100 - 0149)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `sessions` | Server-side session record | user_id, company_id, session_token_hash, device_id, device_secret_hash, user_agent_hash, ip_hash, auth_level, step_up_at, absolute_expiry, idle_expiry, rotation_counter, revoked_at, revocation_reason |
| `session_events` | Rotation and reuse trail | session_id, event_type, previous_token_hash, token_hash, reuse_detected, ip_hash |
| `devices` | Device registry | user_id, device_fingerprint, label, trusted_at, last_seen_at, risk_state |
| `login_attempts` | Failure counting | email_normalized, user_id, success, failure_reason, ip, vpn_flag, created_at |
| `account_locks` | Account lock state | user_id, locked_at, unlock_at, reason, failure_count, unlocked_by, unlocked_at, contact_verified |
| `auth_events` | Auth timeline | user_id, event_type, result, ip, user_agent, correlation_id |
| `mfa_factors` | TOTP factors | user_id, secret_encrypted, confirmed_at, recovery_codes_hash, last_used_at |
| `approval_requests` | Approval chain | entity_type, entity_id, action, requested_by, level, status, sla_due_at, escalated_at, decided_by, decision_note |
| `approval_steps` | Chain history | request_id, step_index, approver_role, approver_id, decision, decided_at |
| `approval_delegations` | Delegation | from_user_id, to_user_id, starts_at, ends_at, reason |
| `ip_intel_cache` | Network intel cache | ip_hash, country, asn, is_vpn, is_proxy, is_tor, is_datacenter, score, expires_at |
| `ip_blocklist` | Manual and automatic blocks | cidr, reason, expires_at, created_by |

## STEP 04 - Tenant lifecycle, plans, entitlements (0150 - 0199)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `onboarding_states` | Wizard state machine | company_id, step_key, status, completed_at, data_snapshot |
| `company_profiles` | Extended profile | company_id, legal_address, tax_id, industry, size, logo_file_id |
| `company_branding` | Visual identity | primary_color, secondary_color, accent_color, font_stack, email_footer, portal_mode |
| `company_domains` | Custom domain | domain, verification_token, verified_at, status, certificate_state |
| `team_invitations` | Invites | email, role, permissions_snapshot, token_hash, expires_at, accepted_at |
| `user_preferences` | Per-user settings | user_id, theme, dashboard_layout, notification_matrix, timezone_display |
| `plans` | Commercial plans | code, name, price_monthly, price_yearly, currency, features, limits |
| `plan_features` | Feature matrix | plan_id, feature_key, limit_value, unit |
| `subscriptions` | Tenant subscription | company_id, plan_id, status, current_period_start, current_period_end, trial_end, cancel_at |
| `coupons` | Discounts | code, type, value, max_redemptions, redeemed_count, valid_from, valid_to |
| `coupon_redemptions` | Usage | coupon_id, company_id, subscription_id, amount_applied |
| `entitlements` | Effective rights | company_id, feature_key, limit_value, source, expires_at |
| `usage_counters` | Consumption | company_id, metric_key, period_start, value |
| `notifications` | In-app notifications | user_id, type, title, body, entity_ref, read_at |
| `notification_preferences` | Channel matrix | user_id, event_type, in_app, email, whatsapp |
| `backup_requests` | One-click backup record | company_id, requested_by, scope, status, file_id, completed_at |

## STEP 05 - Communication (0200 - 0229)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `email_accounts` | Platform and tenant SMTP | company_id, provider, host, port, username, secret_encrypted, from_address, verified_at, is_default |
| `email_templates` | Template registry | key, company_id, subject, body_html, body_text, version, variables_schema |
| `email_messages` | Outbound queue and log | account_id, template_key, to_address, subject, status, attempts, provider_message_id, sent_at, error_code |
| `email_events` | Delivery events | message_id, event_type, occurred_at, payload |
| `suppression_list` | Bounce and complaint | email_normalized, reason, source, created_at |
| `email_rate_limits` | Sending caps | company_id, window_start, sent_count |

## STEP 06 - Storage and KYC (0230 - 0269)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `storage_connections` | Drive or other connection | company_id, provider, account_ref, root_folder_id, secret_encrypted, status, last_health_at |
| `files` | File registry | company_id, storage_provider, storage_key, mime_type, size_bytes, content_hash, encryption_key_version, uploaded_by, scan_status |
| `file_links` | Polymorphic attach | file_id, entity_type, entity_id, category, is_primary |
| `file_access_logs` | Download trail | file_id, user_id, ip, purpose, signed_url_expires_at |
| `kyc_submissions` | Verification case | company_id, submitted_by, status, submitted_at, reviewer_id, decision_at, decision_note |
| `kyc_documents` | Documents per case | submission_id, document_type, file_id, extracted_data, validity_status |
| `kyc_checks` | Automated checks | submission_id, check_type, result, provider_ref, details |
| `kyc_decisions` | Decision chain | submission_id, step, approver_id, decision, note |

## STEP 07 - CRM, catalog, inventory, suppliers, projects (0270 - 0329)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `clients` | Customers | company_id, display_name, legal_name, email_normalized, phone, tax_id, currency_display, status, merged_into |
| `client_contacts` | Contacts | client_id, name, email, phone, role |
| `client_addresses` | Addresses | client_id, type, line1, line2, city, state, postal_code, country |
| `client_tags` | Tags | client_id, tag |
| `client_notes` | Timeline notes | client_id, author_id, body |
| `products` | Catalog | company_id, sku, name, description, unit_price, tax_code, type, is_active |
| `price_books` | Pricing variants | company_id, name, currency, rules |
| `product_prices` | Price per book | product_id, price_book_id, amount |
| `warehouses` | Locations | company_id, name, address, is_default |
| `stock_levels` | On hand | product_id, warehouse_id, quantity, reserved_quantity, reorder_point |
| `stock_movements` | Ledger | product_id, warehouse_id, movement_type, quantity, unit_cost, reference_type, reference_id |
| `suppliers` | Vendors | company_id, name, email, payment_terms, currency |
| `purchase_orders` | POs | supplier_id, po_number, status, total, expected_at |
| `purchase_order_lines` | PO lines | purchase_order_id, product_id, quantity, unit_price, tax_amount |
| `supplier_bills` | Bills | supplier_id, bill_number, due_date, total, status |
| `supplier_payments` | Payments | supplier_id, bill_id, amount, paid_at, method_code |
| `projects` | Projects | client_id, name, status, budget, start_date, end_date |
| `project_tasks` | Tasks | project_id, title, assignee_id, status, estimate_hours |
| `time_entries` | Time tracking | project_id, task_id, user_id, started_at, duration_minutes, billable, hourly_rate, invoiced_document_id |
| `dashboard_layouts` | Widget layout | user_id, widgets, version |

## STEP 08 - Documents and invoicing (0330 - 0369)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `documents` | All billing documents | company_id, document_type, document_number, client_id, status, issue_date, due_date, currency, subtotal, discount_total, tax_total, total, amount_paid, balance_due, fx_rate, fx_snapshot, notes, terms, version, duplicate_hash |
| `document_lines` | Lines | document_id, line_no, product_id, description, quantity, unit_price, discount_type, discount_value, tax_code, tax_rate, line_subtotal, line_tax, line_total |
| `document_taxes` | Tax breakdown | document_id, tax_name, tax_rate, taxable_amount, tax_amount, jurisdiction_code |
| `document_snapshots` | Immutable issued copy | document_id, snapshot_hash, file_id, rendered_at, template_key |
| `document_events` | Status history | document_id, event_type, from_status, to_status, actor_id, occurred_at |
| `document_attachments` | Attachments | document_id, file_id, label |
| `recurring_schedules` | Recurrence | document_id, frequency, interval_count, next_run_at, end_date, auto_send |
| `instalment_plans` | Payment plans | document_id, instalments, frequency, first_due_at |
| `instalment_items` | Instalments | plan_id, sequence, due_date, amount, status, payment_id |
| `dunning_schedules` | Collection rules | company_id, name, offsets_days, actions, is_default |
| `late_fee_rules` | Late fees | company_id, fee_type, value, grace_days, max_cap |
| `document_templates` | Layouts | company_id, template_key, name, layout_config, is_default |

## STEP 09 - Payments (0370 - 0419)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `payment_providers` | Registry mirror | code, display_name, category, supports_sub_merchant, is_enabled, adapter_verified_at |
| `payment_provider_credentials` | Encrypted credentials | provider_code, company_id (null for platform), mode (test or live), secret_encrypted, key_version, masked_suffix, last_tested_at, last_test_result |
| `payment_provider_settings` | Mode and options | provider_code, company_id, active_mode, collect_js_enabled, payment_component_enabled, routing_weight, is_enabled |
| `payment_intents` | Pre-payment intent | company_id, document_id, provider_code, mode, amount, currency, idempotency_key, status, client_ip, client_country, billing_postal_code, risk_score, decision |
| `payments` | Settled payments | intent_id, provider_code, provider_payment_id, amount, fee_amount, net_amount, currency, status, method_type, card_token_id, card_fingerprint, captured_at, settled_at |
| `payment_attempts` | Attempt log | intent_id, attempt_no, provider_code, outcome, failure_code, failure_reason, is_authentication_failure, is_balance_failure, card_token_id, ip |
| `refunds` | Refunds | payment_id, amount, reason, status, provider_refund_id, approved_by |
| `payment_events` | State timeline | payment_id, event_type, source, payload, occurred_at |
| `webhook_events` | Inbound webhook ledger | provider_code, event_id, signature_valid, payload, processed_at, processing_result, attempt_count |
| `card_tokens` | Tokenized cards | company_id, client_id, provider_code, token_ref, fingerprint, brand, last4, expiry_month, expiry_year, first_seen_at, last_used_at, is_blacklisted |
| `card_blacklist` | Blacklist | provider_code, token_hash, fingerprint_hash, reason, source, blocked_at, expires_at |
| `card_failure_counters` | Auth failure counting | provider_code, token_hash, window_start, failure_count, blocked_until |
| `card_invoice_usage` | Per-invoice card rule | invoice_id, token_hash, success_at, expires_at |
| `payment_velocity_counters` | Velocity | bucket_key, window_start, attempts, amount_total |
| `manual_review_queue` | Payment review | intent_id, reason_code, assigned_to, decision, decided_at |
| `payment_links` | Payment links | document_id, token_hash, amount, expires_at, status |
| `payment_routing_rules` | Routing | company_id, priority, conditions, target_provider_code, is_active |
| `provider_health` | Health metrics | provider_code, window_start, success_rate, latency_ms, error_rate |

## STEP 10 - MoR, wallet, payouts, tax (0420 - 0459)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `mor_contracts` | MoR terms per tenant | company_id, version, accepted_at, accepted_ip, file_id |
| `sub_merchant_accounts` | Provisioned sub-merchant | company_id, provider_code, external_account_id, status, capabilities, requirements_due_at, provisioned_at, suspended_at |
| `sub_merchant_requirements` | Provider requirements | account_id, requirement_code, status, due_at, evidence_file_id |
| `sub_merchant_events` | Provisioning trail | account_id, event_type, payload, outcome, correlation_id |
| `sub_merchant_capabilities` | Enabled capabilities | account_id, capability, status, activated_at |
| `wallets` | Tenant wallet | company_id, currency, available_balance, pending_balance, held_balance |
| `wallet_ledger` | Double-entry wallet | wallet_id, entry_type, amount, balance_after, reference_type, reference_id |
| `payouts` | Payout requests | company_id, amount, method_code, status, approved_by, processed_at, provider_ref |
| `payout_items` | Payout composition | payout_id, payment_id, gross_amount, fee_amount, net_amount |
| `payout_batches` | Batch runs | batch_ref, total_amount, item_count, status |
| `disputes` | Chargebacks | payment_id, provider_code, reason_code, amount, status, due_at, representment_deadline |
| `dispute_evidence` | Evidence pack | dispute_id, file_id, evidence_type, generated_at |
| `platform_fees` | Fee schedule | company_id, fee_type, rate, fixed_amount, effective_from |
| `tax_jurisdictions` | Jurisdiction tree | country, region, locality, level, code |
| `tax_rates` | Rate catalogue | jurisdiction_id, name, rate, effective_from, effective_to, is_inclusive |
| `tax_rules` | Product mapping | product_tax_code, jurisdiction_id, rule_type, conditions |
| `tax_registrations` | Registrations | company_id, jurisdiction_id, registration_number, registered_at, filing_frequency |
| `tax_transactions` | Per-line tax ledger | company_id, document_id, document_line_id, jurisdiction_id, taxable_amount, tax_amount, is_reverse_charge |
| `tax_thresholds` | Nexus tracking | company_id, jurisdiction_id, metric, threshold_value, current_value, crossed_at |
| `tax_filings` | Returns | company_id, jurisdiction_id, period_start, period_end, total_tax, status, submitted_at, file_id |
| `exemption_certificates` | Exemptions | client_id, jurisdiction_id, certificate_file_id, valid_from, valid_to |
| `client_subscriptions` | Tenant to client billing | client_id, plan_ref, status, next_invoice_at, amount |
| `client_subscription_items` | Items | subscription_id, description, quantity, unit_price |

## STEP 11 - Client portal (0460 - 0489)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `portal_tokens` | Tokenized access | token_hash, company_id, entity_type, entity_id, scope, single_use, max_uses, use_count, expires_at, revoked_at |
| `portal_access_logs` | Access trail | token_id, ip, user_agent, action, result |
| `portal_access_gates` | Optional PIN or OTP | token_id, gate_type, secret_hash, attempts, locked_until |
| `document_approvals` | Client approval | document_id, token_id, decision, decided_at, ip, evidence_hash |
| `signatures` | E-signature evidence | entity_type, entity_id, signer_name, signer_email, signature_file_id, evidence_hash, signed_at, ip |
| `branding_overrides` | Portal branding | company_id, portal_theme, hide_platform_brand, custom_domain_id |

## STEP 12 - Payroll and HR (0490 - 0549)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `employees` | Employee master | company_id, user_id, employee_code, full_name, department, designation, hire_date, termination_date, status, base_salary, currency_display |
| `employee_documents` | Documents | employee_id, document_type, file_id, expires_at |
| `salary_structures` | Pay components | employee_id, effective_from, components, gross_amount |
| `salary_components` | Component master | company_id, code, name, type, taxable, formula |
| `attendance_records` | Attendance | employee_id, work_date, hours, overtime_hours, status |
| `leave_types` | Leave catalogue | company_id, code, name, annual_quota, is_paid |
| `leave_balances` | Balances | employee_id, leave_type_id, period_year, accrued, used, balance |
| `leave_requests` | Requests | employee_id, leave_type_id, start_date, end_date, status, approved_by |
| `payroll_tax_rules` | Statutory rules | jurisdiction_code, year, employee_rate_table, employer_rates, caps |
| `pay_runs` | Pay run | company_id, period_start, period_end, status, total_gross, total_deductions, total_net, approved_by, locked_at, journal_entry_id |
| `pay_run_items` | Per employee | pay_run_id, employee_id, gross, deductions, employer_cost, net, breakdown |
| `payslips` | Payslip | pay_run_item_id, file_id, delivered_at, delivery_channel |
| `employee_portal_tokens` | Self service | employee_id, token_hash, expires_at, scope |

## STEP 13 - Accounting and reporting (0550 - 0619)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `accounting_entities` | Multi-entity | company_id, name, base_currency, fiscal_year_start |
| `accounts` | Chart of accounts | entity_id, code, name, type, parent_id, is_system, normal_balance |
| `journal_entries` | Header | entity_id, entry_no, entry_date, period_id, source_type, source_id, memo, status, posted_at, posted_by, reversal_of |
| `journal_lines` | Lines | journal_entry_id, account_id, debit, credit, client_id, tax_code, dimension_ref |
| `periods` | Fiscal periods | entity_id, period_year, period_month, status, closed_at, closed_by |
| `opening_balances` | Opening | entity_id, account_id, amount, as_of_date |
| `bank_accounts` | Bank | entity_id, account_name, account_number_masked, currency, gl_account_id |
| `bank_statements` | Imports | bank_account_id, statement_date, source, file_id, status |
| `bank_transactions` | Lines | statement_id, posted_at, description, amount, reference, matched_entry_id, match_status |
| `reconciliations` | Reconciliation runs | bank_account_id, period_id, statement_balance, ledger_balance, difference, status, completed_by |
| `expenses` | Expenses | company_id, category_account_id, client_id, project_id, amount, tax_amount, expense_date, status, receipt_file_id, approved_by |
| `expense_policies` | Rules | company_id, category, limit_amount, requires_receipt, approval_level |
| `fixed_assets` | Assets | entity_id, name, category, cost, acquired_at, useful_life_months, salvage_value, status |
| `depreciation_schedules` | Schedules | asset_id, period_date, amount, accumulated, journal_entry_id |
| `budgets` | Budgets | entity_id, period_id, account_id, amount, created_by |
| `report_definitions` | Saved reports | company_id, report_key, parameters, schedule, recipients |
| `report_runs` | Execution log | definition_id, run_at, file_id, row_count |

## STEP 14 - Integrations (0620 - 0669)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `api_keys` | Public API keys | company_id, name, prefix, key_hash, scopes, last_used_at, expires_at, revoked_at |
| `api_requests` | Request log | api_key_id, route, method, status, duration_ms, correlation_id |
| `outbound_webhooks` | Subscriptions | company_id, url, secret_encrypted, events, is_active, failure_count |
| `webhook_deliveries` | Delivery log | webhook_id, event_type, payload, response_status, attempts, next_retry_at, signature |
| `whatsapp_accounts` | WABA config | company_id, phone_number_id, business_account_id, secret_encrypted, status |
| `whatsapp_templates` | Templates | account_id, name, language, category, status, components |
| `whatsapp_messages` | Messages | account_id, template_id, to_number, status, provider_message_id, sent_at |
| `whatsapp_consents` | Consent | company_id, phone_normalized, opted_in_at, opted_out_at, source |
| `social_accounts` | Connections | company_id, platform, account_ref, secret_encrypted, status |
| `social_posts` | Posts | company_id, content, media_ids, scheduled_at, status, approvals |
| `social_metrics` | Analytics | post_id, impressions, clicks, captured_at |
| `tickets` | Support | company_id, requester_id, subject, status, priority, assignee_id |
| `ticket_messages` | Thread | ticket_id, author_id, body, is_internal, attachments |
| `ocr_documents` | Receipt OCR | company_id, file_id, extracted, confidence, linked_expense_id |
| `import_jobs` | Migration wizard | company_id, source_platform, status, stats, errors, started_at, finished_at |
| `ecommerce_connections` | Shopify and Woo | company_id, platform, shop_domain, secret_encrypted, sync_state |
| `ecommerce_sync_logs` | Sync trail | connection_id, entity_type, external_id, outcome, occurred_at |

## STEP 15 - Admin, CMS, marketing (0670 - 0699)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `cms_pages` | Public page content | slug, title, meta, sections, status, published_at, updated_by |
| `cms_revisions` | Revision history | page_id, revision_no, content, author_id, created_at |
| `blog_posts` | Blog | slug, title, excerpt, body, status, published_at, author_id, seo |
| `blog_categories` | Categories | slug, name, description |
| `seo_entities` | SEO records | entity_type, entity_id, title, description, canonical, json_ld |
| `redirects` | Redirect map | from_path, to_path, status_code |
| `ab_tests` | Experiments | key, variants, traffic_split, status, started_at |
| `ab_assignments` | Assignment | test_id, visitor_hash, variant |
| `campaigns` | Marketing campaigns | company_id, channel, name, status, audience_filter, schedule |
| `campaign_messages` | Sends | campaign_id, recipient, status, sent_at |
| `leads` | Lead capture | email, source, utm, status, score |
| `pixel_settings` | Analytics config | company_id, pixel_type, identifier, consent_mode, is_active |
| `incidents` | Status page | title, severity, status, started_at, resolved_at, updates |
| `setup_state` | First-run wizard | step_key, status, completed_at |
| `impersonation_sessions` | Admin impersonation | admin_id, target_user_id, started_at, ended_at, reason, correlation_id |

## STEP 16 - Compliance and security completion (0700 - 0749)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `fraud_signals` | Signal store | company_id, entity_type, entity_id, signal_type, score, source, details |
| `device_fingerprints` | Device tracking | user_id, fingerprint_hash, components, first_seen_at, risk_state |
| `behavior_events` | UBA | user_id, session_id, event_type, metadata, occurred_at |
| `consent_records` | Consent | subject_ref, purpose, granted, granted_at, ip, evidence |
| `dsar_requests` | Data subject requests | subject_email, request_type, status, due_at, completed_at, export_file_id |
| `retention_policies` | Retention | entity_type, retention_days, legal_basis, purge_strategy |
| `data_classification` | Field classification | table_name, column_name, classification, handling |
| `security_findings` | Audit findings | area, severity, finding, status, remediation, verified_at |
| `siem_exports` | Forwarding log | batch_id, adapter, event_count, forwarded_at, status |
| `backup_runs` | Backup record | scope, started_at, finished_at, size_bytes, checksum, storage_ref, verified_at |

## Enum catalogue (created once, in the owning step)

`role_enum`, `admin_staff_role_enum`, `approval_level_enum`, `approval_status_enum`,
`company_status_enum`, `kyc_status_enum`, `storage_mode_enum`, `storage_provider_enum`,
`document_type_enum`, `document_status_enum`, `payment_status_enum`,
`payment_mode_enum`, `provider_code_enum`, `sub_merchant_status_enum`,
`payout_status_enum`, `dispute_status_enum`, `tax_level_enum`, `expense_status_enum`,
`journal_status_enum`, `period_status_enum`, `pay_run_status_enum`,
`ticket_status_enum`, `job_status_enum`, `severity_enum`.

Rule: an enum value is added through a dedicated migration in the owning step's
range. Values are never renamed or removed.
