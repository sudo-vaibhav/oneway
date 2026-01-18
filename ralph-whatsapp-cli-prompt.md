# Ralph Wiggum Loop: OneWay WhatsApp TUI Builder

**Project Name:** `oneway`  
**Command:** `oneway`  
**Description:** Interactive Terminal UI for one-way WhatsApp communication

## Mission
Build a Bun-based WhatsApp interactive TUI (Terminal User Interface) app for one-way communication (send/search only, no live updates). App launches with `oneway` command and provides a Claude Code-like interface with contact list, interactive navigation, and message sending. Use TDD, iterate until all tests pass and requirements met, then output `<promise>COMPLETE</promise>`.

---

## Requirements Checklist

### Phase 1: Core Infrastructure ✓
- [ ] Initialize Bun project with TypeScript
- [ ] Install whatsapp-web.js and TUI dependencies (ink, ink-text-input, ink-select-input)
- [ ] Create project structure (src/ui/, src/whatsapp/, src/db/, tests/)
- [ ] Setup SQLite with Bun's built-in DB
- [ ] WhatsApp client connection working
- [ ] Session persistence working
- [ ] **Verification**: Can scan QR and connect

### Phase 2: Database & Message Sync ✓
- [ ] SQLite schema for messages and chats
- [ ] Fetch messages on app start (last 100 per chat)
- [ ] Store messages in SQLite with timestamps
- [ ] Deduplicate messages by WhatsApp message ID
- [ ] Extract and cache contact/group list
- [ ] Index for fast searching
- [ ] **Verification**: Messages and chat list persist across app runs

### Phase 3: TUI Framework & Navigation ✓
- [ ] Main App component using Ink (React for terminal)
- [ ] Home screen with menu options
- [ ] Contact/Group list view (scrollable, searchable)
- [ ] Navigation with keyboard (arrow keys, enter, esc)
- [ ] Screen transitions (home → contacts → compose → send)
- [ ] Status bar showing current screen and shortcuts
- [ ] **Verification**: Can navigate through all screens smoothly

### Phase 4: Send Message Interface ✓
- [ ] Contact/Group selection screen with search filter
- [ ] Message composition with multi-line text input
- [ ] Send confirmation prompt
- [ ] Success/error feedback in UI
- [ ] Return to home after send
- [ ] **Tests Pass**: Unit tests for send logic

### Phase 5: Search Interface ✓
- [ ] Search input screen
- [ ] Full-text search in SQLite
- [ ] Results view with navigation
- [ ] Highlight search terms in results
- [ ] Filter by chat/group
- [ ] **Tests Pass**: Search tests with fixtures

### Phase 6: Global Command Setup ✓
- [ ] Create standalone executable with Bun
- [ ] Install as global `oneway` command
- [ ] Auto-initialize WhatsApp on first launch
- [ ] Auto-sync messages on every launch
- [ ] Graceful exit and cleanup
- [ ] **Verification**: `oneway` launches from anywhere

### Phase 7: E2E Testing ✓
- [ ] E2E test: Launch TUI and send to 'test group'
- [ ] E2E test: Self (sender) number will always be '+91 93197 40960'
- [ ] E2E test: Launch TUI and send to '+91 92203 92556'
- [ ] E2E test: Search messages from 'test group'
- [ ] E2E test: Verify contact list displays correctly
- [ ] E2E tests check for auth session before running
- [ ] E2E tests show helpful error message if not authenticated
- [ ] E2E tests can be skipped with SKIP_E2E=true
- [ ] **Tests Pass**: E2E tests confirm real WhatsApp integration
- [ ] **Note**: Developer must authenticate manually once before E2E tests work

### Phase 8: Quality & Polish ✓
- [ ] No message event listeners (verified!)
- [ ] All tests passing (>80% coverage)
- [ ] TypeScript with no `any` types
- [ ] README with usage examples and screenshots
- [ ] README shows project name 'OneWay' prominently
- [ ] Error recovery for network issues
- [ ] Smooth keyboard navigation
- [ ] **Final Check**: Run full test suite

---

## Authentication Strategy

### Regular Use (Production)

**Session Storage Location:**
- Production: `~/.oneway/.wwebjs_auth/` (user home directory)
- Development/Testing: `./data/.wwebjs_auth/` (project directory)

**Authentication Flow:**

1. **First Launch:**
   <code>
   $ oneway
   🔐 Initializing WhatsApp client...
   📱 Scan this QR code with WhatsApp:
   
   ████ ▄▄▄▄▄ █▀█ █▄▄▀▄█ ▄▄▄▄▄ ████
   ████ █   █ █▀▀▀█ ▀ ▀█ █   █ ████
   ...
   
   Waiting for authentication...
   ✅ Authenticated! Starting OneWay...
   [TUI launches]
   <code>

2. **Subsequent Launches:**
   <code>
   $ oneway
   🔐 Loading saved session...
   ✅ Connected! Syncing messages...
   [TUI launches immediately]
   <code>

3. **Session Expired:**
   <code>
   $ oneway
   🔐 Loading saved session...
   ⚠️  Session expired. Re-authenticating...
   📱 Scan QR code again:
   [Shows QR]
   <code>

