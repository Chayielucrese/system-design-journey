---
title: "Part 1: Answering the Framework"
description: "My notes on the first phase of system design: requirements, estimation, API, data model, components and bottlenecks."
---

# Part 1: Answering the Framework

::: info Learning in public
I'm early in my system design journey, so this is my current understanding. I expect to revisit and correct parts of it as I learn more.
:::

## Data first, features second

The biggest lesson so far: systems are more **data intensive** than **compute intensive**.

Think about it. Without data in the system, would any feature do anything? They would all sit idle. An application is really about how data changes, flows and gets manipulated. Performance and features come after that.

With that in mind, let's look at one of the most important phases in system design: **answering the framework**.

## What is it about?

Answering the framework is the phase where you decide on the requirements, estimations, API, data model, main components and bottlenecks of a system. It has six parts:

| # | Part | The question it answers |
|---|------|-------------------------|
| 1 | Requirements | What should the system do, and how well? |
| 2 | Estimation | How big is it? |
| 3 | API | How do clients talk to it? |
| 4 | Data model | What data do we store, and where? |
| 5 | Main components | What are the building blocks? |
| 6 | Bottlenecks | What is slow, and what can break? |

![The six parts of the framework](/.vitepress/theme/framing.png)

You have to answer each part to get a clearer picture of what the system may look like. Below I walk through each one with a small example.

## 1. Requirements

Here we identify what the system must do and the qualities it must have.

### Functional requirements

These answer: **"What can the system do?"**

We usually group them by the **actors** in the system. For example, in a booking app:

**Admin**
- Creates and manages user accounts
- Views global financial statistics

**Staff**
- Reviews and approves new partner accounts
- Manages partner agreements

**Customer**
- Signs up, or uses SSO (Single Sign-On)
- Searches for a vehicle by category, date and location

### Non-functional requirements

These answer: **"What qualities should the application have?"**

Typical things to consider:

- Scalability
- Reliability
- Availability
- Performance
- Security
- Maintainability

## 2. Estimation

Estimation is how I work out how big the application will get. I estimate requests per second, queries per second and storage per year, starting from assumptions I state (for example, bookings per day).

From those numbers I set two targets:

- **Latency**: how long a request should take (for example, under 20 ms).
- **Throughput**:  how many requests per second the system should handle, with room above the expected peak.

For example, for my booking app:
I estimate about **500** requests per second at peak, so I'm aiming to handle **1,000 **.


## 3. API

The API lists the main endpoints and methods. For each one, think about what goes in, what comes out and who is allowed to call it. Add **idempotency** where needed (I'll cover that in a later chapter).

For example, a few admin endpoints:

| Action | Endpoint |
|--------|----------|
| Create a staff account | `POST /api/v1/admin/staff` |
| List all staff accounts | `GET /api/v1/admin/staff` |
| Create a pricing plan | `POST /api/v1/admin/plans` |
| View global financial metrics | `GET /api/v1/admin/dashboard/financials/overview` |


## 4. Data model

Here we identify the **entities**, their **main fields**, and the **relationships** between them.

::: tip ERD, not a Class Diagram
At this stage, we are sketching an **Entity-Relationship Diagram (ERD)**—not an object-oriented class diagram. We aren't modeling methods, inheritance, or business logic yet; we are strictly mapping out what data gets stored, its primary/foreign keys, and how tables relate (`1:1`, `1:N`, `M:N`).
:::

You don't need to draw this by hand—tools like **dbdiagram.io**, **Eraser.io**, **DrawSQL**, **Excalidraw**, or **Mermaid** make it fast to sketch and iterate on schemas.

Beyond the diagram, you also need to justify your choice of database (e.g., SQL vs. NoSQL) and decide whether your access patterns require **joins**, **simple key-value lookups**, or **ACID transactions**.

![Data model ERD](/.vitepress/theme/framing4.png)

## 5. Main components

Here we identify the **building blocks** of the system (clients, API gateways, services, databases, caches, and queues) and how data flows between them to get the job done.

::: tip Sketch first, refine second
Start with a rough **boxes-and-arrows sketch** to map out the big picture and core request paths without getting lost in implementation details. Once the flow makes sense, it is advisable to draw a **component diagram** to explicitly identify all internal modules, infrastructure layers, and the **dependencies between them** (who calls whom, and what depends on what).
:::

You can create both quickly using tools like **Excalidraw**, **Eraser.io**, **draw.io (diagrams.net)**, **Lucidchart**, or **Mermaid**.

### 1. High-level sketch

A simple bird's-eye view showing the main entry points, core modules, and primary data store.

![High-level sketch](/.vitepress/theme/framing2.png)

### 2. Detailed component diagram

A structured **component diagram** that breaks down internal modules, shared guards/services, external providers, and the exact dependencies connecting them.

![Detailed component diagram](/.vitepress/theme/framing3.png)

## 6. Bottlenecks

This part asks:

- What is slow?
- What is a single point of failure?
- What happens if two things happen at the same time?

I split bottlenecks into two categories.

### Correctness bottlenecks

These matter **even with few users**.

**Double booking (booking + availability).** Two customers book the same vehicle for the same time slot at the same moment. A check-then-insert flow isn't safe, because both checks can pass before either insert happens.

Options to consider:

- A Postgres transaction with a row lock
- An exclusion constraint on the vehicle and time range
- A short-lived Redis lock

### Performance bottlenecks

These show up **as the system grows**.

**Permission checks (auth and RBAC).** The guard runs on every request, and with roles plus user-level overrides that means several database reads each time.

A fix: cache the resolved permissions per user in Redis, and clear that cache whenever roles change.


## Wrapping up

Answering the framework doesn't require getting every number or box right on the first try. The goal is to force yourself to think about **scale, data flow, and failure modes** before writing a single line of code.

Even a rough pass through these six steps uncovers critical edge cases like double bookings or slow permission checks that are far cheaper to fix on paper than in production.

The hardest part of this phase for me was **estimation** knowing which numbers to pick and how to justify them. In **Part 2**, I'll dive into **back-of-the-envelope estimation** to work out realistic load numbers for my booking app and measure a baseline for one of its endpoints.
