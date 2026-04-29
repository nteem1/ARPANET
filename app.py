from __future__ import annotations

import getpass
import json
import os
import platform
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.request import urlopen

import psutil
from flask import Flask, abort, render_template, request, redirect, url_for, session, send_file

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me-in-production")

PASSWORD = "64682789"
SEVERCODE = "1384792913997999177997719777916371361638122618677997737"
MASTER_HATCH_CODE = "417264-62317-NKTTGG"


def get_protected_pdf_path() -> Path:
    configured_path = os.getenv("PROTECTED_PDF_PATH")
    if configured_path:
        return Path(configured_path).expanduser()

    project_default = Path(__file__).resolve().parent / "secure_files" / "Jan 13th 2026.pdf"
    if project_default.exists():
        return project_default

    # Backward-compatible local fallback
    return Path("/Users/teem2/Downloads/Jan 13th 2026.pdf")


def _run_command(cmd: list[str]) -> str:
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except Exception:
        return ""


def _normalize_code(value: str) -> str:
    return "".join(ch.lower() for ch in value if ch.isalnum())


def get_ssid() -> str:
    if platform.system() != "Darwin":
        return ""
    # Try networksetup first (most stable on macOS)
    output = _run_command(["/usr/sbin/networksetup", "-getairportnetwork", "en0"])
    if output:
        # Expected: "Current Wi-Fi Network: <SSID>"
        parts = output.split(":", 1)
        if len(parts) == 2:
            return parts[1].strip()

    # Fallback to airport utility
    airport_path = (
        "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"
    )
    output = _run_command([airport_path, "-I"])
    for line in output.splitlines():
        if " SSID:" in line:
            return line.split(":", 1)[1].strip()
    return ""


def get_geo_snapshot() -> dict[str, str]:
    try:
        with urlopen("https://ipapi.co/json/", timeout=2) as response:
            payload = json.loads(response.read().decode("utf-8"))
        city = payload.get("city") or ""
        region = payload.get("region") or ""
        country = payload.get("country_name") or payload.get("country") or ""
        parts = [part for part in [city, region, country] if part]
        return {
            "approx_location": ", ".join(parts) if parts else "Not available",
            "public_ip": payload.get("ip") or "Not available",
        }
    except Exception:
        return {"approx_location": "Not available", "public_ip": "Not available"}