**Implementation:**
- Check auth status BEFORE launching TUI
- QR display in plain terminal (not Ink)
- Only launch TUI after successful auth
- Use environment variable for auth path: `ONEWAY_AUTH_PATH`

### E2E Testing Authentication

**Challenge:**
E2E tests need WhatsApp authenticated, but can't scan QR during automated tests.

**Solution:**

**Manual Pre-Authentication Required:**
<code>bash
# Step 1: Developer authenticates once
bun run src/index.tsx
# [Scans QR code, creates session in ./data/.wwebjs_auth/]
# [Exits TUI]

# Step 2: Session is now available for E2E tests
bun test tests/e2e/
# Tests reuse the authenticated session
<code>

**E2E Test Setup:**
<code>typescript
// tests/e2e/setup.ts
import { initClient } from '../../src/whatsapp/client';
import { existsSync } from 'fs';

export async function ensureAuthenticated() {
  const authPath = './data/.wwebjs_auth/';
  
  if (!existsSync(authPath)) {
    throw new Error(
      '❌ E2E tests require authentication first.\n' +
      '   Run: bun run src/index.tsx\n' +
      '   Scan QR code, then exit and run tests again.'
    );
  }
  
  // Use existing session
  await initClient();
}
<code>

**E2E Test Execution:**
<code>bash
# First time only - authenticate manually
ONEWAY_AUTH_PATH=./data/.wwebjs_auth bun run src/index.tsx
# [Scan QR, wait for 'WhatsApp ready', then Ctrl+C]

# Now run E2E tests (reuses session)
bun test tests/e2e/

# Or skip E2E entirely during development
SKIP_E2E=true bun test
<code>

**CI/CD Strategy:**
- **Option 1 (Recommended)**: Skip E2E in CI
  <code>yaml
  # .github/workflows/test.yml
  - name: Run tests
    run: SKIP_E2E=true bun test
  <code>

- **Option 2 (Advanced)**: Pre-baked auth session
  <code>yaml
  # Store authenticated session as GitHub secret/artifact
  # Restore before running E2E tests
  # SECURITY RISK: Session data is sensitive!
  <code>

**Best Practice:**
- E2E tests are **developer-local only**
- CI runs unit tests only
- Add to README: 'E2E tests require manual WhatsApp authentication'
- Session expires every ~2 weeks, re-auth needed

---

## Tech Stack (Bun-First)

<code>
Runtime: Bun (not Node.js)
Database: Bun's SQLite (import { Database } from 'bun:sqlite')
Package Manager: bun install
Test Runner: bun test
TypeScript: Built-in to Bun
TUI Framework: Ink (React for terminal)
Scripts:
  - bun run src/index.tsx         # Launch TUI app
  - oneway                         # Global command (after install)
  - bun test tests/unit/           # Fast unit tests
  - bun test tests/e2e/            # E2E tests (requires WhatsApp)
  - SKIP_E2E=true bun test         # Skip E2E during development
Dependencies:
  - whatsapp-web.js                # WhatsApp Web API
  - ink                            # React-based TUI framework
  - ink-text-input                 # Text input component
  - ink-select-input               # Selection/list component
  - ink-spinner                    # Loading spinner
  - react                          # Required by Ink
<code>
<code>

---

## Project Structure

<code>
oneway/
├── package.json
├── tsconfig.json
├── README.md
├── bin/
│   └── oneway.ts             # Global executable entry point
├── src/
│   ├── index.tsx             # Main TUI app entry
│   ├── ui/
│   │   ├── App.tsx           # Root TUI component
│   │   ├── screens/
│   │   │   ├── Home.tsx      # Main menu
│   │   │   ├── ContactList.tsx  # Contact/group selection
│   │   │   ├── Compose.tsx   # Message composition
│   │   │   └── Search.tsx    # Search interface
│   │   ├── components/
│   │   │   ├── StatusBar.tsx
│   │   │   ├── ChatListItem.tsx
│   │   │   └── MessageInput.tsx
│   │   └── hooks/
│   │       ├── useNavigation.ts
│   │       └── useKeyboard.ts
│   ├── whatsapp/
│   │   ├── client.ts         # WhatsApp connection
│   │   └── sync.ts           # Message fetching on start
│   ├── db/
│   │   ├── schema.ts         # SQLite schema
│   │   ├── messages.ts       # Message CRUD
│   │   ├── chats.ts          # Chat/contact list CRUD
│   │   └── search.ts         # Search queries
│   └── utils/
│       ├── validators.ts
│       └── formatters.ts
├── tests/
│   ├── unit/
│   │   ├── validators.test.ts
│   │   ├── send.test.ts
│   │   └── search.test.ts
│   └── e2e/
│       ├── send-to-group.test.ts
│       ├── send-to-contact.test.ts
│       └── search-messages.test.ts
└── data/
    ├── whatsapp.db           # SQLite database
    └── .wwebjs_auth/         # Session data
<code>

---

## Self-Correction Protocol

### After Each Build Iteration:
1. **Run Unit Tests**: `bun test tests/unit/`
   - If ANY test fails → read failure, fix code, re-test
   - If coverage < 80% → write more tests
   
2. **Type Check**: `bun build src/index.tsx`
   - If compilation fails → fix TypeScript errors
   - No `any` types allowed → add proper types
   - Ensure React/Ink types are correct

