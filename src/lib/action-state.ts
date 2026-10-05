// What a staff action reports back to the page: a message either way, so a tap
// always shows what happened (and why, if it didn't work).
export type ActionState = { error?: string; notice?: string };

type DbError = { code?: string; message: string } | null;

// Messages with code 22023 are written for people; permission errors say so.
export function failed(error: DbError, doing = "save that"): ActionState | null {
  if (!error) return null;
  if (error.code === "22023") return { error: error.message };
  if (error.code === "42501") return { error: "You don't have permission to do that." };
  return { error: `We couldn't ${doing}. (${error.code ?? "error"}: ${error.message})` };
}
