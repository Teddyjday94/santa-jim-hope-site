export function bookingTransitionPlan(args: {
  currentStatus: string;
  requestedStatus: string;
  googleEventId: string | null;
}): {
  allowed: boolean;
  expectedStatus: string | null;
  calendarAction: "create-event" | "cancel-event" | null;
};
