const { prisma } = require("../prisma");

async function listPersons(req, res) {
  try {
    const persons = await prisma.person.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" }
    });
    res.json(persons);
  } catch (err) {
    console.error("listPersons error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function createPerson(req, res) {
  const { name, phone, email, notes } = req.body;

  try {
    const person = await prisma.person.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        userId: req.user.id
      }
    });
    res.json(person);
  } catch (err) {
    console.error("createPerson error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function updatePerson(req, res) {
  const { id } = req.params;
  const { name, phone, email, notes } = req.body;

  try {
    const person = await prisma.person.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null
      }
    });
    res.json(person);
  } catch (err) {
    console.error("updatePerson error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function deletePerson(req, res) {
  const { id } = req.params;

  try {
    await prisma.person.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deletePerson error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listPersons, createPerson, updatePerson, deletePerson };
