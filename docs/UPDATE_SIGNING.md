# Signed Updates (ed25519)

Goal: prevent "official update" supply chain tampering and make it harder for forks to masquerade as official 5tratumOS releases.

This uses:
- an **ed25519 private signing key** (kept offline, never committed)
- a **public verification key** baked into devices (or installed into `/etc/5tratumos/update_signing.pub`)
- a detached signature file `5tratumos-update.tgz.sig` uploaded alongside the update bundle

## Key generation (do this on a secure machine)

```bash
openssl genpkey -algorithm ed25519 -out 5tratumos_update_signing.key
openssl pkey -in 5tratumos_update_signing.key -pubout -out 5tratumos_update_signing.pub
```

Keep `5tratumos_update_signing.key` offline.

## Signing a release bundle

From the private build repo (where `dist/5tratumos-update.tgz` is produced):

```bash
SIGNING_KEY=/path/to/5tratumos_update_signing.key ./scripts/build-update-bundle.sh
```

This writes:
- `dist/5tratumos-update.tgz`
- `dist/5tratumos-update.tgz.sha256`
- `dist/5tratumos-update.tgz.sig` (if `SIGNING_KEY` is set)

Upload all three as GitHub Release assets.

## Enabling verification on devices

Install the public key onto the device:

```bash
sudo install -d -m 0755 /etc/5tratumos
sudo install -m 0644 5tratumos_update_signing.pub /etc/5tratumos/update_signing.pub
```

Signature enforcement modes:
- Default: signature verification happens only when a public key is present.
- Force signature required: set env `FIVETRATUMOS_UPDATE_REQUIRE_SIG=1` for the daemon unit.

Related daemon env:
- `FIVETRATUMOS_UPDATE_PUBKEY_FILE` (default: `/etc/5tratumos/update_signing.pub`)
- `FIVETRATUMOS_UPDATE_REQUIRE_SIG` (`0`/`1`)

