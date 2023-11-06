import { UseClickProps, UseHoverProps } from "@floating-ui/react";

export type TriggerAction = "click" | "hover";

export interface TriggerOptions {
  stopPropagation?: boolean;
  props?: any;
}

export interface TriggerActionObjectOption {
  action: TriggerAction;
  options: TriggerOptions;
}

export type TriggerActionOption =
  | {
      action: "click";
      options: { props?: UseClickProps; stopPropagation?: boolean };
    }
  | {
      action: "hover";
      options: { props?: UseHoverProps; stopPropagation?: boolean };
    }
  | TriggerAction;
