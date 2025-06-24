// PasswordResetButton.jsx
import { useState } from "react"; // Adjust the import according to your service structure
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import authService from "../services/authService";

const PasswordResetButton = ({
  buttonTitle,
  userId,
  timeLeft,
  disabled,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.sendPasswordResetEmail(userId, null);
      onSuccess(response);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center h-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                onClick={handleClick}
                className="text-xs font-medium min-w-[176px]"
                variant="outline"
                disabled={disabled || loading}
              >
                {loading && <Loader2 className="animate-spin mr-2" />}
                {loading ? "Please wait" : buttonTitle}
              </Button>
            </div>
          </TooltipTrigger>
          {timeLeft > 0 && (
            <TooltipContent>
              <span>{`You can request a new email in ${timeLeft} seconds.`}</span>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default PasswordResetButton;
