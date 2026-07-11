---
title: Homelab Current State
description: A snapshot of the homelabâ€™s current architecture, active security controls, monitoring capabilities, and remaining implementation work.
date: 2026-07-11
status: published
featured: false
tags:
  - dfir-homelab
  - incident-scenario
projectSlug: dfir-homelab
pageType: "landing"
navigationTitle: Homelab Configuration
navigationOrder: 0
category: Incident Scenarios
---
# Homelab Configuration Overview

## Purpose

This homelab provides a controlled environment for practising digital forensics, incident response, security monitoring, network analysis, and attack simulation.

The environment is designed to support repeatable investigations involving monitored endpoints, victim systems, attacker systems, network controls, and centrally collected security evidence.

## Hardware and Roles

### Blackstone Fortress

An ASUS ROG Strix G531GV laptop running Ubuntu Server.

Primary responsibilities:

- Hosts the Wazuh security monitoring platform
    
- Provides central log collection and alerting
    
- Hosts Pi-hole for internal DNS filtering
    
- Runs supporting services through Docker
    

### ASUS TUF Router

The primary home network router.

Primary responsibilities:

- Provides the stable home network
    
- Separates general, gaming, VR, and laboratory traffic
    
- Controls access between network segments
    
- Forwards relevant network logs to the monitoring environment
    

### MS-A2

A dedicated device for the isolated security laboratory network.

Primary responsibilities:

- Provides separation between the laboratory and home network
    
- Controls communication between attacker, victim, and monitoring systems
    
- Supports future network monitoring and security services
    

### Bertha

A Windows 11 workstation used for administration, analysis, gaming, and security laboratory activity.

Primary responsibilities:

- Runs the Wazuh endpoint agent
    
- Collects Windows and Sysmon telemetry
    
- Hosts investigation and development tools
    
- Connects to laboratory virtual machines when required
    

## Network Configuration

The network will be separated into several logical areas:

- General home network
    
- Gaming and VR network
    
- Security laboratory network
    
- Security monitoring and management services
    

Access between these areas will be restricted using firewall rules and network segmentation.

Important systems will use DHCP reservations or static addressing so that monitoring, DNS, and management services remain consistently available.

## Core Security Toolset

The initial environment will use:

- **Wazuh** for security monitoring, log collection, alerting, and endpoint visibility
    
- **Sysmon** for detailed Windows endpoint telemetry
    
- **Pi-hole** for DNS filtering and DNS activity visibility
    
- **Docker** for isolated service deployment
    
- **Virtual machines** for attacker, victim, and investigation systems
    

Additional tools may later be introduced for network monitoring, memory analysis, forensic collection, malware analysis, and threat intelligence.

## Current Status

The following components are currently operational:

- Blackstone Fortress Ubuntu server
    
- Docker-based Wazuh deployment
    
- Windows Wazuh agent on Bertha
    
- Sysmon endpoint logging
    
- Pi-hole DNS services
    
- ASUS TUF router providing the primary home network
    

The MS-A2 laboratory segmentation device and isolated attack environment are the next major components to be implemented.

## Next Steps

The immediate priorities are:

1. Configure the MS-A2 laboratory network
    
2. Create isolated attacker and victim systems
    
3. Confirm firewall and segmentation rules
    
4. Forward network and endpoint telemetry into Wazuh
    
5. Build a repeatable incident scenario
    
6. Document the resulting investigation