3. **Manual TUI Verification**:
   - Can launch TUI: `bun run src/index.tsx`
   - Home screen displays correctly?
   - Can navigate to contact list?
   - Contact list shows chats?
   - Can compose and send test message?
   - Search interface works?
   - No incoming message handlers in code?

4. **Global Command Test**:
   - `bun link` succeeds?
   - `oneway` command accessible from different directory?
   - App launches and initializes correctly?

5. **E2E Tests (Final Phase)**:
   - `bun test tests/e2e/` → All tests must pass
   - Sends to 'test group' successfully
   - Sends to '+91 92203 92556' successfully  
   - Searches and finds messages from 'test group'

6. **Check Phase Completion**:
   - Review checklist above
   - Mark completed phases
   - Move to next phase OR fix current phase

### If Stuck After 5 Iterations:
- Document what's blocking progress
- Check Ink documentation for TUI issues
- Try alternative TUI approach (simpler components)
- Simplify requirement if too complex
- Add more debug logging
- For TUI rendering issues, check React component structure

---

## TUI Interface Example

When you run `oneway`, the interface should look like this:

<code>
═══════════════════════════════════════
  OneWay - One-Way WhatsApp
═══════════════════════════════════════
Use ↑↓ arrows to navigate, Enter to select

> 📤 Send Message
  🔍 Search Messages
  ❌ Exit
<code>

After selecting 'Send Message', you see the contact list:

<code>
Select Contact / Group
Press / to filter, Esc to go back

> 👥 test group
  👤 +91 92203 92556
  👥 Family Group
  👤 John Doe
<code>

After selecting a contact, compose your message:

<code>
Send to: test group
Type your message and press Enter. Esc to cancel.

Message: Hey everyone, quick status update_
<code>

---

## Implementation Guide

### Step 1: Initialize Project
<code>bash
mkdir oneway && cd oneway
bun init -y
bun add whatsapp-web.js ink ink-text-input ink-select-input ink-spinner react qrcode-terminal chalk
bun add -d @types/react
mkdir -p src/ui/{screens,components,hooks} src/{whatsapp,db,utils} tests/{unit,e2e} data bin
<code>

**Update package.json:**
<code>json
{
  'name': 'oneway',
  'version': '1.0.0',
  'bin': {
    'oneway': './bin/oneway.ts'
  },
  'scripts': {
    'dev': 'bun run src/index.tsx',
    'test': 'bun test',
    'test:unit': 'bun test tests/unit/',
    'test:e2e': 'bun test tests/e2e/',
    'install-global': 'bun link'
  },
  'dependencies': {
    'whatsapp-web.js': '^1.23.0',
    'ink': '^4.4.1',
    'ink-text-input': '^5.0.1',
    'ink-select-input': '^5.0.0',
    'ink-spinner': '^5.0.0',
    'react': '^18.2.0',
    'qrcode-terminal': '^0.12.0',
    'chalk': '^4.1.2'
  },
  'devDependencies': {
    '@types/react': '^18.2.0'
  }
}
<code>

