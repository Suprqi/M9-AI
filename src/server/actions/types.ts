/** Shared shape for every server action consumed by `useActionState`. */
export interface ActionState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Correlates a user-visible failure with the structured server log. */
  requestId?: string;
}

export const IDLE_STATE: ActionState = { ok: false };

export function failure(
  message: string,
  fieldErrors?: Record<string, string>,
  requestId?: string
): ActionState {
  return { ok: false, message, fieldErrors, requestId };
}

export function success(message?: string): ActionState {
  return { ok: true, message };
}
