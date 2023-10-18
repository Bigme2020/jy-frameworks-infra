import {
  CSSProperties,
  FC,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { useTooltipContext } from "./hooks/useTooltipContext";
import { Transition } from "react-transition-group";
import { Portal } from "..";
import { TriggerAction } from "./types";
import { ReferenceType, UseFloatingOptions } from "@floating-ui/react";

type TransitionState = "entering" | "entered" | "exited" | "exiting";

interface TooltipContentProps {
  id: string;
  children: ForwardRefExoticComponent<any> | ReactNode;
  transitionMap?: Record<TransitionState, CSSProperties>;
  triggers: TriggerAction[];
  floatingOptions?: Partial<UseFloatingOptions<ReferenceType>>;
}

/** children 必须要对外提供 ref 和 style */
export const TooltipContent: FC<TooltipContentProps> = memo(
  ({
    id,
    children,
    transitionMap,
    triggers,
    floatingOptions,
  }): ReactElement | null => {
    const {
      refs,
      floatingStyles,
      getFloatingProps,
      context,
      currentTrigger,
      registerdContent,
      setRegisterdContent,
      setUseFloatingOptions,
    } = useTooltipContext();

    const isCurrentTrigger = useMemo(
      () => triggers.includes(currentTrigger as any),
      [triggers, currentTrigger]
    );

    useEffect(() => {
      if (isCurrentTrigger && floatingOptions) {
        setUseFloatingOptions(floatingOptions);
      }
    }, [floatingOptions, isCurrentTrigger]);

    useEffect(() => {
      setRegisterdContent((registerdContent) => {
        const cloned = [...registerdContent];
        if (!cloned.includes(id)) {
          cloned.push(id);
          return cloned;
        }
        return registerdContent;
      });
    }, [id]);

    console.log("registerdContent", registerdContent);

    const trasitionStyle = useCallback(
      (state: TransitionState) => {
        const animation = transitionMap
          ? {
              ...transitionMap.exited,
              ...transitionMap[state],
            }
          : {
              entering: { opacity: 1, zIndex: 1 },
              entered: { opacity: 1, zIndex: 1 },
              exiting: { opacity: 0, zIndex: -99 },
              exited: { opacity: 0, zIndex: -99 },
            }[state];

        const common: CSSProperties = {
          pointerEvents:
            state === "exited" || state === "exiting" ? "none" : "auto",
        };

        return {
          ...animation,
          ...common,
        };
      },
      [transitionMap]
    );

    return (
      <Portal>
        <Transition
          in={context.open && isCurrentTrigger}
          nodeRef={refs.floating}
          timeout={300}
        >
          {(state) => {
            return cloneElement(children as any, {
              ...getFloatingProps({
                style: {
                  ...floatingStyles,
                  ...trasitionStyle(state as TransitionState),
                },
                ref:
                  isCurrentTrigger || registerdContent.length === 1
                    ? refs.setFloating
                    : null,
              }),
            });
          }}
        </Transition>
      </Portal>
    );
  }
);
