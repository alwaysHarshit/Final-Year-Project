
---

### 🧰 **3️⃣ server_1 / server_2 / server_3 (same README for all)**
```markdown
# Worker Server

Each worker server processes tasks assigned by the master server.  
It reads pending tasks from the shared folder, performs computation, and saves results back.

### Responsibilities
- Monitors shared task file.
- Processes assigned or pending tasks.
- Saves completed results in `/shared/processed`.

### Runs As
Docker container with a shared volume connected to the master.

### Commands
```bash
npm install
npm start
