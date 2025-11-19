#!/usr/bin/env python3
"""Lightweight packet sniffer helper for quick network triage and demos."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, List, Tuple

try:
    from scapy.all import (
        ARP,
        ICMP,
        IP,
        IPv6,
        TCP,
        UDP,
        Packet,
        sniff,
        wrpcap,
    )
except ImportError as exc:  # pragma: no cover - import guard
    raise SystemExit("scapy is required: pip install scapy") from exc


@dataclass
class PacketSnapshot:
    """Serializable view of a captured packet."""

    timestamp: str
    src: str
    dst: str
    protocol: str
    length: int
    summary: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Capture packets on an interface with optional BPF filtering and emit a "
            "concise report (table or JSON)."
        )
    )
    parser.add_argument(
        "-i",
        "--interface",
        help=(
            "Interface to sniff on (default: let scapy decide). "
            "Use `ip addr`/`ifconfig` to list interfaces."
        ),
    )
    parser.add_argument(
        "-f",
        "--filter",
        help="Optional BPF capture filter, e.g. 'tcp port 443' or 'arp'.",
    )
    parser.add_argument(
        "-c",
        "--count",
        type=int,
        default=0,
        help="Stop after N packets (0 means capture until interrupted or timeout).",
    )
    parser.add_argument(
        "-t",
        "--timeout",
        type=float,
        help="Stop after N seconds (default: run until count is reached or interrupted).",
    )
    parser.add_argument(
        "--pcap",
        help="Optional path to write the capture as a .pcap file for later analysis.",
    )
    parser.add_argument(
        "-o",
        "--output",
        choices=("table", "json"),
        default="table",
        help="Final report format (table or JSON).",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Silence live per-packet logging; only print the final report.",
    )
    args = parser.parse_args()
    if args.count < 0:
        parser.error("--count must be zero or a positive integer")
    if args.timeout is not None and args.timeout <= 0:
        parser.error("--timeout must be a positive number")
    return args


def summarize_packet(packet: Packet) -> PacketSnapshot:
    """Extract key metadata for display/serialization."""
    timestamp = datetime.fromtimestamp(float(getattr(packet, "time", 0.0))).isoformat(timespec="microseconds")
    length = len(packet)
    src, dst = "-", "-"
    protocol = packet.lastlayer().name if packet.layers() else "unknown"
    summary = packet.summary()

    if IP in packet:
        ip: IP = packet[IP]
        src, dst = ip.src, ip.dst
        protocol, summary = describe_transport(packet, default_proto=ip.proto)
    elif IPv6 in packet:
        ipv6: IPv6 = packet[IPv6]
        src, dst = ipv6.src, ipv6.dst
        protocol, summary = describe_transport(packet, default_proto=ipv6.nh)
    elif ARP in packet:
        arp: ARP = packet[ARP]
        src, dst = arp.psrc, arp.pdst
        operation = "request" if arp.op == 1 else "reply" if arp.op == 2 else str(arp.op)
        protocol = "ARP"
        summary = f"ARP {operation} {arp.hwsrc} ({arp.psrc}) -> {arp.hwdst} ({arp.pdst})"

    return PacketSnapshot(timestamp=timestamp, src=src, dst=dst, protocol=str(protocol), length=length, summary=summary)


def describe_transport(packet: Packet, default_proto: Any) -> Tuple[str, str]:
    """Return a (protocol, description) tuple for IP/IPv6 packets."""
    if TCP in packet:
        seg: TCP = packet[TCP]
        flags = seg.sprintf("%TCP.flags%")
        proto = "TCP"
        summary = f"TCP {seg.sport} -> {seg.dport} len={len(seg)} flags={flags}"
        return proto, summary
    if UDP in packet:
        datagram: UDP = packet[UDP]
        proto = "UDP"
        summary = f"UDP {datagram.sport} -> {datagram.dport} len={len(datagram)}"
        return proto, summary
    if ICMP in packet:
        icmp: ICMP = packet[ICMP]
        proto = "ICMP"
        summary = f"ICMP type={icmp.type} code={icmp.code}"
        return proto, summary
    proto_map: Dict[int, str] = {1: "ICMP", 6: "TCP", 17: "UDP"}
    proto = proto_map.get(default_proto, str(default_proto))
    return proto, packet.summary()


def capture_packets(args: argparse.Namespace) -> List[PacketSnapshot]:
    """Capture packets per the CLI settings and return structured rows."""
    snapshots: List[PacketSnapshot] = []
    raw_packets: List[Packet] = []

    def handle_packet(packet: Packet) -> None:
        raw_packets.append(packet)
        snapshot = summarize_packet(packet)
        snapshots.append(snapshot)
        if not args.quiet:
            print(
                f"[{snapshot.timestamp}] {snapshot.protocol} {snapshot.src} -> {snapshot.dst} "
                f"len={snapshot.length} | {snapshot.summary}"
            )

    sniff_kwargs: Dict[str, Any] = {
        "iface": args.interface,
        "filter": args.filter,
        "count": args.count or 0,
        "timeout": args.timeout,
        "prn": handle_packet,
        "store": False,
    }
    # Remove unset keys so scapy can apply its defaults.
    sniff_kwargs = {key: value for key, value in sniff_kwargs.items() if value not in (None, "")}

    try:
        sniff(**sniff_kwargs)
    except PermissionError as exc:  # pragma: no cover - user environment dependent
        raise SystemExit("Root/administrator privileges are required to sniff packets.") from exc

    if args.pcap and raw_packets:
        wrpcap(args.pcap, raw_packets)
        print(f"Wrote {len(raw_packets)} packets to {args.pcap}")

    return snapshots


def render_table(snapshots: List[PacketSnapshot]) -> None:
    if not snapshots:
        print("No packets captured.")
        return

    headers = ["Timestamp", "Protocol", "Source", "Destination", "Length", "Summary"]
    rows = [
        [
            snap.timestamp,
            snap.protocol,
            snap.src,
            snap.dst,
            str(snap.length),
            snap.summary,
        ]
        for snap in snapshots
    ]
    col_widths = [min(60, max(len(row[idx]) for row in [headers] + rows)) for idx in range(len(headers))]

    def fmt_row(row: List[str]) -> str:
        clipped = [
            val if len(val) <= col_widths[idx] else f"{val[: col_widths[idx] - 3]}..."
            for idx, val in enumerate(row)
        ]
        return "  ".join(val.ljust(col_widths[idx]) for idx, val in enumerate(clipped))

    print(fmt_row(headers))
    print("  ".join("-" * width for width in col_widths))
    for row in rows:
        print(fmt_row(row))


def main() -> None:
    args = parse_args()
    snapshots = capture_packets(args)

    if args.output == "json":
        payload = [asdict(snapshot) for snapshot in snapshots]
        print(json.dumps(payload, indent=2))
    else:
        render_table(snapshots)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        raise SystemExit("\nCapture interrupted by user.")
