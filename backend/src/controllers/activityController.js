const { prisma } = require("../prisma");

async function createActivity(req, res) {
  const { title, description, activity_date, time, personId } = req.body;

  try {
    const data = {
      title,
      description: description || null,
      activityDate: new Date(activity_date),
      userId: req.user.id
    };

    if (time) data.time = time;
    if (personId) data.personId = personId;

    const activity = await prisma.activity.create({ data });
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

  const where = {
    userId: req.user.id,
    activityDate: { gte: startDate, lte: endDate }
  };

  try {
    const activities = await prisma.activity.findMany({
      where,
      include: { person: true },
      orderBy: [{ activityDate: "asc" }, { time: "asc" }]
    });
    return res.json(activities);
  } catch {
    // fallback: migration ainda não foi aplicada — retorna sem campos novos
  }

  try {
    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ activityDate: "asc" }]
    });
    res.json(activities);
  } catch (err) {
    console.error("getActivities error:", err.message);
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
      include: { person: true }
    });
    return res.json(activity);
  } catch {
    // fallback sem include caso migration pendente
  }

  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: { status }
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
    console.error("deleteActivity error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createActivity, getActivities, updateActivityStatus, deleteActivity };
