---
layout: post
title: "From Alert to Root Cause in One Command: Building a SOC Toolkit"
date: 2026-09-29
categories: [projects]
tags: [python, detection, automation, projects]
description: "A dependency-free Python toolkit for the first hour of an investigation: SSH log detections mapped to MITRE ATT&CK, phishing triage, file integrity monitoring, IOC extraction and web header audits."
---

My [Help Desk Toolkit](/projects/2026/09/28/help-desk-toolkit.html) turned common tickets into one command each. This is its security-side sibling: a toolkit for the first hour of an investigation, when you have a log file, a suspicious email or a threat report and need answers fast.

It's called **SOC Toolkit**, the command is `soctk`, and the code is on [GitHub](https://github.com/eguidey/soc-toolkit).

![SSH log analysis report](https://github.com/eguidey/soc-toolkit/raw/main/docs/authlog-report.png)

## What it does

| Command | Question it answers |
| --- | --- |
| `authlog` | Is someone brute-forcing this server, and did it work? |
| `phish` | Is this email phishing? |
| `fim` | Did anything on this machine change? |
| `iocs` | What indicators are buried in this threat report? |
| `webheaders` | How hardened is this site's configuration? |

Every check can print to the terminal, emit JSON for other tools, or write a self-contained HTML report you can attach to a ticket. Like the Help Desk Toolkit, it returns exit code `0` (clean), `1` (warnings) or `2` (high or critical findings), so it works in cron jobs, CI and playbooks.

It uses only the Python standard library. No dependencies means nothing to install on a locked-down analyst box, and nothing to audit but the code itself.

## Detection rules are small functions

The part I care most about is `authlog`, because it's the closest to real detection engineering. Each rule is one function that takes parsed events and returns findings, and they're all registered in a single list:

```python
RULES = [
    detect_brute_force,
    detect_password_spray,
    detect_success_after_failures,
    detect_root_login,
    detect_off_hours,
]
```

Adding a detection means writing one function and adding one line. Every finding carries a MITRE ATT&CK technique ID, so the output maps straight onto how a SIEM would tag it.

Brute force detection is a sliding window: "N failures from one IP within M minutes." Both numbers are command-line flags, because tuning thresholds is most of the job.

```python
def _burst(events, count, window):
    start = 0
    for end, event in enumerate(events):
        while event.time - events[start].time > window:
            start += 1
        if end - start + 1 >= count:
            return events[start : end + 1]
    return None
```

The two-pointer approach touches each event once, so it stays fast on large logs.

## The rule that matters most

Plenty of tools flag brute force. The finding I'd actually want at 2 a.m. is **a login that succeeded after a burst of failures from the same address**, because that means the attack may have worked. I built a sample log with a planted attack to test it. This is the real output:

```
 CRITICAL Possible compromise: admin logged in from 203.0.113.50 after repeated failures  [T1078]
           14 failures preceded a successful password login at 13:31:50. Reset the credential and review the session.
           > Sep 28 13:30:28 web01 sshd[2304]: Failed password for admin from 203.0.113.50 port 50004 ssh2
           > Sep 28 13:31:50 web01 sshd[2320]: Accepted password for admin from 203.0.113.50 port 50099 ssh2
```

It shows the evidence lines, the technique ID and the next action, so the analyst doesn't have to reconstruct the story from raw logs.

## Two bugs testing caught

Writing tests against my own sample data found two real mistakes, and both taught me something.

**Double counting.** sshd writes two lines for one bad login against a nonexistent user: an `Invalid user` line and a `Failed password for invalid user` line. My first version counted both, so a source that tried 7 times showed as 14. The fix was to count only real failed authentications for brute-force logic, and use both line types only for username enumeration.

**A look-alike check that missed the obvious one.** My first rule for "brand name embedded in a domain" allowed only a few extra characters, so `paypal-secure-login.com` slipped through. The obvious fix, a plain substring match, would flag `purchase.com` because it contains `chase`. The right fix was matching on hyphen-separated tokens, and I added a regression test for the `purchase.com` case.

## Phishing triage

`phish` reads a `.eml` file and runs independent checks:

- **Authentication:** SPF, DKIM and DMARC results from the headers
- **Sender:** Reply-To and Return-Path mismatches, and display names that claim a brand the address doesn't belong to
- **Look-alike domains:** edit distance (written by hand, no library), homoglyph normalization like `paypa1` and `rnicrosoft`, and tricks like `paypal.com.evil.io`
- **Links:** raw IP hosts, URL shorteners, punycode, and links whose visible text shows one address while the `href` goes to another
- **Attachments:** executables, scripts, macro documents and double extensions like `invoice.pdf.exe`

Each finding has a weight, and the tool ends with a plain-language verdict such as "PHISHING - block and report." Any critical finding forces that verdict on its own, since a disguised executable shouldn't be averaged away by otherwise clean headers.

## A baseline that detects tampering

File integrity monitoring hashes every file in a directory and later reports what was added, changed or deleted. The extra step is that the baseline stores a digest of its own contents. If an attacker edits the baseline to hide their change, `fim check` reports `fim-baseline-tampered` as critical. Changes to sensitive files like `sshd_config`, `authorized_keys` and `sudoers` are escalated automatically.

## Handling indicators safely

Threat reports write indicators in defanged form, like `hxxps://evil[.]example[.]com`, so nobody clicks them by accident. `iocs` refangs the text, extracts URLs, domains, IPs, emails, hashes and CVEs, and prints them defanged again by default so they're safe to paste into a ticket or chat. Private IP ranges are dropped, and a SHA-256 isn't also counted as an MD5. It also ignores filenames like `config.yaml`, which a naive domain regex would report as domains.

## Safe by design

A security tool shouldn't create new risk, so a few choices were deliberate:

- `webheaders` accepts only `http` and `https`. A linter security rule flagged that `urlopen` will happily read `file://` paths, so I added validation and a test for it.
- Log lines and email fields are attacker-controlled, so the HTML report escapes everything, and a test feeds it a `<script>` tag to prove it.
- The tools are read-only and make no network lookups, so nothing about an investigation leaves the machine.

## Testing and CI

There are 69 pytest tests covering every module, including an end-to-end run against the sample attack log and a live test that starts a local HTTP server to exercise the header audit. GitHub Actions runs the linter (with security rules enabled) and the tests on Windows, macOS and Linux.

## Limitations and what's next

It's an early version, and it has clear limits. `authlog` parses OpenSSH logs only, the look-alike check uses a small built-in brand list, and IOC extraction relies on a fixed list of top-level domains. On the roadmap:

- A Windows Security event parser (4625, 4624, 4688)
- Sigma rule export for the detections
- Optional reputation lookups behind an explicit `--online` flag
- A TLS certificate expiry and protocol audit

The code, tests and sample data are on [GitHub](https://github.com/eguidey/soc-toolkit). If you try it on your own logs and something looks wrong, I want to hear about it.
