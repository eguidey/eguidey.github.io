---
layout: page
title: Projects
permalink: /projects/
---

Things I've built, with the code to back them up.

## AWS AppSec Pipeline

A CI/CD pipeline on AWS that scans, signs and policy-checks every release, then ties each runtime attack back to the exact build that was running. Eight security gates, keyless image signing, policy as code, MITRE ATT&CK-mapped detections, and a Lambda that blocks attackers automatically.

**Stack:** GitHub Actions, Terraform, ECS Fargate, CloudWatch, Lambda, OWASP ZAP, cosign

[Read the write-up]({% post_url 2026-09-29-from-commit-to-containment %}) · [View the code](https://github.com/eguidey/aws-pipeline-2)

## Help Desk Toolkit

A cross-platform command-line toolkit for common help desk tickets. One command each for system info, layered network diagnostics with root-cause hints, disk usage, top processes, privacy-safe password breach checks, new-hire onboarding, and a self-contained HTML health report to attach to a ticket.

**Stack:** Python 3.10+, runs on Windows, macOS and Linux

[Read the write-up]({% post_url 2026-09-28-help-desk-toolkit %}) · [View the code](https://github.com/eguidey/Helpdesk-toolkit)
