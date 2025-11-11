# Network Scanner

Small Python utility that wraps `nmap` (via `python-nmap`) to discover devices on a local network and optionally enumerate open ports.

## Requirements
- Python 3.9+
- `nmap` CLI tool installed and on `PATH`
- `python-nmap` library: `pip install python-nmap`

## Usage
```bash
# Quick ARP/ping sweep plus a port scan for ports 22, 80, and 443
python3 network_scan.py 192.168.1.0/24

# Scan the 100 most common ports instead of specifying a list
python3 network_scan.py 10.0.0.0/24 --top-ports 100

# Discovery only (faster, no port scan) and JSON output
python3 network_scan.py 172.16.0.0/24 --skip-ports --output json
```

Useful flags:
- `network` (positional): CIDR block to scan, e.g. `192.168.1.0/24`.
- `--timing`: nmap timing template (0–5). Higher is faster but noisier.
- `--ports`: Comma-separated list or ranges when you want specific ports.
- `--top-ports`: Scan the N most common ports and ignore `--ports`.
- `--skip-ports`: Only list active hosts.
- `--output`: `table` (default) or `json`.

The script prints a formatted table by default. Use `--output json` to integrate it with other tooling.
