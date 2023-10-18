import { useContext } from "react";
import { TooltipContext } from "..";

export const useTooltipContext = () => {
  const providerValue = useContext(TooltipContext);

  if (!providerValue) throw new Error("TooltipContext null error");

  return providerValue;
};
