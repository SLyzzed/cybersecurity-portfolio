---
title: "VAmPI — Unauthorised API Data Access"
description: "An isolated API incident investigation confirming cross-user data exposure and account takeover, with Wazuh telemetry, DFIR-IRIS evidence and verified containment of the exposed endpoint."
date: 2026-11-27
status: published
infrastructureRefs: [ludus]
---

*The date above is the publication date.*

## Objective and environment

I built an isolated API investigation environment using Ludus and Proxmox to reproduce API security failures under controlled conditions, investigate the resulting telemetry and practise incident response.

- **Kali Linux** was the test client.
- **Ubuntu 24.04** ran VAmPI behind an Nginx reverse proxy.
- **Wazuh** collected searchable request telemetry.
- **DFIR-IRIS** held the investigation and case evidence.

**Request flow:** Kali test client → Nginx reverse proxy → VAmPI on Ubuntu.

**Evidence flow:** Nginx JSON request logs → Wazuh agent on Ubuntu → Wazuh manager. I reviewed the events and exported the evidence for manual import into DFIR-IRIS.

## Confirmed exploitation

### Broken object-level authorisation

An authenticated lab user retrieved a protected book belonging to another test user. The API returned HTTP 200, and the response contained verified victim-owned test data. I classified this as broken object-level authorisation (BOLA), OWASP API1:2023.

### Unauthorised password change and account takeover

A password change on another test account returned HTTP 204. Subsequent login tests showed that the changed password worked and the original password failed. Together with the password-change response, those tests confirmed account takeover in the lab.

## Telemetry and detection limits

The Wazuh agent on Ubuntu collected Nginx JSON request logs and made them searchable in Wazuh. I could correlate requests with the test activity, but the logs alone did not show whether an otherwise valid request was authorised. To establish unauthorised access, I needed to know which account made the request, who owned the resource or account it targeted, and what the application actually did.

- I had not implemented custom detection rules or automated alerts for this activity.
- The logs did not identify the authenticated JWT principal or establish who owned the targeted resource.
- Successful and unsuccessful login requests both returned HTTP 200. That status alone could not establish which login succeeded.

Correlation helped me find the relevant requests. The API responses, known test-account ownership and subsequent login tests established the cross-user data exposure and account takeover.

## Investigation and response

I documented the investigation in DFIR-IRIS Case #3 and reviewed 14 API requests from the test source. I correlated the cross-user book access, password change and subsequent login tests with the corresponding Wazuh request events.

- The case timeline recorded exploitation, account takeover and containment.
- I exported the Wazuh JSONL evidence and recorded its SHA-256 integrity hash.
- I preserved a post-attack Proxmox snapshot.

![DFIR-IRIS timeline showing confirmed BOLA exploitation, account takeover and API containment.](/cybersecurity-portfolio/images/projects/vampi-incident-investigation/iris-timeline.png)

*DFIR-IRIS timeline documenting cross-user data exposure, account takeover and containment of the exposed endpoint.*

The timeline supports the documented sequence of events. The recovered publication materials do not include the original API response captures, the Wazuh JSONL export, its SHA-256 digest or the Proxmox snapshot. The evidence-handling actions above come from the investigation record. I could not independently inspect or verify those artifacts from the recovered materials.

I stopped the Nginx reverse proxy to contain the exposed API. A subsequent connectivity test confirmed that the Kali system could no longer reach the API through that endpoint.

Stopping the reverse proxy contained access through the endpoint I tested. The test did not establish whether other access paths existed. Stopping the proxy also left the underlying application vulnerabilities in place. Recovery and remediation remained outstanding in the lab. I did not patch the vulnerabilities or recover the victim account, and JWT revocation was neither performed nor independently verified.

## Results and lessons learned

I confirmed cross-user data exposure and account takeover in the lab. Searchable logs helped me find the requests, but investigative visibility depended on the application recording who acted, which resource they targeted and what the action did. A request can look valid on its own. To judge whether it was authorised, I needed to know how the caller related to the resource or account. The login tests also showed why an HTTP status code can be an unreliable proxy for a security outcome.

For detection engineering, I would check the quality and context of the telemetry before writing a rule. A rule built on these request logs would inherit the same blind spots about identity, ownership and authentication outcomes. The response also reinforced the distinction between containment and remediation. Taking the proxy offline addressed access through the tested endpoint. Remediation would require correcting the application flaws that allowed the access and password change.

My recommendations were to:

- Enforce resource-level ownership checks.
- Apply appropriate authorisation controls to account password changes.
- Record an appropriate authenticated principal identifier and meaningful authentication outcomes in audit logs. Keep raw JWTs, passwords and other credentials out of those logs.
- Develop correlation rules for suspicious API activity.

[All projects](/cybersecurity-portfolio/projects/)
