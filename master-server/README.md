
---

### ⚙️ **2️⃣ master-server/README.md**
```markdown
# Master Server

The master server coordinates tasks between the client and worker servers.  
It receives tasks from the client, stores them in the shared folder, and tracks their status.

### Responsibilities
- Accepts tasks from the client.
- Writes new tasks to the shared volume.
- Monitors progress and updates task statuses.
- Communicates with worker servers through the shared folder.

### Runs On
Port: `3000`

### Commands
```bash
npm install
npm start
