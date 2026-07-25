import type { ActivePlan } from "./tools/todo-write";

export const ACTIVE_PLAN_KEY = "active_plan";

export async function setActivePlan(
  storage: DurableObjectStorage,
  plan: ActivePlan | null
): Promise<void> {
  if (plan == null) await storage.delete(ACTIVE_PLAN_KEY);
  else await storage.put(ACTIVE_PLAN_KEY, plan);
}
