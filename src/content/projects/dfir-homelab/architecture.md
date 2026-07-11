---
title: "DFIR Homelab Architecture"
description: "The system, network, security-control, and evidence-flow design of the DFIR Homelab."
date: 2026-07-11
status: published
featured: false
tags: ["DFIR", "architecture", "homelab"]
projectSlug: "dfir-homelab"
pageType: "subpage"
navigationTitle: "Architecture"
navigationOrder: 1
category: "Digital Forensics and Incident Response"
---

## Physical Infrastructure

The DFIR homelab uses several physical systems with separate responsibilities. The architecture separates general household networking, security monitoring, infrastructure services and isolated cyber-range workloads.

|Device|Architectural role|Primary functions|Design rationale|
|---|---|---|---|
|**ASUS TUF BE9400**|Home network gateway and segmentation boundary|Internet gateway, household network segmentation, gaming and VR networking, wireless access and connection of the lab environment to the wider home network|Provides separation between normal household devices, trusted workstations, gaming devices, IoT devices and the DFIR lab. It forms the outer network boundary but is not intended to control communication between individual lab systems.|
|**Blackstone Fortress**|Security monitoring and shared infrastructure server|Wazuh SIEM, security-event collection, Wazuh management services, Pi-hole DNS filtering and DNS telemetry|Repurposed hardware provides centralised monitoring and DNS-level visibility without requiring additional dedicated servers. Co-locating Wazuh and Pi-hole conserves resources, although it also creates a shared-service dependency that must be considered during failure and compromise scenarios.|
|**MINISFORUM MS-A2**|Virtualisation host and internal lab infrastructure platform|Hosts victim machines, attacker machines, identity infrastructure, forensic systems, virtual networks and potentially a virtual firewall|Provides the compute, storage and network connectivity required to create repeatable DFIR scenarios. Its multiple physical network interfaces make it suitable for separating management, monitoring and simulated attack networks.|
|**Bertha**|Analyst workstation|Lab administration, investigation, forensic analysis, local security tooling, virtual-machine console access and local AI-assisted analysis|Provides the primary interface through which scenarios are deployed, monitored, investigated and documented. It remains outside the hostile lab networks wherever possible.|

## Network Responsibility Separation

The ASUS router and MS-A2 perform related but distinct roles.

### ASUS TUF BE9400

The ASUS router provides segmentation for the wider home environment. Its responsibilities include:

- Separating normal household traffic from the DFIR lab
    
- Protecting gaming, VR, personal and IoT devices from lab activity
    
- Providing controlled internet access to the lab
    
- Acting as the upstream gateway for the physical lab infrastructure
    
- Preventing simulated attacks from reaching unrelated home devices
    

### MINISFORUM MS-A2

The MS-A2 provides the platform for segmentation inside the DFIR lab. Its responsibilities include:

- Hosting the virtualisation platform
    
- Creating isolated virtual switches and network segments
    
- Separating attacker, victim, server, monitoring and management systems
    
- Hosting a virtual firewall or router to control traffic between lab zones
    
- Supporting snapshots, templates and repeatable scenario deployment
    
- Connecting selected lab traffic to Wazuh for monitoring and investigation
    

The MS-A2 includes multiple Ethernet interfaces, including two 2.5 GbE RJ45 ports and two 10 GbE SFP+ interfaces. This allows physical interfaces to be assigned to separate management, lab-uplink or storage roles if required.

## Proposed Trust Boundaries

The lab should use the following logical zones:

|Zone|Purpose|Example systems|
|---|---|---|
|**Home Network**|Trusted household and personal devices|Personal computers, phones and normal household services|
|**Management Network**|Administration of the lab infrastructure|Bertha, MS-A2 hypervisor management and administrative interfaces|
|**Monitoring Network**|Collection and analysis of security telemetry|Blackstone Fortress, Wazuh and Pi-hole|
|**Victim Network**|Systems deliberately exposed during security scenarios|Windows endpoints, Linux servers and vulnerable applications|
|**Attacker Network**|Controlled offensive-security systems|Kali Linux and attack simulation machines|
|**Infrastructure Network**|Services required by the simulated organisation|Domain controllers, DNS, file servers and application servers|
|**Evidence Network or Storage**|Controlled transfer and preservation of evidence|Forensic workstation, evidence repositories and exported logs|

## Architectural Relationship

The intended traffic flow is:

**Internet/NBN â†’ ASUS TUF BE9400 â†’ Lab uplink â†’ MS-A2 virtual firewall â†’ Isolated lab networks**

Blackstone Fortress receives telemetry from the relevant systems but should not automatically be placed inside the attacker or victim networks. Wazuh agents, syslog forwarding and controlled firewall rules should transport telemetry into the monitoring environment.

Bertha should access the MS-A2 and Blackstone Fortress through the management network. Direct connectivity from attacker systems to Bertha should be denied unless temporarily required for a documented exercise.

## Shared-Service Consideration

Running Pi-hole and Wazuh on Blackstone Fortress is acceptable for the current lab scale, but the architecture documentation should record the following limitation:

> Blackstone Fortress hosts both security monitoring and DNS infrastructure. An outage, configuration error or compromise affecting this server could simultaneously reduce DNS availability and security visibility. This consolidation is accepted during the initial implementation to reduce hardware requirements and may be separated in a future architecture revision.

## Visual Representation

![1200](/cybersecurity-portfolio/images/projects/dfir-homelab/assets/diagrams/dfir-homelab-network-architecture.png)