def get_network_info() -> dict[str, Any]:
    interfaces = []
    for name, addrs in psutil.net_if_addrs().items():
        ipv4 = [a.address for a in addrs if a.family.name == "AF_INET"]
        if not ipv4:
            continue
        interfaces.append({"name": name, "ipv4": ipv4})

    ssid = get_ssid()
    geo_snapshot = get_geo_snapshot()
    primary_ipv4 = interfaces[0]["ipv4"][0] if interfaces else ""
    virtual_memory = psutil.virtual_memory()
    disk_usage = psutil.disk_usage("/")
    net_io = psutil.net_io_counters()
    boot_time = datetime.fromtimestamp(psutil.boot_time())
    uptime_seconds = int((datetime.now() - boot_time).total_seconds())
    hours, remainder = divmod(uptime_seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    disk_partitions = []
    for partition in psutil.disk_partitions(all=False):
        try:
            part_usage = psutil.disk_usage(partition.mountpoint)
            disk_partitions.append(
                {
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "percent": round(part_usage.percent, 1),
                }
            )
        except Exception:
            continue

    return {
        "user_name": getpass.getuser(),
        "hostname": platform.node(),
        "interfaces": interfaces,
        "ssid": ssid,
        "primary_ipv4": primary_ipv4,
        "approx_location": geo_snapshot["approx_location"],
        "public_ip": geo_snapshot["public_ip"],
        "os_name": platform.system(),
        "os_release": platform.release(),
        "machine_arch": platform.machine(),
        "cpu_physical": psutil.cpu_count(logical=False) or 0,
        "cpu_logical": psutil.cpu_count(logical=True) or 0,
        "cpu_usage_percent": round(psutil.cpu_percent(interval=0.2), 1),
        "memory_total_gb": round(virtual_memory.total / (1024**3), 2),
        "memory_used_gb": round(virtual_memory.used / (1024**3), 2),
        "memory_percent": round(virtual_memory.percent, 1),
        "disk_total_gb": round(disk_usage.total / (1024**3), 2),
        "disk_used_gb": round(disk_usage.used / (1024**3), 2),
        "disk_percent": round(disk_usage.percent, 1),
        "net_sent_gb": round(net_io.bytes_sent / (1024**3), 2),
        "net_recv_gb": round(net_io.bytes_recv / (1024**3), 2),
        "packets_sent": net_io.packets_sent,
        "packets_recv": net_io.packets_recv,
        "process_count": len(psutil.pids()),
        "uptime": f"{hours}h {minutes}m",
        "boot_time": boot_time.strftime("%Y-%m-%d %H:%M:%S"),
        "captured_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "disk_partitions": disk_partitions,
    }


def run_speedtest() -> dict[str, Any]:
    try:
        import speedtest  # type: ignore

        tester = speedtest.Speedtest()
        tester.get_best_server()
        download_bps = tester.download()
        upload_bps = tester.upload()
        ping_ms = tester.results.ping
        return {
            "download_mbps": round(download_bps / 1_000_000, 2),
            "upload_mbps": round(upload_bps / 1_000_000, 2),
            "ping_ms": round(ping_ms, 2),
        }
    except Exception as exc:  # pragma: no cover - best-effort network test
        return {"error": str(exc)}


@app.route("/", methods=["GET", "POST"])
def login():
    error = ""
    if request.method == "POST":
        submitted_password = request.form.get("password", "")
        if _normalize_code(submitted_password) == _normalize_code(PASSWORD):
            session["password_authed"] = True
            session.pop("severcode_authed", None)
            return redirect(url_for("severcode"))
        error = "Incorrect password."

    return render_template("login.html", error=error)


@app.route("/severcode", methods=["GET", "POST"])
def severcode():
    if not session.get("password_authed"):
        return redirect(url_for("login"))

    error = ""
    if request.method == "POST":
        submitted_severcode = request.form.get("severcode", "")
        if _normalize_code(submitted_severcode) == _normalize_code(SEVERCODE):
            session["severcode_authed"] = True
            return redirect(url_for("protected"))
        error = "Incorrect Severcode."

    return render_template("severcode.html", error=error)


@app.route("/protected")
def protected():
    if not (session.get("password_authed") and session.get("severcode_authed")):
        return redirect(url_for("login"))

    network_info = get_network_info()
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else (request.remote_addr or "Unknown")
    try:
        load_1m, load_5m, load_15m = os.getloadavg()
        load_avg = f"{load_1m:.2f} / {load_5m:.2f} / {load_15m:.2f}"
    except Exception:
        load_avg = "Not available"
    audit_info = {
        "client_ip": client_ip,
        "forwarded_for": forwarded_for or "Not provided",
        "user_agent": request.user_agent.string or "Unknown",
        "request_method": request.method,
        "path": request.path,
        "captured_at_utc": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "cpu_load_avg": load_avg,
    }
    speedtest_results = None
    if request.args.get("speed") == "1":
        speedtest_results = run_speedtest()

    return render_template(
        "protected.html",
        network_info=network_info,
        audit_info=audit_info,
        speedtest_results=speedtest_results,
        file_error=request.args.get("file_error") == "1",
    )


@app.route("/protected/file", methods=["POST"])
def protected_file():
    if not (session.get("password_authed") and session.get("severcode_authed")):
        return redirect(url_for("login"))
    submitted_master_hatch_code = request.form.get("master_hatch_code", "")
    if _normalize_code(submitted_master_hatch_code) != _normalize_code(MASTER_HATCH_CODE):
        return redirect(url_for("protected", file_error="1"))
    protected_pdf_path = get_protected_pdf_path()
    if not protected_pdf_path.exists():
        abort(404)
    return send_file(protected_pdf_path, mimetype="application/pdf")


@app.route("/notes")
def notes():
    if not (session.get("password_authed") and session.get("severcode_authed")):
        return redirect(url_for("login"))

    return render_template(
        "notes.html",
        password=PASSWORD,
        severcode=SEVERCODE,
        master_hatch_code=MASTER_HATCH_CODE,
        protected_pdf_path=str(get_protected_pdf_path()),
    )


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host=host, port=port, debug=debug)
