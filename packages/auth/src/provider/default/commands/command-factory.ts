import { Context } from '../../default/context';

export type CommandFactory<Command> = (context: Context) => Command;
