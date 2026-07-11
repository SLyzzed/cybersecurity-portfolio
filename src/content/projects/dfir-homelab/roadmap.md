---
title: Homelab Roadmap and Target State
description: The planned development path from the current homelab environment to a complete, repeatable DFIR investigation platform.
date: 2026-07-11
status: published
featured: false
projectSlug: dfir-homelab
pageType: "subpage"
navigationTitle: Roadmap
navigationOrder: 2
category: Digital Forensics and Incident Response
tags: []
---
## Purpose

This roadmap defines the work required to develop the homelab from its current monitoring environment into a complete digital forensics and incident response platform.

The final environment will support repeatable attack scenarios, centralised evidence collection, structured investigation, and documented incident reporting.

## Target State

The completed homelab will include:

- Segmented home, management, monitoring, and laboratory networks
- Dedicated attacker and victim systems
- Centralised endpoint and network telemetry
- Repeatable attack and incident scenarios
- Forensic evidence collection and preservation
- Investigation workstations and analysis tools
- Documented detection, investigation, and reporting workflows
- Secure remote administration and system recovery procedures

## Phase 1: Core Infrastructure

Status: In Progress

- Configure the Blackstone Fortress server
- Deploy Wazuh using Docker
- Configure Pi-hole DNS services
- Connect Bertha as a monitored endpoint
- Install and validate Sysmon
- Secure SSH and administrative access
- Apply stable addressing to critical systems

## Phase 2: Network Segmentation

Status: Planned

- Configure the MS-A2 laboratory gateway
- Create an isolated security laboratory network
- Restrict communication between home and laboratory systems
- Define firewall rules for attacker, victim, and monitoring systems
- Confirm that monitoring traffic can reach Wazuh
- Test that laboratory systems cannot access protected home devices

## Phase 3: Laboratory Systems

Status: Planned

- Create a Windows victim system
- Create a Linux victim system
- Create a dedicated attacker system
- Create an investigation workstation
- Develop reusable virtual machine templates
- Record baseline configurations and snapshots

## Phase 4: Monitoring and Evidence Collection

Status: Planned

- Forward Windows and Sysmon telemetry to Wazuh
- Forward Linux logs to Wazuh
- Collect DNS activity from Pi-hole
- Forward relevant router and firewall logs
- Introduce network monitoring capabilities
- Validate timestamps and log retention
- Confirm that evidence can be exported for investigation

## Phase 5: Incident Scenarios

Status: Planned

- Create repeatable attack scenarios
- Generate realistic endpoint and network evidence
- Test Wazuh detections and alerting
- Record investigation procedures
- Build timelines from collected evidence
- Map activity to MITRE ATT&CK
- Produce formal incident reports

## Phase 6: Advanced DFIR Capabilities

Status: Future

- Memory acquisition and analysis
- Disk imaging and forensic analysis
- Malware analysis environment
- Threat intelligence enrichment
- Detection engineering with Sigma and YARA
- Automated evidence collection
- Case management and investigation tracking

## Final State Requirements

The homelab will be considered complete when it can:

1. Isolate attacker and victim systems from the home network
2. Collect endpoint, DNS, network, and security telemetry
3. Generate controlled and repeatable attack activity
4. Preserve sufficient evidence for investigation
5. Support complete incident timelines
6. Demonstrate detection and investigation methods
7. Produce clear technical and executive reporting
8. Return systems to a known baseline after each scenario

## Ongoing Development

The homelab will remain an evolving platform. New tools and scenarios will be introduced only where they improve evidence quality, investigative capability, security visibility, or repeatability.