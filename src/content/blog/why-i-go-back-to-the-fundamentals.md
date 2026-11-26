---
title: "Why I Go Back to the Fundamentals"
description: "A reflection on what small experiments teach me about detection, evidence and the alerts I see at work."
date: 2026-11-27
authorAlias: "Slyzzed"
category: "Technical Reflections"
status: published
---

When I built the [API Threat Detector](/cybersecurity-portfolio/projects/api-threat-detector/), two legitimate requests were flagged because they contained examples of suspicious input. The rules had found the patterns I'd asked them to find. To understand the result, I had to ask a different question: what did those patterns mean in the context of the request?

That's why I like going back to the fundamentals. Security platforms make it possible to search, correlate and triage more activity than I could work through manually. When I'm trying to understand how a result was reached, though, a small experiment gives me room to examine the decisions the tooling usually handles for me.

## Make the question small enough to test

I use APIs regularly, but I wanted a better feel for what a detector can learn from a request. Writing a few rules made me decide which fields to inspect, what to count as a match and how much weight to give it. Those decisions are easy to skim past when I'm looking at a finished verdict.

The false positives gave me a concrete example. A request can contain text that resembles an attack because someone is discussing or documenting one. A pattern match tells me what the rule found. To decide what it means, I'd also want to understand how the application handles that input and whether it's ordinary for people to submit text like it. My small synthetic dataset showed the distinction clearly. It left open how often the same problem would occur in live traffic.

## Follow one event all the way through

I took a similar approach with the [first investigation in my Ludus range](/cybersecurity-portfolio/incident-investigations/powershell-tcp-callback/). I wanted to know whether I could generate a known network event, find it in Wazuh and carry the evidence into a case in DFIR-IRIS. I kept the activity deliberately simple so I could check each part of that workflow before relying on it for a more involved investigation.

Sysmon recorded the connection, and I found the event in Wazuh. I could see which process made the connection and where it went. That gave me enough to investigate and document the activity. Whether an automated alert fired was a separate question, and I hadn't verified it.

Keeping the experiment small also helped me think through what a missing result would mean. If I couldn't find the event, I'd want to know whether the connection had happened, whether the endpoint had recorded it and whether the record had made it to Wazuh. Each answer would send me somewhere different.

## What I take into the next investigation

These experiments reinforce the smaller decisions I make within my existing workflow. When I see an alert at work, I have a better feel for what might have caused it to fire, what the underlying evidence can tell me and what I'd need to check before drawing a conclusion. Following a single event through the lab helps me make sense of the results I see on the job.

Each experiment also reminds me how broad cybersecurity is. I can spend time on one narrow question, come away with a better understanding of it and still feel like I've only scratched the surface. That's part of what keeps me coming back.
