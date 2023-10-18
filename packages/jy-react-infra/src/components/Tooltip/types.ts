export type TriggerAction = "click" | "hover" | "focus";

export interface TriggerOptions {
  stopPropagation?: boolean;
}

export type TriggerActionOption =
  | { action: TriggerAction; options: TriggerOptions }
  | TriggerAction;
