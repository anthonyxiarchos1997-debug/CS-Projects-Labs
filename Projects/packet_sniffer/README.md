# Packet Sniffer

Simple Scapy-based sniffing helper for quick network triage labs. It captures packets on any local interface, prints a concise per-packet log (optional), and generates either a human-readable table or JSON you can feed into other tooling. Captured frames can also be persisted to a `.pcap` file for replay in Wireshark/tshark.

## Requirements
- Python 3.9+
- [`scapy`](https://scapy.net/): `pip install scapy`
- Root/administrator privileges when sniffing live traffic

## Usage
```bash
cd Projects/packet_sniffer
sudo python3 packet_sniffer.py --interface eth0 --filter "tcp port 443" --count 50 --pcap tls_capture.pcap

# JSON output suitable for piping elsewhere
sudo python3 packet_sniffer.py -i wlan0 --timeout 10 --output json
```

### Helpful flags
- `--interface` / `-i`: Interface to capture on. Leave unset to let Scapy choose.
- `--filter` / `-f`: BPF expression (same syntax as tcpdump) to reduce noise.
- `--count` / `-c`: Stop after N packets (`0` = run until timeout/CTRL+C).
- `--timeout` / `-t`: Stop after N seconds.
- `--pcap`: Write every captured packet to a `.pcap` file.
- `--output` / `-o`: `table` (default) or `json`.
- `--quiet`: Suppress live per-packet log lines—only final report is printed.

By default the script prints a rolling log similar to:

```
[2024-06-01T14:23:36.102939] TCP 192.168.1.5 -> 142.251.32.142 len=74 | TCP 51534 -> 443 len=34 flags=PA
```

When `--output table` is used (default) the run ends with a compact table of the captured packets. `--output json` emits structured rows such as:

```json
[
  {
    "timestamp": "2024-06-01T14:23:36.102939",
    "src": "192.168.1.5",
    "dst": "142.251.32.142",
    "protocol": "TCP",
    "length": 74,
    "summary": "TCP 51534 -> 443 len=34 flags=PA"
  }
]
```

> **Tip:** Run inside a Python virtual environment and keep captures short in lab settings—raw packets can include sensitive data.
