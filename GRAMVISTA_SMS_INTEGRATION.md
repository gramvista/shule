# Gramvista SMS integration

Gramvista SMS remains a separate product. Shule Connect calls it through a provider boundary; it does not share browser credentials or claim delivery before a provider callback confirms it.

## Required external contract

Confirm the production submission URL, authorization scheme, request field names, response message ID, rate limits, Sender ID rules, callback signatures and delivery status values with the Gramvista SMS team. The current adapter expects a bearer key and a JSON submission containing `sender_id`, `to`, `message` and `client_reference`; change the adapter if the signed provider contract differs.

## Send lifecycle

1. A permitted school user creates one queued message and deduplicated recipient rows.
2. The Edge Function verifies the user, active school, subscription, enabled settings and daily limit.
3. The API key is decrypted only inside the Edge Function.
4. Accepted provider responses become `SUBMITTED`; transport or provider rejection becomes `FAILED`.
5. A separately verified webhook must update recipients to `DELIVERED`, `FAILED` or `REJECTED`.

The send function never marks a message delivered. Automatic absence alerts remain disabled until the school explicitly enables them. Fee reminder templates accept only the documented placeholder allowlist.

## Secrets

Store a random 32-byte AES-GCM key as base64 in `SMS_CREDENTIAL_ENCRYPTION_KEY`. Encrypt each school API key with a unique 12-byte nonce and store `base64(nonce || ciphertext || tag)` in `sms_provider_credentials.encrypted_api_key`. Rotate with `key_version` and a controlled re-encryption job.

