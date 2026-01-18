# OneWay

> One-way WhatsApp communication for focused work

A Terminal UI (TUI) app that lets you send WhatsApp messages and search history without the distraction of incoming messages.

## Installation

```bash
bun install
bun link
```

## Usage

Launch the app from anywhere:

```bash
oneway
```

### First Time Setup

1. Run `oneway`
2. Scan QR code with your WhatsApp mobile app
3. Wait for message sync
4. Start using!

### Keyboard Shortcuts

- `↑/↓` - Navigate menu items
- `Enter` - Select item / Submit input
- `Esc` - Go back / Cancel
- `Ctrl+C` - Exit application
- `/` - Filter/search (in contact list)

### Screen Flow

```
Home → Send Message → Select Contact → Compose Message → Send
  ↓
  Search → Enter Query → View Results
  ↓
  Exit
```

## Features

- 📤 Send messages to contacts and groups
- 🔍 Search message history
- 🚫 Zero incoming message notifications (tech detox mode)
- ⚡ Fast keyboard navigation
- 💾 Local SQLite storage
- 🔐 Session persistence (QR scan once, works forever)

## Running Tests

**Unit Tests** (fast, no auth needed):
```bash
bun test tests/unit/
```

**E2E Tests** (requires manual authentication first):
```bash
# First time: Authenticate once
bun run src/index.tsx
# Scan QR, wait for 'ready', then Ctrl+C

# Now run E2E tests
bun test tests/e2e/

# Or skip E2E during development
SKIP_E2E=true bun test
```

**All Tests:**
```bash
bun test
```

## Architecture

```
oneway/
├── bin/
│   └── oneway.ts             # Global executable entry point
├── src/
│   ├── index.tsx             # Main TUI app entry
│   ├── ui/
│   │   ├── App.tsx           # Root TUI component
│   │   ├── screens/
│   │   │   ├── Home.tsx      # Main menu
│   │   │   ├── ContactList.tsx
│   │   │   ├── Compose.tsx
│   │   │   └── Search.tsx
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
│   ├── commands/
│   │   ├── send.ts           # Send message logic
│   │   └── search.ts         # Search logic
│   └── utils/
│       ├── validators.ts
│       └── formatters.ts
├── tests/
│   ├── unit/
│   │   ├── validators.test.ts
│   │   └── formatters.test.ts
│   └── e2e/
│       ├── setup.ts
│       ├── send-to-group.test.ts
│       ├── send-to-contact.test.ts
│       └── search-messages.test.ts
└── data/
    ├── whatsapp.db           # SQLite database
    └── .wwebjs_auth/         # Session data (gitignored)
```

## Tech Stack

- **Runtime:** Bun
- **Database:** Bun's SQLite (`bun:sqlite`)
- **TUI Framework:** Ink (React for terminal)
- **WhatsApp:** whatsapp-web.js
- **TypeScript:** Built-in to Bun

## Security Notes

- Session data is stored in `data/.wwebjs_auth/` - never commit this!
- The SQLite database contains your message history
- Both are gitignored by default

## Requirements

- Bun 1.0+
- A WhatsApp account

## License

MIT
