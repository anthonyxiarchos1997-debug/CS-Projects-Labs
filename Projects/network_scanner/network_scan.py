#!/usr/bin/env python3
"""Discover devices on a local network and optionally scan their open ports."""

from __future__ import annotations

import argparse
import ipaddress
import json
import shutil
import sys
from typing import Dict, List, Optional

try:
    import nmap  # type: ignore
except ImportError as exc:  # pragma: no cover - import guard
    print("python-nmap is required: pip install python-nmap", file=sys.stderr)
    raise


def validate_network(value: str) -> str:
    """Return canonical CIDR notation or raise argparse error."""
    try:
        network = ipaddress.ip_network(value, strict=False)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(str(exc)) from exc
    return str(network)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Scan a local network for active hosts and optionally enumerate open ports "
            "using nmap via python-nmap."
        )
    )
    parser.add_argument(
        "network",
        type=validate_network,
        help="CIDR notation for the target network, e.g. 192.168.1.0/24.",
    )
    parser.add_argument(
        "--ports",
        default="22,80,443",
        help=(
            "Comma-separated ports and/or ranges (nmap syntax). Ignored when --top-ports "
            "is provided. Default: 22,80,443."
        ),
    )
    parser.add_argument(
        "--top-ports",
        type=int,
        default=0,
        help="Scan the N most common ports instead of specifying --ports.",
    )
    parser.add_argument(
        "--skip-ports",
        action="store_true",
        help="Only discover active hosts; skip all port scanning.",
    )
    parser.add_argument(
        "--timing",
        type=int,
        default=3,
        choices=range(0, 6),
        metavar="{0..5}",
        help="nmap timing template (0-5). Higher is faster but noisier. Default: 3.",
    )
    parser.add_argument(
        "--output",
        choices=("table", "json"),
        default="table",
        help="Output format for the scan report. Default: table.",
    )
    args = parser.parse_args()
    if args.top_ports < 0:
        parser.error("--top-ports must be zero or a positive integer")
    if not shutil.which("nmap"):
        parser.error("The 'nmap' executable is required but was not found in PATH.")
    return args


def discover_hosts(network: str, timing: int) -> List[Dict[str, Optional[str]]]:
    """Use an nmap ping scan (-sn) to list active hosts on the network."""
    scanner = nmap.PortScanner()
    scanner.scan(hosts=network, arguments=f"-sn -T{timing}")

    devices: List[Dict[str, Optional[str]]] = []
    for host in scanner.all_hosts():
        status = scanner[host].get("status", {}).get("state")
        if status != "up":
            continue
        addresses = scanner[host].get("addresses", {})
        mac = addresses.get("mac")
        vendor_map = scanner[host].get("vendor", {})
        vendor = vendor_map.get(mac) if mac else None
        devices.append(
            {
                "ip": host,
                "mac": mac,
                "vendor": vendor,
                "hostname": scanner[host].hostname() or None,
            }
        )
    return devices


def scan_ports(hosts: List[str], timing: int, ports: str, top_ports: int) -> Dict[str, List[Dict[str, str]]]:
    """Scan the provided hosts for open ports."""
    if not hosts:
        return {}

    args = f"-Pn -T{timing}"
    if top_ports:
        args += f" --top-ports {top_ports}"
    elif ports:
        args += f" -p {ports}"

    scanner = nmap.PortScanner()
    scanner.scan(hosts=" ".join(hosts), arguments=args)

    results: Dict[str, List[Dict[str, str]]] = {}
    for host in scanner.all_hosts():
        host_ports: List[Dict[str, str]] = []
        for proto in scanner[host].all_protocols():
            for port, meta in sorted(scanner[host][proto].items()):
                if meta.get("state") != "open":
                    continue
                host_ports.append(
                    {
                        "protocol": proto,
                        "port": str(port),
                        "service": meta.get("name") or "unknown",
                    }
                )
        results[host] = host_ports
    return results


def render_table(devices: List[Dict[str, Optional[str]]]) -> None:
    if not devices:
        print("No active hosts discovered.")
        return

    headers = ["IP", "MAC", "Vendor", "Hostname", "Open Ports"]
    rows: List[List[str]] = []
    for device in devices:
        ports = device.get("ports", [])
        port_str = "none"
        if ports:
            port_str = ", ".join(f"{entry['port']}/{entry['protocol']} ({entry['service']})" for entry in ports)
        rows.append(
            [
                device.get("ip") or "-",
                device.get("mac") or "-",
                device.get("vendor") or "-",
                device.get("hostname") or "-",
                port_str,
            ]
        )

    col_widths = [max(len(row[idx]) for row in [headers] + rows) for idx in range(len(headers))]

    def fmt_row(row: List[str]) -> str:
        return "  ".join(val.ljust(col_widths[idx]) for idx, val in enumerate(row))

    print(fmt_row(headers))
    print("  ".join("-" * width for width in col_widths))
    for row in rows:
        print(fmt_row(row))


def main() -> None:
    args = parse_args()

    devices = discover_hosts(args.network, args.timing)

    if not args.skip_ports:
        port_map = scan_ports(
            hosts=[device["ip"] for device in devices if device.get("ip")],
            timing=args.timing,
            ports=args.ports,
            top_ports=args.top_ports,
        )
        for device in devices:
            device["ports"] = port_map.get(device.get("ip"), [])
    else:
        for device in devices:
            device["ports"] = []

    if args.output == "json":
        print(json.dumps(devices, indent=2))
    else:
        render_table(devices)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("Scan aborted by user.")
