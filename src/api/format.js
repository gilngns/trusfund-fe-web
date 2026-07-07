export const rp = (n) => "Rp" + Number(n || 0).toLocaleString("id");

export const statusColor = (s) => {
  const map = {
    ACTIVE: "green",
    VALIDATED: "green",
    COMPLETED: "blue",
    FROZEN: "red",
    DRAFT: "slate",
    PENDING_REVIEW: "amber",
    EVALUATING: "amber",
  };
  return map[s] || "slate";
};
