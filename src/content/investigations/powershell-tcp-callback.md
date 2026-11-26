---
title: "PowerShell TCP Callback — End-to-End Investigation Validation"
description: "A controlled Ludus lab investigation tracing a PowerShell network connection through Sysmon, Wazuh and DFIR-IRIS."
date: 2026-11-26
status: published
infrastructureRefs: [ludus]
---

*The date above is the publication date.*

I used a controlled PowerShell TCP callback to see whether I could trace a known network connection from a Windows endpoint through Sysmon and Wazuh into a documented case in DFIR-IRIS.

## Why I kept the test simple

I deliberately kept the initial proof of concept simple. Before investing time in a more complex investigation, I wanted to establish that the environment worked as intended. The last thing I wanted was to get halfway through a research project and discover that the telemetry I needed wasn't being collected or that part of the infrastructure wasn't configured correctly.

## Objectives and expected outcomes

- Confirm that the controlled connection could cross the lab segments through the intended network rule.
- Check that Sysmon recorded the connection and that I could find the event in Wazuh and identify the process, endpoints and destination port.
- Export the event, preserve it as evidence, and document and close the case in DFIR-IRIS.

## 1. Range deployment

I deployed the segmented range through Ludus, with separate systems for the Windows and Kali test endpoints, monitoring and case management. The callback required an explicit inter-VLAN rule between the test systems.

![Ludus range architecture showing segmented attacker, victim, monitoring, and case-management systems.](/cybersecurity-portfolio/images/poc_test/ludus/ludus-range-architecture.png)

*Segmented Ludus range used for the investigation POC.*

## 2. Controlled PowerShell callback

I ran the controlled callback on the Windows test endpoint, BR-WIN11, and observed the connection on BR-kali over TCP port 4444. The exercise generated a network connection without opening an interactive shell.

![PowerShell command used to execute the controlled TCP callback from BR-WIN11.](/cybersecurity-portfolio/images/poc_test/ludus/ludus-range-callback-command.png)

*Controlled PowerShell callback executed on BR-WIN11.*

![Callback response received on BR-kali from the Windows victim system.](/cybersecurity-portfolio/images/poc_test/ludus/ludus-range-callback-response.png)

*Callback received on BR-kali over TCP port 4444.*

## 3. Wazuh telemetry

Sysmon Event ID 3 records a network connection and associates it with the process that made it. I found the event in Wazuh and could match the process and destination fields to the activity I had generated. That made the record useful evidence for the investigation and verified that the telemetry had been collected and was searchable.

| Evidence field | Observed value |
| --- | --- |
| Source | BR-WIN11 (Windows test endpoint) |
| Destination | BR-kali (Kali test endpoint) |
| Destination port | 4444/TCP |
| Process | powershell.exe |

I mapped the observed PowerShell activity to MITRE ATT&CK T1059.001 (PowerShell) during analysis. This mapping was my interpretation of the activity, separate from the fields I observed in the event and from any automated alert.

![Wazuh evidence from the lab endpoint showing the Sysmon PowerShell network connection event.](/cybersecurity-portfolio/images/poc_test/wauah/wazuh-endpoint-evidence.png)

*Sysmon network connection telemetry collected in Wazuh.*

## 4. DFIR-IRIS investigation and closure

I reviewed the event in Wazuh, exported it as evidence and documented the investigation in DFIR-IRIS. I closed the case as an authorised lab simulation with no containment required.

![DFIR-IRIS investigation summary documenting the PowerShell callback lab simulation and case closure.](/cybersecurity-portfolio/images/poc_test/iris/summary.png)

*Completed investigation and case closure in DFIR-IRIS.*

## Outcome, limitations and lessons learned

The connection crossed the intended lab segments, the PowerShell network event was collected and searchable in Wazuh, and I preserved the evidence and closed the case in DFIR-IRIS. That met the objectives of the proof of concept.

I verified telemetry collection and searchability. Whether an automated threat detection alert fired remained unverified. The test covered one controlled activity inside the range. I did not use it to assess detection coverage for other behaviours or verify isolation from my household network.

Starting with one known activity gave me a way to check each stage of the workflow separately. The explicit inter-VLAN rule also showed why I need to distinguish a connection that never happened from an event that happened but was never collected.
