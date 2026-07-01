export type CommandId = string;

export type CommandContext = {
  source: 'user' | 'system' | 'assistant' | 'local-agent';
};

export type CommandHandler<TPayload = unknown, TResult = unknown> = (
  payload: TPayload,
  context: CommandContext,
) => Promise<TResult> | TResult;

export type CommandContribution<TPayload = unknown, TResult = unknown> = {
  id: CommandId;
  title: string;
  handler: CommandHandler<TPayload, TResult>;
};

export type CommandRegistry = {
  register: (command: CommandContribution) => void;
  execute: <TPayload = unknown, TResult = unknown>(
    commandId: CommandId,
    payload: TPayload,
    context: CommandContext,
  ) => Promise<TResult>;
  list: () => CommandContribution[];
};

export function createCommandRegistry(): CommandRegistry {
  const commands = new Map<CommandId, CommandContribution>();

  return {
    register(command) {
      if (commands.has(command.id)) {
        throw new Error(`Command already registered: ${command.id}`);
      }

      commands.set(command.id, command);
    },
    execute: async <TPayload = unknown, TResult = unknown>(
      commandId: CommandId,
      payload: TPayload,
      context: CommandContext,
    ) => {
      const command = commands.get(commandId);

      if (!command) {
        throw new Error(`Command not registered: ${commandId}`);
      }

      const result = await command.handler(payload, context);
      return result as TResult;
    },
    list() {
      return Array.from(commands.values());
    },
  };
}
