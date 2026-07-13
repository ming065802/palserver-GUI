import { loadConfig } from './config';
import { createDiscordClient } from './bot/client';
import { registerSlashCommands } from './bot/registerCommands';

async function main() {
  const config = loadConfig();

  if (!config.discord.token) {
    console.error('Discord bot token is missing. Set discord.token in config.json');
    process.exit(1);
  }

  if (!config.discord.clientId) {
    console.error(
      'Discord clientId is missing. Set discord.clientId in config.json',
    );
    process.exit(1);
  }

  await registerSlashCommands(config);
  const client = createDiscordClient(config);
  await client.login(config.discord.token);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Discord bot failed to start:', message);
  process.exit(1);
});
