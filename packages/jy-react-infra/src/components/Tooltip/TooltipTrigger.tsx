import {
  FC,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  cloneElement,
} from "react";

import { useTooltipContext } from "./hooks/useTooltipContext";
import { TriggerAction } from "./types";

interface TooltipTriggerProps {
  children: ForwardRefExoticComponent<any> | ReactNode;
}

export const TooltipTrigger: FC<TooltipTriggerProps> = ({
  children,
}): ReactElement => {
  const {
    refs,
    triggerActionOptions,
    elements,
    getReferenceProps,
    setCurrentTrigger,
  } = useTooltipContext();

  const isStopPropagation = (triggerActionType: TriggerAction) => {
    if (triggerActionOptions) {
      for (let option of triggerActionOptions) {
        if (typeof option === "string" && option === triggerActionType)
          return false;
        if (
          typeof option === "object" &&
          option.action === triggerActionType &&
          option.options.stopPropagation
        )
          return true;
      }
      return false;
    }
    return false;
  };

  return cloneElement(children as any, {
    ...getReferenceProps({
      ref: refs.setReference,
      onClick(e) {
        if (isStopPropagation("click")) {
          e.stopPropagation();
        }
        if (typeof getReferenceProps()["onClick"] === "function") {
          (getReferenceProps()["onClick"] as Function)(e);
          setCurrentTrigger("click");
        }
      },
      onFocus(e) {
        if (isStopPropagation("focus")) {
          e.stopPropagation();
        }
        if (typeof getReferenceProps()["onFocus"] === "function") {
          (getReferenceProps()["onFocus"] as Function)(e);
          setCurrentTrigger("focus");
        }
      },
      onPointerEnter(e) {
        if (isStopPropagation("hover")) {
          e.stopPropagation();
        }
        if (typeof getReferenceProps()["onPointerEnter"] === "function") {
          (getReferenceProps()["onPointerEnter"] as Function)(e);
          setCurrentTrigger("hover");
        }
      },
    }),
  });
};
