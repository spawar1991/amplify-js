import { Context } from '../context';

export type CommandFactory<Command> = (context: Context) => Command;
