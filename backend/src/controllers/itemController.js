const { prisma } = require("../prisma");

async function createItem(req, res) {
  const { name, description, quantity, price } = req.body;

  try {
    const item = await prisma.item.create({
      data: {
        name,
        description: description || null,
        quantity: parseInt(quantity) || 0,
        price: price !== "" && price != null ? parseFloat(price) : null,
        userId: req.user.id
      }
    });
    res.json(item);
  } catch (err) {
    console.error("createItem error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function listItems(req, res) {
  try {
    const items = await prisma.item.findMany({
      where: { userId: req.user.id }
    });
    res.json(items);
  } catch (err) {
    console.error("listItems error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function updateItem(req, res) {
  const { id } = req.params;
  const { name, description, quantity, price } = req.body;

  try {
    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        description: description || null,
        quantity: parseInt(quantity) || 0,
        price: price !== "" && price != null ? parseFloat(price) : null
      }
    });
    res.json(item);
  } catch (err) {
    console.error("updateItem error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteItem(req, res) {
  const { id } = req.params;

  try {
    await prisma.item.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteItem error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createItem, listItems, updateItem, deleteItem };
