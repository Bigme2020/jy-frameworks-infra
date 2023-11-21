import { UseClickProps, UseHoverProps } from "@floating-ui/react";

export type TransitionState = "entering" | "entered" | "exited" | "exiting";

export type TriggerAction = "click" | "hover";

export type TriggerActionOption =
  | {
      action: "click";
      options: UseClickProps;
    }
  | {
      action: "hover";
      options: UseHoverProps;
    }
  | TriggerAction;
