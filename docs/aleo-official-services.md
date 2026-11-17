Aleo chain queries use `VITE_ALEO_RPC_LIST`; transaction metadata uses
`VITE_ALEO_WALLET_API_LIST`. Both default to `https://api.provable.com/v2`,
with the network appended by the client. Transaction metadata comes from
`/{network}/transactions/{id}`. A 404 remains unconfirmed; accepted/rejected
statuses, block height and seconds timestamps are adapted to wallet consumers.

The retired `VITE_ALEO_SYNC_API_LIST` is unused and has been removed. Record
sync, private balances, private history and rescanning already use the official
Record Scanning Service at `https://api.provable.com/scanner/{network}`, with
encrypted View Key registration and local record decryption.

Base fees are estimated locally in a dedicated worker using the pinned official
SDK/WASM 0.13.0 `estimateExecutionFee` implementation. Program sources and editions
are fetched together using `/program/{id}?metadata=true`, and dependencies are
loaded in order with their editions. The SDK estimates with sampled inputs and
its latest supported consensus rules (V22); update the SDK when the network's
fee rules change. This function estimate does not replace estimation of a DApp's
actual dynamic authorization. Estimation failures propagate rather than using a
different program's fee. Credits `split` retains the protocol's internal burn
of 10,000 microcredits.

Priority fees use the P75 of accepted transactions in the latest ten official
blocks. Public and private fee inputs are read at their respective indexes;
zero is valid. Results are cached for 30 seconds. On failure, a successful
estimate from the last ten minutes is reused, otherwise the existing 100,000
microcredits fallback applies. Failed requests are retried after ten seconds.

The mainnet configuration does not enable the internal Fox faucet. There is no
equivalent official mainnet API for its signed claim protocol; these methods
now report unsupported without contacting the retired backend.

Deploy the extension migration before updating the environment artifact.
The new transaction client recognizes the five old Fox wallet URLs and routes
them directly to official Explorer, so it also works with an older artifact.
