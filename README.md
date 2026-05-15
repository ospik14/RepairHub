# 🛠 RepairHub CRM

<p align="center">
  <img src="assets/logo.png" width="200" alt="RepairHub Logo">
</p>

**Service center automation system: from device intake to printing the receipt.**

## 📖 About the project 

**RepairHub CRM** — is a comprehensive solution for small and medium-sized service centers. The project was born as a response to the chaos of "paper" accounting. When orders are written down on slips of paper, spare parts get lost in the warehouse, and calculating profits at the end of the month turns into a quest — the business loses money.

This system turns chaos into a clear algorithm:
* **No lost clients:** the entire interaction history is in one place.
* **Transparent warehouse:** instant control over spare parts stock.
* **Financial discipline:** automatic calculation of labor costs and reporting.

For me, this project became a challenge in designing complex systems with access control and asynchronous architecture.

---

## 🛡 Security and Reliability 

The project is built considering modern data security standards:

* **Multi-level Authorization:** Utilizes **OAuth2** with **JWT (JSON Web Tokens)**. A system with `access` and `refresh` tokens is implemented, ensuring a stable and secure session.
* **Password Protection:** No plain-text passwords in the database. Reliable hashing is used.
* **Closed Registration:** A new employee can **only be created by an administrator**. This prevents random people from appearing in the system.
* **Role-Based Access Control (RBAC):** Each user sees only what is allowed by their role. A manager cannot delete an employee, and a technician won't change prices in the warehouse.

---

## 🚀 Key Functionality 

### 👨‍💼 Manager Module 
* **Fast Intake:** Search for a client by phone number or create a new one in a few clicks.
* **Order Processing:** Registering a device, describing the problem, and instantly putting it to work.
* **Handover and Checkout:** Convenient search for completed orders and **automatic receipt generation** for the client.

### 🛠 Technician Module 
* **Workspace:** List of available orders ("Free") and personal dashboard ("My Orders").
* **Repair Management:** Changing statuses, adding used parts from the warehouse, and recording the cost of completed work.
* **Auto-calculation:** The system automatically calculates the final amount (technician's labor + parts price).

### 👑 Administrator Module 
* **HR Management:** Full control over the staff (creating, editing, dismissing employees).
* **Warehouse Control:** Monitoring stock, adding new items, and editing existing ones.
* **Statistics Dashboard:** Visual indicators of monthly revenue, the number of closed orders, and notifications about low stock parts.

---

## 🛠 Technology Stack 

**Backend:**
* **FastAPI:** High-performance framework for building APIs.
* **SQLAlchemy (Async):** Working with the database in non-blocking mode.
* **PostgreSQL:** Powerful relational database.
* **Pydantic:** Data validation and strict typing.

**Frontend:**
* **Vanilla JavaScript (ES6+):** The entire frontend is written without heavy frameworks for maximum speed and understanding of basic Web API principles.
* **Bootstrap 5:** Modern and responsive UI.

**DevOps:**
* **Docker & Docker Compose:** The project is fully containerized for quick deployment in any environment.

---

## 📸 Screenshots (Screenshots)


![Manager Interface](assets/screen4.png) ![Master Interface](assets/screen7.png) ![Master Interface](assets/screen2.png)

---

## 🐳 Quick Start (Installation)

You do not need to install Python or PostgreSQL. It is enough to have **Docker** installed.

1. Clone the repository:
   ```bash
   git clone [https://github.com/ospik14/repairHub.git](https://github.com/ospik14/repairHub.git)
   cd repairHub

2. Run the system:
    ```bash

    docker-compose up --build

3. The application will be available at: http://localhost:8000

## 🔮 Roadmap 

  * Integration with Telegram API to notify clients when ready.

  * Advanced financial reporting module (profit/expense charts).

  * Mobile app for technicians (React Native).
