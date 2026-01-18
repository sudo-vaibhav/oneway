import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { searchMessages } from '../../commands/search';
import { formatTimestamp } from '../../utils/formatters';

interface SearchResult {
  chat_name: string;
  body: string;
  timestamp: number;
}

interface SearchProps {
  onBack: () => void;
}

export default function Search({ onBack }: SearchProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const handleSearch = (): void => {
    if (!query.trim()) return;

    const searchResults = searchMessages(query, 20);
    setResults(searchResults);
    setSearched(true);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Search Messages
      </Text>
      <Box marginTop={1}>
        <Text dimColor>Type search query and press Enter. Esc to go back.</Text>
      </Box>

      <Box marginTop={1}>
        <Text>Search: </Text>
        <TextInput value={query} onChange={setQuery} onSubmit={handleSearch} />
      </Box>

      {searched && results.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>Results ({results.length}):</Text>
          {results.slice(0, 10).map((r, i) => (
            <Box key={i} flexDirection="column" marginTop={1}>
              <Text color="cyan">{r.chat_name}</Text>
              <Text dimColor>{formatTimestamp(r.timestamp)}</Text>
              <Text>
                {r.body.length > 100 ? `${r.body.substring(0, 100)}...` : r.body}
              </Text>
            </Box>
          ))}
          {results.length > 10 && (
            <Box marginTop={1}>
              <Text dimColor>...and {results.length - 10} more results</Text>
            </Box>
          )}
        </Box>
      )}

      {searched && results.length === 0 && (
        <Box marginTop={1}>
          <Text color="yellow">No results found for "{query}"</Text>
        </Box>
      )}
    </Box>
  );
}