**Create .gitignore:**
<code>
node_modules/
dist/
data/.wwebjs_auth/
data/*.db
.DS_Store
*.log
<code>

**IMPORTANT:** Never commit WhatsApp session data (.wwebjs_auth/) to version control!

**Note on TUI:**
- TUI (Terminal User Interface) using Ink provides a Claude Code-like experience
- Takes over the terminal with interactive components
- Keyboard navigation (arrows, enter, esc, ctrl+c)
- E2E tests require WhatsApp authentication

**Note on Global Command:**
- App will be installed globally as `oneway`
- Run `bun link` to install globally
- Can be launched from anywhere in terminal
- Auto-syncs messages on every launch

### Step 2: SQLite Schema (src/db/schema.ts)
<code>typescript
import { Database } from 'bun:sqlite';

const db = new Database('data/whatsapp.db');

// Messages table
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    chat_name TEXT,
    body TEXT,
    timestamp INTEGER,
    from_me INTEGER,
    is_group INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

// Chats table (for contact/group list)
db.run(`
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_group INTEGER,
    last_message_time INTEGER,
    unread_count INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

// Indexes
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_body ON messages(body)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chat_name ON messages(chat_name)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_chats_name ON chats(name)`);

export { db };
<code>

### Step 3: WhatsApp Client (src/whatsapp/client.ts)
<code>typescript
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';

let client: Client | null = null;
let isReady = false;

// Get auth path from environment or use default
const getAuthPath = () => {
  return process.env.ONEWAY_AUTH_PATH || './data/.wwebjs_auth';
};

export async function initClient(): Promise<Client> {
  if (client && isReady) return client;

  const authPath = getAuthPath();
  
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: { 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  return new Promise((resolve, reject) => {
    let qrAttempts = 0;
    const MAX_QR_ATTEMPTS = 3;

    client!.on('qr', (qr) => {
      qrAttempts++;
      if (qrAttempts > MAX_QR_ATTEMPTS) {
        console.log(chalk.red('❌ Too many QR attempts. Please restart.'));
        reject(new Error('QR scan timeout'));
        return;
      }
      
      console.log(chalk.cyan('\n📱 Scan this QR code with WhatsApp:\n'));
      qrcode.generate(qr, { small: true });
      console.log(chalk.yellow(`\nAttempt ${qrAttempts}/${MAX_QR_ATTEMPTS}`));
      console.log(chalk.gray('Waiting for authentication...\n'));
    });

    client!.on('authenticated', () => {
      console.log(chalk.green('✅ Authenticated successfully'));
    });

    client!.on('ready', () => {
      isReady = true;
      console.log(chalk.green('✅ WhatsApp client ready!\n'));
      resolve(client!);
    });

    client!.on('auth_failure', (msg) => {
      console.log(chalk.red('❌ Authentication failure:', msg));
      reject(new Error('Authentication failed'));
    });

    client!.on('disconnected', (reason) => {
      console.log(chalk.yellow('⚠️  Disconnected:', reason));
      isReady = false;
    });

    // CRITICAL: No message event listeners to avoid distractions
    // client.on('message', ...) deliberately omitted

    console.log(chalk.cyan('🔐 Initializing WhatsApp client...'));
    client!.initialize().catch(reject);
  });
}

export function getClient(): Client {
  if (!client || !isReady) {
    throw new Error('Client not initialized. Call initClient() first.');
  }
  return client;
}

export async function closeClient(): Promise<void> {
  if (client) {
    await client.destroy();
    client = null;
    isReady = false;
  }
}
<code>

### Step 4: Message Sync on Start (src/whatsapp/sync.ts)
<code>typescript
import { getClient } from './client';
import { db } from '../db/schema';

export async function syncMessages() {
  console.log('🔄 Syncing messages and chats...');
  const client = getClient();
  const chats = await client.getChats();
  
  let totalSynced = 0;
  
  for (const chat of chats) {
    // Save/update chat in chats table
    db.run(
      `INSERT OR REPLACE INTO chats (id, name, is_group, last_message_time)
       VALUES (?, ?, ?, ?)`,
      [chat.id._serialized, chat.name, chat.isGroup ? 1 : 0, chat.timestamp]
    );
    
    // Fetch last 100 messages per chat
    const messages = await chat.fetchMessages({ limit: 100 });
    
    for (const msg of messages) {
      // Insert or ignore (dedupe by message ID)
      db.run(
        `INSERT OR IGNORE INTO messages (id, chat_id, chat_name, body, timestamp, from_me, is_group)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          msg.id._serialized,
          msg.from,
          chat.name,
          msg.body,
          msg.timestamp,
          msg.fromMe ? 1 : 0,
          chat.isGroup ? 1 : 0
        ]
      );
      totalSynced++;
    }
  }
  
  console.log(`✅ Synced ${totalSynced} messages from ${chats.length} chats`);
}
<code>

### Step 5: Send Command (src/commands/send.ts)
<code>typescript
import { getClient } from '../whatsapp/client';
import { db } from '../db/schema';

export async function sendMessage(recipient: string, message: string) {
  const client = getClient();
  
  // Check if recipient is a group name (search in synced chats)
  const groupChat = db.query(
    'SELECT DISTINCT id FROM chats WHERE name = ? AND is_group = 1 LIMIT 1'
  ).get(recipient);
  
  let chatId: string;
  
  if (groupChat) {
    // Sending to group
    chatId = (groupChat as any).id;
    console.log(`📱 Sending to group: ${recipient}`);
  } else {
    // Check if it's in chats as individual
    const individualChat = db.query(
      'SELECT DISTINCT id FROM chats WHERE name = ? AND is_group = 0 LIMIT 1'
    ).get(recipient);
    
    if (individualChat) {
      chatId = (individualChat as any).id;
    } else {
      // Fallback: treat as phone number
      const formatted = recipient.match(/^\d{10}$/) ? `91${recipient}` : recipient.replace(/\D/g, '');
      chatId = `${formatted}@c.us`;
    }
    console.log(`📱 Sending to contact: ${recipient}`);
  }
  
  await client.sendMessage(chatId, message);
  
  console.log(`✅ Sent: '${message.substring(0, 50)}${message.length > 50 ? '...' : ''}'`);
  
  return { success: true, recipient, chatId, message };
}
<code>

### Step 13: Search Screen (src/ui/screens/Search.tsx)
<code>typescript
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { searchMessages } from '../../commands/search';

interface SearchProps {
  onBack: () => void;
}

export default function Search({ onBack }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setSearching(true);
    const searchResults = searchMessages(query, 20);
    setResults(searchResults);
    setSearching(false);
  };

  return (
    <Box flexDirection='column' padding={1}>
      <Text bold color='cyan'>Search Messages</Text>
      <Box marginTop={1}>
        <Text dimColor>Type search query and press Enter. Esc to go back.</Text>
      </Box>
      
      <Box marginTop={1}>
        <Text>Search: </Text>
        <TextInput 
          value={query} 
          onChange={setQuery}
          onSubmit={handleSearch}
        />
      </Box>
      
      {searching && (
        <Box marginTop={1}>
          <Text color='yellow'>Searching...</Text>
        </Box>
      )}
      
      {results.length > 0 && (
        <Box flexDirection='column' marginTop={1}>
          <Text bold>Results ({results.length}):</Text>
          {results.map((r: any, i: number) => (
            <Box key={i} flexDirection='column' marginTop={1}>
              <Text color='cyan'>{r.chat_name}</Text>
              <Text dimColor>{new Date(r.timestamp * 1000).toLocaleString()}</Text>
              <Text>{r.body.substring(0, 100)}...</Text>
            </Box>
          ))}
        </Box>
      )}
      
      {results.length === 0 && !searching && query && (
        <Box marginTop={1}>
          <Text color='yellow'>No results found</Text>
        </Box>
      )}
    </Box>
  );
}
<code>

### Step 6: Search Command (src/commands/search.ts)
<code>typescript
import { db } from '../db/schema';

export function searchMessages(query: string, limit = 20) {
  const results = db.query(
    `SELECT chat_name, body, timestamp 
     FROM messages 
     WHERE body LIKE ? 
     ORDER BY timestamp DESC 
     LIMIT ?`
  ).all([`%${query}%`, limit]);

  console.log(`\n🔍 Found ${results.length} results for '${query}':\n`);
  
  for (const row of results) {
    const r = row as any;
    const date = new Date(r.timestamp * 1000).toLocaleString();
    console.log(`[${date}] ${r.chat_name}`);
    console.log(`  ${r.body.substring(0, 100)}${r.body.length > 100 ? '...' : ''}\n`);
  }
  
  return results; // Return for testing
}
<code>

### Step 7: Main TUI App (src/ui/App.tsx)
<code>typescript
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Home from './screens/Home';
import ContactList from './screens/ContactList';
import Compose from './screens/Compose';
import Search from './screens/Search';

type Screen = 'home' | 'contacts' | 'compose' | 'search';

interface AppProps {
  onExit: () => void;
}

export default function App({ onExit }: AppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string } | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleChatSelect = (chat: { id: string; name: string }) => {
    setSelectedChat(chat);
    setCurrentScreen('compose');
  };

  const handleBack = () => {
    if (currentScreen === 'compose') {
      setCurrentScreen('contacts');
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <Box flexDirection='column'>
      {currentScreen === 'home' && (
        <Home onNavigate={handleNavigate} onExit={onExit} />
      )}
      {currentScreen === 'contacts' && (
        <ContactList onSelect={handleChatSelect} onBack={handleBack} />
      )}
      {currentScreen === 'compose' && selectedChat && (
        <Compose chat={selectedChat} onBack={handleBack} onSent={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'search' && (
        <Search onBack={handleBack} />
      )}
    </Box>
  );
}
<code>

### Step 8: Home Screen (src/ui/screens/Home.tsx)
<code>typescript
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

interface HomeProps {
  onNavigate: (screen: 'contacts' | 'search') => void;
  onExit: () => void;
}

export default function Home({ onNavigate, onExit }: HomeProps) {
  const items = [
    { label: '📤 Send Message', value: 'send' },
    { label: '🔍 Search Messages', value: 'search' },
    { label: '❌ Exit', value: 'exit' },
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'send') {
      onNavigate('contacts');
    } else if (item.value === 'search') {
      onNavigate('search');
    } else if (item.value === 'exit') {
      onExit();
    }
  };

  return (
    <Box flexDirection='column' padding={1}>
      <Text bold color='cyan'>
        ═══════════════════════════════════════
      </Text>
      <Text bold color='cyan'>  OneWay - One-Way WhatsApp</Text>
      <Text bold color='cyan'>
        ═══════════════════════════════════════
      </Text>
      <Box marginTop={1}>
        <Text dimColor>Use ↑↓ arrows to navigate, Enter to select</Text>
      </Box>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
}
<code>

### Step 9: Contact List Screen (src/ui/screens/ContactList.tsx)
<code>typescript
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { db } from '../../db/schema';

interface ContactListProps {
  onSelect: (chat: { id: string; name: string }) => void;
  onBack: () => void;
}

export default function ContactList({ onSelect, onBack }: ContactListProps) {
  const [chats, setChats] = useState<Array<{ id: string; name: string; is_group: number }>>([]);
  const [filter, setFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    const results = db.query('SELECT id, name, is_group FROM chats ORDER BY last_message_time DESC').all();
    setChats(results as any);
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(filter.toLowerCase())
  );

  const items = filteredChats.map(chat => ({
    label: `${chat.is_group ? '👥' : '👤'} ${chat.name}`,
    value: chat.id,
    chat: chat
  }));

  const handleSelect = (item: any) => {
    onSelect({ id: item.chat.id, name: item.chat.name });
  };

  return (
    <Box flexDirection='column' padding={1}>
      <Text bold color='cyan'>Select Contact / Group</Text>
      <Box marginTop={1}>
        <Text dimColor>Press / to filter, Esc to go back</Text>
      </Box>
      
      {showFilter && (
        <Box marginTop={1}>
          <Text>Filter: </Text>
          <TextInput value={filter} onChange={setFilter} />
        </Box>
      )}
      
      <Box marginTop={1}>
        {items.length > 0 ? (
          <SelectInput items={items} onSelect={handleSelect} />
        ) : (
          <Text color='yellow'>No chats found</Text>
        )}
      </Box>
    </Box>
  );
}
<code>

### Step 10: Message Compose Screen (src/ui/screens/Compose.tsx)
<code>typescript
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { sendMessage } from '../../commands/send';

interface ComposeProps {
  chat: { id: string; name: string };
  onBack: () => void;
  onSent: () => void;
}

export default function Compose({ chat, onBack, onSent }: ComposeProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setSending(true);
    try {
      await sendMessage(chat.name, message);
      onSent();
    } catch (err: any) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <Box flexDirection='column' padding={1}>
      <Text bold color='cyan'>Send to: {chat.name}</Text>
      <Box marginTop={1}>
        <Text dimColor>Type your message and press Enter. Esc to cancel.</Text>
      </Box>
      
      <Box marginTop={1}>
        <Text>Message: </Text>
        <TextInput 
          value={message} 
          onChange={setMessage}
          onSubmit={handleSubmit}
        />
      </Box>
      
      {sending && (
        <Box marginTop={1}>
          <Text color='yellow'>Sending...</Text>
        </Box>
      )}
      
      {error && (
        <Box marginTop={1}>
          <Text color='red'>Error: {error}</Text>
        </Box>
      )}
    </Box>
  );
}
<code>

### Step 11: Entry Point (src/index.tsx)
<code>typescript
import React from 'react';
import { render } from 'ink';
import App from './ui/App';
import { initClient, closeClient } from './whatsapp/client';
import { syncMessages } from './whatsapp/sync';

async function main() {
  try {
    // STEP 1: Authenticate BEFORE launching TUI
    // This shows QR code in plain terminal if needed
    console.log('Starting OneWay...\n');
    await initClient();
    
    // STEP 2: Sync messages
    console.log(''); // Add spacing
    await syncMessages();
    
    // STEP 3: Clear console and launch TUI
    console.clear();
    
    const { waitUntilExit } = render(<App onExit={async () => {
      await closeClient();
      process.exit(0);
    }} />);
    
    await waitUntilExit();
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Try running again and scan the QR code with your WhatsApp app.');
    }
    
    await closeClient();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Goodbye!');
  await closeClient();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeClient();
  process.exit(0);
});

main();
<code>

### Step 12: Global Command (bin/oneway.ts)
<code>typescript
#!/usr/bin/env bun
import '../src/index.tsx';
<code>

**Install globally:**
<code>bash
# Add to package.json
{
  'bin': {
    'oneway': './bin/oneway.ts'
  }
}

# Install globally
bun link

# Now you can run from anywhere:
oneway
<code>

### Step 8: Unit Tests (tests/unit/validators.test.ts)
<code>typescript
import { test, expect } from 'bun:test';

test('validates Indian phone number', () => {
  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? `91${cleaned}` : cleaned;
  };
  
  expect(validatePhone('9876543210')).toBe('919876543210');
  expect(validatePhone('919876543210')).toBe('919876543210');
  expect(validatePhone('+91 92203 92556')).toBe('919220392556');
});

test('validates message not empty', () => {
  expect('Hello'.trim().length > 0).toBe(true);
  expect(''.trim().length > 0).toBe(false);
});

test('formats chat ID correctly', () => {
  const formatChatId = (phone: string) => `${phone}@c.us`;
  expect(formatChatId('919876543210')).toBe('919876543210@c.us');
});
<code>

### Step 9: E2E Tests (tests/e2e/send-to-group.test.ts)
<code>typescript
import { test, expect } from 'bun:test';
import { initClient } from '../../src/whatsapp/client';
import { syncMessages } from '../../src/whatsapp/sync';
import { sendMessage } from '../../src/commands/send';
import { existsSync } from 'fs';

const SKIP_E2E = process.env.SKIP_E2E === 'true';

// Check if authenticated before running E2E tests
if (!SKIP_E2E && !existsSync('./data/.wwebjs_auth/session')) {
  console.error(`
❌ E2E tests require WhatsApp authentication first!

Run these commands:
  1. ONEWAY_AUTH_PATH=./data/.wwebjs_auth bun run src/index.tsx
  2. Scan QR code with WhatsApp
  3. Wait for 'WhatsApp client ready!'
  4. Press Ctrl+C to exit
  5. Run: bun test tests/e2e/

Your authenticated session will be saved and reused for tests.
`);
  process.exit(1);
}

test.skipIf(SKIP_E2E)('E2E: Send message to test group', async () => {
  // Set auth path for testing
  process.env.ONEWAY_AUTH_PATH = './data/.wwebjs_auth';
  
  await initClient();
  await syncMessages();
  
  const result = await sendMessage('test group', 'E2E test message from OneWay');
  
  expect(result.success).toBe(true);
  expect(result.recipient).toBe('test group');
}, 30000); // 30 second timeout for real WhatsApp operations
<code>

### Step 10: E2E Tests (tests/e2e/send-to-contact.test.ts)
<code>typescript
import { test, expect } from 'bun:test';
import { initClient } from '../../src/whatsapp/client';
import { syncMessages } from '../../src/whatsapp/sync';
import { sendMessage } from '../../src/commands/send';

const SKIP_E2E = process.env.SKIP_E2E === 'true';

test.skipIf(SKIP_E2E)('E2E: Send message to contact +91 92203 92556', async () => {
  // Set auth path for testing
  process.env.ONEWAY_AUTH_PATH = './data/.wwebjs_auth';
  
  await initClient();
  await syncMessages();
  
  const result = await sendMessage('+91 92203 92556', 'E2E test message from OneWay');
  
  expect(result.success).toBe(true);
  expect(result.chatId).toContain('9220392556');
}, 30000);
<code>

### Step 11: E2E Tests (tests/e2e/search-messages.test.ts)
<code>typescript
import { test, expect } from 'bun:test';
import { initClient } from '../../src/whatsapp/client';
import { syncMessages } from '../../src/whatsapp/sync';
import { searchMessages } from '../../src/commands/search';

const SKIP_E2E = process.env.SKIP_E2E === 'true';

test.skipIf(SKIP_E2E)('E2E: Search messages from test group', async () => {
  // Set auth path for testing
  process.env.ONEWAY_AUTH_PATH = './data/.wwebjs_auth';
  
  await initClient();
  await syncMessages();
  
  const results = await searchMessages('test', 50);
  
  expect(results.length).toBeGreaterThan(0);
  // Verify at least one result is from 'test group'
  const hasTestGroup = results.some((r: any) => r.chat_name === 'test group');
  expect(hasTestGroup).toBe(true);
}, 30000);
<code>

---

## Test-Driven Development Loop

**For Each Feature:**

1. ✍️ **Write Failing Test**
   <code>bash
   # tests/unit/send.test.ts
   test('send message formats phone correctly', () => {
     expect(formatPhone('9876543210')).toBe('919876543210@c.us');
   });
   <code>

2. 🏃 **Run Test** → See it fail
   <code>bash
   bun test
   # FAIL: formatPhone is not defined
   <code>

3. 🔨 **Implement Feature**
   <code>typescript
   export function formatPhone(phone: string) {
     const cleaned = phone.replace(/\D/g, '');
     const withCode = cleaned.length === 10 ? `91${cleaned}` : cleaned;
     return `${withCode}@c.us`;
   }
   <code>

4. ✅ **Run Test** → See it pass
   <code>bash
   bun test
   # PASS: All tests passed
   <code>

5. ♻️ **Refactor** if needed, tests still pass

6. **Move to Next Feature**

**E2E Testing:**

Run E2E tests after all unit tests pass:

<code>bash
# Run unit tests only (fast)
bun test tests/unit/

# Run E2E tests (requires WhatsApp connection)
bun test tests/e2e/

# Skip E2E tests during development
SKIP_E2E=true bun test
<code>

E2E tests verify:
- Real WhatsApp message sending to 'test group'
- Real WhatsApp message sending to '+91 92203 92556'
- Real message search from synced data

---

## Completion Criteria

When ALL of these are true:

✅ **Functionality**
- Can launch TUI with `oneway` command from anywhere
- TUI displays home menu with options
- Can navigate to contact list and see all chats
- Can select a chat and compose message
- Can send message to 'test group' via TUI
- Can send message to '+91 92203 92556' via TUI
- Can search messages and see results in TUI
- Messages sync on app launch
- Messages and chat list persist in SQLite

✅ **TUI Experience**
- Keyboard navigation works (arrows, enter, esc)
- Contact list is scrollable and searchable
- Message composition has text input
- Status messages show during operations
- Clean screen transitions between views
- Can exit cleanly with Esc or exit option

✅ **Quality**
- All unit tests pass: `bun test tests/unit/` shows 100% pass rate
- All E2E tests pass: `bun test tests/e2e/` shows all E2E tests passing
- Coverage > 80%: Check with `bun test --coverage`
- TypeScript compiles: `bun build src/index.tsx`
- No `any` types in codebase
- React/Ink components render without errors

✅ **E2E Verification**
- E2E test can interact with TUI programmatically
- E2E test sends to 'test group' successfully
- E2E test sends to '+91 92203 92556' successfully
- E2E test finds messages from 'test group' in search

✅ **Global Command**
- `bun link` successfully creates global command
- `oneway` can be executed from any directory
- App auto-initializes and syncs on launch
- Session persists between runs (no QR re-scan)

✅ **Verification**
- Verified NO message event listeners in code: `grep -r 'on('message'' src/`
- README exists with screenshots and usage examples
- Can run end-to-end without errors

✅ **Final Check**
- Clean build: `rm -rf node_modules && bun install && bun test tests/unit/`
- Install global command: `bun link`
- Launch TUI: `oneway` from any directory
- Navigate through all screens smoothly
- Send test messages to both targets
- Search works and displays results

**When all above verified, output:**
<code>
<promise>COMPLETE</promise>
<code>

---

## Escape Hatch (If Stuck)

**After 15 iterations without completion:**

1. List what's working
2. List what's blocking
3. Document attempted solutions
4. Suggest alternatives (e.g., different DB approach, simpler search)
5. Output diagnostic report

**Common Issues & Fixes:**

| Issue | Fix |
|-------|-----|
| whatsapp-web.js won't install | Use `bun add --backend=npm whatsapp-web.js` |
| SQLite not found | Check Bun version >= 1.0, use `import { Database } from 'bun:sqlite'` |
| QR won't display | Add delay, check terminal supports Unicode |
| Tests timeout | Increase timeout: `test('...', async () => {...}, 10000)` |
| Puppeteer crashes | Add `args: ['--no-sandbox', '--disable-dev-shm-usage']` |
| Ink TUI not rendering | Check React version, ensure stdin is not redirected |
| Keyboard input not working | Ensure terminal is in raw mode, check if stdin.isTTY |
| TUI components crash | Wrap in error boundaries, check component props |
| Global command not found | Run `bun link` again, check $PATH includes Bun bin |
| SelectInput not showing items | Verify items array format: `{label, value}` |

---

## Ralph Loop Execution

**Command to Run:**
<code>bash
/ralph-loop '$(cat this-prompt.md)' --completion-promise 'COMPLETE' --max-iterations 35
<code>

**Ralph will:**
1. Build project structure with TUI components
2. Implement WhatsApp client and database
3. Create Ink-based TUI interface
4. Implement navigation and screens
5. Run tests after each change
6. Fix failing tests
7. Setup global `oneway` command
8. Verify completion criteria
9. Output `<promise>COMPLETE</promise>` when done

**You can monitor progress:**
- Check git commits to see iterations
- Check `bun test` output in logs
- Check files being modified
- Periodically test by running `bun run src/index.tsx` manually

**After completion:**
<code>bash
# Install globally
cd oneway
bun link

# Launch from anywhere
oneway
<code>

---

## Success Metrics

- **Development Time**: < 30 Ralph iterations
- **Test Coverage**: > 80% (unit tests)
- **E2E Tests**: All E2E tests passing
- **Code Quality**: No `any` types, all functions typed
- **Functionality**: All 8 phases completed
- **TUI Experience**: Smooth navigation, clear UI, responsive
- **Global Command**: `oneway` works from anywhere
- **Reliability**: Can run `oneway`, navigate to send, and send message successfully

---

**Remember:** Ralph iterates autonomously. Write good tests, let the loop fix failures, trust the process. When you see `<promise>COMPLETE</promise>`, the tool is ready to use!

## Expected TUI Behavior

**Keyboard Shortcuts:**
- `↑/↓` - Navigate menu items
- `Enter` - Select item / Submit input
- `Esc` - Go back / Cancel
- `Ctrl+C` - Exit application
- `/` - Filter/search (in contact list)
- `Tab` - Switch between input fields

**Screen Flow:**
<code>
Home → Send Message → Select Contact → Compose Message → Send
  ↓
  Search → Enter Query → View Results
  ↓
  Exit
<code>

**Key Features:**
1. **No Distractions**: Zero incoming message notifications
2. **Fast Navigation**: Keyboard-only, mouse-free interface
3. **Persistent Session**: QR scan once, works forever
4. **Local Storage**: All messages cached in SQLite
5. **Global Access**: Run `oneway` from any directory

**First Run:**
1. Run `oneway`
2. See QR code in plain terminal (not in TUI)
3. Scan QR code with WhatsApp
4. Wait for sync (may take 30-60 seconds)
5. TUI launches automatically after auth
6. Start sending messages!

**Subsequent Runs:**
1. Run `oneway`
2. Auto-connects (no QR, session reused)
3. Auto-syncs latest messages
4. TUI launches immediately!

**E2E Testing Setup:**
1. Authenticate once: `ONEWAY_AUTH_PATH=./data/.wwebjs_auth bun run src/index.tsx`
2. Scan QR, wait for 'ready', press Ctrl+C
3. Session saved to `./data/.wwebjs_auth/`
4. Run E2E tests: `bun test tests/e2e/`
5. Tests reuse the authenticated session
6. Re-authenticate if session expires (~2 weeks)

---

## Example README Structure

The final README.md should include:

<code>markdown
# OneWay

> One-way WhatsApp communication for focused work

A Terminal UI (TUI) app that lets you send WhatsApp messages and search history without the distraction of incoming messages.

## Installation

<code>bash
bun install
bun link
<code>

## Usage

Launch the app from anywhere:

<code>bash
oneway
<code>

### First Time Setup
1. Run `oneway`
2. Scan QR code with your WhatsApp mobile app
3. Wait for message sync
4. Start using!

### Running Tests

**Unit Tests** (fast, no auth needed):
<code>bash
bun test tests/unit/
<code>

**E2E Tests** (requires manual authentication first):
<code>bash
# First time: Authenticate once
ONEWAY_AUTH_PATH=./data/.wwebjs_auth bun run src/index.tsx
# Scan QR, wait for 'ready', then Ctrl+C

# Now run E2E tests
bun test tests/e2e/

# Or skip E2E during development
SKIP_E2E=true bun test
<code>

### Features
- 📤 Send messages to contacts and groups
- 🔍 Search message history
- 🚫 Zero incoming message notifications (tech detox mode)
- ⚡ Fast keyboard navigation
- 💾 Local SQLite storage

### Keyboard Shortcuts
- `↑/↓` - Navigate
- `Enter` - Select
- `Esc` - Go back
- `Ctrl+C` - Exit

## Tech Stack
- Bun runtime
- TypeScript
- Ink (React for terminal)
- SQLite
- whatsapp-web.js
<code>
---
