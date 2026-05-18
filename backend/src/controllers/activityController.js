const { prisma } = require("../prisma");

const INCLUDE = {
  person: true,
  pricings: { include: { pricing: true } },
};

async function createActivity(req, res) {
  const { title, description, activity_date, time, personId, pricingIds, price } = req.body;
  if (!title) return res.status(400).json({ error: "Título é obrigatório." });
  try {
    const activity = await prisma.activity.create({
      data: {
        title,
        description: description || null,
        activityDate: new Date(activity_date),
        time: time || null,
        personId: personId || null,
        price: price != null ? parseFloat(price) : null,
        userId: req.user.id,
        pricings: pricingIds?.length
          ? { create: pricingIds.map(id => ({ pricingId: id })) }
          : undefined,
      },
      include: INCLUDE,
    });
    res.json(activity);
  } catch (err) {
    console.error("createActivity error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getActivities(req, res) {
  const { month, year } = req.query;
  const m = String(month).padStart(2, "0");
  const startDate = new Date(`${year}-${m}-01T00:00:00.000Z`);
  const endDate = new Date(parseInt(year), parseInt(month), 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const where = { userId: req.user.id, activityDate: { gte: startDate, lte: endDate } };

  try {
    const activities = await prisma.activity.findMany({
      where,
      include: INCLUDE,
      orderBy: [{ activityDate: "asc" }, { time: "asc" }],
    });
    return res.json(activities);
  } catch (err) {
    console.error("getActivities error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function updateActivity(req, res) {
  const { id } = req.params;
  const { title, description, time, personId, pricingIds, price } = req.body;
  try {
    await prisma.activityPricing.deleteMany({ where: { activityId: id } });

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title,
        description: description || null,
        time: time || null,
        personId: personId || null,
        price: price != null ? parseFloat(price) : null,
        pricings: pricingIds?.length
          ? { create: pricingIds.map(pid => ({ pricingId: pid })) }
          : undefined,
      },
      include: INCLUDE,
    });
    res.json(activity);
  } catch (err) {
    console.error("updateActivity error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function updateActivityStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: { status },
      include: INCLUDE,
    });
    res.json(activity);
  } catch (err) {
    console.error("updateActivityStatus error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function deleteActivity(req, res) {
  const { id } = req.params;
  try {
    await prisma.activity.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteActivity error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createActivity, getActivities, updateActivity, updateActivityStatus, deleteActivity };
