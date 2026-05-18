const { prisma } = require("../prisma");

async function listPricings(req, res) {
  try {
    const pricings = await prisma.pricing.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" },
    });
    res.json(pricings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPricing(req, res) {
  const { name, description, price } = req.body;
  if (!name || price == null) return res.status(400).json({ error: "Nome e preço são obrigatórios." });
  try {
    const pricing = await prisma.pricing.create({
      data: { name, description: description || null, price: parseFloat(price), userId: req.user.id },
    });
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePricing(req, res) {
  const { id } = req.params;
  const { name, description, price } = req.body;
  try {
    const pricing = await prisma.pricing.update({
      where: { id },
      data: { name, description: description || null, price: parseFloat(price) },
    });
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deletePricing(req, res) {
  const { id } = req.params;
  try {
    await prisma.pricing.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listPricings, createPricing, updatePricing, deletePricing };
