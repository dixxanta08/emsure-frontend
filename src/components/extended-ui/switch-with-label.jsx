import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

const SwitchWithLabel = ({
  checked,
  onChange,
  disabled,
  tooltip,
  activeText = "Active",
  inactiveText = "Inactive",
}) => {
  return (
    <div className="flex items-center h-10">
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Switch
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{tooltip}</span>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      )}
      <span className="ml-2">{checked ? activeText : inactiveText}</span>
    </div>
  );
};

export default SwitchWithLabel;
