import { format } from "date-fns";

interface TaskDetailsProps {
  isRecurring: boolean;
  description: string | null;
  nextDue: Date;
  frequencyHours: number | null;
  lastCompleted: Date | null;
}

export function TaskDetails({
  isRecurring,
  frequencyHours,
  lastCompleted,
}: TaskDetailsProps) {
  return (
    <div className="space-y-4">
      {isRecurring && (
        <>
          <div>
            <h3 className="text-sm font-medium">Frequency</h3>
            <p className="mt-1 text-muted-foreground">
              Every{" "}
              {frequencyHours === 24
                ? "day"
                : frequencyHours === 168
                  ? "week"
                  : frequencyHours === 336
                    ? "two weeks"
                    : "month"}
            </p>
          </div>

          {lastCompleted && (
            <div>
              <h3 className="text-sm font-medium">Last Completed</h3>
              <p className="mt-1 text-muted-foreground">
                {format(lastCompleted, "PPP 'at' p")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
